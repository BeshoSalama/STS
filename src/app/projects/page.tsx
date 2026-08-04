import { SectionHeading } from "@/components/ui/SectionHeading";
import { StatCard } from "@/components/ui/StatCard";
import { ProjectGrid } from "@/components/sections/ProjectGrid";
import { heroStats } from "@/lib/content/stats";

export default function ProjectsPage() {
  return (
    <>
      <section className="relative overflow-hidden pb-16 pt-40 sm:pt-48">
        <div className="container grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:items-center">
          <SectionHeading
            eyebrow="Our Work"
            title={
              <>
                STS Company <span className="bg-violet-gradient-text bg-clip-text text-transparent">Projects</span>
              </>
            }
            subtitle="A selection of brands we've helped scale with data-driven marketing systems."
          />
          <div className="grid grid-cols-3 gap-3">
            <StatCard label="Growth" value={heroStats.growth} prefix="+" suffix="%" variant="line" />
            <StatCard label="Revenue" value={heroStats.revenue} prefix="+" suffix="K" variant="bars" />
            <StatCard label="ROI" value={heroStats.roi} decimals={1} suffix="X" variant="ring" />
          </div>
        </div>
      </section>
      <ProjectGrid />
    </>
  );
}
