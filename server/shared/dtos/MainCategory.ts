import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";
import { mainCategories } from "../../db/schemas/mainCategories";
import { PaginationOptions, PaginationResponse } from "../utils/pagination";
import { MAIN_CATEGORY_SORT_FIELDS, MainCategorySortField } from "../constants/feature/mainCategoryMessages";

// === BASE SCHEMA ===
export const mainCategorySchema = createInsertSchema(mainCategories);

// === CREATE MAIN CATEGORY DTO ===
export const createMainCategorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  orderIndex: z.number().int("Order index must be an integer"),
}).strict();

export type CreateMainCategoryDTO = z.infer<typeof createMainCategorySchema>;

// === UPDATE MAIN CATEGORY DTO ===
export const updateMainCategorySchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  slug: z.string().min(1, "Slug is required").optional(),
  orderIndex: z.number().int("Order index must be an integer").optional(),
}).strict();

export type UpdateMainCategoryDTO = z.infer<typeof updateMainCategorySchema>;

// === MAIN CATEGORY RESPONSE DTO ===
export const mainCategoryResponseSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid().nullable(),
  name: z.string().nullable(),
  slug: z.string().nullable(),
  orderIndex: z.number().nullable(),
  createdBy: z.string().uuid().nullable(),
  updatedBy: z.string().uuid().nullable(),
  createdOn: z.date().nullable(),
  updatedOn: z.date().nullable(),
  userIp: z.string().nullable(),
});

export type MainCategoryResponseDTO = z.infer<typeof mainCategoryResponseSchema>;

/**
 * Main Category-specific pagination options
 */
export type GetMainCategoriesOptions = PaginationOptions<MainCategorySortField>;

/**
 * Main Category-specific pagination response
 */
export type GetMainCategoriesResponse = PaginationResponse<MainCategoryResponseDTO>;
