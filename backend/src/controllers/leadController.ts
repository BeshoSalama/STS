import type { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";
import { db } from "../config/db";
import { assertBookable } from "../services/bookingService";
import { briefSchema } from "../../../frontend/src/lib/validations/brief";
import { contactSchema } from "../../../frontend/src/lib/validations/contact";
import { packageQuoteSchema } from "../../../frontend/src/lib/validations/packageQuote";

const CUSTOM_PACKAGE_BASE_FEE = 199;

export async function contactLeadHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = contactSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    if (parsed.data.website) return res.json({ ok: true });

    const bookable = await assertBookable(parsed.data.consultationDate);
    if (!bookable.ok) return res.status(409).json({ error: bookable.reason });

    const result = await db.$transaction(async (tx) => {
      const booking = await tx.booking.create({
        data: { date: bookable.date, name: parsed.data.name, phone: parsed.data.phone },
      });
      const lead = await tx.lead.create({
        data: {
          type: "CONSULTATION",
          name: parsed.data.name,
          phone: parsed.data.phone,
          payload: JSON.stringify({ consultationDate: parsed.data.consultationDate, bookingId: booking.id }),
        },
      });
      return { booking, lead };
    });

    return res.status(201).json(result);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return res.status(409).json({ error: "DOUBLE_BOOKING" });
    }
    return next(error);
  }
}

export async function briefLeadHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = briefSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    if (parsed.data.website) return res.json({ ok: true });

    const data = parsed.data;
    const result = await db.$transaction(async (tx) => {
      const lead = await tx.lead.create({
        data: {
          type: "BRIEF",
          name: data.clientName,
          email: data.email || null,
          phone: data.phone,
          payload: JSON.stringify(data),
        },
      });
      const brief = await tx.brief.create({
        data: {
          leadId: lead.id,
          clientName: data.clientName,
          brandName: data.brandName,
          briefDate: data.briefDate ? new Date(`${data.briefDate}T00:00:00.000Z`) : null,
          email: data.email || null,
          phone: data.phone,
          mainGoals: data.mainGoals,
          roleModel: data.roleModel,
          competitorsLinks: data.competitorsLinks,
          brandIdentity: data.brandIdentity,
          brandLevel: data.brandLevel,
          customerSegment: data.customerSegment,
          businessType: data.businessType,
          socialPlatforms: JSON.stringify(data.socialPlatforms),
          brandSlogan: data.brandSlogan,
          preferredColors: data.preferredColors,
          colorNumbers: data.colorNumbers,
          toneOfVoice: JSON.stringify(data.toneOfVoice),
          advertisingPlatforms: JSON.stringify(data.advertisingPlatforms),
          adsBudget: data.adsBudget,
          targetAge: data.targetAge,
          branchesNumber: data.branchesNumber,
          locations: data.locations,
          gender: data.gender,
          languages: JSON.stringify(data.languages),
          platformLinks: data.platformLinks,
          notes: data.notes,
          businessModel: data.businessModel,
          digitalMarketingExperience: data.digitalMarketingExperience,
          uniqueSellingPoints: data.uniqueSellingPoints,
          planObjectives: data.planObjectives,
        },
      });
      return { lead, brief };
    });

    return res.status(201).json(result);
  } catch (error) {
    return next(error);
  }
}

export async function packageQuoteLeadHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = packageQuoteSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    if (parsed.data.website) return res.json({ ok: true });

    const addOns = await db.packageAddOn.findMany({ where: { id: { in: parsed.data.addOnIds } } });
    const total = addOns.reduce((sum, addOn) => sum + addOn.price, CUSTOM_PACKAGE_BASE_FEE);
    const result = await db.$transaction(async (tx) => {
      const lead = await tx.lead.create({
        data: {
          type: "PACKAGE_QUOTE",
          name: "Package Builder",
          phone: "not-provided",
          payload: JSON.stringify({ planName: parsed.data.planName, addOnIds: parsed.data.addOnIds, total }),
        },
      });
      const quote = await tx.packageQuote.create({
        data: {
          leadId: lead.id,
          planName: parsed.data.planName,
          addOnIds: JSON.stringify(addOns.map((addOn) => addOn.id)),
          total,
        },
      });
      return { lead, quote };
    });

    return res.status(201).json(result);
  } catch (error) {
    return next(error);
  }
}
