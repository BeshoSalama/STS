import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdminSession } from "@/lib/rbac";
import { packageAddOnSchema } from "@/lib/validations/packages";

export async function GET() {
  if (!(await requireAdminSession())) return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  return NextResponse.json(await db.packageAddOn.findMany({ orderBy: { order: "asc" } }));
}

export async function POST(req: Request) {
  if (!(await requireAdminSession())) return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  const parsed = packageAddOnSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  return NextResponse.json(await db.packageAddOn.create({ data: parsed.data }), { status: 201 });
}
