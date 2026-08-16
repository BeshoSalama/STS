"use client";

import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  BarChart3,
  Box,
  Check,
  Pencil,
  Headphones,
  Megaphone,
  Minus,
  PenLine,
  Plus,
  Send,
  ShieldCheck,
  Sparkles,
  Target,
  Trash2,
  X,
  Wand2,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { ManualPaymentCheckout, type PublicManualPaymentSettings } from "@/components/sections/ManualPaymentCheckout";
import { apiFetch } from "@/lib/apiClient";
import type { PackageAddOn, PackagePlan } from "@/types/content";

const addOnIcons = [PenLine, Megaphone, BarChart3, Target, Box, Wand2, ShieldCheck, Headphones];
const editorInputClass =
  "min-h-10 rounded-[8px] border border-violet-200/15 bg-black/25 px-3 text-sm font-bold text-white outline-none placeholder:text-white/35 focus:border-violet-300/55";
const editorTextAreaClass =
  "min-h-28 rounded-[8px] border border-violet-200/15 bg-black/25 px-3 py-3 text-sm font-semibold leading-6 text-white outline-none placeholder:text-white/35 focus:border-violet-300/55";

type PricingPlanAction = (formData: FormData) => void | Promise<void>;
type PricingAdminActions = {
  createPlan: PricingPlanAction;
  updatePlan: PricingPlanAction;
  deletePlan: PricingPlanAction;
  updateCustomBase: PricingPlanAction;
  createAddOn: PricingPlanAction;
  updateAddOn: PricingPlanAction;
  deleteAddOn: PricingPlanAction;
};
type CustomPackageMeta = {
  tagline: string;
  description: string;
  cta: string;
  period: string;
};

function featuresToLines(features: string[]) {
  return features.join("\n");
}

function PlanEditorDialog({
  id,
  title,
  plan,
  action,
}: {
  id: string;
  title: string;
  plan?: PackagePlan;
  action: PricingPlanAction;
}) {
  return (
    <dialog
      id={id}
      className="w-[min(94vw,860px)] rounded-[8px] border border-violet-200/20 bg-[#10031f] p-0 text-white shadow-[0_30px_90px_rgba(0,0,0,0.62)] backdrop:bg-black/70"
    >
      <div className="p-5 sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-[#dac7f5]/80">Pricing Card</p>
            <h3 className="mt-2 font-display text-3xl font-black">{title}</h3>
          </div>
          <button
            type="button"
            onClick={() => document.getElementById(id) instanceof HTMLDialogElement && (document.getElementById(id) as HTMLDialogElement).close()}
            className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white"
            aria-label="Close editor"
          >
            <X size={17} />
          </button>
        </div>

        <form action={action} className="grid gap-3 md:grid-cols-4">
          {plan?.id && <input type="hidden" name="id" value={plan.id} />}
          <input name="name" required defaultValue={plan?.name ?? ""} placeholder="Plan name" className={editorInputClass} />
          <input name="tagline" required defaultValue={plan?.tagline ?? ""} placeholder="Short tagline" className={editorInputClass} />
          <input name="price" required defaultValue={plan?.price ?? ""} placeholder="$499" className={editorInputClass} />
          <input name="period" required defaultValue={plan?.period ?? "/mo"} placeholder="/mo" className={editorInputClass} />
          <textarea name="description" required defaultValue={plan?.description ?? ""} placeholder="Plan description" className={`${editorTextAreaClass} md:col-span-2`} />
          <textarea name="features" required defaultValue={plan ? featuresToLines(plan.features) : ""} placeholder="One feature per line" className={`${editorTextAreaClass} md:col-span-2`} />
          <input name="cta" required defaultValue={plan?.cta ?? "Get Started"} placeholder="Button text" className={editorInputClass} />
          <input name="order" type="number" defaultValue={plan?.order ?? 0} className={editorInputClass} />
          <label className="flex min-h-10 items-center gap-2 rounded-[8px] border border-violet-200/15 bg-black/20 px-3 text-sm font-bold text-white/78">
            <input name="featured" type="checkbox" defaultChecked={Boolean(plan?.featured)} />
            Most Popular
          </label>
          <button className="rounded-[8px] bg-violet-gradient px-5 py-3 text-sm font-black text-white shadow-[0_18px_44px_rgba(109,63,196,0.28)]">
            Save Card
          </button>
        </form>
      </div>
    </dialog>
  );
}

function PlanCard({
  index,
  plan,
  isAuthenticated,
  paymentSettings,
  adminActions,
}: {
  index: number;
  plan: PackagePlan;
  isAuthenticated: boolean;
  paymentSettings: PublicManualPaymentSettings;
  adminActions?: PricingAdminActions;
}) {
  const editorId = `pricing-plan-editor-${plan.id ?? index}`;
  return (
    <article
      data-package-card
      style={{ "--package-card-index": index } as CSSProperties}
      className={cn("package-card package-motion group flex h-full min-h-[510px] flex-col rounded-[8px] border p-6", plan.featured && "pricing-plan-featured")}
    >
      {plan.featured && (
        <div className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 rounded-full border border-violet-300/35 bg-violet-gradient px-5 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-white shadow-[0_0_32px_rgba(169,132,227,0.46)]">
          Most Popular
        </div>
      )}

      {adminActions && plan.id && (
        <div className="absolute right-4 top-4 z-20 flex gap-2">
          <button
            type="button"
            onClick={() => document.getElementById(editorId) instanceof HTMLDialogElement && (document.getElementById(editorId) as HTMLDialogElement).showModal()}
            className="grid h-9 w-9 place-items-center rounded-full border border-violet-200/20 bg-black/45 text-violet-100 backdrop-blur transition hover:bg-violet-500/30"
            aria-label={`Edit ${plan.name}`}
          >
            <Pencil size={15} />
          </button>
          <form action={adminActions.deletePlan}>
            <input type="hidden" name="id" value={plan.id} />
            <button
              className="grid h-9 w-9 place-items-center rounded-full border border-red-300/25 bg-red-500/15 text-red-100 backdrop-blur transition hover:bg-red-500/30"
              aria-label={`Delete ${plan.name}`}
            >
              <Trash2 size={15} />
            </button>
          </form>
          <PlanEditorDialog id={editorId} title={`Edit ${plan.name}`} plan={plan} action={adminActions.updatePlan} />
        </div>
      )}

      <span className="font-display text-lg font-bold text-white/45">{String(index + 1).padStart(2, "0")}</span>
      <h3 className="mt-3 font-display text-2xl font-black text-white">{plan.name}</h3>
      <p className="mt-1 min-h-10 text-sm leading-5 text-[#d8cbea]/75">{plan.tagline}</p>

      <div className="mt-4 flex items-end gap-1">
        <span className="font-display text-4xl font-black tracking-normal text-white">{plan.price}</span>
        <span className="pb-1 text-sm font-bold text-[#d8cbea]/75">{plan.period}</span>
      </div>
      <p className="mt-2 text-xs font-semibold text-[#d8cbea]/65">{plan.description}</p>

      <ul className="mt-6 flex-1 space-y-3">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5 text-sm leading-5 text-white/82">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-violet-300/30 bg-violet-400/10 text-[#dac7f5]">
              <Check size={12} strokeWidth={3} />
            </span>
            {feature}
          </li>
        ))}
      </ul>

      <ManualPaymentCheckout plan={plan} isAuthenticated={isAuthenticated} paymentSettings={paymentSettings} />
    </article>
  );
}

function AddPlanCard({ nextOrder, adminActions }: { nextOrder: number; adminActions: PricingAdminActions }) {
  const editorId = "pricing-plan-create";
  const draftPlan: PackagePlan = {
    name: "",
    tagline: "",
    price: "",
    period: "/mo",
    description: "",
    features: [],
    cta: "Get Started",
    order: nextOrder,
  };

  return (
    <article
      data-package-card
      className="package-card package-motion flex min-h-[510px] flex-col items-center justify-center rounded-[8px] border border-dashed border-violet-200/30 bg-white/[0.025] p-6 text-center"
    >
      <button
        type="button"
        onClick={() => document.getElementById(editorId) instanceof HTMLDialogElement && (document.getElementById(editorId) as HTMLDialogElement).showModal()}
        className="grid h-16 w-16 place-items-center rounded-full border border-violet-200/25 bg-violet-500/15 text-violet-100 shadow-[0_18px_44px_rgba(109,63,196,0.2)] transition hover:scale-105 hover:bg-violet-500/25"
        aria-label="Add pricing card"
      >
        <Plus size={26} />
      </button>
      <h3 className="mt-5 font-display text-2xl font-black text-white">Add New Card</h3>
      <p className="mt-2 max-w-52 text-sm leading-6 text-[#d8cbea]/65">Create a new pricing plan directly from this page.</p>
      <PlanEditorDialog id={editorId} title="Add New Plan" plan={draftPlan} action={adminActions.createPlan} />
    </article>
  );
}

function CustomPreviewCard({
  index,
  packageAddOns,
  customPackageBaseFee,
  customPackageMeta,
  adminActions,
}: {
  index: number;
  packageAddOns: PackageAddOn[];
  customPackageBaseFee: number;
  customPackageMeta: CustomPackageMeta;
  adminActions?: PricingAdminActions;
}) {
  const editorId = "custom-package-editor";

  return (
    <article
      data-package-card
      style={{ "--package-card-index": index } as CSSProperties}
      className="package-card package-motion group flex h-full min-h-[510px] flex-col rounded-[8px] border p-6"
    >
      {adminActions && (
        <div className="absolute right-4 top-4 z-20">
          <button
            type="button"
            onClick={() => document.getElementById(editorId) instanceof HTMLDialogElement && (document.getElementById(editorId) as HTMLDialogElement).showModal()}
            className="grid h-9 w-9 place-items-center rounded-full border border-violet-200/20 bg-black/45 text-violet-100 backdrop-blur transition hover:bg-violet-500/30"
            aria-label="Edit custom package"
          >
            <Pencil size={15} />
          </button>
          <CustomPackageEditorDialog
            id={editorId}
            packageAddOns={packageAddOns}
            customPackageBaseFee={customPackageBaseFee}
            customPackageMeta={customPackageMeta}
            adminActions={adminActions}
          />
        </div>
      )}
      <span className="font-display text-lg font-bold text-white/45">{String(index + 1).padStart(2, "0")}</span>
      <h3 className="mt-3 font-display text-2xl font-black text-white">Custom Package</h3>
      <p className="mt-1 min-h-10 text-sm leading-5 text-[#d8cbea]/75">{customPackageMeta.tagline}</p>

      <div className="mt-4 flex items-end gap-1">
        <span className="font-display text-4xl font-black tracking-normal text-white">${customPackageBaseFee.toLocaleString()}+</span>
        <span className="pb-1 text-sm font-bold text-[#d8cbea]/75">{customPackageMeta.period}</span>
      </div>
      <p className="mt-2 text-xs font-semibold text-[#d8cbea]/65">{customPackageMeta.description}</p>

      <div className="mt-6 flex-1 space-y-2">
        {packageAddOns.slice(0, 4).map((addOn, addOnIndex) => {
          const Icon = addOnIcons[addOnIndex % addOnIcons.length];
          return (
            <div key={addOn.id} className="flex items-center gap-3 rounded-[8px] border border-violet-200/12 bg-black/20 p-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[8px] border border-violet-300/20 bg-violet-400/10 text-[#dac7f5]">
                <Icon size={16} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-black text-white">{addOn.label}</span>
                <span className="block text-[10px] font-bold text-[#d8cbea]/55">+${addOn.price.toLocaleString()} /mo</span>
              </span>
            </div>
          );
        })}
      </div>

      <a
        href="/pricing/custom"
        className="mt-8 inline-flex h-11 w-full items-center justify-center gap-3 rounded-[8px] border border-violet-200/15 bg-black/15 px-4 text-sm font-black text-white transition duration-200 hover:-translate-y-0.5 hover:border-violet-300/40 hover:bg-violet-400/10"
      >
        {customPackageMeta.cta}
        <ArrowUpRight size={16} />
      </a>
    </article>
  );
}

function CustomPackageEditorDialog({
  id,
  packageAddOns,
  customPackageBaseFee,
  customPackageMeta,
  adminActions,
}: {
  id: string;
  packageAddOns: PackageAddOn[];
  customPackageBaseFee: number;
  customPackageMeta: CustomPackageMeta;
  adminActions: PricingAdminActions;
}) {
  return (
    <dialog
      id={id}
      className="w-[min(94vw,980px)] rounded-[8px] border border-violet-200/20 bg-[#10031f] p-0 text-white shadow-[0_30px_90px_rgba(0,0,0,0.62)] backdrop:bg-black/70"
    >
      <div className="max-h-[86vh] overflow-auto p-5 sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-[#dac7f5]/80">Custom Package Card</p>
            <h3 className="mt-2 font-display text-3xl font-black">Edit Custom Package</h3>
          </div>
          <button
            type="button"
            onClick={() => document.getElementById(id) instanceof HTMLDialogElement && (document.getElementById(id) as HTMLDialogElement).close()}
            className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white"
            aria-label="Close custom package editor"
          >
            <X size={17} />
          </button>
        </div>

        <form action={adminActions.updateCustomBase} className="grid gap-3 rounded-[8px] border border-violet-200/15 bg-white/[0.035] p-4 md:grid-cols-4">
          <h4 className="font-display text-xl font-bold md:col-span-4">Main Card Details</h4>
          <input name="price" required defaultValue={`$${customPackageBaseFee}`} placeholder="$199" className={editorInputClass} />
          <input name="period" required defaultValue={customPackageMeta.period} placeholder="/mo" className={editorInputClass} />
          <input name="tagline" required defaultValue={customPackageMeta.tagline} className={`${editorInputClass} md:col-span-2`} />
          <textarea
            name="description"
            required
            defaultValue={customPackageMeta.description}
            className={`${editorTextAreaClass} md:col-span-3`}
          />
          <input name="cta" required defaultValue={customPackageMeta.cta} className={editorInputClass} />
          <button className="rounded-[8px] bg-violet-gradient px-5 py-3 text-sm font-black text-white md:col-span-4">
            Save Custom Package
          </button>
        </form>

        <div className="mt-5 grid gap-3">
          <h4 className="font-display text-xl font-bold">Custom Services</h4>
          {packageAddOns.map((addOn, index) => (
            <form key={addOn.id} action={adminActions.updateAddOn} className="grid gap-3 rounded-[8px] border border-violet-200/15 bg-white/[0.035] p-4 md:grid-cols-5">
              <input type="hidden" name="currentId" value={addOn.id} />
              <input name="id" defaultValue={addOn.id} className={editorInputClass} />
              <input name="label" defaultValue={addOn.label} className={editorInputClass} />
              <input name="description" defaultValue={addOn.description} className={`${editorInputClass} md:col-span-2`} />
              <input name="price" type="number" min="0" defaultValue={addOn.price} className={editorInputClass} />
              <input name="order" type="number" defaultValue={addOn.order ?? index} className={editorInputClass} />
              <div className="flex gap-2 md:col-span-4">
                <button className="flex-1 rounded-[8px] bg-violet-gradient px-5 py-3 text-sm font-black text-white">Save Service</button>
                <button formAction={adminActions.deleteAddOn} className="flex-1 rounded-[8px] border border-red-300/30 bg-red-500/10 px-5 py-3 text-sm font-black text-red-100 transition hover:bg-red-500/20">
                  Delete Service
                </button>
              </div>
            </form>
          ))}
        </div>

        <form action={adminActions.createAddOn} className="mt-5 grid gap-3 rounded-[8px] border border-violet-200/15 bg-white/[0.035] p-4 md:grid-cols-5">
          <h4 className="font-display text-xl font-bold md:col-span-5">Add Custom Service</h4>
          <input name="id" required placeholder="service-id" className={editorInputClass} />
          <input name="label" required placeholder="Service name" className={editorInputClass} />
          <input name="description" required placeholder="Description" className={`${editorInputClass} md:col-span-2`} />
          <input name="price" required type="number" min="0" placeholder="350" className={editorInputClass} />
          <input name="order" type="number" defaultValue={packageAddOns.length} className={editorInputClass} />
          <button className="rounded-[8px] bg-violet-gradient px-5 py-3 text-sm font-black text-white md:col-span-5">
            Add Service
          </button>
        </form>
      </div>
    </dialog>
  );
}

export function CustomPackageBuilder({
  packageAddOns,
  customPackageBaseFee,
  isAuthenticated,
}: {
  packageAddOns: PackageAddOn[];
  customPackageBaseFee: number;
  isAuthenticated: boolean;
}) {
  const router = useRouter();
  const [quantities, setQuantities] = useState<Record<string, number>>(() =>
    Object.fromEntries(packageAddOns.slice(0, 4).map((addOn, addOnIndex) => [addOn.id, addOnIndex === 1 ? 2 : 1]))
  );
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  const selectedItems = useMemo(
    () =>
      packageAddOns
        .map((addOn) => ({ ...addOn, quantity: quantities[addOn.id] ?? 0 }))
        .filter((addOn) => addOn.quantity > 0),
    [packageAddOns, quantities]
  );

  const rawTotal = selectedItems.reduce((sum, addOn) => sum + addOn.price * addOn.quantity, customPackageBaseFee);
  const total = billing === "annual" ? Math.round(rawTotal * 0.85) : rawTotal;
  const selectedCount = selectedItems.reduce((sum, addOn) => sum + addOn.quantity, 0);
  const savings = rawTotal - total;
  const level = selectedCount >= 14 ? "Scale" : selectedCount >= 7 ? "Growth" : "Start";

  function updateQuantity(id: string, next: number) {
    setQuantities((prev) => ({ ...prev, [id]: Math.max(0, Math.min(99, next)) }));
  }

  async function requestQuote() {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    setStatus("loading");
    try {
      const response = await apiFetch("/leads/package-quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planName: "Custom Package",
          addOnIds: selectedItems.map((item) => item.id),
          addOns: selectedItems.map((item) => ({ id: item.id, quantity: item.quantity })),
          billing,
        }),
      });

      if (!response.ok) throw new Error("Could not save quote");
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className="pricing-custom-builder container relative z-10 mt-10 rounded-[8px] border border-violet-200/15 p-5 sm:p-7" dir="rtl">
      <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_390px]">
        <div className="min-w-0">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-white">اختر خدماتك</p>
              <p className="mt-1 text-xs text-[#d8cbea]/65">حدد عدد كل خدمة محتاجها والباقي علينا</p>
            </div>
            <div className="flex rounded-[8px] border border-violet-200/15 bg-black/20 p-1">
              <button
                type="button"
                onClick={() => setBilling("monthly")}
                className={cn("rounded-[7px] px-4 py-2 text-xs font-black", billing === "monthly" ? "bg-violet-gradient text-white" : "text-[#d8cbea]/75")}
              >
                شهري
              </button>
              <button
                type="button"
                onClick={() => setBilling("annual")}
                className={cn("rounded-[7px] px-4 py-2 text-xs font-black", billing === "annual" ? "bg-violet-gradient text-white" : "text-[#d8cbea]/75")}
              >
                ادفع سنوي
              </button>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2" dir="rtl">
            {packageAddOns.map((addOn, addOnIndex) => {
              const Icon = addOnIcons[addOnIndex % addOnIcons.length];
              const quantity = quantities[addOn.id] ?? 0;
              return (
                <div key={addOn.id} className={cn("custom-service-row rounded-[8px] border p-4", quantity > 0 ? "is-selected" : "border-violet-200/12")}>
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[8px] border border-violet-300/20 bg-violet-400/10 text-[#dac7f5]">
                      <Icon size={20} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h4 className="truncate text-sm font-black text-white">{addOn.label}</h4>
                      <p className="mt-1 line-clamp-1 text-xs text-[#d8cbea]/65">{addOn.description}</p>
                    </div>
                    <button type="button" onClick={() => updateQuantity(addOn.id, 0)} className="text-[#d8cbea]/45 transition hover:text-white" aria-label="Remove service">
                      ×
                    </button>
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <div className="flex h-9 items-center overflow-hidden rounded-[8px] border border-violet-200/15 bg-black/25">
                      <button type="button" onClick={() => updateQuantity(addOn.id, quantity - 1)} className="grid h-full w-10 place-items-center text-white/80" aria-label="Decrease">
                        <Minus size={14} />
                      </button>
                      <span className="grid h-full w-10 place-items-center border-x border-violet-200/10 text-sm font-black text-white">{quantity}</span>
                      <button type="button" onClick={() => updateQuantity(addOn.id, quantity + 1)} className="grid h-full w-10 place-items-center text-white/80" aria-label="Increase">
                        <Plus size={14} />
                      </button>
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] font-bold text-[#d8cbea]/55">سعر الخدمة</p>
                      <strong className="font-display text-lg text-[#c69cff]">${(addOn.price * Math.max(quantity, 1)).toLocaleString()}</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <aside className="pricing-summary-panel rounded-[8px] border border-violet-200/15 p-5">
          <div className="mb-6 text-center">
            <p className="inline-flex items-center gap-2 text-sm font-black text-white">
              باقتك المخصصة
              <Sparkles size={17} className="text-[#dac7f5]" />
            </p>
            <div className="pricing-gauge mx-auto mt-5">
              <span>{level}</span>
            </div>
            <p className="mt-2 text-xs font-bold text-[#d8cbea]/70">أنت على الطريق الصحيح للنمو</p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-[8px] border border-violet-200/12 bg-black/18 p-3 text-center">
              <p className="text-[10px] text-[#d8cbea]/55">الخدمات</p>
              <strong className="mt-1 block text-white">{selectedItems.length}</strong>
            </div>
            <div className="rounded-[8px] border border-violet-200/12 bg-black/18 p-3 text-center">
              <p className="text-[10px] text-[#d8cbea]/55">الكميات</p>
              <strong className="mt-1 block text-white">{selectedCount}</strong>
            </div>
            <div className="rounded-[8px] border border-emerald-300/15 bg-emerald-400/5 p-3 text-center">
              <p className="text-[10px] text-emerald-100/55">التوفير</p>
              <strong className="mt-1 block text-emerald-200">{billing === "annual" ? "15%" : "0%"}</strong>
            </div>
          </div>

          <div className="mt-5 border-t border-violet-200/10 pt-5">
            <p className="mb-4 text-sm font-black text-white">ملخص الباقة</p>
            <div className="max-h-56 space-y-3 overflow-auto pr-1">
              {selectedItems.length === 0 ? (
                <p className="text-sm text-[#d8cbea]/65">ابدأ بإضافة خدمة واحدة على الأقل.</p>
              ) : (
                selectedItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-3 text-sm">
                    <span className="min-w-0 truncate text-[#d8cbea]/75">{item.label}</span>
                    <span className="shrink-0 text-[#d8cbea]/60">x{item.quantity}</span>
                    <strong className="shrink-0 text-white">${(item.price * item.quantity).toLocaleString()}</strong>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-6 border-t border-violet-200/10 pt-5">
            <p className="text-sm text-[#d8cbea]/70">الإجمالي الشهري</p>
            <div className="mt-2 flex items-end gap-2">
              <strong className="font-display text-5xl font-black text-[#c69cff]">${total.toLocaleString()}</strong>
              <span className="pb-2 text-sm font-bold text-white">/mo</span>
            </div>
            {savings > 0 && <p className="mt-2 text-xs font-bold text-emerald-200">وفرت ${savings.toLocaleString()} عند اختيار الدفع السنوي.</p>}
          </div>

          {status === "done" && <p className="mt-4 text-sm font-bold text-emerald-200">تم حفظ طلب الباقة، هنرجع لك بالتفاصيل.</p>}
          {status === "error" && <p className="mt-4 text-sm font-bold text-red-200">حصل خطأ أثناء الحفظ. جرب مرة أخرى.</p>}

          <button
            type="button"
            onClick={requestQuote}
            disabled={status === "loading" || selectedItems.length === 0}
            className="mt-5 inline-flex h-12 w-full items-center justify-center gap-3 rounded-[8px] bg-violet-gradient px-5 text-sm font-black text-white shadow-[0_18px_44px_rgba(109,63,196,0.38)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-55"
          >
            {status === "loading" ? "جاري الحفظ..." : "اطلب هذه الباقة الآن"}
            <Send size={17} />
          </button>
        </aside>
      </div>
    </section>
  );
}

export function PackageCards({
  packagePlans,
  packageAddOns,
  customPackageBaseFee,
  customPackageMeta,
  isAuthenticated,
  paymentSettings,
  adminActions,
}: {
  packagePlans: PackagePlan[];
  packageAddOns: PackageAddOn[];
  customPackageBaseFee: number;
  customPackageMeta: CustomPackageMeta;
  isAuthenticated: boolean;
  paymentSettings: PublicManualPaymentSettings;
  adminActions?: PricingAdminActions;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const cards = Array.from(container.querySelectorAll<HTMLElement>("[data-package-card]"));
    let frameId = 0;

    const observer = new IntersectionObserver(
      ([entry]) => {
        cancelAnimationFrame(frameId);
        frameId = requestAnimationFrame(() => {
          cards.forEach((card) => {
            card.classList.toggle("package-card-visible", entry.isIntersecting);
          });
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -4% 0px" }
    );

    observer.observe(container);
    return () => {
      cancelAnimationFrame(frameId);
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={ref} className="package-showcase container grid gap-5 pt-12 sm:grid-cols-2 xl:grid-cols-4 xl:items-stretch">
      {packagePlans.map((plan, index) => (
        <PlanCard
          key={plan.id ?? plan.name}
          index={index}
          plan={plan}
          isAuthenticated={isAuthenticated}
          paymentSettings={paymentSettings}
          adminActions={adminActions}
        />
      ))}
      <CustomPreviewCard
        index={packagePlans.length}
        packageAddOns={packageAddOns}
        customPackageBaseFee={customPackageBaseFee}
        customPackageMeta={customPackageMeta}
        adminActions={adminActions}
      />
      {adminActions && <AddPlanCard nextOrder={packagePlans.length + 1} adminActions={adminActions} />}
    </div>
  );
}
