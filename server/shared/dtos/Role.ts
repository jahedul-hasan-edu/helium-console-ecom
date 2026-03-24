import { z } from "zod";

export const roleResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  displayName: z.string(),
  description: z.string().nullable().optional(),
  isActive: z.boolean(),
  isSystem: z.boolean(),
  assignedUserCount: z.number(),
  activePageCount: z.number(),
  createdOn: z.date().nullable().optional(),
  updatedOn: z.date().nullable().optional(),
});

export const createRoleSchema = z.object({
  displayName: z.string().trim().min(2, "Display name is required"),
  description: z.string().trim().max(500).optional().nullable(),
  isActive: z.boolean().optional(),
}).strict();

export const updateRoleSchema = createRoleSchema.partial().strict();

export type RoleResponseDTO = z.infer<typeof roleResponseSchema>;
export type CreateRoleDTO = z.infer<typeof createRoleSchema>;
export type UpdateRoleDTO = z.infer<typeof updateRoleSchema>;