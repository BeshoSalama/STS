import { SectionHeading } from "@/components/ui/SectionHeading";
import { TeamGrid } from "@/components/sections/TeamGrid";

export default function AboutPage() {
  return (
    <>
      <section className="relative overflow-hidden pb-16 pt-40 sm:pt-48">
        <div className="container">
          <SectionHeading
            align="center"
            eyebrow="Our Team"
            title={
              <>
                Meet the <span className="bg-violet-gradient-text bg-clip-text text-transparent">Growth Team</span>
              </>
            }
            subtitle="A senior, multi-disciplinary team of strategists, marketers, and creatives working as one growth engine for your brand."
            className="mx-auto max-w-2xl"
          />
        </div>
      </section>
      <TeamGrid />
    </>
  );
}
