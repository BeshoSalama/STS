import { SectionHeading } from "@/components/ui/SectionHeading";
import { PackageCards } from "@/components/sections/PackageCards";

export default function PricingPage() {
  return (
    <section className="pricing-page relative overflow-hidden pb-24 pt-36 sm:pt-44">
      <div className="container">
        <SectionHeading
          align="center"
          eyebrow="Marketing Packages"
          title={
            <>
              Pick a plan, or{" "}
              <span className="bg-violet-gradient-text bg-clip-text text-transparent">build your own</span>
            </>
          }
          subtitle="Three ready-made growth packages, or assemble a custom plan from exactly the services you need."
          className="mx-auto max-w-2xl"
        />
      </div>

      <PackageCards />
    </section>
  );
}
