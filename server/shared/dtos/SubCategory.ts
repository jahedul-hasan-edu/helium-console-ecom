import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";
import { subCategories } from "../../db/schemas/subCategories";
import { PaginationOptions, PaginationResponse } from "../utils/pagination";
import { SubCategorySortField } from "../constants";

// === BASE SCHEMA ===
export const subCategorySchema = createInsertSchema(subCategories);

// === CREATE SUB CATEGORY DTO ===
export const createSubCategorySchema = z.object({
  categoryId: z.string().uuid("Invalid category ID"),
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
}).strict();

export type CreateSubCategoryDTO = z.infer<typeof createSubCategorySchema>;

// === UPDATE SUB CATEGORY DTO ===
export const updateSubCategorySchema = z.object({
  categoryId: z.string().uuid("Invalid category ID").optional(),
  name: z.string().min(1, "Name is required").optional(),
  slug: z.string().min(1, "Slug is required").optional(),
}).strict();

export type UpdateSubCategoryDTO = z.infer<typeof updateSubCategorySchema>;

// === SUB CATEGORY RESPONSE DTO ===
export const subCategoryResponseSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid().nullable(),
  categoryId: z.string().uuid().nullable(),
  categoryName: z.string().nullable(),
  name: z.string().nullable(),
  slug: z.string().nullable(),
  createdBy: z.string().uuid().nullable(),
  updatedBy: z.string().uuid().nullable(),
  createdOn: z.date().nullable(),
  updatedOn: z.date().nullable(),
  userIp: z.string().nullable(),
});

export type SubCategoryResponseDTO = z.infer<typeof subCategoryResponseSchema>;

/**
 * SubCategory-specific pagination options
 */
export type GetSubCategoriesOptions = PaginationOptions<SubCategorySortField>;

/**
 * SubCategory-specific pagination response
 */
export type GetSubCategoriesResponse = PaginationResponse<SubCategoryResponseDTO>;
