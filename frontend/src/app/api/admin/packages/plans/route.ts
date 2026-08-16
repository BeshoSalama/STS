import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdminSession } from "@/lib/rbac";
import { packagePlanSchema } from "@/lib/validations/packages";

export async function GET() {
  if (!(await requireAdminSession())) return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  return NextResponse.json(await db.packagePlan.findMany({ orderBy: { order: "asc" } }));
}

export async function POST(req: Request) {
  if (!(await requireAdminSession())) return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  const parsed = packagePlanSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  return NextResponse.json(
    await db.packagePlan.create({
      data: {
        ...parsed.data,
        features: JSON.stringify(parsed.data.features),
        featured: Boolean(parsed.data.featured),
      },
    }),
    { status: 201 }
  );
}
