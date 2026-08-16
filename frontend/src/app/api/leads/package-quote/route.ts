import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendLeadNotification } from "@/lib/email";
import { getClientIp, rateLimit } from "@/lib/rateLimit";
import { packageQuoteSchema } from "@/lib/validations/packageQuote";

const CUSTOM_PACKAGE_BASE_FEE = 199;

function parsePrice(value: string | null | undefined) {
  const parsed = Number(String(value ?? "").replace(/[^\d]/g, ""));
  return Number.isFinite(parsed) ? parsed : CUSTOM_PACKAGE_BASE_FEE;
}

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

  const requestedAddOns = parsed.data.addOns?.length
    ? parsed.data.addOns
    : parsed.data.addOnIds.map((id) => ({ id, quantity: 1 }));
  const quantities = new Map(requestedAddOns.map((addOn) => [addOn.id, addOn.quantity]));
  const [addOns, baseFeePlan] = await Promise.all([
    db.packageAddOn.findMany({ where: { id: { in: requestedAddOns.map((addOn) => addOn.id) } } }),
    db.packagePlan.findUnique({ where: { name: "Custom Package Base Fee" } }),
  ]);
  const rawTotal = addOns.reduce((sum, addOn) => sum + addOn.price * (quantities.get(addOn.id) ?? 1), parsePrice(baseFeePlan?.price));
  const total = parsed.data.billing === "annual" ? Math.round(rawTotal * 0.85) : rawTotal;
  const quoteItems = addOns.map((addOn) => ({ id: addOn.id, label: addOn.label, quantity: quantities.get(addOn.id) ?? 1, price: addOn.price }));

  const result = await db.$transaction(async (tx) => {
    const lead = await tx.lead.create({
      data: {
        type: "PACKAGE_QUOTE",
        name: user?.name ?? "Package Builder",
        email: user?.email ?? null,
        phone: "not-provided",
        userId: user?.id,
        payload: JSON.stringify({ planName: parsed.data.planName, addOnIds: parsed.data.addOnIds, addOns: quoteItems, billing: parsed.data.billing, total }),
      },
    });

    const quote = await tx.packageQuote.create({
      data: {
        leadId: lead.id,
        planName: parsed.data.planName,
        addOnIds: JSON.stringify(quoteItems),
        total,
      },
    });

    return { lead, quote };
  });

  await sendLeadNotification("New package quote", `<p>Package quote total: $${total}</p>`);

  return NextResponse.json(result, { status: 201 });
}
