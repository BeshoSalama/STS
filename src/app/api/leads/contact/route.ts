import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { assertBookable } from "@/lib/booking";
import { db } from "@/lib/db";
import { sendLeadNotification } from "@/lib/email";
import { getClientIp, rateLimit } from "@/lib/rateLimit";
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
      const booking = await tx.booking.create({
        data: { date: bookable.date, name: parsed.data.name, phone: parsed.data.phone, userId },
      });
      const lead = await tx.lead.create({
        data: {
          type: "CONSULTATION",
          name: parsed.data.name,
          phone: parsed.data.phone,
          userId,
          payload: JSON.stringify({ consultationDate: parsed.data.consultationDate, bookingId: booking.id }),
        },
      });
      return { booking, lead };
    });

    await sendLeadNotification(
      "New consultation booking",
      `<p>${parsed.data.name} booked ${parsed.data.consultationDate}.</p><p>Phone: ${parsed.data.phone}</p>`
    );

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "DOUBLE_BOOKING" }, { status: 409 });
    }
    throw error;
  }
}
