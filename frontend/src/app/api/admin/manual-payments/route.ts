import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { requireAdminSession } from "@/lib/rbac";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!(await requireAdminSession())) return NextResponse.json({ error: "Admin access required" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const pageSize = Math.min(50, Math.max(5, Number(searchParams.get("pageSize") || 20)));
  const status = searchParams.get("status") || undefined;
  const paymentMethod = searchParams.get("paymentMethod") || undefined;
  const planId = searchParams.get("planId") || undefined;
  const query = searchParams.get("q")?.trim();
  const date = searchParams.get("date") || undefined;

  const where: Prisma.PaymentTransactionWhereInput = {
    ...(status ? { status } : {}),
    ...(paymentMethod ? { paymentMethod } : {}),
    ...(planId ? { planId } : {}),
    ...(date ? dateRangeFilter(date) : {}),
    ...(query
      ? {
          OR: [
            { id: { contains: query } },
            { senderPhone: { contains: query } },
            { transactionReference: { contains: query } },
            { user: { email: { contains: query } } },
            { user: { name: { contains: query } } },
          ],
        }
      : {}),
  };

  const [total, payments] = await Promise.all([
    db.paymentTransaction.count({ where }),
    db.paymentTransaction.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        user: { select: { id: true, name: true, email: true } },
        plan: { select: { id: true, name: true } },
      },
    }),
  ]);

  return NextResponse.json({
    total,
    page,
    pageSize,
    payments: payments.map((payment) => ({
      ...payment,
      amount: Number(payment.amount.toString()),
      proofImage: undefined,
      proofUrl: `/api/admin/manual-payments/${payment.id}/proof`,
    })),
  });
}

function dateRangeFilter(date: string): Prisma.PaymentTransactionWhereInput {
  const start = new Date(date);
  if (Number.isNaN(start.getTime())) return {};
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { createdAt: { gte: start, lt: end } };
}
