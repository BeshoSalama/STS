import type { CustomPackageSettings } from "@/types/content";

export const defaultCustomPackageSettings: CustomPackageSettings = {
  quantityDiscountStart: 5,
  quantityDiscountPercent: 10,
  maxQuantityDiscount: 25,
  annualDiscountPercent: 15,
};

export function calculateQuantityDiscountPercent(selectedCount: number, settings: CustomPackageSettings) {
  if (settings.quantityDiscountStart <= 0 || selectedCount < settings.quantityDiscountStart) return 0;

  const discountSteps = selectedCount - settings.quantityDiscountStart + 1;
  const discount = discountSteps * settings.quantityDiscountPercent;

  return Math.max(0, Math.min(settings.maxQuantityDiscount, discount));
}

export function calculateCustomPackageTotal({
  rawTotal,
  selectedCount,
  billing,
  settings,
}: {
  rawTotal: number;
  selectedCount: number;
  billing?: "monthly" | "annual";
  settings: CustomPackageSettings;
}) {
  const quantityDiscountPercent = calculateQuantityDiscountPercent(selectedCount, settings);
  const annualDiscountPercent = billing === "annual" ? settings.annualDiscountPercent : 0;
  const discountPercent = Math.min(95, quantityDiscountPercent + annualDiscountPercent);
  const total = Math.round(rawTotal * (1 - discountPercent / 100));

  return {
    total,
    savings: rawTotal - total,
    quantityDiscountPercent,
    annualDiscountPercent,
    discountPercent,
  };
}
