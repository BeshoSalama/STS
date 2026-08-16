"use client";

import { useRef } from "react";
import { useFormStatus } from "react-dom";
import { ShieldAlert, Trash2, X } from "lucide-react";

type DeleteAccountButtonProps = {
  action: (formData: FormData) => void | Promise<void>;
};

function ConfirmButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-red-500 px-5 py-3 text-sm font-extrabold text-white shadow-[0_18px_45px_rgba(239,68,68,0.24)] transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-70"
    >
      <Trash2 size={16} />
      {pending ? "Deleting..." : "Confirm Delete"}
    </button>
  );
}

export function DeleteAccountButton({ action }: DeleteAccountButtonProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-red-300/30 bg-red-500/15 px-5 py-3 text-sm font-bold text-red-100 transition hover:bg-red-500/25"
      >
        <Trash2 size={16} />
        Delete Account
      </button>

      <dialog
        ref={dialogRef}
        className="w-[min(92vw,460px)] rounded-2xl border border-red-300/20 bg-[#140516] p-0 text-white shadow-[0_30px_90px_rgba(0,0,0,0.55)] backdrop:bg-black/70"
      >
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-500/15 text-red-100">
              <ShieldAlert size={22} />
            </div>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white"
              aria-label="Close delete account confirmation"
            >
              <X size={16} />
            </button>
          </div>

          <h3 className="mt-5 font-display text-2xl font-extrabold">Delete your account?</h3>
          <p className="mt-3 text-sm leading-6 text-white/62">
            This action is permanent. Your account, login sessions, campaigns, bookings, leads, briefs, and quotes will be removed.
          </p>

          <form action={action} className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <input type="hidden" name="confirmation" value="CONFIRM_ACCOUNT_DELETE" />
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/12 bg-white/5 px-5 py-3 text-sm font-bold text-white/78 transition hover:bg-white/10 hover:text-white"
            >
              Cancel
            </button>
            <ConfirmButton />
          </form>
        </div>
      </dialog>
    </>
  );
}
