import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/cn";

export function Logo({ light = false, className }: { light?: boolean; className?: string }) {
  return (
    <Link href="/" className="flex items-center">
      <Image
        src="/logo.svg"
        alt="STS Agency — Step to Success"
        width={1080}
        height={1080}
        priority
        className={cn("h-14 w-14 object-contain sm:h-16 sm:w-16", light && "brightness-0 invert", className)}
      />
      <span className={`sr-only ${light ? "text-white" : "text-ink"}`}>STS Agency</span>
    </Link>
  );
}
