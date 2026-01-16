import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";
import { products } from "../../db/schemas/products";
import { PaginationOptions, PaginationResponse } from "../utils/pagination";
import { ProductSortField } from "../constants";

// === BASE SCHEMA ===
export const productSchema = createInsertSchema(products);

// === CREATE PRODUCT DTO ===
export const createProductSchema = z.object({
  subCategoryId: z.string().uuid("Invalid sub category ID"),
  subSubCategoryId: z.string().uuid("Invalid sub sub category ID"),
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: "Price must be a positive number",
  }),
  stock: z.number().int("Stock must be an integer").min(0, "Stock must be at least 0"),
  isActive: z.boolean().default(true),
}).strict();

export type CreateProductDTO = z.infer<typeof createProductSchema>;

// === UPDATE PRODUCT DTO ===
export const updateProductSchema = z.object({
  subCategoryId: z.string().uuid("Invalid sub category ID").optional(),
  subSubCategoryId: z.string().uuid("Invalid sub sub category ID").optional(),
  name: z.string().min(1, "Name is required").optional(),
  description: z.string().min(1, "Description is required").optional(),
  price: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: "Price must be a positive number",
  }).optional(),
  stock: z.number().int("Stock must be an integer").min(0, "Stock must be at least 0").optional(),
  isActive: z.boolean().optional(),
}).strict();

export type UpdateProductDTO = z.infer<typeof updateProductSchema>;

// === PRODUCT RESPONSE DTO ===
export const productResponseSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid().nullable(),
  subCategoryId: z.string().uuid().nullable(),
  subSubCategoryId: z.string().uuid().nullable(),
  name: z.string().nullable(),
  description: z.string().nullable(),
  price: z.string().nullable(),
  stock: z.number().nullable(),
  isActive: z.boolean().nullable(),
  createdBy: z.string().uuid().nullable(),
  updatedBy: z.string().uuid().nullable(),
  createdOn: z.date().nullable(),
  updatedOn: z.date().nullable(),
  userIp: z.string().nullable(),
});

export type ProductResponseDTO = z.infer<typeof productResponseSchema>;

/**
 * Product-specific pagination options
 */
export type GetProductsOptions = PaginationOptions<ProductSortField>;

/**
 * Product-specific pagination response
 */
export type GetProductsResponse = PaginationResponse<ProductResponseDTO>;
