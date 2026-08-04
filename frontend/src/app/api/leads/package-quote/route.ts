import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendLeadNotification } from "@/lib/email";
import { getClientIp, rateLimit } from "@/lib/rateLimit";
import { packageQuoteSchema } from "@/lib/validations/packageQuote";

const CUSTOM_PACKAGE_BASE_FEE = 199;

export async function POST(req: Request) {
  const limited = await rateLimit(`package:${getClientIp(req)}`);
  if (!limited.success) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const body = await req.json().catch(() => null);
  const parsed = packageQuoteSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const session = await auth();
  const user = session?.user;
  if (!user?.id) return NextResponse.json({ error: "Login is required before requesting a package quote" }, { status: 401 });
  if (parsed.data.website) return NextResponse.json({ ok: true });

  const addOns = await db.packageAddOn.findMany({ where: { id: { in: parsed.data.addOnIds } } });
  const total = addOns.reduce((sum, addOn) => sum + addOn.price, CUSTOM_PACKAGE_BASE_FEE);

  const result = await db.$transaction(async (tx) => {
    const lead = await tx.lead.create({
      data: {
        type: "PACKAGE_QUOTE",
        name: user?.name ?? "Package Builder",
        email: user?.email ?? null,
        phone: "not-provided",
        userId: user?.id,
        payload: JSON.stringify({ planName: parsed.data.planName, addOnIds: parsed.data.addOnIds, total }),
      },
    });

    const quote = await tx.packageQuote.create({
      data: {
        leadId: lead.id,
        planName: parsed.data.planName,
        addOnIds: JSON.stringify(addOns.map((addOn) => addOn.id)),
        total,
      },
    });

    return { lead, quote };
  });

  await sendLeadNotification("New package quote", `<p>Package quote total: $${total}</p>`);

  return NextResponse.json(result, { status: 201 });
}
