import { notFound, redirect } from "next/navigation";
import { ManualPaymentPageForm } from "@/components/sections/ManualPaymentCheckout";
import { PricingBackdrop } from "@/components/sections/PricingBackdrop";
import { db } from "@/lib/db";
import { getManualPaymentSettings, parsePlanAmount, publicPaymentSettings } from "@/lib/manualPayments";
import { requireSession } from "@/lib/rbac";

export const dynamic = "force-dynamic";

export default async function PlanPaymentPage({ params }: { params: { planId: string } }) {
  const session = await requireSession();
  if (!session) redirect("/login");

  const [plan, settings] = await Promise.all([
    db.packagePlan.findUnique({ where: { id: params.planId } }),
    getManualPaymentSettings(),
  ]);

  if (!plan || plan.name === "Custom Package Base Fee" || parsePlanAmount(plan.price) <= 0) notFound();

  return (
    <main className="pricing-page relative min-h-screen overflow-hidden bg-[#080216] text-white">
      <PricingBackdrop />
      <ManualPaymentPageForm
        plan={{
          id: plan.id,
          name: plan.name,
          tagline: plan.tagline,
          price: plan.price,
          period: plan.period,
          description: plan.description,
          features: jsonToStringArray(plan.features),
          cta: plan.cta,
          featured: plan.featured,
          order: plan.order,
        }}
        paymentSettings={publicPaymentSettings(settings)}
      />
    </main>
  );
}

function jsonToStringArray(value: string) {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return value
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  }
}
