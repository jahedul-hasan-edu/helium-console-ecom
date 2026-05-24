import { z } from "zod";

export const pagePermissionEntrySchema = z.object({
  pageId: z.string().uuid(),
  enabled: z.boolean(),
  canView: z.boolean(),
  canCreate: z.boolean(),
  canUpdate: z.boolean(),
  canDelete: z.boolean(),
  canPreview: z.boolean(),
  scopes: z.array(z.string().trim().min(1)).default([]),
});

export const updatePagePermissionsSchema = z.object({
  entries: z.array(pagePermissionEntrySchema).min(1, "At least one page permission entry is required"),
}).strict();

export const pagePermissionResponseSchema = z.object({
  role: z.object({
    id: z.string().uuid(),
    name: z.string(),
    displayName: z.string(),
    isSystem: z.boolean(),
  }),
  pages: z.array(
    z.object({
      id: z.string().uuid(),
      title: z.string(),
      slug: z.string(),
      icon: z.string().nullable().optional(),
      routePath: z.string(),
      sortOrder: z.number(),
      isSystem: z.boolean(),
      isActive: z.boolean(),
      enabled: z.boolean(),
      canView: z.boolean(),
      canCreate: z.boolean(),
      canUpdate: z.boolean(),
      canDelete: z.boolean(),
      canPreview: z.boolean(),
      scopes: z.array(z.string()),
    })
  ),
});

export type PagePermissionEntryDTO = z.infer<typeof pagePermissionEntrySchema>;
export type UpdatePagePermissionsDTO = z.infer<typeof updatePagePermissionsSchema>;
export type PagePermissionResponseDTO = z.infer<typeof pagePermissionResponseSchema>;