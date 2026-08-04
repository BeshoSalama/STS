import { Infinity, ShoppingBag, Youtube } from "lucide-react";
import { TikTokIcon } from "@/components/icons/SocialIcons";

function GoogleAdsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path d="M13.5 5.4 3.4 22.9a4.2 4.2 0 0 0 7.3 4.2L20.8 9.6a4.2 4.2 0 1 0-7.3-4.2Z" fill="#71308F" />
      <path d="M18.5 5.4a4.2 4.2 0 0 1 5.7 1.5l4.4 7.6a4.2 4.2 0 1 1-7.3 4.2L16.9 11a4.2 4.2 0 0 1 1.6-5.6Z" fill="#A86AC8" />
      <circle cx="7" cy="25" r="4.2" fill="#C69CDB" />
    </svg>
  );
}

function ShopifyIcon({ className }: { className?: string }) {
  return (
    <span className={`relative inline-flex items-center justify-center ${className ?? ""}`} aria-hidden="true">
      <ShoppingBag className="h-full w-full" strokeWidth={2.4} />
      <span className="absolute mt-1 font-display text-[11px] font-extrabold leading-none">S</span>
    </span>
  );
}

function PlatformIcon({ name }: { name: string }) {
  const iconClass = "h-8 w-8 shrink-0 text-violet-700 transition-colors group-hover:text-white";

  if (name === "Meta") return <Infinity className={iconClass} strokeWidth={2.4} />;
  if (name === "Google Ads") return <GoogleAdsIcon className={iconClass} />;
  if (name === "TikTok") return <TikTokIcon className={iconClass} />;
  if (name === "Shopify") return <ShopifyIcon className={iconClass} />;
  if (name === "YouTube") return <Youtube className={iconClass} strokeWidth={2.4} />;
  return null;
}

export function ClientLogoMarquee({ platforms }: { platforms: string[] }) {
  return (
    <section className="border-y border-violet-400/25 bg-surface-card/75 py-7 backdrop-blur-xl">
      <div className="container">
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-5">
          {platforms.map((name) => (
            <span
              key={name}
              className="group flex min-w-[170px] items-center justify-center gap-3 whitespace-nowrap text-center font-display text-xl font-bold text-violet-700 transition-colors hover:text-white"
            >
              <PlatformIcon name={name} />
              <span>{name}</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
