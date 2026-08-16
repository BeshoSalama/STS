import { NextResponse } from "next/server";
import { approvePayment } from "@/lib/manualPayments";
import { requireAdminSession } from "@/lib/rbac";
import { adminPaymentDecisionSchema } from "@/lib/validations/manualPayments";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "Admin access required" }, { status: 403 });

  const parsed = adminPaymentDecisionSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  try {
    const payment = await approvePayment(params.id, session.user.id, parsed.data.adminNotes);
    return NextResponse.json({ id: payment.id, status: payment.status });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not approve payment" }, { status: 409 });
  }
}
