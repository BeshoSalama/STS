import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { assertBookable } from "@/lib/booking";
import { db } from "@/lib/db";
import { sendLeadNotification } from "@/lib/email";
import { notifyRoles } from "@/lib/notifications";
import { getClientIp, rateLimit } from "@/lib/rateLimit";
import { roles } from "@/lib/roles";
import { contactSchema } from "@/lib/validations/contact";

export async function POST(req: Request) {
  const limited = await rateLimit(`contact:${getClientIp(req)}`);
  if (!limited.success) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const body = await req.json().catch(() => null);
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  if (parsed.data.website) return NextResponse.json({ ok: true });

  const bookable = await assertBookable(parsed.data.consultationDate);
  if (!bookable.ok) return NextResponse.json({ error: bookable.reason }, { status: 409 });

  const session = await auth();
  const userId = session?.user?.id || undefined;

  try {
    const result = await db.$transaction(async (tx) => {
      const currentBookings = await tx.booking.count({ where: { date: bookable.date } });
      const capacity = await tx.dayCapacity.findUnique({ where: { date: bookable.date } });
      if (capacity?.blocked) throw new Error("DAY_BLOCKED");
      if (currentBookings >= 1) throw new Error("DAY_FULL");

      const booking = await tx.booking.create({
        data: { date: bookable.date, name: parsed.data.name, phone: parsed.data.phone, userId },
      });
      const lead = await tx.lead.create({
        data: {
          type: "CONSULTATION",
          name: parsed.data.name,
          email: parsed.data.email || null,
          phone: parsed.data.phone,
          userId,
          payload: JSON.stringify({
            consultationDate: parsed.data.consultationDate,
            bookingId: booking.id,
            email: parsed.data.email || null,
            company: parsed.data.company || null,
            activity: parsed.data.activity || null,
            source: parsed.data.source || null,
            goal: parsed.data.goal || null,
          }),
        },
      });
      return { booking, lead };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

    const notificationBody = [
      `Name: ${parsed.data.name}`,
      parsed.data.email ? `Email: ${parsed.data.email}` : null,
      `Phone: ${parsed.data.phone}`,
      `Date: ${parsed.data.consultationDate}`,
      parsed.data.company ? `Company: ${parsed.data.company}` : null,
      parsed.data.activity ? `Activity: ${parsed.data.activity}` : null,
      parsed.data.source ? `Source: ${parsed.data.source}` : null,
      parsed.data.goal ? `Goal: ${parsed.data.goal}` : null,
    ].filter(Boolean).join(" | ");

    await sendLeadNotification(
      "New consultation booking",
      `<p>${parsed.data.name} booked ${parsed.data.consultationDate}.</p><p>Phone: ${parsed.data.phone}</p>`
    );
    await notifyRoles([roles.admin, roles.staff, roles.developer], {
      type: "CONSULTATION",
      title: "New free consultation request",
      body: notificationBody,
      href: `/admin/leads?q=${result.lead.id}`,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof Error && (error.message === "DAY_BLOCKED" || error.message === "DAY_FULL")) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "DOUBLE_BOOKING" }, { status: 409 });
    }
    throw error;
  }
}
