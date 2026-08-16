import { z } from "zod";

export const packageQuoteSchema = z.object({
  planName: z.string().trim().optional(),
  addOnIds: z.array(z.string()).default([]),
  addOns: z
    .array(
      z.object({
        id: z.string().trim().min(1),
        quantity: z.coerce.number().int().min(1).max(99),
      })
    )
    .optional(),
  billing: z.enum(["monthly", "annual"]).optional(),
  website: z.string().optional(),
});
