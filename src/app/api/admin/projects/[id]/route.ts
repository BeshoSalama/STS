import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireStaffSession } from "@/lib/rbac";
import { projectSchema } from "@/lib/validations/project";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  if (!(await requireStaffSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = projectSchema.partial().safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  return NextResponse.json(await db.project.update({ where: { id: params.id }, data: parsed.data }));
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  if (!(await requireStaffSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await db.project.delete({ where: { id: params.id } });
  return NextResponse.json({ deleted: true });
}
