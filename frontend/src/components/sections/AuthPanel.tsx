"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { ArrowRight, CheckCircle2, Eye, EyeOff, LockKeyhole, Mail, UserRound, XCircle } from "lucide-react";
import { cn } from "@/lib/cn";
import { passwordRules } from "@/lib/validations/auth";

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
  showToggle,
}: {
  icon: React.ReactNode;
  label: string;
  name: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  showToggle?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  const inputType = showToggle ? (visible ? "text" : "password") : type;

  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-violet-700">
        {label}
      </span>

      <span className="flex items-center gap-3 rounded-full border border-violet-400/30 bg-white/10 px-5 py-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)] transition focus-within:border-violet-400 focus-within:ring-4 focus-within:ring-violet-400/30">
        <span className="text-violet-500">{icon}</span>

        <input
          name={name}
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="min-w-0 flex-1 bg-transparent text-sm font-medium text-ink outline-none placeholder:text-muted/65"
        />

        {showToggle && (
          <button
            type="button"
            aria-label={visible ? `Hide ${label}` : `Show ${label}`}
            title={visible ? `Hide ${label}` : `Show ${label}`}
            onClick={() => setVisible((current) => !current)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-violet-600 transition hover:bg-violet-100"
          >
            {visible ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </span>
    </label>
  );
}

function getErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "string") {
    return error;
  }

  if (error && typeof error === "object" && "fieldErrors" in error) {
    const fieldErrors = (error as { fieldErrors?: Record<string, string[]> }).fieldErrors;
    const firstError = fieldErrors ? Object.values(fieldErrors).flat()[0] : undefined;

    if (firstError) {
      return firstError;
    }
  }

  return fallback;
}

function PasswordRuleList({ password }: { password: string }) {
  return (
    <div className="grid gap-2 rounded-2xl border border-violet-300/30 bg-white/10 px-4 py-3 sm:grid-cols-2">
      {passwordRules.map((rule) => {
        const passed = rule.test(password);

        return (
          <div key={rule.label} className="flex items-center gap-2 text-xs font-bold">
            {passed ? (
              <CheckCircle2 size={15} className="shrink-0 text-emerald-600" />
            ) : (
              <XCircle size={15} className="shrink-0 text-muted/45" />
            )}
            <span className={passed ? "text-emerald-700" : "text-muted"}>{rule.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function GoogleMark() {
  return (
    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm">
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-[18px] w-[18px]"
      >
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 0 3.99 3.47 2.18 7.06L5.84 9.9C6.71 7.3 9.14 5.38 12 5.38z"
        />
      </svg>
    </span>
  );
}

export function AuthPanel({ mode }: AuthPanelProps) {
  const searchParams = useSearchParams();
  const data = copy[mode];
  const isRegister = mode === "register";

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [verificationCode, setVerificationCode] = useState("");
  const [awaitingVerification, setAwaitingVerification] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "google">("idle");
  const [message, setMessage] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown <= 0) {
      return;
    }

    const timer = window.setTimeout(() => {
      setResendCooldown((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [resendCooldown]);

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      if (isRegister) {
        if (awaitingVerification) {
          const response = await fetch("/api/auth/verify-email", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: form.email,
              code: verificationCode,
            }),
          });

          if (!response.ok) {
            const result = (await response.json().catch(() => null)) as {
              error?: string;
            } | null;

            throw new Error(
              typeof result?.error === "string"
                ? result.error
                : "Invalid verification code"
            );
          }
        } else {
          const response = await fetch("/api/auth/register", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(form),
          });

          const result = (await response.json().catch(() => null)) as {
            error?: string;
            message?: string;
            devCode?: string;
            retryAfter?: number;
            resendCooldown?: number;
          } | null;

          if (!response.ok) {
            if (response.status === 429 && result?.retryAfter) {
              setResendCooldown(result.retryAfter);
            }

            throw new Error(
              getErrorMessage(result?.error, "Could not create account")
            );
          }

          setAwaitingVerification(true);
          setResendCooldown(result?.resendCooldown ?? 60);

          setMessage(
            result?.devCode
              ? `Email sending is not configured. Development code: ${result.devCode}`
              : result?.message ??
                  "Verification code sent. Please check your email."
          );

          return;
        }
      } else {
        const result = await signIn("credentials", {
          email: form.email,
          password: form.password,
          redirect: false,
        });

        if (result?.error) {
          throw new Error("Invalid email or password");
        }
      }

      if (isRegister) {
        const result = await signIn("credentials", {
          email: form.email,
          password: form.password,
          redirect: false,
        });

        if (result?.error) {
          throw new Error(
            "Email verified. Please login with your password."
          );
        }
      }

      const callbackUrl = searchParams.get("callbackUrl");

      window.location.assign(
        callbackUrl?.startsWith("/") ? callbackUrl : "/profile"
      );
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Something went wrong"
      );
    } finally {
      setStatus("idle");
    }
  }

  async function handleResendCode() {
    if (resendCooldown > 0) {
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const result = (await response.json().catch(() => null)) as {
        error?: string;
        message?: string;
        devCode?: string;
        retryAfter?: number;
        resendCooldown?: number;
      } | null;

      if (!response.ok) {
        if (response.status === 429 && result?.retryAfter) {
          setResendCooldown(result.retryAfter);
        }

        throw new Error(
          typeof result?.error === "string"
            ? result.error
            : "Could not send verification code"
        );
      }

      setResendCooldown(result?.resendCooldown ?? 60);

      setMessage(
        result?.devCode
          ? `Email sending is not configured. Development code: ${result.devCode}`
          : result?.message ??
              "Verification code sent. Please check your email."
      );
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Something went wrong"
      );
    } finally {
      setStatus("idle");
    }
  }

  async function handleGoogleSignIn() {
    setStatus("google");
    setMessage("");

    const callbackUrl = searchParams.get("callbackUrl");

    await signIn("google", {
      callbackUrl: callbackUrl?.startsWith("/")
        ? callbackUrl
        : "/profile",
    });
  }

  return (
    <section className="relative min-h-screen overflow-hidden px-4 pb-20 pt-32 sm:pt-36">
      <div className="container grid min-h-[calc(100vh-10rem)] items-center gap-8 lg:grid-cols-[1fr_0.92fr]">
        <div className="max-w-2xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-violet-600">
            {data.eyebrow}
          </p>

          <h1 className="font-display text-5xl font-extrabold leading-[0.95] text-ink sm:text-7xl">
            STS{" "}
            <span className="block">
              <span className="block bg-violet-gradient-text bg-clip-text text-transparent sm:inline">
                Growth
              </span>

              <span className="block bg-violet-gradient-text bg-clip-text text-transparent sm:ml-3 sm:inline">
                Portal
              </span>
            </span>
          </h1>

          <p className="mt-6 max-w-md text-base leading-8 text-muted sm:text-lg">
            Keep your brand requests, campaign updates, and consultation
            details in one focused place.
          </p>
        </div>

        <div className="rounded-[2rem] border border-violet-400/30 bg-surface-card/90 p-5 shadow-card-lg backdrop-blur-xl sm:p-7">
          <div className="rounded-[1.55rem] border border-violet-200/80 bg-violet-50/70 p-6 sm:p-8">
            <div className="mb-8">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-500">
                {data.eyebrow}
              </p>

              <h2 className="mt-3 font-display text-4xl font-extrabold text-ink">
                {data.title}
              </h2>

              <p className="mt-2 text-sm text-muted">{data.subtitle}</p>
            </div>

            {!awaitingVerification && (
              <>
                <button
                  type="button"
                  disabled={status !== "idle"}
                  onClick={handleGoogleSignIn}
                  className="group flex w-full items-center justify-center gap-3 rounded-full border border-slate-200 bg-white px-6 py-4 text-sm font-extrabold text-slate-800 shadow-[0_18px_45px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-0.5 hover:border-violet-300 hover:bg-slate-50 hover:shadow-[0_22px_55px_rgba(93,63,211,0.16)] focus:outline-none focus:ring-4 focus:ring-violet-300/35 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <GoogleMark />

                  <span>
                    {status === "google"
                      ? "Connecting to Google..."
                      : "Continue with Google"}
                  </span>
                </button>

                <div className="my-6 flex items-center gap-3">
                  <span className="h-px flex-1 bg-violet-200" />
                  <span className="text-xs font-bold uppercase tracking-[0.18em] text-violet-500">
                    or
                  </span>
                  <span className="h-px flex-1 bg-violet-200" />
                </div>
              </>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {isRegister && !awaitingVerification && (
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

              {!awaitingVerification && (
                <>
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
                    showToggle
                  />
                </>
              )}

              {isRegister && !awaitingVerification && <PasswordRuleList password={form.password} />}

              {isRegister && !awaitingVerification && (
                <Field
                  icon={<LockKeyhole size={18} />}
                  label="Confirm Password"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm password"
                  value={form.confirmPassword}
                  onChange={(value) =>
                    updateField("confirmPassword", value)
                  }
                  showToggle
                />
              )}

              {isRegister && awaitingVerification && (
                <Field
                  icon={<Mail size={18} />}
                  label="Verification Code"
                  name="verificationCode"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={verificationCode}
                  onChange={setVerificationCode}
                />
              )}

              {message && (
                <p className="rounded-2xl border border-violet-300/40 bg-white/10 px-4 py-3 text-sm font-semibold text-ink">
                  {message}
                </p>
              )}

              <button
                type="submit"
                disabled={status !== "idle"}
                className={cn(
                  "group flex w-full items-center justify-center gap-3 rounded-full px-6 py-4 text-sm font-bold text-white shadow-card transition duration-300 hover:-translate-y-0.5 hover:shadow-card-lg",
                  "bg-violet-gradient disabled:cursor-not-allowed disabled:opacity-70"
                )}
              >
                {status === "loading"
                  ? "Please wait..."
                  : awaitingVerification
                    ? "Verify Email"
                    : data.button}

                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 transition-transform duration-300 group-hover:translate-x-1">
                  <ArrowRight size={15} />
                </span>
              </button>

              {isRegister && awaitingVerification && (
                <button
                  type="button"
                  disabled={status === "loading" || resendCooldown > 0}
                  onClick={handleResendCode}
                  className="w-full text-center text-sm font-bold text-violet-600 transition hover:text-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {resendCooldown > 0
                    ? `Send a new code in ${resendCooldown}s`
                    : "Send a new code"}
                </button>
              )}
            </form>

            <p className="mt-7 text-center text-sm text-muted">
              {data.switchText}{" "}
              <Link
                href={data.switchHref}
                className="font-bold text-violet-600 hover:text-violet-700"
              >
                {data.switchLabel}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
