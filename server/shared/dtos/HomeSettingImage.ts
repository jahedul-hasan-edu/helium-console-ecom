import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";
import { homeSettingImages } from "../../db/schemas/homeSettingImages";

// === BASE SCHEMA ===
export const homeSettingImageSchema = createInsertSchema(homeSettingImages);

// === CREATE HOME SETTING IMAGE DTO ===
export const createHomeSettingImageSchema = z.object({
  homeSettingId: z.string().uuid("Invalid home setting ID"),
  imageUrl: z.string().min(1, "Image URL is required"),
  createdBy: z.string().uuid().optional(),
  userIp: z.string().optional(),
}).strict();

export type CreateHomeSettingImageDTO = z.infer<typeof createHomeSettingImageSchema>;

// === HOME SETTING IMAGE RESPONSE DTO ===
export const homeSettingImageResponseSchema = z.object({
  id: z.string().uuid(),
  homeSettingId: z.string().uuid().nullable(),
  imageUrl: z.string().nullable(),
  createdBy: z.string().uuid().nullable(),
  updatedBy: z.string().uuid().nullable(),
  createdOn: z.date().nullable(),
  updatedOn: z.date().nullable(),
  userIp: z.string().nullable(),
});

export type HomeSettingImageResponseDTO = z.infer<typeof homeSettingImageResponseSchema>;
