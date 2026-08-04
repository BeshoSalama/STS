"use client";

import { UserPlus } from "lucide-react";
import { useScrollReveal } from "@/lib/animations";
import { team } from "@/lib/content/team";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);
}

export function TeamGrid() {
  const ref = useScrollReveal<HTMLDivElement>({ selector: "[data-reveal]", stagger: 0.06, y: 24 });

  return (
    <section className="pb-28">
      <div ref={ref} className="container grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3 lg:grid-cols-6">
        {team.map((member) => (
          <div key={member.name} data-reveal className="group text-center">
            <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full border-2 border-violet-200 transition-colors duration-300 group-hover:border-violet-500">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-violet-gradient font-display text-lg font-bold text-white">
                {initials(member.name)}
              </div>
            </div>
            <p className="mt-4 text-sm font-bold text-ink">{member.name}</p>
            <p className="mt-0.5 text-xs font-medium text-violet-600">{member.role}</p>
          </div>
        ))}

        <div data-reveal className="group text-center">
          <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full border-2 border-dashed border-ink/20 transition-colors duration-300 group-hover:border-violet-500">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-card text-violet-700 transition-colors duration-300 group-hover:text-white">
              <UserPlus size={22} />
            </div>
          </div>
          <p className="mt-4 text-sm font-bold text-ink">Join Us</p>
          <p className="mt-0.5 text-xs font-medium text-muted">We&apos;re hiring</p>
        </div>
      </div>
    </section>
  );
}
