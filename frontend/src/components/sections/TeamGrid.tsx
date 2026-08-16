"use client";

import Image from "next/image";
import { UserPlus } from "lucide-react";
import { useScrollReveal } from "@/lib/animations";
import type { TeamMember } from "@/types/content";

const defaultAvatar = "/team/default-avatar.svg";

export function TeamGrid({ team }: { team: TeamMember[] }) {
  const ref = useScrollReveal<HTMLDivElement>({ selector: "[data-reveal]", stagger: 0.06, y: 24 });

  return (
    <section className="pb-8">
      <div ref={ref} className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {team.map((member) => (
          <div key={member.id ?? member.name} data-reveal className="group rounded-lg border border-white/10 bg-white/[0.035] p-4 text-center shadow-card transition-colors duration-300 hover:border-violet-300/45">
            <div className="relative mx-auto h-20 w-20 overflow-hidden rounded-full border border-violet-300/45 bg-violet-950 shadow-[0_0_28px_rgba(198,156,255,0.24)]">
              <Image src={member.photo || defaultAvatar} alt={member.name} fill sizes="80px" className="object-cover" />
            </div>
            <p className="mt-4 text-sm font-bold text-ink">{member.name}</p>
            <p className="mt-1 min-h-8 text-xs font-medium leading-relaxed text-muted">{member.role}</p>
          </div>
        ))}

        <div data-reveal className="group rounded-lg border border-dashed border-white/15 bg-white/[0.025] p-4 text-center">
          <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-violet-300/35 transition-colors duration-300 group-hover:border-violet-300">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-card text-violet-600 transition-colors duration-300 group-hover:text-white">
              <UserPlus size={22} />
            </div>
          </div>
          <p className="mt-4 text-sm font-bold text-ink">انضم إلينا</p>
          <p className="mt-1 min-h-8 text-xs font-medium leading-relaxed text-muted">We&apos;re hiring</p>
        </div>
      </div>
    </section>
  );
}
