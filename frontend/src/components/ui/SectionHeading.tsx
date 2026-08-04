import { cn } from "@/lib/cn";

interface SectionHeadingProps {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeading({ eyebrow, title, subtitle, align = "left", className }: SectionHeadingProps) {
  return (
    <div className={cn(align === "center" ? "text-center" : "text-left", className)}>
      {eyebrow && (
        <div
          className={cn(
            "mb-3 flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.2em] text-violet-600",
            align === "center" && "justify-center"
          )}
        >
          {align === "center" && <span className="h-px w-8 bg-violet-300" />}
          {eyebrow}
          {align === "center" && <span className="h-px w-8 bg-violet-300" />}
        </div>
      )}
      <h2 className="font-display text-3xl font-bold leading-tight text-ink sm:text-4xl lg:text-5xl">{title}</h2>
      {subtitle && <p className="mt-4 max-w-xl text-base text-muted">{subtitle}</p>}
    </div>
  );
}
