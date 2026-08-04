import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  if (req.headers.get("x-revalidate-secret") !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as { path?: string } | null;
  if (!body?.path) return NextResponse.json({ error: "path is required" }, { status: 400 });

  revalidatePath(body.path);
  return NextResponse.json({ revalidated: true });
}
