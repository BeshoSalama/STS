import { readFile } from "fs/promises";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { proofAbsolutePath } from "@/lib/manualPayments";
import { requireAdminSession } from "@/lib/rbac";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  if (!(await requireAdminSession())) return NextResponse.json({ error: "Admin access required" }, { status: 403 });

  const payment = await db.paymentTransaction.findUnique({
    where: { id: params.id },
    select: { proofImage: true, proofMimeType: true },
  });
  if (!payment) return NextResponse.json({ error: "Payment not found" }, { status: 404 });

  try {
    const bytes = await readFile(proofAbsolutePath(payment.proofImage));
    return new NextResponse(bytes, {
      headers: {
        "Content-Type": payment.proofMimeType,
        "Cache-Control": "private, max-age=60",
      },
    });
  } catch {
    return NextResponse.json({ error: "Proof image was not found on disk." }, { status: 404 });
  }
}
