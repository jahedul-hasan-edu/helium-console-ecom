import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";
import { categories } from "../../db/schemas/categories";
import { PaginationOptions, PaginationResponse } from "../utils/pagination";
import { CATEGORY_SORT_FIELDS, CategorySortField } from "../constants/feature/categoryMessages";

// === BASE SCHEMA ===
export const categorySchema = createInsertSchema(categories);

// === CREATE CATEGORY DTO ===
export const createCategorySchema = z.object({
  mainCategoryId: z.string().uuid("Invalid main category ID"),
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
}).strict();

export type CreateCategoryDTO = z.infer<typeof createCategorySchema>;

// === UPDATE CATEGORY DTO ===
export const updateCategorySchema = z.object({
  mainCategoryId: z.string().uuid("Invalid main category ID").optional(),
  name: z.string().min(1, "Name is required").optional(),
  slug: z.string().min(1, "Slug is required").optional(),
}).strict();

export type UpdateCategoryDTO = z.infer<typeof updateCategorySchema>;

// === CATEGORY RESPONSE DTO ===
export const categoryResponseSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid().nullable(),
  mainCategoryId: z.string().uuid().nullable(),
  mainCategoryName: z.string().nullable(),
  name: z.string().nullable(),
  slug: z.string().nullable(),
  createdBy: z.string().uuid().nullable(),
  updatedBy: z.string().uuid().nullable(),
  createdOn: z.date().nullable(),
  updatedOn: z.date().nullable(),
  userIp: z.string().nullable(),
});

export type CategoryResponseDTO = z.infer<typeof categoryResponseSchema>;

/**
 * Category-specific pagination options
 */
export type GetCategoriesOptions = PaginationOptions<CategorySortField>;

/**
 * Category-specific pagination response
 */
export type GetCategoriesResponse = PaginationResponse<CategoryResponseDTO>;
