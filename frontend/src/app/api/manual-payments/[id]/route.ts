import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/rbac";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const payment = await db.paymentTransaction.findFirst({
    where: { id: params.id, userId: session.user.id },
    include: { plan: true },
  });
  if (!payment) return NextResponse.json({ error: "Payment not found" }, { status: 404 });

  return NextResponse.json({
    id: payment.id,
    planName: payment.planNameSnapshot,
    amount: Number(payment.amount.toString()),
    currency: payment.currency,
    paymentMethod: payment.paymentMethod,
    senderName: payment.senderName,
    senderPhone: payment.senderPhone,
    transactionReference: payment.transactionReference,
    transferDate: payment.transferDate,
    transferTime: payment.transferTime,
    notes: payment.notes,
    status: payment.status,
    adminMessage: payment.status === "REJECTED" ? payment.adminNotes : null,
    createdAt: payment.createdAt,
    reviewedAt: payment.reviewedAt,
  });
}
