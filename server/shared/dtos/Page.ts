import { z } from "zod";

export const pageSortFieldSchema = z.enum(["title", "slug", "routePath", "sortOrder", "createdOn", "updatedOn"]);

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
  tenantId: z.string().uuid().optional(),
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

export const getPagesQuerySchema = z.object({
  tenantId: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
  search: z.string().trim().optional(),
  sortBy: pageSortFieldSchema.optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
}).strict();

export const paginatedPagesResponseSchema = z.object({
  items: z.array(pageResponseSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().min(1),
  pageSize: z.number().int().min(1),
  totalPages: z.number().int().min(0),
});

export type PageResponseDTO = z.infer<typeof pageResponseSchema>;
export type CreatePageDTO = z.infer<typeof createPageSchema>;
export type UpdatePageDTO = z.infer<typeof updatePageSchema>;
export type GetPagesQueryDTO = z.infer<typeof getPagesQuerySchema>;
export type GetPagesResponseDTO = z.infer<typeof paginatedPagesResponseSchema>;