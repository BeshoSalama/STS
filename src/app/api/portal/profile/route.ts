import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireClientSession } from "@/lib/rbac";

const profileSchema = z.object({
  name: z.string().trim().min(2),
  phone: z.string().trim().optional(),
});

export async function PATCH(req: Request) {
  const session = await requireClientSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = profileSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const user = await db.user.update({
    where: { id: session.user.id },
    data: parsed.data,
    select: { id: true, name: true, email: true, phone: true, role: true },
  });
  return NextResponse.json(user);
}
