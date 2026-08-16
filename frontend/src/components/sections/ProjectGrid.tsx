"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useScrollReveal } from "@/lib/animations";
import { getProjectSlug } from "@/lib/content/projects";
import type { ProjectItem } from "@/types/content";

function getProjectHref(project: ProjectItem) {
  return `/projects/${project.slug || getProjectSlug(project.name)}`;
}

export function ProjectGrid({ projects }: { projects: ProjectItem[] }) {
  const ref = useScrollReveal<HTMLDivElement>({ selector: "[data-reveal]", stagger: 0.14 });

  return (
    <section className="pb-28">
      <div ref={ref} className="container grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Link
            key={project.name}
            href={getProjectHref(project)}
            data-reveal
            className="service-showcase-card service-motion group block"
            aria-label={`Open ${project.name} case study`}
          >
            <div className="project-logo-visual service-showcase-visual service-motion">
              <div className="service-visual-scan service-motion" />
              <div className="service-neural-trace" aria-hidden="true">
                <span className="service-motion" />
                <span className="service-motion" />
                <span className="service-motion" />
                <span className="service-motion" />
                <span className="service-motion" />
              </div>

              <span className="project-card-arrow service-motion">
                <ArrowUpRight size={16} />
              </span>

              <div className="project-logo-frame service-motion">
                <Image
                  src={project.image}
                  alt={project.imageAlt}
                  fill
                  sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
                  className="object-contain p-5"
                />
              </div>
            </div>

            <div className="service-showcase-content project-showcase-content">
              <div className="min-w-0">
                <p className="font-display text-base font-bold text-ink">{project.name}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-violet-500">
                  {project.category}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
