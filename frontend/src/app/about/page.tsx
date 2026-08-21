import Image from "next/image";
import { BarChart3, Check, Headphones, LineChart, Rocket, Search, ShieldCheck, Target, Users, Zap } from "lucide-react";
import { TeamGrid } from "@/components/sections/TeamGrid";
import { getAboutContent } from "@/lib/content/about";
import { getTeam } from "@/lib/content/team";

export const revalidate = 3600;

const icons = [Headphones, Search, Target, Rocket, BarChart3, LineChart];
const reasonIcons = [Users, Zap, Headphones, Target, BarChart3, ShieldCheck];

function splitHighlight(text: string) {
  const parts = text.trim().split(/\s+/);
  if (parts.length < 3) return { main: text, highlight: "" };
  return {
    main: parts.slice(0, -2).join(" "),
    highlight: parts.slice(-2).join(" "),
  };
}

export default async function AboutPage() {
  const [content, team] = await Promise.all([getAboutContent(), getTeam()]);
  const processTitle = splitHighlight(content.processTitle);

  return (
    <main dir="ltr" className="relative overflow-hidden bg-[#02040b] pb-16 pt-24 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_24%_23%,rgba(98,38,190,0.18),transparent_28%),radial-gradient(circle_at_72%_20%,rgba(82,28,142,0.12),transparent_24%),linear-gradient(180deg,#02040b_0%,#050612_40%,#02040b_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(107,70,193,0.026)_1px,transparent_1px),linear-gradient(90deg,rgba(107,70,193,0.026)_1px,transparent_1px)] bg-[size:56px_56px] opacity-55" />

      <div className="container relative z-10 grid gap-5">
        <section dir="ltr" className="grid min-h-[420px] items-center gap-10 border-b border-white/[0.04] py-8 lg:grid-cols-[0.96fr_1.04fr]">
          <div className="relative min-h-[320px]">
            <div className="absolute left-1/2 top-[47%] h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full border border-violet-300/32 bg-[radial-gradient(circle,rgba(168,85,247,0.18),rgba(30,9,68,0.15)_48%,transparent_72%)] shadow-[0_0_78px_rgba(125,49,255,0.42)]" />
            <div className="absolute left-1/2 top-[47%] h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full border border-violet-300/22 shadow-[inset_0_0_24px_rgba(196,156,255,0.14)]" />
            <div className="absolute left-1/2 top-[47%] h-1.5 w-60 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[linear-gradient(90deg,transparent,rgba(196,156,255,0.6),transparent)] shadow-[0_0_18px_rgba(196,156,255,0.5)]" />
            <div className="absolute left-1/2 top-[68%] h-14 w-72 -translate-x-1/2 rounded-[50%] border border-violet-300/50 bg-[radial-gradient(ellipse,rgba(168,85,247,0.23),rgba(8,2,22,0.14)_58%,transparent_72%)] shadow-[0_0_34px_rgba(196,156,255,0.44)]" />
            <div className="absolute left-1/2 top-[72%] h-6 w-52 -translate-x-1/2 rounded-[50%] border border-violet-300/50 bg-violet-500/14 shadow-[0_0_24px_rgba(196,156,255,0.4)]" />
            <div className="absolute left-1/2 top-[47%] grid h-28 w-28 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-violet-300/42 bg-[#0b0618] font-display text-4xl font-black text-violet-400 shadow-[inset_0_0_24px_rgba(196,156,255,0.14),0_0_36px_rgba(168,85,247,0.32)]">
              STS
            </div>
            <span className="absolute left-[31%] top-[31%] h-1.5 w-1.5 rounded-full bg-violet-300 shadow-[0_0_14px_rgba(196,156,255,0.9)]" />
            <span className="absolute left-[66%] top-[38%] h-1.5 w-1.5 rounded-full bg-violet-300 shadow-[0_0_14px_rgba(196,156,255,0.9)]" />
            <span className="absolute left-[44%] top-[20%] h-1.5 w-1.5 rounded-full bg-violet-300 shadow-[0_0_14px_rgba(196,156,255,0.9)]" />
            {content.heroStats.map((stat, index) => (
              <article
                key={`${stat.value}-${stat.label}`}
                className="absolute min-w-[128px] rounded-lg border border-violet-300/16 bg-[#0b0618]/78 px-4 py-3 text-left shadow-[0_18px_45px_rgba(0,0,0,0.35),0_0_18px_rgba(124,58,237,0.16)] backdrop-blur"
                style={{
                  left: index === 0 || index === 2 ? "3%" : "auto",
                  right: index === 1 || index === 3 ? "3%" : "auto",
                  top: index < 2 ? "14%" : "45%",
                }}
              >
                <strong className="block font-display text-2xl font-black text-violet-400">{stat.value}</strong>
                <span className="mt-1 block text-xs text-white/58">{stat.label}</span>
              </article>
            ))}
          </div>

          <div className="text-left">
            <p className="text-sm font-black text-violet-400">• {content.heroEyebrow}</p>
            <h1 className="mt-4 max-w-3xl font-display text-4xl font-black leading-tight text-white sm:text-5xl">
              {content.heroTitle} <span className="bg-violet-gradient-text bg-clip-text text-transparent">{content.heroHighlight}</span>
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-8 text-white/62">{content.heroSubtitle}</p>
            <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {content.serviceCards.map((card) => (
                <article key={card.title} className="min-h-[74px] rounded-lg border border-white/[0.07] bg-white/[0.025] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]">
                  <p className="text-sm font-black text-white">{card.title}</p>
                  <p className="mt-1 text-xs leading-5 text-white/48">{card.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-lg border border-white/[0.08] bg-[#040711]/82 px-5 py-6 text-center shadow-[0_24px_80px_rgba(0,0,0,0.36),inset_0_1px_0_rgba(255,255,255,0.035)]">
          <p className="text-sm font-black text-violet-400">{content.processEyebrow}</p>
          <h2 className="mt-2 font-display text-3xl font-black leading-tight text-white">
            {processTitle.main}
            {processTitle.highlight && (
              <>
                {" "}
                <span className="bg-violet-gradient-text bg-clip-text text-transparent">{processTitle.highlight}</span>
              </>
            )}
          </h2>
          <div className="relative mt-9 grid gap-x-5 gap-y-9 md:grid-cols-3 lg:grid-cols-6">
            <div className="pointer-events-none absolute left-[7%] right-[7%] top-[8px] hidden h-px bg-[linear-gradient(90deg,transparent,rgba(147,51,234,0.85),rgba(196,156,255,0.72),rgba(147,51,234,0.85),transparent)] shadow-[0_0_18px_rgba(168,85,247,0.46)] lg:block" />
            {content.processSteps.map((step, index) => {
              const Icon = icons[index % icons.length];
              return (
                <article key={step.title} className="relative z-10 px-2 pt-5">
                  <span className="absolute left-1/2 top-0 hidden h-3 w-3 -translate-x-1/2 rounded-full border border-violet-300/60 bg-[#4c1d95] shadow-[0_0_16px_rgba(196,156,255,0.82)] lg:block" />
                  <span className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-violet-300/32 bg-[#080316] text-violet-300 shadow-[0_0_24px_rgba(168,85,247,0.28),inset_0_0_18px_rgba(168,85,247,0.12)]">
                    <Icon size={20} />
                  </span>
                  <strong className="mt-5 block text-sm font-black leading-6 text-white">{step.title}</strong>
                  <p className="mx-auto mt-2 max-w-[150px] text-xs leading-6 text-white/55">{step.description}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="grid gap-8 rounded-lg border border-white/10 bg-white/[0.025] p-6 shadow-card lg:grid-cols-[0.85fr_1fr] lg:items-center">
          <div className="relative mx-auto aspect-[4/3] w-full max-w-md overflow-hidden rounded-lg border border-violet-300/25 bg-[#100422]">
            <Image src={content.founderPhoto} alt={content.founderName} fill sizes="(min-width: 1024px) 420px, 90vw" className="object-cover" />
          </div>
          <div>
            <p className="text-sm font-black text-violet-300">• {content.founderEyebrow}</p>
            <h2 className="mt-3 font-display text-3xl font-black">{content.founderName}</h2>
            <p className="mt-1 text-sm font-bold text-violet-200">{content.founderRole}</p>
            <p className="mt-5 max-w-2xl text-sm leading-8 text-muted">{content.founderBio}</p>
            <ul className="mt-5 grid gap-3 text-sm text-muted">
              {content.founderBullets.map((bullet) => (
                <li key={bullet} className="flex items-start gap-3">
                  <Check className="mt-1 h-4 w-4 flex-none text-violet-300" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
            <div className="mt-7 grid grid-cols-2 gap-4 md:grid-cols-4">
              {content.founderStats.map((stat) => (
                <article key={`${stat.value}-${stat.label}`} className="border-l border-white/10 pl-4 first:border-l-0 first:pl-0">
                  <strong className="block font-display text-3xl font-black text-violet-300">{stat.value}</strong>
                  <span className="mt-1 block text-xs text-muted">{stat.label}</span>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="py-4 text-center">
          <p className="text-sm font-black text-violet-300">{content.teamEyebrow}</p>
          <h2 className="mt-2 font-display text-3xl font-black">{content.teamTitle}</h2>
          <div className="mt-6">
            <TeamGrid team={team} />
          </div>
        </section>

        <section className="rounded-lg border border-white/10 bg-white/[0.025] p-6 text-center shadow-card">
          <h2 className="font-display text-2xl font-black">{content.metricsTitle}</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-5">
            {content.metrics.map((stat) => (
              <article key={`${stat.value}-${stat.label}`} className="rounded-lg border border-white/10 bg-black/20 p-4">
                <strong className="block font-display text-3xl font-black text-violet-300">{stat.value}</strong>
                <span className="mt-2 block text-xs text-muted">{stat.label}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-white/10 bg-white/[0.025] p-6 text-center shadow-card">
          <h2 className="font-display text-2xl font-black">{content.reasonsTitle}</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
            {content.reasons.map((reason, index) => {
              const Icon = reasonIcons[index % reasonIcons.length];
              return (
                <article key={reason.title} className="rounded-lg border border-white/10 bg-black/20 p-4">
                  <Icon className="mx-auto h-6 w-6 text-violet-300" />
                  <strong className="mt-3 block text-sm font-black">{reason.title}</strong>
                  <p className="mt-2 text-xs leading-6 text-muted">{reason.description}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="grid gap-6 rounded-lg border border-white/10 bg-white/[0.025] p-6 shadow-card lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="text-center lg:text-left">
            <ShieldCheck className="mx-auto h-16 w-16 text-violet-300 lg:mx-0" />
            <h2 className="mt-4 font-display text-2xl font-black">{content.termsTitle}</h2>
            <p className="mt-3 text-sm leading-7 text-muted">{content.termsText}</p>
          </div>
          <div className="grid gap-2">
            {content.termsItems.map((item, index) => (
              <details key={item.title} className="group rounded-lg border border-white/10 bg-black/20 px-4 py-3 text-sm text-muted">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold text-white/76">
                  <span>{index + 1}. {item.title}</span>
                  <span className="text-violet-300 transition-transform duration-200 group-open:rotate-180">⌄</span>
                </summary>
                <p className="mt-3 border-t border-white/10 pt-3 text-xs leading-7 text-white/52">{item.description}</p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
