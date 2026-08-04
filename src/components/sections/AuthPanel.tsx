"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { ArrowRight, LockKeyhole, Mail, UserRound } from "lucide-react";
import { apiFetch } from "@/lib/apiClient";
import { cn } from "@/lib/cn";

type AuthMode = "login" | "register";

interface AuthPanelProps {
  mode: AuthMode;
}

const copy = {
  login: {
    eyebrow: "Welcome Back",
    title: "Login",
    subtitle: "Access your STS growth workspace.",
    button: "Login",
    switchText: "New here?",
    switchLabel: "Create account",
    switchHref: "/register",
  },
  register: {
    eyebrow: "Start Growing",
    title: "Create Account",
    subtitle: "Create your STS client account.",
    button: "Create Account",
    switchText: "Already have an account?",
    switchLabel: "Login",
    switchHref: "/login",
  },
};

function Field({
  icon,
  label,
  name,
  type,
  placeholder,
  value,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  name: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-violet-700">{label}</span>
      <span className="flex items-center gap-3 rounded-full border border-violet-400/30 bg-white/10 px-5 py-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)] transition focus-within:border-violet-400 focus-within:ring-4 focus-within:ring-violet-400/30">
        <span className="text-violet-500">{icon}</span>
        <input
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="min-w-0 flex-1 bg-transparent text-sm font-medium text-ink outline-none placeholder:text-muted/65"
        />
      </span>
    </label>
  );
}

export function AuthPanel({ mode }: AuthPanelProps) {
  const router = useRouter();
  const data = copy[mode];
  const isRegister = mode === "register";
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [message, setMessage] = useState("");

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      if (isRegister) {
        const response = await apiFetch("/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });

        if (!response.ok) {
          const data = (await response.json().catch(() => null)) as { error?: string } | null;
          throw new Error(typeof data?.error === "string" ? data.error : "Could not create account");
        }
      }

      const result = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error("Invalid email or password");
      }

      router.push("/portal");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setStatus("idle");
    }
  }

  return (
    <section className="relative min-h-screen overflow-hidden px-4 pb-20 pt-32 sm:pt-36">
      <div className="container grid min-h-[calc(100vh-10rem)] items-center gap-8 lg:grid-cols-[1fr_0.92fr]">
        <div className="max-w-2xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-violet-600">{data.eyebrow}</p>
          <h1 className="font-display text-5xl font-extrabold leading-[0.95] text-ink sm:text-7xl">
            STS{" "}
            <span className="block">
              <span className="block bg-violet-gradient-text bg-clip-text text-transparent sm:inline">Growth</span>
              <span className="block bg-violet-gradient-text bg-clip-text text-transparent sm:ml-3 sm:inline">Portal</span>
            </span>
          </h1>
          <p className="mt-6 max-w-md text-base leading-8 text-muted sm:text-lg">
            Keep your brand requests, campaign updates, and consultation details in one focused place.
          </p>
        </div>

        <div className="rounded-[2rem] border border-violet-400/30 bg-surface-card/90 p-5 shadow-card-lg backdrop-blur-xl sm:p-7">
          <div className="rounded-[1.55rem] border border-violet-200/80 bg-violet-50/70 p-6 sm:p-8">
            <div className="mb-8">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-500">{data.eyebrow}</p>
              <h2 className="mt-3 font-display text-4xl font-extrabold text-ink">{data.title}</h2>
              <p className="mt-2 text-sm text-muted">{data.subtitle}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {isRegister && (
                <Field
                  icon={<UserRound size={18} />}
                  label="Name"
                  name="name"
                  type="text"
                  placeholder="Your name"
                  value={form.name}
                  onChange={(value) => updateField("name", value)}
                />
              )}
              <Field
                icon={<Mail size={18} />}
                label="Email"
                name="email"
                type="email"
                placeholder="you@company.com"
                value={form.email}
                onChange={(value) => updateField("email", value)}
              />
              <Field
                icon={<LockKeyhole size={18} />}
                label="Password"
                name="password"
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={(value) => updateField("password", value)}
              />

              {isRegister && (
                <Field
                  icon={<LockKeyhole size={18} />}
                  label="Confirm Password"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm password"
                  value={form.confirmPassword}
                  onChange={(value) => updateField("confirmPassword", value)}
                />
              )}

              {message && (
                <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                  {message}
                </p>
              )}

              <button
                type="submit"
                disabled={status === "loading"}
                className={cn(
                  "group flex w-full items-center justify-center gap-3 rounded-full px-6 py-4 text-sm font-bold text-white shadow-card transition duration-300 hover:-translate-y-0.5 hover:shadow-card-lg",
                  "bg-violet-gradient disabled:cursor-not-allowed disabled:opacity-70"
                )}
              >
                {status === "loading" ? "Please wait..." : data.button}
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 transition-transform duration-300 group-hover:translate-x-1">
                  <ArrowRight size={15} />
                </span>
              </button>
            </form>

            <p className="mt-7 text-center text-sm text-muted">
              {data.switchText}{" "}
              <Link href={data.switchHref} className="font-bold text-violet-600 hover:text-violet-700">
                {data.switchLabel}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
