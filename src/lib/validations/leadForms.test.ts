import { describe, expect, it } from "vitest";
import { briefSchema } from "@/lib/validations/brief";
import { contactSchema } from "@/lib/validations/contact";
import { packageQuoteSchema } from "@/lib/validations/packageQuote";

describe("lead form validations", () => {
  it("accepts a valid consultation request", () => {
    expect(
      contactSchema.safeParse({
        name: "Jane Client",
        phone: "+201001234567",
        consultationDate: "2026-08-12",
      }).success
    ).toBe(true);
  });

  it("rejects malformed consultation dates", () => {
    expect(
      contactSchema.safeParse({
        name: "Jane Client",
        phone: "+201001234567",
        consultationDate: "12/08/2026",
      }).success
    ).toBe(false);
  });

  it("normalizes optional brief checkbox arrays", () => {
    const parsed = briefSchema.parse({
      clientName: "Jane Client",
      brandName: "Jane Brand",
      phone: "+201001234567",
      socialPlatforms: ["Facebook"],
      toneOfVoice: [],
      advertisingPlatforms: ["Google"],
      languages: ["ENG"],
    });

    expect(parsed.socialPlatforms).toEqual(["Facebook"]);
    expect(parsed.languages).toEqual(["ENG"]);
  });

  it("accepts package quote add-on ids and ignores client totals", () => {
    const parsed = packageQuoteSchema.parse({
      planName: "Custom Package",
      addOnIds: ["ads", "seo"],
      total: 1,
    });

    expect(parsed.addOnIds).toEqual(["ads", "seo"]);
    expect("total" in parsed).toBe(false);
  });
});
