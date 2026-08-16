import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import type { PaymentMethod } from "@/lib/validations/manualPayments";

export const manualPaymentMethodLabels: Record<PaymentMethod, string> = {
  VODAFONE_CASH: "Vodafone Cash",
  INSTAPAY: "InstaPay",
};

const defaultVodafoneInstructions =
  "Transfer the exact plan amount to one of the Vodafone Cash numbers shown, keep a screenshot, then submit the transfer details below.";
const defaultInstapayInstructions =
  "Transfer the exact plan amount to the InstaPay address shown, keep a screenshot, then submit the transfer details below.";

export async function getManualPaymentSettings() {
  return db.manualPaymentSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      vodafoneCashEnabled: true,
      vodafoneCashNumber: "01039839414",
      vodafoneCashSecondNumber: "01021804116",
      vodafoneCashInstructions: defaultVodafoneInstructions,
      instapayEnabled: true,
      instapayAddress: "01021804116",
      instapayInstructions: defaultInstapayInstructions,
    },
  });
}

export function parsePlanAmount(price: string) {
  const normalized = price.replace(/,/g, "");
  const match = normalized.match(/([0-9]+(?:\.[0-9]+)?)/);
  const amount = match ? Number(match[1]) : 0;
  return Number.isFinite(amount) ? amount : 0;
}

export async function getPlanForPayment(planId: string) {
  const plan = await db.packagePlan.findUnique({ where: { id: planId } });
  if (!plan || plan.name === "Custom Package Base Fee") return null;
  const amount = parsePlanAmount(plan.price);
  if (amount <= 0) return null;
  return { plan, amount, currency: process.env.MANUAL_PAYMENT_CURRENCY || "EGP" };
}

export function publicPaymentSettings(settings: Awaited<ReturnType<typeof getManualPaymentSettings>>) {
  return {
    currency: process.env.MANUAL_PAYMENT_CURRENCY || "EGP",
    methods: {
      VODAFONE_CASH: {
        enabled: settings.vodafoneCashEnabled,
        label: manualPaymentMethodLabels.VODAFONE_CASH,
        destination: settings.vodafoneCashNumber || "",
        destinations: compactStrings([settings.vodafoneCashNumber, settings.vodafoneCashSecondNumber]),
        accountName: settings.vodafoneCashAccountName || "",
        instructions: settings.vodafoneCashInstructions || defaultVodafoneInstructions,
      },
      INSTAPAY: {
        enabled: settings.instapayEnabled,
        label: manualPaymentMethodLabels.INSTAPAY,
        destination: settings.instapayAddress || "",
        destinations: compactStrings([settings.instapayAddress]),
        accountName: settings.instapayAccountName || "",
        instructions: settings.instapayInstructions || defaultInstapayInstructions,
      },
    },
  };
}

const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxProofBytes = 5 * 1024 * 1024;

export async function validateAndStoreProof(file: File, userId: string) {
  if (!file || file.size === 0) throw new Error("Payment proof is required");
  if (file.size > maxProofBytes) throw new Error("Payment proof must be 5MB or smaller");
  if (!allowedMimeTypes.has(file.type)) throw new Error("Payment proof must be JPG, PNG, or WEBP");

  const bytes = Buffer.from(await file.arrayBuffer());
  if (!matchesImageSignature(bytes, file.type)) throw new Error("Payment proof file type is invalid");

  const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const uploadRoot = path.join(process.cwd(), "storage", "payment-proofs");
  const safeUserDir = userId.replace(/[^a-zA-Z0-9_-]/g, "");
  const relativePath = path.join(safeUserDir, `${Date.now()}-${randomUUID()}.${extension}`);
  const absolutePath = path.join(uploadRoot, relativePath);
  await mkdir(path.dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, bytes, { flag: "wx" });

  return {
    relativePath: relativePath.replace(/\\/g, "/"),
    mimeType: file.type,
  };
}

function matchesImageSignature(bytes: Buffer, mimeType: string) {
  if (mimeType === "image/png") {
    return bytes.length > 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
  }
  if (mimeType === "image/jpeg") {
    return bytes.length > 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[bytes.length - 2] === 0xff && bytes[bytes.length - 1] === 0xd9;
  }
  if (mimeType === "image/webp") {
    return bytes.length > 12 && bytes.subarray(0, 4).toString("ascii") === "RIFF" && bytes.subarray(8, 12).toString("ascii") === "WEBP";
  }
  return false;
}

export function proofAbsolutePath(relativePath: string) {
  const uploadRoot = path.join(process.cwd(), "storage", "payment-proofs");
  const normalized = path.normalize(relativePath).replace(/^(\.\.[/\\])+/, "");
  return path.join(uploadRoot, normalized);
}

export async function approvePayment(paymentId: string, adminId: string, adminNotes?: string) {
  return db.$transaction(async (tx) => {
    const payment = await tx.paymentTransaction.findUnique({ where: { id: paymentId } });
    if (!payment) throw new Error("Payment not found");
    if (payment.status === "APPROVED") return payment;
    if (payment.status !== "PENDING") throw new Error("Only pending payments can be approved");

    const reviewedAt = new Date();
    const updatedPayment = await tx.paymentTransaction.update({
      where: { id: payment.id },
      data: {
        status: "APPROVED",
        adminNotes: cleanOptional(adminNotes),
        reviewedBy: adminId,
        reviewedAt,
      },
    });

    await tx.userSubscription.upsert({
      where: { userId: payment.userId },
      update: {
        planId: payment.planId,
        planNameSnapshot: payment.planNameSnapshot,
        status: "ACTIVE",
        startsAt: reviewedAt,
        endsAt: subscriptionEndDate(payment.transferDate, payment.planNameSnapshot),
        activatedByPaymentId: payment.id,
      },
      create: {
        userId: payment.userId,
        planId: payment.planId,
        planNameSnapshot: payment.planNameSnapshot,
        status: "ACTIVE",
        startsAt: reviewedAt,
        endsAt: subscriptionEndDate(payment.transferDate, payment.planNameSnapshot),
        activatedByPaymentId: payment.id,
      },
    });

    await tx.notification.create({
      data: {
        userId: payment.userId,
        type: "PAYMENT_APPROVED",
        title: "Payment approved",
        body: `Your ${payment.planNameSnapshot} payment was approved and your plan is now active.`,
        href: "/profile",
      },
    });

    return updatedPayment;
  });
}

export async function rejectPayment(paymentId: string, adminId: string, adminNotes?: string) {
  return db.$transaction(async (tx) => {
    const payment = await tx.paymentTransaction.findUnique({ where: { id: paymentId } });
    if (!payment) throw new Error("Payment not found");
    if (payment.status !== "PENDING") return { count: 0 };

    const result = await tx.paymentTransaction.updateMany({
      where: { id: paymentId, status: "PENDING" },
      data: {
        status: "REJECTED",
        adminNotes: cleanOptional(adminNotes) || "Rejected by admin",
        reviewedBy: adminId,
        reviewedAt: new Date(),
      },
    });

    if (result.count > 0) {
      await tx.notification.create({
        data: {
          userId: payment.userId,
          type: "PAYMENT_REJECTED",
          title: "Payment rejected",
          body: `Your ${payment.planNameSnapshot} payment was rejected. Please review the admin note in your profile.`,
          href: "/profile",
        },
      });
    }

    return result;
  });
}

function subscriptionEndDate(_transferDate: Date, _planName: string) {
  const endsAt = new Date();
  endsAt.setMonth(endsAt.getMonth() + 1);
  return endsAt;
}

export function decimalToNumber(value: Prisma.Decimal | number | string) {
  return typeof value === "number" ? value : Number(value.toString());
}

export function cleanOptional(value?: string | null) {
  const cleaned = (value ?? "").trim();
  return cleaned.length > 0 ? cleaned : null;
}

function compactStrings(values: Array<string | null | undefined>) {
  return values.filter((value): value is string => Boolean(value));
}
