import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(2),
  phone: z.string().trim().min(6),
  consultationDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  website: z.string().optional(),
});
