"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export function LogoutButton({ className = "" }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className={`inline-flex items-center justify-center gap-2 rounded-full border border-red-300/25 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-100 transition hover:bg-red-500/20 ${className}`}
    >
      <LogOut size={16} />
      Logout
    </button>
  );
}
