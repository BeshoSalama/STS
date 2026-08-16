"use client";

import { useEffect, useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { CheckCircle2, Eye, EyeOff, LockKeyhole, XCircle } from "lucide-react";
import { passwordRules } from "@/lib/validations/auth";

export type ChangePasswordState = {
  status: "idle" | "success" | "error";
  message: string;
  fieldErrors?: {
    currentPassword?: string[];
    newPassword?: string[];
    confirmPassword?: string[];
  };
};

const initialState: ChangePasswordState = {
  status: "idle",
  message: "",
};

type PasswordFieldName = "currentPassword" | "newPassword" | "confirmPassword";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-fit rounded-full bg-violet-gradient px-5 py-3 text-sm font-bold text-white shadow-card transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-65"
    >
      {pending ? "Changing Password..." : "Change Password"}
    </button>
  );
}

function PasswordField({
  label,
  name,
  autoComplete,
  error,
  value,
  onChange,
}: {
  label: string;
  name: PasswordFieldName;
  autoComplete: string;
  error?: string[];
  value?: string;
  onChange?: (value: string) => void;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <label className="grid min-w-0 gap-2 text-sm font-bold">
      {label}
      <span className="grid min-h-11 w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 rounded-lg border border-white/10 bg-black/20 px-3 transition focus-within:border-violet-300/50">
        <LockKeyhole size={16} className="shrink-0 text-violet-200/75" />
        <input
          name={name}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          required
          value={value}
          onChange={onChange ? (event) => onChange(event.target.value) : undefined}
          className="min-w-0 bg-transparent py-3 text-white outline-none placeholder:text-white/30"
        />
        <button
          type="button"
          aria-label={visible ? `Hide ${label}` : `Show ${label}`}
          title={visible ? `Hide ${label}` : `Show ${label}`}
          onClick={() => setVisible((current) => !current)}
          className="flex h-8 w-8 items-center justify-center rounded-full text-white/62 transition hover:bg-white/10 hover:text-white"
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </span>
      {error?.[0] && <span className="text-xs font-semibold text-red-200">{error[0]}</span>}
    </label>
  );
}

export function ChangePasswordForm({
  action,
}: {
  action: (prevState: ChangePasswordState, formData: FormData) => Promise<ChangePasswordState>;
}) {
  const [state, formAction] = useFormState(action, initialState);
  const [newPassword, setNewPassword] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
      setNewPassword("");
    }
  }, [state.status]);

  return (
    <form ref={formRef} action={formAction} className="grid gap-4 rounded-lg border border-white/10 bg-white/[0.04] p-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-200">Security</p>
        <h2 className="mt-2 font-display text-2xl font-bold">Change Password</h2>
        <p className="mt-2 text-sm leading-6 text-white/58">
          Enter your current password first, then choose a stronger new one.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
        <PasswordField
          label="Old Password"
          name="currentPassword"
          autoComplete="current-password"
          error={state.fieldErrors?.currentPassword}
        />
        <PasswordField
          label="New Password"
          name="newPassword"
          autoComplete="new-password"
          error={state.fieldErrors?.newPassword}
          value={newPassword}
          onChange={setNewPassword}
        />
        <PasswordField
          label="Confirm New Password"
          name="confirmPassword"
          autoComplete="new-password"
          error={state.fieldErrors?.confirmPassword}
        />
      </div>

      <div className="grid gap-2 rounded-lg border border-white/10 bg-black/20 p-4 sm:grid-cols-2">
        {passwordRules.map((rule) => {
          const passed = rule.test(newPassword);

          return (
            <div key={rule.label} className="flex items-center gap-2 text-xs font-bold">
              {passed ? (
                <CheckCircle2 size={15} className="shrink-0 text-emerald-200" />
              ) : (
                <XCircle size={15} className="shrink-0 text-white/28" />
              )}
              <span className={passed ? "text-emerald-100" : "text-white/50"}>{rule.label}</span>
            </div>
          );
        })}
      </div>

      {state.message && (
        <p
          className={`rounded-lg border px-4 py-3 text-sm font-bold ${
            state.status === "success"
              ? "border-emerald-300/25 bg-emerald-400/10 text-emerald-100"
              : "border-red-300/25 bg-red-500/10 text-red-100"
          }`}
        >
          {state.message}
        </p>
      )}

      <SubmitButton />
    </form>
  );
}
