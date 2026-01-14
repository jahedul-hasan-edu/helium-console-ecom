import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";
import { users } from "../../db/schemas/users";
import { PaginationOptions, PaginationResponse } from "../utils/pagination";
import { USER_SORT_FIELDS, UserSortField } from "../constants/feature/userMessages";

// === BASE SCHEMA ===
export const userSchema = createInsertSchema(users);

// === CREATE USER DTO ===
export const createUserSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email"),
  mobile: z.string().min(1, "Mobile is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  tenantId: z.string().uuid().optional(),
}).strict();

export type CreateUserDTO = z.infer<typeof createUserSchema>;

// === UPDATE USER DTO ===
export const updateUserSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  mobile: z.string().min(1, "Mobile is required"),
  tenantId: z.string().uuid().optional(),
}).strict();

export type UpdateUserDTO = z.infer<typeof updateUserSchema>;

// === USER RESPONSE DTO ===
export const userResponseSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  email: z.string().nullable(),
  mobile: z.string().nullable(),
  createdBy: z.string().uuid().nullable(),
  updatedBy: z.string().uuid().nullable(),
  createdOn: z.date().nullable(),
  updatedOn: z.date().nullable(),
  userIp: z.string().nullable(),
});

export type UserResponseDTO = z.infer<typeof userResponseSchema>;

/**
 * User-specific pagination options
 */
export type GetUsersOptions = PaginationOptions<UserSortField>;

/**
 * User-specific pagination response
 */
export type GetUsersResponse = PaginationResponse<UserResponseDTO>;
