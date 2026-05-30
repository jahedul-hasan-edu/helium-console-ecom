import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";
import { organizations } from "../../db/schemas/organizations";
import { PaginationOptions, PaginationResponse } from "../utils/pagination";
import { OrganizationSortField } from "../constants/feature/organizationMessages";

const requiredText = (message: string) => z.string().trim().min(1, message);
const optionalText = (message: string) => z.string().trim().min(1, message).optional();
const booleanFromForm = z.union([
  z.boolean(),
  z.string().transform((value) => value === "true" || value === "1"),
]);

export const organizationSchema = createInsertSchema(organizations);

export const createOrganizationSchema = z.object({
  tenantId: z.string().uuid("Invalid tenant ID").optional(),
  title: requiredText("Title is required"),
  logoTitle: requiredText("Logo title is required"),
  phone: requiredText("Phone is required"),
  email: z.string().trim().email("Valid email is required"),
  address: requiredText("Address is required"),
  socialFbUrl: requiredText("Facebook URL is required"),
  socialInUrl: requiredText("LinkedIn URL is required"),
  socialXUrl: requiredText("X URL is required"),
  socialUtubeUrl: requiredText("YouTube URL is required"),
  license: requiredText("License is required"),
  privacyPolicy: requiredText("Privacy policy is required"),
  returnPolicy: requiredText("Return policy is required"),
  isActive: booleanFromForm.default(true),
}).strict();

export type CreateOrganizationDTO = z.infer<typeof createOrganizationSchema>;

export const updateOrganizationSchema = z.object({
  title: optionalText("Title is required"),
  logoTitle: optionalText("Logo title is required"),
  phone: optionalText("Phone is required"),
  email: z.string().trim().email("Valid email is required").optional(),
  address: optionalText("Address is required"),
  socialFbUrl: optionalText("Facebook URL is required"),
  socialInUrl: optionalText("LinkedIn URL is required"),
  socialXUrl: optionalText("X URL is required"),
  socialUtubeUrl: optionalText("YouTube URL is required"),
  license: optionalText("License is required"),
  privacyPolicy: optionalText("Privacy policy is required"),
  returnPolicy: optionalText("Return policy is required"),
  isActive: booleanFromForm.optional(),
  removeImage: booleanFromForm.optional(),
}).strict();

export type UpdateOrganizationDTO = z.infer<typeof updateOrganizationSchema>;

export const organizationResponseSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid().nullable(),
  title: z.string().nullable(),
  logoTitle: z.string().nullable(),
  phone: z.string().nullable(),
  email: z.string().nullable(),
  address: z.string().nullable(),
  socialFbUrl: z.string().nullable(),
  socialInUrl: z.string().nullable(),
  socialXUrl: z.string().nullable(),
  socialUtubeUrl: z.string().nullable(),
  license: z.string().nullable(),
  privacyPolicy: z.string().nullable(),
  returnPolicy: z.string().nullable(),
  imageUrl: z.string().nullable(),
  isActive: z.boolean().nullable(),
  createdBy: z.string().uuid().nullable(),
  updatedBy: z.string().uuid().nullable(),
  createdOn: z.date().nullable(),
  updatedOn: z.date().nullable(),
  userIp: z.string().nullable(),
});

export type OrganizationResponseDTO = z.infer<typeof organizationResponseSchema>;

export type GetOrganizationsOptions = PaginationOptions<OrganizationSortField>;
export type GetOrganizationsResponse = PaginationResponse<OrganizationResponseDTO>;