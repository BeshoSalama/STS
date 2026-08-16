import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdminSession } from "@/lib/rbac";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  if (!(await requireAdminSession())) return NextResponse.json({ error: "Admin access required" }, { status: 403 });

  const payment = await db.paymentTransaction.findUnique({
    where: { id: params.id },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
      plan: true,
      reviewer: { select: { id: true, name: true, email: true } },
    },
  });
  if (!payment) return NextResponse.json({ error: "Payment not found" }, { status: 404 });

  return NextResponse.json({
    ...payment,
    amount: Number(payment.amount.toString()),
    proofImage: undefined,
    proofUrl: `/api/admin/manual-payments/${payment.id}/proof`,
  });
}
