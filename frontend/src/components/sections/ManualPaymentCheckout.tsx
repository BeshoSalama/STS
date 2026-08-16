"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, CheckCircle2, CreditCard, Loader2, Smartphone, Upload, Wallet } from "lucide-react";
import { cn } from "@/lib/cn";
import type { PackagePlan } from "@/types/content";

type PublicPaymentMethod = {
  enabled: boolean;
  label: string;
  destination: string;
  destinations: string[];
  accountName: string;
  instructions: string;
};

export type PublicManualPaymentSettings = {
  currency: string;
  methods: {
    VODAFONE_CASH: PublicPaymentMethod;
    INSTAPAY: PublicPaymentMethod;
  };
};

const methodIcons = {
  VODAFONE_CASH: Smartphone,
  INSTAPAY: Wallet,
};

const methodNames = {
  VODAFONE_CASH: "Vodafone Cash",
  INSTAPAY: "InstaPay",
};

type PaymentMethodKey = keyof PublicManualPaymentSettings["methods"];

export function ManualPaymentCheckout({ plan, isAuthenticated }: { plan: PackagePlan; isAuthenticated: boolean; paymentSettings: PublicManualPaymentSettings }) {
  const router = useRouter();

  function startPayment() {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    router.push(`/pricing/pay/${plan.id}`);
  }

  return (
    <button
      type="button"
      onClick={startPayment}
      className={cn(
        "mt-8 inline-flex h-11 w-full items-center justify-center gap-3 rounded-[8px] border px-4 text-sm font-black transition duration-200 hover:-translate-y-0.5",
        plan.featured
          ? "border-violet-300/35 bg-violet-gradient text-white shadow-[0_16px_38px_rgba(109,63,196,0.36)]"
          : "border-violet-200/15 bg-black/15 text-white hover:border-violet-300/40 hover:bg-violet-400/10"
      )}
    >
      {plan.cta}
      <CreditCard size={16} />
    </button>
  );
}

export function ManualPaymentPageForm({
  plan,
  paymentSettings,
}: {
  plan: PackagePlan;
  paymentSettings: PublicManualPaymentSettings;
}) {
  const router = useRouter();
  const [method, setMethod] = useState<PaymentMethodKey>("VODAFONE_CASH");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const amount = useMemo(() => parsePlanAmount(plan.price), [plan.price]);
  const selectedMethod = paymentSettings.methods[method];

  async function submitPayment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return;
    setStatus("submitting");
    setMessage("");

    const formData = new FormData(event.currentTarget);
    formData.set("planId", plan.id ?? "");
    formData.set("paymentMethod", method);

    try {
      const response = await fetch("/api/manual-payments", { method: "POST", body: formData });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Could not submit payment.");
      setStatus("success");
      setMessage("تم إرسال بيانات التحويل بنجاح، وسيتم مراجعة عملية الدفع من الإدارة.");
      router.refresh();
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Could not submit payment.");
    }
  }

  return (
    <section className="container relative z-10 grid gap-6 py-32 text-white lg:grid-cols-[0.82fr_1.18fr]">
      <aside className="h-fit rounded-[8px] border border-violet-200/14 bg-white/[0.04] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.25)]">
        <Link href="/pricing" className="inline-flex items-center gap-2 text-sm font-black text-violet-100 transition hover:text-white">
          <ArrowLeft size={16} />
          Back to pricing
        </Link>
        <p className="mt-7 text-xs font-black uppercase tracking-[0.2em] text-violet-200">Selected Plan</p>
        <h1 className="mt-3 font-display text-4xl font-black">{plan.name}</h1>
        <p className="mt-2 text-sm leading-6 text-[#d8cbea]/72">{plan.tagline}</p>
        <div className="mt-5 rounded-[8px] border border-violet-200/12 bg-black/25 p-4">
          <p className="text-xs font-bold text-[#d8cbea]/60">Required Amount</p>
          <strong className="mt-1 block font-display text-5xl font-black text-[#c69cff]">{formatMoney(amount, paymentSettings.currency)}</strong>
          <span className="text-sm font-bold text-white/52">{plan.period}</span>
        </div>
        <p className="mt-4 text-sm leading-6 text-[#d8cbea]/68">{plan.description}</p>
        <ul className="mt-5 space-y-3">
          {plan.features.map((feature) => (
            <li key={feature} className="flex gap-2.5 text-sm leading-5 text-white/82">
              <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-200" size={16} />
              {feature}
            </li>
          ))}
        </ul>
      </aside>

      <div className="grid gap-5">
        <div className="rounded-[8px] border border-violet-200/14 bg-white/[0.04] p-5">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-violet-200">Manual Payment</p>
          <h2 className="mt-2 font-display text-3xl font-black">Choose transfer method</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {(Object.keys(paymentSettings.methods) as PaymentMethodKey[]).map((key) => {
              const Icon = methodIcons[key];
              const item = paymentSettings.methods[key];
              const active = method === key;
              return (
                <button
                  key={key}
                  type="button"
                  disabled={!item.enabled || item.destinations.length === 0}
                  onClick={() => setMethod(key)}
                  className={cn(
                    "min-h-28 rounded-[8px] border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-45",
                    active ? "border-violet-300/45 bg-violet-500/18" : "border-violet-200/14 bg-black/20 hover:bg-white/[0.06]"
                  )}
                >
                  <span className="flex items-center gap-3">
                    <span className="grid h-11 w-11 place-items-center rounded-[8px] border border-violet-300/20 bg-violet-400/10 text-[#dac7f5]">
                      <Icon size={19} />
                    </span>
                    <span>
                      <span className="block text-sm font-black">{methodNames[key]}</span>
                      <span className="mt-1 block text-xs font-semibold text-[#d8cbea]/58">
                        {item.destinations.length > 0 ? item.destinations.join(" / ") : "Configure in admin settings"}
                      </span>
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <form onSubmit={submitPayment} className="grid gap-5 rounded-[8px] border border-violet-200/14 bg-white/[0.04] p-5">
          <div className="rounded-[8px] border border-violet-200/14 bg-black/20 p-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-white/42">Transfer To</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {selectedMethod.destinations.map((destination, index) => (
                <ReadOnlyDetail
                  key={`${method}-${destination}-${index}`}
                  label={method === "VODAFONE_CASH" ? `Vodafone Cash ${index + 1}` : selectedMethod.label}
                  value={destination}
                />
              ))}
              <ReadOnlyDetail label="Account Name" value={selectedMethod.accountName || "Not configured"} />
            </div>
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-6 text-[#d8cbea]/75">
              <li>Transfer the exact required amount shown on this page.</li>
              <li>Keep a screenshot that clearly shows the transfer details.</li>
              <li>Fill in the sender details and upload the screenshot.</li>
              <li>Submit once. Your subscription activates only after admin approval.</li>
            </ol>
            <p className="mt-3 rounded-[8px] border border-violet-200/10 bg-white/[0.035] p-3 text-sm leading-6 text-white/72">
              {selectedMethod.instructions}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <PaymentInput name="senderName" label="Sender Name" required />
            <PaymentInput name="senderPhone" label="Sender Phone / Identifier" required />
            <PaymentInput name="transactionReference" label="Transaction Reference" />
            <PaymentInput name="transferDate" label="Transfer Date" type="date" required />
            <PaymentInput name="transferTime" label="Transfer Time" type="time" />
            <label className="grid gap-2 text-sm font-bold sm:col-span-2">
              Payment Proof
              <span className="flex min-h-24 items-center justify-center rounded-[8px] border border-dashed border-violet-200/25 bg-black/20 px-3 text-center text-sm text-[#d8cbea]/70">
                <span className="inline-flex items-center gap-2">
                  <Upload size={17} />
                  <input name="proof" type="file" accept="image/jpeg,image/png,image/webp" required className="max-w-full text-xs" />
                </span>
              </span>
            </label>
            <label className="grid gap-2 text-sm font-bold sm:col-span-2">
              Notes
              <textarea name="notes" rows={3} className={inputClass} />
            </label>
          </div>

          {message && (
            <p
              className={cn(
                "flex items-start gap-2 rounded-[8px] border p-3 text-sm font-bold",
                status === "success" ? "border-emerald-300/25 bg-emerald-400/10 text-emerald-100" : "border-red-300/25 bg-red-500/10 text-red-100"
              )}
            >
              {status === "success" ? <CheckCircle2 size={17} /> : <AlertCircle size={17} />}
              {message}
            </p>
          )}

          <button
            disabled={status === "submitting" || !selectedMethod.enabled || selectedMethod.destinations.length === 0}
            className="inline-flex h-12 items-center justify-center gap-3 rounded-[8px] bg-violet-gradient px-5 text-sm font-black text-white shadow-[0_18px_44px_rgba(109,63,196,0.36)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-55"
          >
            {status === "submitting" ? <Loader2 className="animate-spin" size={17} /> : <Upload size={17} />}
            Submit Payment Proof
          </button>
        </form>
      </div>
    </section>
  );
}

const inputClass =
  "min-h-11 rounded-[8px] border border-violet-200/15 bg-black/25 px-3 text-sm font-semibold text-white outline-none placeholder:text-white/35 focus:border-violet-300/55";

function PaymentInput({ label, name, type = "text", required = false }: { label: string; name: string; type?: string; required?: boolean }) {
  return (
    <label className="grid gap-2 text-sm font-bold">
      {label}
      <input name={name} type={type} required={required} className={inputClass} />
    </label>
  );
}

function ReadOnlyDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[8px] border border-violet-200/12 bg-white/[0.035] p-3">
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/38">{label}</p>
      <p className="mt-1 break-words text-sm font-black text-white">{value}</p>
    </div>
  );
}

function parsePlanAmount(price: string) {
  const match = price.replace(/,/g, "").match(/([0-9]+(?:\.[0-9]+)?)/);
  return match ? Number(match[1]) : 0;
}

function formatMoney(amount: number, currency: string) {
  return `${amount.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${currency}`;
}
