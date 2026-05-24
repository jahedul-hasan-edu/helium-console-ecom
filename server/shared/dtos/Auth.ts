import { z } from "zod";
import { RegistrationMode, TwoFactorMethod } from "server/shared/constants/enums";

export const systemStatusResponseSchema = z.object({
  hasSuperAdmin: z.boolean(),
  registrationMode: z.nativeEnum(RegistrationMode),
});

export type SystemStatusResponseDTO = z.infer<typeof systemStatusResponseSchema>;

export const loginSchema = z.object({
  email: z.string().trim().email("Valid email is required"),
  password: z.string().min(1, "Password is required"),
}).strict();

export type LoginDTO = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Valid email is required"),
}).strict();

export type ForgotPasswordDTO = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Reset token is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .strict()
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ResetPasswordDTO = z.infer<typeof resetPasswordSchema>;

export const verify2FASchema = z.object({
  tempToken: z.string().min(1, "Temp token is required").optional(),
  code: z.string().trim().length(6, "Code must be 6 digits"),
}).strict();

export type Verify2FADTO = z.infer<typeof verify2FASchema>;

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
}).strict();

export type RefreshTokenDTO = z.infer<typeof refreshTokenSchema>;

const registrationBaseSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  email: z.string().trim().email("Valid email is required"),
  mobile: z.string().trim().min(1, "Phone number is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Confirm password is required"),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: "You must accept the terms and conditions" }),
  }),
});

export const registerSuperAdminSchema = registrationBaseSchema
  .strict()
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterSuperAdminDTO = z.infer<typeof registerSuperAdminSchema>;

export const registerTenantAdminSchema = registrationBaseSchema
  .extend({
    planId: z.string().uuid("Invalid subscription plan"),
  })
  .strict()
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterTenantAdminDTO = z.infer<typeof registerTenantAdminSchema>;

export const publicSubscriptionPlanSchema = z.object({
  id: z.string().uuid(),
  name: z.string().nullable(),
  price: z.string().nullable(),
  durationDays: z.number().nullable(),
});

export type PublicSubscriptionPlanDTO = z.infer<typeof publicSubscriptionPlanSchema>;

export const twoFactorSetupSchema = z.object({
  method: z.nativeEnum(TwoFactorMethod),
}).strict();

export type TwoFactorSetupDTO = z.infer<typeof twoFactorSetupSchema>;