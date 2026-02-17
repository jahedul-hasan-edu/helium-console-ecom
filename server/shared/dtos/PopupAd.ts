import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";
import { popupAds } from "../../db/schemas/popupAds";
import { PaginationOptions, PaginationResponse } from "../utils/pagination";
import { PopupAdSortField } from "../constants/feature/popupAdMessages";

// === BASE SCHEMA ===
export const popupAdSchema = createInsertSchema(popupAds);

// === CREATE POPUP AD DTO ===
export const createPopupAdSchema = z.object({
  tenantId: z.string().uuid("Invalid tenant ID"),
  title: z.string().min(1, "Title is required"),
  isActive: z.union([z.boolean(), z.string().transform(val => val === 'true' || val === '1')]).default(true),
}).strict();

export type CreatePopupAdDTO = z.infer<typeof createPopupAdSchema>;

// === UPDATE POPUP AD DTO ===
export const updatePopupAdSchema = z.object({
  tenantId: z.string().uuid("Invalid tenant ID").optional(),
  title: z.string().min(1, "Title is required").optional(),
  isActive: z.union([z.boolean(), z.string().transform(val => val === 'true' || val === '1')]).optional(),
  removeImage: z.boolean().optional(),
}).strict();

export type UpdatePopupAdDTO = z.infer<typeof updatePopupAdSchema>;

// === POPUP AD RESPONSE DTO ===
export const popupAdResponseSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid().nullable(),
  title: z.string().nullable(),
  imageUrl: z.string().nullable(),
  isActive: z.boolean().nullable(),
  createdBy: z.string().uuid().nullable(),
  updatedBy: z.string().uuid().nullable(),
  createdOn: z.date().nullable(),
  updatedOn: z.date().nullable(),
  userIp: z.string().nullable(),
});

export type PopupAdResponseDTO = z.infer<typeof popupAdResponseSchema>;

/**
 * PopupAd-specific pagination options
 */
export type GetPopupAdsOptions = PaginationOptions<PopupAdSortField>;

/**
 * PopupAd-specific pagination response
 */
export type GetPopupAdsResponse = PaginationResponse<PopupAdResponseDTO>;
