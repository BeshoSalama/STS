import { z } from "zod";

export const projectSchema = z.object({
  slug: z.string().trim().min(1),
  name: z.string().trim().min(1),
  category: z.string().trim().min(1),
  image: z.string().trim().min(1),
  imageAlt: z.string().trim().min(1),
  published: z.coerce.boolean().optional(),
  order: z.coerce.number().int().optional(),
});
