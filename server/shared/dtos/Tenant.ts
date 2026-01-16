import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";
import { tenants } from "../../db/schemas/tenants";
import { PaginationOptions, PaginationResponse } from "../utils/pagination";
import { TENANT_SORT_FIELDS, TenantSortField } from "../constants/feature/tenantMessages";

// === BASE SCHEMA ===
export const tenantSchema = createInsertSchema(tenants);

// === CREATE TENANT DTO ===
export const createTenantSchema = z.object({
  name: z.string().min(1, "Name is required"),
  domain: z.string().optional(),
  isActive: z.boolean().optional(),
}).strict();

export type CreateTenantDTO = z.infer<typeof createTenantSchema>;

// === UPDATE TENANT DTO ===
export const updateTenantSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  domain: z.string().optional(),
  isActive: z.boolean().optional(),
}).strict();

export type UpdateTenantDTO = z.infer<typeof updateTenantSchema>;

// === TENANT RESPONSE DTO ===
export const tenantResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  domain: z.string().nullable(),
  isActive: z.boolean().nullable(),
  createdBy: z.string().uuid().nullable(),
  updatedBy: z.string().uuid().nullable(),
  createdOn: z.date().nullable(),
  updatedOn: z.date().nullable(),
  userIp: z.string().nullable(),
});

export type TenantResponseDTO = z.infer<typeof tenantResponseSchema>;

/**
 * Tenant-specific pagination options
 */
export interface GetTenantsOptions extends PaginationOptions {
  sortBy?: TenantSortField;
}

/**
 * Tenant list response
 */
export interface GetTenantsResponse extends PaginationResponse<TenantResponseDTO> {}
