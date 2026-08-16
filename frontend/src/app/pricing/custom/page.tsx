import { CustomPackageBuilder } from "@/components/sections/PackageCards";
import { PricingBackdrop } from "@/components/sections/PricingBackdrop";
import { auth } from "@/lib/auth";
import { getCustomPackageBaseFee, getCustomPackageSettings, getPackageAddOns } from "@/lib/content/packages";

export const dynamic = "force-dynamic";

export default async function CustomPricingPage() {
  const [packageAddOns, customPackageBaseFee, customPackageSettings, session] = await Promise.all([
    getPackageAddOns(),
    getCustomPackageBaseFee(),
    getCustomPackageSettings(),
    auth(),
  ]);

  return (
    <section className="pricing-page relative overflow-hidden pb-24 pt-36 sm:pt-44">
      <PricingBackdrop />

      <div className="container relative z-10 text-center">
        <p className="mx-auto flex w-fit items-center gap-4 text-xs font-black uppercase tracking-[0.42em] text-[#dac7f5]/85 before:h-px before:w-16 before:bg-violet-300/20 after:h-px after:w-16 after:bg-violet-300/20">
          Custom Package
        </p>
        <h1 className="mx-auto mt-5 max-w-4xl font-display text-4xl font-black leading-[1.05] tracking-normal text-white sm:text-6xl" dir="rtl">
          صمم <span className="bg-violet-gradient-text bg-clip-text text-transparent">الباقة اللي تناسبك</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#d8cbea]/80" dir="rtl">
          اختار الخدمات والكمية، وشوف السعر والملخص فوراً قبل ما تبعت الطلب.
        </p>
      </div>

      <CustomPackageBuilder
        packageAddOns={packageAddOns}
        customPackageBaseFee={customPackageBaseFee}
        customPackageSettings={customPackageSettings}
        isAuthenticated={Boolean(session?.user?.id)}
      />
    </section>
  );
}
