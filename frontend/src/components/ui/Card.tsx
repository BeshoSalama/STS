import { cn } from "@/lib/cn";

interface CardProps {
  className?: string;
  children: React.ReactNode;
}

export function Card({ className, children }: CardProps) {
  return (
    <div className={cn("rounded-4xl border border-violet-400/20 bg-surface-card shadow-card", className)}>{children}</div>
  );
}
