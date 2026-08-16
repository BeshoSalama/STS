import { revalidatePath } from "next/cache";
import { PackageCards } from "@/components/sections/PackageCards";
import { PricingBackdrop } from "@/components/sections/PricingBackdrop";
import { auth } from "@/lib/auth";
import { getCustomPackageBaseFee, getCustomPackageMeta, getPackageAddOns, getPackagePlans } from "@/lib/content/packages";
import { db } from "@/lib/db";
import { getManualPaymentSettings, publicPaymentSettings } from "@/lib/manualPayments";
import { requireAdminSession } from "@/lib/rbac";
import { isAdmin } from "@/lib/roles";

export const dynamic = "force-dynamic";

function linesToJson(value: FormDataEntryValue | null) {
  return JSON.stringify(
    String(value ?? "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
  );
}

async function createPlanFromPricing(formData: FormData) {
  "use server";
  if (!(await requireAdminSession())) throw new Error("Admin access required");

  await db.packagePlan.create({
    data: {
      name: String(formData.get("name") ?? ""),
      tagline: String(formData.get("tagline") ?? ""),
      price: String(formData.get("price") ?? ""),
      period: String(formData.get("period") ?? ""),
      description: String(formData.get("description") ?? ""),
      features: linesToJson(formData.get("features")),
      cta: String(formData.get("cta") ?? "Get Started"),
      featured: formData.get("featured") === "on",
      order: Number(formData.get("order") ?? 0),
    },
  });

  revalidatePath("/pricing");
  revalidatePath("/admin/packages");
}

async function updatePlanFromPricing(formData: FormData) {
  "use server";
  if (!(await requireAdminSession())) throw new Error("Admin access required");

  await db.packagePlan.update({
    where: { id: String(formData.get("id") ?? "") },
    data: {
      name: String(formData.get("name") ?? ""),
      tagline: String(formData.get("tagline") ?? ""),
      price: String(formData.get("price") ?? ""),
      period: String(formData.get("period") ?? ""),
      description: String(formData.get("description") ?? ""),
      features: linesToJson(formData.get("features")),
      cta: String(formData.get("cta") ?? "Get Started"),
      featured: formData.get("featured") === "on",
      order: Number(formData.get("order") ?? 0),
    },
  });

  revalidatePath("/pricing");
  revalidatePath("/admin/packages");
}

async function deletePlanFromPricing(formData: FormData) {
  "use server";
  if (!(await requireAdminSession())) throw new Error("Admin access required");

  await db.packagePlan.delete({ where: { id: String(formData.get("id") ?? "") } });
  revalidatePath("/pricing");
  revalidatePath("/admin/packages");
}

async function updateCustomBaseFromPricing(formData: FormData) {
  "use server";
  if (!(await requireAdminSession())) throw new Error("Admin access required");

  const price = String(formData.get("price") ?? "$199");
  await db.packagePlan.upsert({
    where: { name: "Custom Package Base Fee" },
    update: {
      tagline: String(formData.get("tagline") ?? "Tailored to your unique goals"),
      price,
      period: String(formData.get("period") ?? "/mo"),
      description: String(formData.get("description") ?? "Pick exactly the services you need. Nothing you don't."),
      features: "[]",
      cta: String(formData.get("cta") ?? "Build My Package"),
      order: 999,
    },
    create: {
      name: "Custom Package Base Fee",
      tagline: String(formData.get("tagline") ?? "Tailored to your unique goals"),
      price,
      period: String(formData.get("period") ?? "/mo"),
      description: String(formData.get("description") ?? "Pick exactly the services you need. Nothing you don't."),
      features: "[]",
      cta: String(formData.get("cta") ?? "Build My Package"),
      order: 999,
    },
  });

  revalidatePath("/pricing");
  revalidatePath("/admin/packages");
}

async function createAddOnFromPricing(formData: FormData) {
  "use server";
  if (!(await requireAdminSession())) throw new Error("Admin access required");

  await db.packageAddOn.create({
    data: {
      id: String(formData.get("id") ?? ""),
      label: String(formData.get("label") ?? ""),
      description: String(formData.get("description") ?? ""),
      price: Number(formData.get("price") ?? 0),
      order: Number(formData.get("order") ?? 0),
    },
  });

  revalidatePath("/pricing");
  revalidatePath("/admin/packages");
}

async function updateAddOnFromPricing(formData: FormData) {
  "use server";
  if (!(await requireAdminSession())) throw new Error("Admin access required");

  await db.packageAddOn.update({
    where: { id: String(formData.get("currentId") ?? "") },
    data: {
      id: String(formData.get("id") ?? ""),
      label: String(formData.get("label") ?? ""),
      description: String(formData.get("description") ?? ""),
      price: Number(formData.get("price") ?? 0),
      order: Number(formData.get("order") ?? 0),
    },
  });

  revalidatePath("/pricing");
  revalidatePath("/admin/packages");
}

async function deleteAddOnFromPricing(formData: FormData) {
  "use server";
  if (!(await requireAdminSession())) throw new Error("Admin access required");

  await db.packageAddOn.delete({ where: { id: String(formData.get("currentId") ?? "") } });
  revalidatePath("/pricing");
  revalidatePath("/admin/packages");
}

export default async function PricingPage() {
  const [packagePlans, packageAddOns, customPackageBaseFee, customPackageMeta, session, manualPaymentSettings] = await Promise.all([
    getPackagePlans(),
    getPackageAddOns(),
    getCustomPackageBaseFee(),
    getCustomPackageMeta(),
    auth(),
    getManualPaymentSettings(),
  ]);
  const canEditPricing = isAdmin(session?.user?.role);

  return (
    <section className="pricing-page relative overflow-hidden pb-24 pt-36 sm:pt-44">
      <PricingBackdrop />

      <div className="container relative z-10 text-center">
        <p className="mx-auto flex w-fit items-center gap-4 text-xs font-black uppercase tracking-[0.42em] text-[#dac7f5]/85 before:h-px before:w-16 before:bg-violet-300/20 after:h-px after:w-16 after:bg-violet-300/20">
          Marketing Packages
        </p>
        <h1 className="mx-auto mt-5 max-w-4xl font-display text-4xl font-black leading-[1.05] tracking-normal text-white sm:text-6xl">
          Pick a plan, or build a <span className="bg-violet-gradient-text bg-clip-text text-transparent">package that&apos;s uniquely yours</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#d8cbea]/80">
          We don&apos;t just run campaigns. We build growth systems that deliver real results.
        </p>
        <div className="mx-auto mt-8 grid max-w-3xl gap-3 text-xs font-bold text-[#d8cbea]/80 sm:grid-cols-3">
          <span>Data-Driven Strategies</span>
          <span>Creative That Converts</span>
          <span>Results You Can Measure</span>
        </div>
      </div>

      <PackageCards
        packagePlans={packagePlans}
        packageAddOns={packageAddOns}
        customPackageBaseFee={customPackageBaseFee}
        customPackageMeta={customPackageMeta}
        isAuthenticated={Boolean(session?.user?.id)}
        paymentSettings={publicPaymentSettings(manualPaymentSettings)}
        adminActions={
          canEditPricing
            ? {
                createPlan: createPlanFromPricing,
                updatePlan: updatePlanFromPricing,
                deletePlan: deletePlanFromPricing,
                updateCustomBase: updateCustomBaseFromPricing,
                createAddOn: createAddOnFromPricing,
                updateAddOn: updateAddOnFromPricing,
                deleteAddOn: deleteAddOnFromPricing,
              }
            : undefined
        }
      />

      <div className="container relative z-10 mt-12 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="pricing-info-band rounded-[8px] border border-violet-200/15 p-6">
          <h2 className="font-display text-2xl font-black text-white">What&apos;s included in every plan</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-4">
            {["Strategy First", "Content That Sells", "Performance Tracking", "Dedicated Support"].map((item) => (
              <div key={item} className="rounded-[8px] border border-violet-200/10 bg-black/15 p-4">
                <p className="text-sm font-black text-white">{item}</p>
                <p className="mt-2 text-xs leading-5 text-[#d8cbea]/65">A focused foundation to keep your brand growing with clarity.</p>
              </div>
            ))}
          </div>
        </div>
        <div className="pricing-info-band rounded-[8px] border border-violet-200/15 p-6">
          <h2 className="font-display text-2xl font-black text-white">Not sure which plan is right?</h2>
          <p className="mt-3 text-sm leading-6 text-[#d8cbea]/70">Let&apos;s build a custom strategy that fits your goals and budget.</p>
          <a href="/contact-us" className="mt-6 inline-flex h-11 items-center rounded-[8px] bg-violet-gradient px-6 text-sm font-black text-white">
            Book a Free Consultation
          </a>
        </div>
      </div>
    </section>
  );
}
