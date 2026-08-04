import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireStaffSession } from "@/lib/rbac";

const statusSchema = z.object({
  id: z.string(),
  status: z.enum(["NEW", "CONTACTED", "QUALIFIED", "WON", "LOST"]),
});

export async function GET(req: Request) {
  if (!(await requireStaffSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(req.url);
  const type = url.searchParams.get("type") ?? undefined;
  const status = url.searchParams.get("status") ?? undefined;
  const leads = await db.lead.findMany({
    where: { type, status },
    include: { brief: true, quote: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(leads);
}

export async function PATCH(req: Request) {
  if (!(await requireStaffSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = statusSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  return NextResponse.json(await db.lead.update({ where: { id: parsed.data.id }, data: { status: parsed.data.status } }));
}
