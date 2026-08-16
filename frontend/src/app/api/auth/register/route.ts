import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { sendVerificationCodeEmail } from "@/lib/email";
import { getClientIp, rateLimit } from "@/lib/rateLimit";
import { registerSchema } from "@/lib/validations/auth";

const VERIFICATION_CODE_TTL_MS = 15 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;

function createVerificationCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function POST(req: Request) {
  const limited = await rateLimit(`register:${getClientIp(req)}`, 4);

  if (!limited.success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const email = parsed.data.email;

  const existing = await db.user.findUnique({
    where: { email },
  });

  if (existing?.emailVerified) {
    return NextResponse.json(
      { error: "Email is already registered" },
      { status: 409 }
    );
  }

  // Check when the latest verification code was sent.
  // Verification codes expire after 15 minutes, so:
  // sentAt = expires - 15 minutes.
  const latestVerificationToken = await db.verificationToken.findFirst({
    where: {
      identifier: email,
    },
    orderBy: {
      expires: "desc",
    },
  });

  if (latestVerificationToken) {
    const sentAt =
      latestVerificationToken.expires.getTime() - VERIFICATION_CODE_TTL_MS;

    const elapsed = Date.now() - sentAt;

    if (elapsed < RESEND_COOLDOWN_MS) {
      const retryAfter = Math.max(
        1,
        Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1000)
      );

      return NextResponse.json(
        {
          error: `Please wait ${retryAfter} seconds before requesting another code.`,
          retryAfter,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(retryAfter),
          },
        }
      );
    }
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  const user = existing
    ? await db.user.update({
        where: { email },
        data: {
          name: parsed.data.name,
          passwordHash,
          emailVerified: null,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      })
    : await db.user.create({
        data: {
          name: parsed.data.name,
          email,
          passwordHash,
          role: "CLIENT",
          emailVerified: null,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      });

  const code = createVerificationCode();
  const expires = new Date(Date.now() + VERIFICATION_CODE_TTL_MS);

  await db.verificationToken.deleteMany({
    where: {
      identifier: email,
    },
  });

  await db.verificationToken.create({
    data: {
      identifier: email,
      token: code,
      expires,
    },
  });

  const emailResult = await sendVerificationCodeEmail(email, code);

  return NextResponse.json(
    {
      user,
      message: "Verification code sent. Please check your email.",
      emailSkipped: emailResult.skipped,
      devCode:
        emailResult.skipped && process.env.NODE_ENV !== "production"
          ? code
          : undefined,
      resendCooldown: 60,
    },
    { status: 201 }
  );
}