import { z } from "zod";

const emailValidator = z
  .string({ required_error: "Email is required" })
  .email("Enter a valid email address")
  .transform((value) => value.trim());

const passwordValidator = z
  .string({ required_error: "Password is required" })
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password cannot exceed 72 characters")
  .regex(/^(?=.*[A-Za-z])(?=.*\d).+$/, "Password must include a letter and a number");

const nameValidator = z
  .string({ required_error: "Name is required" })
  .min(2, "Enter a valid name")
  .max(120, "Name is too long")
  .transform((value) => value.trim());

const organizationValidator = z
  .string({ required_error: "Organization is required" })
  .min(2, "Organization must be at least 2 characters")
  .max(150, "Organization is too long")
  .transform((value) => value.trim());

export const signupSchema = z.object({
  email: emailValidator,
  password: passwordValidator,
  confirmPassword: z.string({ required_error: "Confirm password is required" }),
  profileType: z.enum(["admin", "facility", "manufacturer"], {
    required_error: "Profile type is required",
  }),
  firstName: nameValidator,
  lastName: nameValidator,
  organization: organizationValidator,
  termsAccepted: z.literal(true, {
    errorMap: () => ({ message: "You must accept the terms" }),
  }),
  metadata: z
    .record(z.unknown())
    .optional()
    .default({})
    .refine((value) => value === undefined || Object.keys(value).length <= 20, {
      message: "Too many metadata entries",
    }),
}).superRefine((data, ctx) => {
  if (data.password !== data.confirmPassword) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["confirmPassword"],
      message: "Passwords do not match",
    });
  }

  if (data.profileType === "admin" && data.metadata && data.metadata["facilityId"]) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["metadata", "facilityId"],
      message: "Admins cannot be linked to a facility",
    });
  }
});

export type SignupInput = z.infer<typeof signupSchema>;

export const loginSchema = z.object({
  email: emailValidator,
  password: passwordValidator,
  rememberMe: z.boolean().default(false),
  fingerprint: z.string().min(8).max(128).optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: emailValidator,
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    token: z.string({ required_error: "Reset token is required" }).min(20),
    password: passwordValidator,
    confirmPassword: z.string({ required_error: "Confirm password is required" }),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmPassword"],
        message: "Passwords do not match",
      });
    }
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const refreshSchema = z.object({
  refreshToken: z.string({ required_error: "Refresh token is required" }).min(20),
  fingerprint: z.string().min(8).max(128).optional(),
});

export type RefreshInput = z.infer<typeof refreshSchema>;

export const logoutSchema = z.object({
  refreshToken: z.string({ required_error: "Refresh token is required" }).min(20),
  fingerprint: z.string().min(8).max(128).optional(),
});

export type LogoutInput = z.infer<typeof logoutSchema>;

export const errorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.record(z.unknown()).optional(),
    requestId: z.string().optional(),
  }),
});

export type ErrorResponse = z.infer<typeof errorResponseSchema>;

export const authSuccessSchema = z.object({
  accessToken: z.string(),
  expiresIn: z.number(),
  refreshToken: z.string().optional(),
  user: z.object({
    id: z.string(),
    email: z.string(),
    firstName: z.string().nullable(),
    lastName: z.string().nullable(),
    profileType: z.enum(["admin", "facility", "manufacturer"]),
    organization: z.string().nullable(),
    facilityId: z.string().nullable(),
    manufacturerId: z.string().nullable(),
    permissions: z.array(z.string()),
  }),
});

export type AuthSuccessResponse = z.infer<typeof authSuccessSchema>;

export const signupSuccessSchema = authSuccessSchema.extend({
  requiresVerification: z.boolean().default(false),
});

export type SignupSuccessResponse = z.infer<typeof signupSuccessSchema>;

export const loginSuccessSchema = authSuccessSchema.extend({
  refreshToken: z.string(),
});

export type LoginSuccessResponse = z.infer<typeof loginSuccessSchema>;

