import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdminSession } from "@/lib/rbac";
import { packagePlanSchema } from "@/lib/validations/packages";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  if (!(await requireAdminSession())) return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  const parsed = packagePlanSchema.partial().safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { features, featured, ...data } = parsed.data;
  return NextResponse.json(
    await db.packagePlan.update({
      where: { id: params.id },
      data: {
        ...data,
        ...(features ? { features: JSON.stringify(features) } : {}),
        ...(featured === undefined ? {} : { featured: Boolean(featured) }),
      },
    })
  );
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  if (!(await requireAdminSession())) return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  await db.packagePlan.delete({ where: { id: params.id } });
  return NextResponse.json({ deleted: true });
}
