import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { parseDateKey } from "@/lib/booking";
import { requireStaffSession } from "@/lib/rbac";

const availabilitySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  capacity: z.coerce.number().int().min(0).default(6),
  blocked: z.coerce.boolean().default(false),
});

export async function PATCH(req: Request) {
  if (!(await requireStaffSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = availabilitySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const day = await db.dayCapacity.upsert({
    where: { date: parseDateKey(parsed.data.date) },
    update: { capacity: parsed.data.capacity, blocked: parsed.data.blocked },
    create: { date: parseDateKey(parsed.data.date), capacity: parsed.data.capacity, blocked: parsed.data.blocked },
  });
  return NextResponse.json(day);
}
