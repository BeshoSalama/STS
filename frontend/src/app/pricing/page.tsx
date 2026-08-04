import { SectionHeading } from "@/components/ui/SectionHeading";
import { PackageCards } from "@/components/sections/PackageCards";
import { getPackageAddOns, getPackagePlans } from "@/lib/content/packages";

export const revalidate = 3600;

export default async function PricingPage() {
  const [packagePlans, packageAddOns] = await Promise.all([getPackagePlans(), getPackageAddOns()]);

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

      <PackageCards packagePlans={packagePlans} packageAddOns={packageAddOns} />
    </section>
  );
}
