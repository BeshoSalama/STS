import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { sendVerificationCodeEmail } from "@/lib/email";
import { getClientIp, rateLimit } from "@/lib/rateLimit";
import { registerSchema } from "@/lib/validations/auth";

function createVerificationCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function POST(req: Request) {
  const limited = await rateLimit(`register:${getClientIp(req)}`, 4);
  if (!limited.success) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const body = await req.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const existing = await db.user.findUnique({ where: { email: parsed.data.email } });
  if (existing?.emailVerified) {
    return NextResponse.json({ error: "Email is already registered" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  const user = existing
    ? await db.user.update({
        where: { email: parsed.data.email },
        data: {
          name: parsed.data.name,
          passwordHash,
          emailVerified: null,
        },
        select: { id: true, name: true, email: true, role: true },
      })
    : await db.user.create({
        data: {
          name: parsed.data.name,
          email: parsed.data.email,
          passwordHash,
          role: "CLIENT",
          emailVerified: null,
        },
        select: { id: true, name: true, email: true, role: true },
      });

  const code = createVerificationCode();
  const expires = new Date(Date.now() + 15 * 60 * 1000);

  await db.verificationToken.deleteMany({ where: { identifier: parsed.data.email } });
  await db.verificationToken.create({
    data: {
      identifier: parsed.data.email,
      token: code,
      expires,
    },
  });

  const emailResult = await sendVerificationCodeEmail(parsed.data.email, code);

  return NextResponse.json(
    {
      user,
      message: "Verification code sent. Please check your email.",
      emailSkipped: emailResult.skipped,
      devCode: emailResult.skipped && process.env.NODE_ENV !== "production" ? code : undefined,
    },
    { status: 201 }
  );
}
