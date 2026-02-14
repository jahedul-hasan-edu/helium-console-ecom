import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";
import { homeSettings } from "../../db/schemas/homeSettings";
import { PaginationOptions, PaginationResponse } from "../utils/pagination";
import { HomeSettingSortField } from "../constants/feature/homeSettingMessages";
import { HomeSettingImageResponseDTO } from "./HomeSettingImage";

// === BASE SCHEMA ===
export const homeSettingSchema = createInsertSchema(homeSettings);

// === CREATE HOME SETTING DTO ===
export const createHomeSettingSchema = z.object({
  tenantId: z.string().uuid("Invalid tenant ID"),
  title: z.string().min(1, "Title is required"),
  subTitle: z.string().min(1, "Subtitle is required"),
  isActive: z.union([z.boolean(), z.string().transform(val => val === 'true' || val === '1')]).default(true),
}).strict();

export type CreateHomeSettingDTO = z.infer<typeof createHomeSettingSchema>;

// === UPDATE HOME SETTING DTO ===
export const updateHomeSettingSchema = z.object({
  tenantId: z.string().uuid("Invalid tenant ID").optional(),
  title: z.string().min(1, "Title is required").optional(),
  subTitle: z.string().min(1, "Subtitle is required").optional(),
  isActive: z.union([z.boolean(), z.string().transform(val => val === 'true' || val === '1')]).optional(),
  imagesToDelete: z.array(z.string()).optional(),
}).strict();

export type UpdateHomeSettingDTO = z.infer<typeof updateHomeSettingSchema>;

// === HOME SETTING RESPONSE DTO ===
export const homeSettingResponseSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid().nullable(),
  title: z.string().nullable(),
  subTitle: z.string().nullable(),
  isActive: z.boolean().nullable(),
  createdBy: z.string().uuid().nullable(),
  updatedBy: z.string().uuid().nullable(),
  createdOn: z.date().nullable(),
  updatedOn: z.date().nullable(),
  userIp: z.string().nullable(),
  images: z.array(z.object({
    id: z.string().uuid(),
    homeSettingId: z.string().uuid().nullable(),
    imageUrl: z.string().nullable(),
    createdBy: z.string().uuid().nullable(),
    updatedBy: z.string().uuid().nullable(),
    createdOn: z.date().nullable(),
    updatedOn: z.date().nullable(),
    userIp: z.string().nullable(),
  })).optional(),
});

export type HomeSettingResponseDTO = z.infer<typeof homeSettingResponseSchema>;

/**
 * HomeSetting-specific pagination options
 */
export type GetHomeSettingsOptions = PaginationOptions<HomeSettingSortField>;

/**
 * HomeSetting-specific pagination response
 */
export type GetHomeSettingsResponse = PaginationResponse<HomeSettingResponseDTO>;
