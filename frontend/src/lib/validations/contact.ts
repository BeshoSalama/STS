import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().trim().email().optional().or(z.literal("")),
  phone: z.string().trim().min(6),
  company: z.string().trim().optional(),
  activity: z.string().trim().optional(),
  source: z.string().trim().optional(),
  goal: z.string().trim().optional(),
  consultationDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  website: z.string().optional(),
});
