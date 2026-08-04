"use client";

import { cn } from "@/lib/cn";
import { useCountUp } from "@/lib/animations";

interface StatCardProps {
  label: string;
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  variant: "line" | "bars" | "ring";
  className?: string;
  style?: React.CSSProperties;
}

function LineGlyph() {
  return (
    <svg viewBox="0 0 96 40" className="h-10 w-full" fill="none">
      <polyline
        points="2,34 16,26 30,29 44,18 58,20 72,8 94,4"
        stroke="url(#lineGrad)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#A984E3" />
          <stop offset="100%" stopColor="#6D3FC4" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function BarsGlyph() {
  const heights = [8, 14, 11, 18, 15, 24, 34];
  return (
    <svg viewBox="0 0 96 40" className="h-10 w-full" fill="none">
      {heights.map((h, i) => (
        <rect
          key={i}
          x={i * 14}
          y={40 - h}
          width="8"
          rx="2"
          height={h}
          fill={i === heights.length - 1 ? "#A984E3" : "#5B2A9E"}
        />
      ))}
    </svg>
  );
}

function RingGlyph({ value }: { value: number }) {
  const pct = Math.min(value / 10, 1);
  const circumference = 2 * Math.PI * 24;
  return (
    <svg viewBox="0 0 64 64" className="h-14 w-14 drop-shadow-sm">
      <circle cx="32" cy="32" r="28" fill="#180B33" />
      <circle cx="32" cy="32" r="24" stroke="#472280" strokeWidth="8" fill="none" />
      <circle
        cx="32"
        cy="32"
        r="24"
        stroke="url(#roiGrad)"
        strokeWidth="8"
        fill="none"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference * (1 - pct)}
        transform="rotate(-90 32 32)"
      />
      <circle cx="32" cy="32" r="12" fill="#21103F" />
      <defs>
        <linearGradient id="roiGrad" x1="12" y1="12" x2="52" y2="52">
          <stop offset="0%" stopColor="#A984E3" />
          <stop offset="100%" stopColor="#5B2A9E" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function StatCard({ label, value, decimals = 0, prefix = "", suffix = "", variant, className, style }: StatCardProps) {
  const countRef = useCountUp({ end: value, decimals, prefix, suffix });

  if (variant === "ring") {
    return (
      <div className={cn("rounded-3xl border border-violet-400/20 bg-surface-card p-5 shadow-card-lg", className)} style={style}>
        <div className="flex h-full items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">{label}</p>
            <span ref={countRef} className="mt-3 block font-display text-2xl font-extrabold text-violet-600">
              {prefix}0{suffix}
            </span>
          </div>
          <RingGlyph value={value} />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("rounded-3xl border border-violet-400/20 bg-surface-card p-5 shadow-card-lg", className)} style={style}>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">{label}</p>
      <div className="mt-1 flex items-end justify-between gap-4">
        <span ref={countRef} className="font-display text-2xl font-bold text-violet-600">
          {prefix}0{suffix}
        </span>
      </div>
      {variant === "line" && <LineGlyph />}
      {variant === "bars" && <BarsGlyph />}
    </div>
  );
}
