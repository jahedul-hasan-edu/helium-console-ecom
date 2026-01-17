import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";
import { productImages } from "../../db/schemas/productImages";

// === BASE SCHEMA ===
export const productImageSchema = createInsertSchema(productImages);

// === CREATE PRODUCT IMAGE DTO ===
export const createProductImageSchema = z.object({
  productId: z.string().uuid("Invalid product ID"),
  imageUrl: z.string().url("Invalid image URL"),
  createdBy: z.string().uuid("Invalid created by ID").optional(),
  userIp: z.string().optional(),
}).strict();

export type CreateProductImageDTO = z.infer<typeof createProductImageSchema>;

// === PRODUCT IMAGE RESPONSE DTO ===
export const productImageResponseSchema = z.object({
  id: z.string().uuid(),
  productId: z.string().uuid().nullable(),
  imageUrl: z.string().nullable(),
  createdBy: z.string().uuid().nullable(),
  updatedBy: z.string().uuid().nullable(),
  createdOn: z.date().nullable(),
  updatedOn: z.date().nullable(),
  userIp: z.string().nullable(),
});

export type ProductImageResponseDTO = z.infer<typeof productImageResponseSchema>;
