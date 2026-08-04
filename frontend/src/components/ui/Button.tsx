"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { useMagnetic } from "@/lib/animations";

type ButtonVariant = "primary" | "dark" | "outline";

interface ButtonProps {
  href?: string;
  onClick?: () => void;
  variant?: ButtonVariant;
  withIcon?: boolean;
  magnetic?: boolean;
  className?: string;
  children: React.ReactNode;
  type?: "button" | "submit";
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-violet-gradient text-white shadow-card hover:shadow-card-lg",
  dark: "bg-violet-950 text-white hover:bg-violet-800 hover:text-white",
  outline: "border border-violet-400/40 bg-surface-card text-ink hover:border-violet-500/80 hover:bg-violet-50",
};

export function Button({
  href,
  onClick,
  variant = "primary",
  withIcon = true,
  magnetic = true,
  className,
  children,
  type = "button",
}: ButtonProps) {
  const magneticRef = useMagnetic<HTMLElement>(0.25);

  const content = (
    <span
      className={cn(
        "group inline-flex items-center gap-3 rounded-full px-6 py-3 text-sm font-semibold transition-all duration-300",
        variantStyles[variant],
        className
      )}
    >
      {children}
      {withIcon && (
        <span
          className={cn(
            "button-icon flex h-7 w-7 items-center justify-center rounded-full transition-transform duration-300 group-hover:rotate-45",
            variant === "primary" ? "bg-white/20" : "bg-white/10 text-current"
          )}
          data-button-icon
        >
          <ArrowUpRight size={15} />
        </span>
      )}
    </span>
  );

  const wrapperClassName = cn("inline-block", className?.includes("w-full") && "block w-full");

  if (href) {
    return (
      <Link
        href={href}
        ref={magnetic ? (magneticRef as React.Ref<HTMLAnchorElement>) : undefined}
        className={wrapperClassName}
        data-magnetic={magnetic ? "true" : undefined}
        data-ripple
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      className={wrapperClassName}
      ref={magnetic ? (magneticRef as React.Ref<HTMLButtonElement>) : undefined}
      data-magnetic={magnetic ? "true" : undefined}
      data-ripple
    >
      {content}
    </button>
  );
}
