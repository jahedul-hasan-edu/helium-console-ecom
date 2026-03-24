import { z } from "zod";

export const pageResponseSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  slug: z.string(),
  icon: z.string().nullable().optional(),
  parentId: z.string().uuid().nullable().optional(),
  sortOrder: z.number(),
  routePath: z.string(),
  isActive: z.boolean(),
  isSystem: z.boolean(),
  createdOn: z.date().nullable().optional(),
  updatedOn: z.date().nullable().optional(),
});

export const createPageSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  slug: z.string().trim().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must contain lowercase letters, numbers, and hyphens only"),
  icon: z.string().trim().min(1).optional().nullable(),
  parentId: z.string().uuid().nullable().optional(),
  sortOrder: z.number().int().min(0).default(0),
  routePath: z.string().trim().min(1, "Route path is required").regex(/^\/admin(\/.*)?$/, "Route path must start with /admin"),
  isActive: z.boolean().optional(),
}).strict();

export const updatePageSchema = createPageSchema.partial().extend({
  title: z.string().trim().min(1, "Title is required").optional(),
}).strict();

export type PageResponseDTO = z.infer<typeof pageResponseSchema>;
export type CreatePageDTO = z.infer<typeof createPageSchema>;
export type UpdatePageDTO = z.infer<typeof updatePageSchema>;