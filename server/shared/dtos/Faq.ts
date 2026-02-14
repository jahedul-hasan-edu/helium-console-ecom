import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";
import { faqs } from "../../db/schemas/faqs";
import { PaginationOptions, PaginationResponse } from "../utils/pagination";
import { FAQSortField } from "../constants/feature/faqMessages";

// === BASE SCHEMA ===
export const faqSchema = createInsertSchema(faqs);

// === CREATE FAQ DTO ===
export const createFaqSchema = z.object({
  title: z.string().min(1, "Title is required").min(5, "Title must be at least 5 characters"),
  answer: z.string().min(1, "Answer is required").min(10, "Answer must be at least 10 characters"),
  tenantId: z.string().uuid("Tenant ID must be a valid UUID"),
  isActive: z.boolean().optional().default(true),
}).strict();

export type CreateFaqDTO = z.infer<typeof createFaqSchema>;

// === UPDATE FAQ DTO ===
export const updateFaqSchema = z.object({
  title: z.string().min(1, "Title is required").min(5, "Title must be at least 5 characters").optional(),
  answer: z.string().min(1, "Answer is required").min(10, "Answer must be at least 10 characters").optional(),
  tenantId: z.string().uuid("Tenant ID must be a valid UUID").optional(),
  isActive: z.boolean().optional(),
}).strict();

export type UpdateFaqDTO = z.infer<typeof updateFaqSchema>;

// === RESPONSE DTO ===
export const faqResponseSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  title: z.string(),
  answer: z.string(),
  isActive: z.boolean(),
  createdBy: z.string().uuid().nullable(),
  updatedBy: z.string().uuid().nullable(),
  createdOn: z.date().nullable(),
  updatedOn: z.date().nullable(),
  userIp: z.string().nullable(),
});

export type FaqResponseDTO = z.infer<typeof faqResponseSchema>;

// === PAGINATION OPTIONS ===
export interface GetFaqsOptions extends PaginationOptions {
  sortBy?: FAQSortField;
  tenantId?: string;
}

// === PAGINATION RESPONSE ===
export interface GetFaqsResponse extends PaginationResponse<FaqResponseDTO> {
  items: FaqResponseDTO[];
}
