import { z } from "zod";

export const packagePlanSchema = z.object({
  name: z.string().trim().min(1),
  tagline: z.string().trim().min(1),
  price: z.string().trim().min(1),
  period: z.string().trim().min(1),
  description: z.string().trim().min(1),
  features: z.array(z.string().trim().min(1)).default([]),
  cta: z.string().trim().min(1),
  featured: z.coerce.boolean().optional(),
  order: z.coerce.number().int().optional(),
});

export const packageAddOnSchema = z.object({
  id: z.string().trim().min(1).regex(/^[a-z0-9-]+$/i, "Use letters, numbers and dashes only"),
  label: z.string().trim().min(1),
  description: z.string().trim().min(1),
  price: z.coerce.number().int().min(0),
  order: z.coerce.number().int().optional(),
});
