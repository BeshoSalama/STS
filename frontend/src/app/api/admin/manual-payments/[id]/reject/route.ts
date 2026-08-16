import { NextResponse } from "next/server";
import { rejectPayment } from "@/lib/manualPayments";
import { requireAdminSession } from "@/lib/rbac";
import { adminPaymentDecisionSchema } from "@/lib/validations/manualPayments";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "Admin access required" }, { status: 403 });

  const parsed = adminPaymentDecisionSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const result = await rejectPayment(params.id, session.user.id, parsed.data.adminNotes);
  if (result.count === 0) {
    return NextResponse.json({ error: "Only pending payments can be rejected." }, { status: 409 });
  }
  return NextResponse.json({ id: params.id, status: "REJECTED" });
}
