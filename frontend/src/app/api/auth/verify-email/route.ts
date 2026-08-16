import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getClientIp, rateLimit } from "@/lib/rateLimit";
import { verifyEmailSchema } from "@/lib/validations/auth";

export async function POST(req: Request) {
  const limited = await rateLimit(`verify-email:${getClientIp(req)}`, 8);
  if (!limited.success) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const body = await req.json().catch(() => null);
  const parsed = verifyEmailSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const token = await db.verificationToken.findUnique({
    where: {
      identifier_token: {
        identifier: parsed.data.email,
        token: parsed.data.code,
      },
    },
  });

  if (!token || token.expires < new Date()) {
    return NextResponse.json({ error: "Invalid or expired verification code" }, { status: 400 });
  }

  await db.$transaction([
    db.user.update({
      where: { email: parsed.data.email },
      data: { emailVerified: new Date() },
    }),
    db.verificationToken.deleteMany({ where: { identifier: parsed.data.email } }),
  ]);

  return NextResponse.json({ ok: true });
}
