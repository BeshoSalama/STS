import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendLeadNotification } from "@/lib/email";
import { getClientIp, rateLimit } from "@/lib/rateLimit";
import { briefSchema } from "@/lib/validations/brief";

export async function POST(req: Request) {
  const limited = await rateLimit(`brief:${getClientIp(req)}`, 4);
  if (!limited.success) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const body = await req.json().catch(() => null);
  const parsed = briefSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Login is required before submitting a brief" }, { status: 401 });
  if (session.user.role !== "CLIENT") return NextResponse.json({ error: "Only client accounts can submit briefs" }, { status: 403 });
  if (parsed.data.website) return NextResponse.json({ ok: true });

  const userId = session.user.id;
  const data = parsed.data;

  const result = await db.$transaction(async (tx) => {
    const lead = await tx.lead.create({
      data: {
        type: "BRIEF",
        name: data.clientName,
        email: data.email || null,
        phone: data.phone,
        payload: JSON.stringify(data),
        userId,
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
        userId,
      },
    });

    return { lead, brief };
  });

  await sendLeadNotification("New client brief", `<p>${data.clientName} submitted a brief for ${data.brandName}.</p>`);

  return NextResponse.json(result, { status: 201 });
}
