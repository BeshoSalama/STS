import { z } from "zod";

export const packageQuoteSchema = z.object({
  planName: z.string().trim().optional(),
  addOnIds: z.array(z.string()).default([]),
  website: z.string().optional(),
});
