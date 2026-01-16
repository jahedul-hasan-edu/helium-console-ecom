import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";
import { subSubCategories } from "../../db/schemas/subSubCategories";
import { PaginationOptions, PaginationResponse } from "../utils/pagination";
import { SubSubCategorySortField } from "../constants";

// === BASE SCHEMA ===
export const subSubCategorySchema = createInsertSchema(subSubCategories);

// === CREATE SUB SUB CATEGORY DTO ===
export const createSubSubCategorySchema = z.object({
  subCategoryId: z.string().uuid("Invalid sub category ID"),
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
}).strict();

export type CreateSubSubCategoryDTO = z.infer<typeof createSubSubCategorySchema>;

// === UPDATE SUB SUB CATEGORY DTO ===
export const updateSubSubCategorySchema = z.object({
  subCategoryId: z.string().uuid("Invalid sub category ID").optional(),
  name: z.string().min(1, "Name is required").optional(),
  slug: z.string().min(1, "Slug is required").optional(),
}).strict();

export type UpdateSubSubCategoryDTO = z.infer<typeof updateSubSubCategorySchema>;

// === SUB SUB CATEGORY RESPONSE DTO ===
export const subSubCategoryResponseSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid().nullable(),
  subCategoryId: z.string().uuid().nullable(),
  name: z.string().nullable(),
  slug: z.string().nullable(),
  createdBy: z.string().uuid().nullable(),
  updatedBy: z.string().uuid().nullable(),
  createdOn: z.date().nullable(),
  updatedOn: z.date().nullable(),
  userIp: z.string().nullable(),
});

export type SubSubCategoryResponseDTO = z.infer<typeof subSubCategoryResponseSchema>;

/**
 * SubSubCategory-specific pagination options
 */
export type GetSubSubCategoriesOptions = PaginationOptions<SubSubCategorySortField>;

/**
 * SubSubCategory-specific pagination response
 */
export type GetSubSubCategoriesResponse = PaginationResponse<SubSubCategoryResponseDTO>;
