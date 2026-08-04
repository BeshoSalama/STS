"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, UserRound, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { navLinks } from "@/lib/content/nav";
import { gsap } from "@/lib/animations/gsapConfig";
import { Logo } from "./Logo";

const headerNavLinks = navLinks.filter((link) => link.href !== "/projects");

type HeaderUser = {
  name?: string | null;
  email?: string | null;
  role?: string;
};

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<HeaderUser | null>(null);
  const navRef = useRef<HTMLElement | null>(null);
  const pillRef = useRef<HTMLSpanElement | null>(null);
  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const hasPositioned = useRef(false);
  const projectsLinkRef = useRef<HTMLAnchorElement | null>(null);
  const loginLinkRef = useRef<HTMLAnchorElement | null>(null);
  const userHref = "/profile";
  const userLabel = user?.name || user?.email?.split("@")[0] || "Account";
  const getHref = (href: string) => (href === "/brief" && !user ? "/login" : href);

  useEffect(() => {
    let active = true;

    fetch("/api/auth/session", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((session: { user?: HeaderUser } | null) => {
        if (active) setUser(session?.user ?? null);
      })
      .catch(() => {
        if (active) setUser(null);
      });

    return () => {
      active = false;
    };
  }, [pathname]);

  useLayoutEffect(() => {
    const link = projectsLinkRef.current;
    if (!link) return;

    function alignToGrowthArrow() {
      if (!link) return false;
      const tip = document.querySelector<SVGPolygonElement>("[data-growth-arrow-tip]");
      const svg = tip?.closest("svg");
      if (!tip || !svg) {
        link.style.left = "";
        link.style.right = "";
        return false;
      }
      const tipRect = tip.getBoundingClientRect();
      const tipX = tipRect.left + tipRect.width / 2;
      const linkWidth = link.getBoundingClientRect().width || 110;
      const loginRect = loginLinkRef.current?.getBoundingClientRect();
      const maxLeft = loginRect ? loginRect.left - linkWidth - 14 : document.documentElement.clientWidth - linkWidth - 24;
      const left = Math.min(tipX - linkWidth / 2, maxLeft);
      link.style.right = "auto";
      link.style.left = `${Math.max(24, left)}px`;
      return true;
    }

    alignToGrowthArrow();

    let attempts = 0;
    const poll = window.setInterval(() => {
      attempts += 1;
      if (alignToGrowthArrow() || attempts >= 20) {
        window.clearInterval(poll);
      }
    }, 150);

    window.addEventListener("resize", alignToGrowthArrow);
    return () => {
      window.clearInterval(poll);
      window.removeEventListener("resize", alignToGrowthArrow);
    };
  }, [pathname]);

  useEffect(() => {
    const nav = navRef.current;
    const pill = pillRef.current;
    const activeLink = linkRefs.current[pathname];
    if (!nav || !pill) return;

    if (!activeLink) {
      gsap.to(pill, { opacity: 0, duration: 0.25, ease: "power2.out" });
      return;
    }

    const navBox = nav.getBoundingClientRect();
    const linkBox = activeLink.getBoundingClientRect();
    const target = { left: linkBox.left - navBox.left, width: linkBox.width };

    if (!hasPositioned.current) {
      gsap.set(pill, { ...target, opacity: 1 });
      hasPositioned.current = true;
      return;
    }

    gsap.to(pill, { ...target, opacity: 1, duration: 0.55, ease: "elastic.out(1, 0.75)" });
  }, [pathname]);

  useEffect(() => {
    function handleResize() {
      hasPositioned.current = false;
      const nav = navRef.current;
      const activeLink = linkRefs.current[pathname];
      if (!nav || !activeLink || !pillRef.current) return;
      const navBox = nav.getBoundingClientRect();
      const linkBox = activeLink.getBoundingClientRect();
      gsap.set(pillRef.current, { left: linkBox.left - navBox.left, width: linkBox.width, opacity: 1 });
      hasPositioned.current = true;
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [pathname]);

  return (
    <header className="fixed inset-x-0 top-3 z-50 px-4 sm:top-4 sm:px-6">
      <div className="container flex items-center justify-between gap-4">
        <div className="flex h-[58px] w-[58px] shrink-0 items-center justify-center rounded-full border border-violet-200/80 bg-white/95 shadow-card backdrop-blur-md sm:h-16 sm:w-16">
          <Logo className="h-10 w-10 sm:h-11 sm:w-11" />
        </div>

        <div className="hidden flex-1 items-center justify-center overflow-hidden lg:flex">
          <nav
            ref={navRef}
            className="relative flex min-h-16 max-w-full items-center gap-1 rounded-full border border-violet-400/25 bg-surface-card/90 px-4 shadow-card backdrop-blur-xl"
          >
            <span
              ref={pillRef}
              className="pointer-events-none absolute left-0 top-1/2 z-0 h-10 -translate-y-1/2 rounded-full bg-violet-gradient opacity-0 shadow-card"
            />
            {headerNavLinks.map((link) => {
              const isActive = pathname === link.href;
              const href = getHref(link.href);
              return (
                <Link
                  key={link.href}
                  href={href}
                  ref={(el) => {
                    linkRefs.current[link.href] = el;
                  }}
                  className={cn(
                    "relative z-10 rounded-full px-4 py-2 text-sm font-medium transition-colors duration-300",
                    link.variant === "pill" && "ml-2",
                    isActive ? "text-white" : "text-ink/70 hover:text-ink"
                  )}
                  data-ripple={link.variant === "pill" ? true : undefined}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex min-h-16 shrink-0 items-center rounded-full border border-violet-400/25 bg-surface-card/90 px-3 shadow-card backdrop-blur-xl sm:px-4 lg:hidden">
          <button
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-gradient text-white"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {pathname === "/clients" && (
        <Link
          ref={projectsLinkRef}
          href="/projects"
          className="absolute right-[136px] top-0 z-20 hidden h-16 min-w-[110px] items-center justify-center rounded-full border border-violet-400/25 bg-surface-card/90 px-5 text-sm font-bold leading-none text-ink/75 shadow-card backdrop-blur-xl transition-colors duration-300 hover:bg-violet-50 hover:text-ink lg:inline-flex"
          data-no-ripple
        >
          Projects
        </Link>
      )}

      {user ? (
        <Link
          ref={loginLinkRef}
          href={userHref}
          className="absolute right-4 top-0 hidden h-16 max-w-[210px] items-center justify-center gap-3 rounded-full border border-violet-400/25 bg-surface-card/90 px-4 text-sm font-bold leading-none text-ink/75 shadow-card backdrop-blur-xl transition-colors duration-300 hover:bg-violet-50 hover:text-ink sm:right-6 lg:inline-flex"
          data-no-ripple
          aria-label={`Open ${userLabel} account`}
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-gradient text-white">
            <UserRound size={17} />
          </span>
          <span className="truncate">{userLabel}</span>
        </Link>
      ) : (
        <Link
          ref={loginLinkRef}
          href="/login"
          className={cn(
            "absolute right-4 top-0 hidden h-16 min-w-[98px] items-center justify-center rounded-full border border-violet-400/25 px-5 text-sm font-bold leading-none shadow-card backdrop-blur-xl transition-colors duration-300 sm:right-6 lg:inline-flex",
            pathname === "/login" ? "bg-violet-gradient text-white" : "bg-surface-card/90 text-ink/75 hover:bg-violet-50 hover:text-ink"
          )}
          data-no-ripple
        >
          Login
        </Link>
      )}

      <div
        className={cn(
          "container mt-3 origin-top overflow-hidden rounded-3xl border border-violet-400/25 bg-surface-card shadow-card-lg transition-all duration-300 lg:hidden",
          open ? "max-h-[420px] opacity-100" : "pointer-events-none max-h-0 opacity-0"
        )}
      >
        <nav className="flex flex-col gap-1 p-4">
          {headerNavLinks.map((link) => {
            const isActive = pathname === link.href;
            const href = getHref(link.href);
            return (
              <Link
                key={link.href}
                href={href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-2xl px-4 py-3 text-base font-medium transition-colors",
                  link.variant === "pill"
                    ? "bg-violet-gradient text-center text-white"
                    : isActive
                    ? "bg-surface text-ink"
                    : "text-ink/70"
                )}
              >
                {link.label}
              </Link>
            );
          })}
          <div className="mt-2 grid gap-2 border-t border-ink/5 pt-3">
            {user ? (
              <Link
                href={userHref}
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-3 rounded-2xl bg-surface px-4 py-3 text-center text-base font-semibold text-ink/75 transition-colors"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-gradient text-white">
                  <UserRound size={16} />
                </span>
                <span className="truncate">{userLabel}</span>
              </Link>
            ) : (
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-2xl px-4 py-3 text-center text-base font-semibold transition-colors",
                  pathname === "/login" ? "bg-violet-gradient text-white" : "bg-surface text-ink/75"
                )}
              >
                Login
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
