import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireClientSession } from "@/lib/rbac";

export async function GET() {
  const session = await requireClientSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const briefs = await db.brief.findMany({
    where: { userId: session.user.id },
    include: { lead: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(briefs);
}
