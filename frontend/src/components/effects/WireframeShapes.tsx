import type { CSSProperties } from "react";

function Hexagon({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 100 100" className={className} style={style} fill="none">
      <polygon points="50,3 93,26 93,74 50,97 7,74 7,26" stroke="currentColor" strokeWidth="1.2" />
      <polygon points="50,22 76,36 76,64 50,78 24,64 24,36" stroke="currentColor" strokeWidth="0.8" opacity="0.6" />
    </svg>
  );
}

function DiamondRing({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 100 100" className={className} style={style} fill="none">
      <rect x="18" y="18" width="64" height="64" stroke="currentColor" strokeWidth="1.2" transform="rotate(45 50 50)" />
      <circle cx="50" cy="50" r="46" stroke="currentColor" strokeWidth="0.6" strokeDasharray="4 6" opacity="0.5" />
    </svg>
  );
}

function TriangleOrbit({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 100 100" className={className} style={style} fill="none">
      <polygon points="50,8 90,88 10,88" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
      <circle cx="50" cy="50" r="38" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
    </svg>
  );
}

interface ShapeConfig {
  Shape: typeof Hexagon;
  className: string;
  duration: string;
  reverse?: boolean;
}

const shapes: ShapeConfig[] = [
  { Shape: Hexagon, className: "left-[6%] top-[12%] h-24 w-24 text-violet-400/50 sm:h-32 sm:w-32", duration: "34s" },
  { Shape: DiamondRing, className: "right-[8%] top-[6%] h-20 w-20 text-violet-500/60 sm:h-28 sm:w-28", duration: "26s", reverse: true },
  { Shape: TriangleOrbit, className: "right-[14%] bottom-[8%] h-24 w-24 text-violet-700/20 sm:h-32 sm:w-32", duration: "40s" },
];

export function WireframeShapes() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {shapes.map(({ Shape, className, duration, reverse }, i) => (
        <div
          key={i}
          className={`animate-pulse-glow absolute ${className}`}
          style={{ animationDuration: `${parseFloat(duration) * 0.3}s` }}
        >
          <Shape
            className={`h-full w-full ${reverse ? "animate-spin-slow-reverse" : "animate-spin-slow"}`}
            style={{ animationDuration: duration }}
          />
        </div>
      ))}
    </div>
  );
}
