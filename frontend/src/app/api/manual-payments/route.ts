import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  cleanOptional,
  getManualPaymentSettings,
  getPlanForPayment,
  publicPaymentSettings,
  validateAndStoreProof,
} from "@/lib/manualPayments";
import { notifyRoles } from "@/lib/notifications";
import { requireSession } from "@/lib/rbac";
import { createManualPaymentSchema } from "@/lib/validations/manualPayments";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const payments = await db.paymentTransaction.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { plan: { select: { name: true } } },
  });

  return NextResponse.json(
    payments.map((payment) => ({
      id: payment.id,
      planName: payment.planNameSnapshot,
      amount: Number(payment.amount.toString()),
      currency: payment.currency,
      paymentMethod: payment.paymentMethod,
      status: payment.status,
      adminMessage: payment.status === "REJECTED" ? payment.adminNotes : null,
      createdAt: payment.createdAt,
      reviewedAt: payment.reviewedAt,
    }))
  );
}

export async function POST(req: Request) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Please log in before submitting payment proof." }, { status: 401 });

  const formData = await req.formData().catch(() => null);
  if (!formData) return NextResponse.json({ error: "Invalid form data" }, { status: 400 });

  const parsed = createManualPaymentSchema.safeParse({
    planId: formData.get("planId"),
    paymentMethod: formData.get("paymentMethod"),
    senderName: formData.get("senderName"),
    senderPhone: formData.get("senderPhone"),
    transactionReference: formData.get("transactionReference"),
    transferDate: formData.get("transferDate"),
    transferTime: formData.get("transferTime"),
    notes: formData.get("notes"),
  });
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const settings = publicPaymentSettings(await getManualPaymentSettings());
  const selectedMethod = settings.methods[parsed.data.paymentMethod];
  if (!selectedMethod.enabled || selectedMethod.destinations.length === 0) {
    return NextResponse.json({ error: "Selected payment method is currently unavailable." }, { status: 400 });
  }

  const planForPayment = await getPlanForPayment(parsed.data.planId);
  if (!planForPayment) return NextResponse.json({ error: "Invalid paid plan." }, { status: 400 });

  const pendingPayment = await db.paymentTransaction.findFirst({
    where: { userId: session.user.id, planId: planForPayment.plan.id, status: "PENDING" },
    select: { id: true },
  });
  if (pendingPayment) {
    return NextResponse.json(
      { error: "You already have a pending payment for this plan.", paymentId: pendingPayment.id },
      { status: 409 }
    );
  }

  const proof = formData.get("proof");
  if (!(proof instanceof File)) return NextResponse.json({ error: "Payment proof is required." }, { status: 400 });

  let storedProof: Awaited<ReturnType<typeof validateAndStoreProof>>;
  try {
    storedProof = await validateAndStoreProof(proof, session.user.id);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid payment proof" }, { status: 400 });
  }

  const transferDate = new Date(parsed.data.transferDate);
  if (Number.isNaN(transferDate.getTime())) return NextResponse.json({ error: "Transfer date is invalid." }, { status: 400 });

  const payment = await db.paymentTransaction.create({
    data: {
      userId: session.user.id,
      planId: planForPayment.plan.id,
      planNameSnapshot: planForPayment.plan.name,
      amount: planForPayment.amount,
      currency: planForPayment.currency,
      paymentMethod: parsed.data.paymentMethod,
      senderName: parsed.data.senderName,
      senderPhone: parsed.data.senderPhone,
      transactionReference: cleanOptional(parsed.data.transactionReference),
      proofImage: storedProof.relativePath,
      proofMimeType: storedProof.mimeType,
      transferDate,
      transferTime: cleanOptional(parsed.data.transferTime),
      notes: cleanOptional(parsed.data.notes),
      status: "PENDING",
    },
  });

  await notifyRoles(["ADMIN"], {
    type: "PAYMENT_SUBMITTED",
    title: "New payment order",
    body: `${session.user.name || session.user.email || "A client"} submitted ${planForPayment.plan.name} payment proof.`,
    href: `/admin/payments?status=PENDING&q=${payment.id}`,
  });

  return NextResponse.json(
    {
      id: payment.id,
      status: payment.status,
      message: "Payment transfer details were submitted successfully and will be reviewed by admin.",
    },
    { status: 201 }
  );
}
