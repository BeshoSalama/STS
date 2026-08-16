import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getManualPaymentSettings } from "@/lib/manualPayments";
import { requireAdminSession } from "@/lib/rbac";
import { manualPaymentSettingsSchema } from "@/lib/validations/manualPayments";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await requireAdminSession())) return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  return NextResponse.json(await getManualPaymentSettings());
}

export async function PATCH(req: Request) {
  if (!(await requireAdminSession())) return NextResponse.json({ error: "Admin access required" }, { status: 403 });

  const parsed = manualPaymentSettingsSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const settings = await db.manualPaymentSettings.upsert({
    where: { id: 1 },
    update: parsed.data,
    create: { id: 1, ...parsed.data },
  });
  return NextResponse.json(settings);
}
