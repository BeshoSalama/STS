"use client";

import { FormEvent, useState } from "react";
import { CheckCircle2, ClipboardList, Send } from "lucide-react";

const socialPlatforms = ["Facebook", "Instagram", "Twitter", "Google", "YouTube", "Other"];
const toneOptions = ["Funny", "Cool", "Trendy", "Formal"];
const advertisingPlatforms = ["Facebook", "Instagram", "Twitter", "Google", "YouTube", "Other"];
const languageOptions = ["AR", "ENG", "Other"];

function Field({
  label,
  name,
  type = "text",
  required = false,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="font-display text-sm font-bold text-white/86">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="min-h-12 rounded-lg border border-violet-300/24 bg-white/[0.06] px-4 text-sm font-medium text-white outline-none transition focus:border-violet-300/70 focus:bg-white/[0.09]"
      />
    </label>
  );
}

function TextArea({
  label,
  name,
  rows = 4,
  required = false,
  placeholder,
}: {
  label: string;
  name: string;
  rows?: number;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="font-display text-sm font-bold text-white/86">{label}</span>
      <textarea
        name={name}
        rows={rows}
        required={required}
        placeholder={placeholder}
        className="resize-y rounded-lg border border-violet-300/24 bg-white/[0.06] px-4 py-3 text-sm font-medium leading-6 text-white outline-none transition focus:border-violet-300/70 focus:bg-white/[0.09]"
      />
    </label>
  );
}

function SelectField({
  label,
  name,
  options,
}: {
  label: string;
  name: string;
  options: string[];
}) {
  return (
    <label className="grid gap-2">
      <span className="font-display text-sm font-bold text-white/86">{label}</span>
      <select
        name={name}
        className="min-h-12 rounded-lg border border-violet-300/24 bg-[#16072d] px-4 text-sm font-semibold text-white outline-none transition focus:border-violet-300/70"
        defaultValue=""
      >
        <option value="" disabled>
          Select
        </option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function CheckboxGroup({
  label,
  name,
  options,
}: {
  label: string;
  name: string;
  options: string[];
}) {
  return (
    <fieldset className="grid gap-3">
      <legend className="font-display text-sm font-bold text-white/86">{label}</legend>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {options.map((option) => (
          <label
            key={option}
            className="flex min-h-11 items-center gap-3 rounded-lg border border-violet-300/18 bg-white/[0.045] px-3 text-sm font-semibold text-white/78"
          >
            <input
              name={name}
              type="checkbox"
              value={option}
              className="h-4 w-4 accent-[#a984e3]"
            />
            {option}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid gap-5 border-t border-violet-300/16 pt-7">
      <h2 className="font-display text-xl font-extrabold text-white">{title}</h2>
      {children}
    </section>
  );
}

export default function BriefPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    const formElement = event.currentTarget;
    const formData = new FormData(formElement);
    const payload = Object.fromEntries(formData.entries()) as Record<string, FormDataEntryValue | string[]>;

    for (const key of ["socialPlatforms", "toneOfVoice", "advertisingPlatforms", "languages"]) {
      payload[key] = formData.getAll(key).map(String);
    }

    try {
      const response = await fetch("/api/leads/brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Could not submit the brief");
      }

      setStatus("done");
      formElement.reset();
      formElement.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Could not submit the brief");
    }
  }

  return (
    <main className="min-h-screen bg-[#080216] pt-36 text-white sm:pt-44">
      <section className="container pb-24">
        <div className="mb-9 max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-violet-300/24 bg-white/[0.06] px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-violet-200">
            <ClipboardList size={15} />
            Client Brief
          </span>
          <h1 className="mt-5 font-display text-5xl font-extrabold leading-none text-white sm:text-6xl">
            Operation Meeting Brief
          </h1>
          <p className="mt-5 max-w-2xl text-base font-medium leading-7 text-white/70">
            Fill the client and brand details from the brief. This form covers only pages 1 to 5.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid gap-8 rounded-[1.75rem] border border-violet-300/18 bg-[#16072d]/82 p-5 shadow-card-lg backdrop-blur-xl sm:p-7 lg:p-9"
        >
          {status === "done" && (
            <div className="flex items-center gap-3 rounded-xl border border-emerald-300/22 bg-emerald-400/10 px-4 py-3 text-sm font-semibold text-emerald-100">
              <CheckCircle2 size={19} />
              Brief submitted. Our team will review it shortly.
            </div>
          )}
          {status === "error" && (
            <div className="rounded-xl border border-red-300/24 bg-red-400/10 px-4 py-3 text-sm font-semibold text-red-100">
              {message}
            </div>
          )}

          <Section title="Client Details">
            <div className="grid gap-5 lg:grid-cols-2">
              <Field label="Client Name" name="clientName" required />
              <Field label="Brand Name" name="brandName" required />
              <Field label="Brief Date" name="briefDate" type="date" />
              <Field label="Email" name="email" type="email" placeholder="name@example.com" />
              <Field label="Phone" name="phone" type="tel" required />
            </div>
            <TextArea label="The main goals of this project" name="mainGoals" rows={3} />
            <TextArea label="Role Model" name="roleModel" rows={3} />
            <TextArea label="Competitors Links" name="competitorsLinks" rows={4} placeholder="Add one link per line" />
          </Section>

          <Section title="Brand Foundation">
            <div className="grid gap-5 lg:grid-cols-2">
              <SelectField label="Do you have a professional - existing brand identity?" name="brandIdentity" options={["Yes", "No"]} />
              <SelectField label="Brand level in digital marketing (A-B-C)" name="brandLevel" options={["A", "B", "C"]} />
              <SelectField label="Current customers segment" name="customerSegment" options={["A", "B", "C"]} />
              <SelectField label="Business Type" name="businessType" options={["Service", "Product", "B2B", "B2C"]} />
            </div>
            <CheckboxGroup label="Current social media platforms" name="socialPlatforms" options={socialPlatforms} />
            <Field label="Brand Slogan" name="brandSlogan" />
            <div className="grid gap-5 lg:grid-cols-2">
              <Field label="If new logo what are the preferred colors?" name="preferredColors" />
              <Field label="Color numbers" name="colorNumbers" placeholder="#000000, Pantone, RGB..." />
            </div>
            <CheckboxGroup label="Tone of voice" name="toneOfVoice" options={toneOptions} />
          </Section>

          <Section title="Marketing & Audience">
            <CheckboxGroup label="Advertising Platforms" name="advertisingPlatforms" options={advertisingPlatforms} />
            <div className="grid gap-5 lg:grid-cols-3">
              <Field label="Total Ads Budget" name="adsBudget" />
              <Field label="Target Audience Age" name="targetAge" />
              <Field label="Branches Number" name="branchesNumber" type="number" />
            </div>
            <TextArea label="Locations" name="locations" rows={4} placeholder="Add one location per line" />
            <div className="grid gap-5 lg:grid-cols-2">
              <SelectField label="Gender" name="gender" options={["Both", "Male", "Female"]} />
              <CheckboxGroup label="Languages" name="languages" options={languageOptions} />
            </div>
          </Section>

          <Section title="Links & Strategy">
            <TextArea label="Please add current platforms links" name="platformLinks" rows={4} placeholder="Add one link per line" />
            <TextArea label="Notes" name="notes" rows={3} />
            <SelectField label="Business Type" name="businessModel" options={["B2B", "B2C", "B2B & B2C"]} />
            <TextArea label="Digital Marketing Experience" name="digitalMarketingExperience" rows={5} />
            <TextArea label="Unique selling points" name="uniqueSellingPoints" rows={5} />
            <TextArea label="Plan Objectives" name="planObjectives" rows={5} />
          </Section>

          <div className="flex flex-col gap-3 border-t border-violet-300/16 pt-7 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium text-white/58">Only the first 5 PDF pages are included.</p>
            <button
              type="submit"
              disabled={status === "loading"}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-violet-gradient px-6 text-sm font-extrabold text-white shadow-card transition hover:shadow-card-lg"
              data-ripple
            >
              {status === "loading" ? "Submitting..." : "Submit Brief"}
              <Send size={16} />
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
