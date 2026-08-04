import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdminSession, requireStaffSession } from "@/lib/rbac";
import { projectSchema } from "@/lib/validations/project";

export async function GET() {
  if (!(await requireStaffSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await db.project.findMany({ orderBy: { order: "asc" } }));
}

export async function POST(req: Request) {
  if (!(await requireAdminSession())) return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  const parsed = projectSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  return NextResponse.json(await db.project.create({ data: { ...parsed.data, published: parsed.data.published ?? true } }), {
    status: 201,
  });
}
