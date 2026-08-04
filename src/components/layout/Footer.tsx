import Link from "next/link";
import { ArrowUpRight, Facebook, Linkedin, MessageCircle } from "lucide-react";
import { TikTokIcon, SnapchatIcon } from "@/components/icons/SocialIcons";
import { navLinks, siteConfig } from "@/lib/content/nav";
import { Logo } from "./Logo";

const footerColumns = [
  {
    title: "Services",
    links: [
      { label: "Branding", href: "/services" },
      { label: "Marketing", href: "/services" },
      { label: "Printing", href: "/services" },
      { label: "Development", href: "/services" },
      { label: "Strategy", href: "/services" },
    ],
  },
  {
    title: "Company",
    links: navLinks.filter((link) => !link.variant),
  },
  {
    title: "Support",
    links: [
      { label: "Help Center", href: "/contact" },
      { label: "Terms & Conditions", href: "/contact" },
      { label: "Privacy Policy", href: "/contact" },
      { label: "Contact Us", href: "/contact" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="site-footer relative mt-24 overflow-hidden text-white">
      <div className="footer-neural-scene" aria-hidden="true">
        <span className="footer-neural-line footer-neural-line--one" />
        <span className="footer-neural-line footer-neural-line--two" />
        <span className="footer-neural-line footer-neural-line--three" />
        <span className="footer-neural-line footer-neural-line--four" />
        <span className="footer-neural-line footer-neural-line--five" />
        <span className="footer-neural-spark footer-neural-spark--one" />
        <span className="footer-neural-spark footer-neural-spark--two" />
        <span className="footer-neural-spark footer-neural-spark--three" />
        <span className="footer-neural-spark footer-neural-spark--four" />
        <span className="footer-neural-spark footer-neural-spark--five" />
        <span className="footer-neural-spark footer-neural-spark--six" />
        <span className="footer-neural-pulse footer-neural-pulse--one" />
        <span className="footer-neural-pulse footer-neural-pulse--two" />
        <span className="footer-neural-pulse footer-neural-pulse--three" />
        <span className="footer-neural-runner footer-neural-runner--one" />
        <span className="footer-neural-runner footer-neural-runner--two" />
        <span className="footer-neural-runner footer-neural-runner--three" />
        <span className="footer-neural-runner footer-neural-runner--four" />
        <span className="footer-neural-runner footer-neural-runner--five" />
      </div>

      <div className="container relative grid gap-12 py-16 lg:grid-cols-[1.15fr_2fr]">
        <div className="max-w-sm">
          <Logo light />
          <p className="mt-5 text-sm leading-7 text-white/80">
            We build scalable marketing systems powered by data, creativity, and performance.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <a href="#" aria-label="Facebook" data-ripple className="footer-social-link">
              <Facebook size={16} />
            </a>
            <a href="#" aria-label="WhatsApp" data-ripple className="footer-social-link">
              <MessageCircle size={16} />
            </a>
            <a href="#" aria-label="LinkedIn" data-ripple className="footer-social-link">
              <Linkedin size={16} />
            </a>
            <a href="#" aria-label="Snapchat" data-ripple className="footer-social-link">
              <SnapchatIcon size={16} />
            </a>
            <a href="#" aria-label="TikTok" data-ripple className="footer-social-link">
              <TikTokIcon size={16} />
            </a>
          </div>
        </div>

        <div className="grid gap-9 sm:grid-cols-3">
          {footerColumns.map((column) => (
            <div key={column.title}>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-300/90">
                {column.title}
              </p>
              <ul className="mt-4 space-y-3 text-sm text-white/64">
                {column.links.map((link) => (
                  <li key={`${column.title}-${link.label}`}>
                    <Link href={link.href} className="footer-link">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="container relative flex flex-col items-center justify-between gap-4 border-t border-white/10 py-6 text-xs text-white/45 sm:flex-row">
        <p>&copy; {new Date().getFullYear()} STS Agency. All rights reserved.</p>
        <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:text-left">
          <span>{siteConfig.phone}</span>
          <span className="hidden h-1 w-1 rounded-full bg-violet-300/80 sm:block" />
          <span>{siteConfig.location}</span>
        </div>
        <Link href="/contact" data-ripple className="footer-project-link">
          Start a project
          <ArrowUpRight size={14} />
        </Link>
      </div>
    </footer>
  );
}
