import { z } from "zod";

export const passwordRules = [
  {
    label: "At least 12 characters",
    test: (value: string) => value.length >= 12,
  },
  {
    label: "One uppercase letter",
    test: (value: string) => /[A-Z]/.test(value),
  },
  {
    label: "One lowercase letter",
    test: (value: string) => /[a-z]/.test(value),
  },
  {
    label: "One number",
    test: (value: string) => /\d/.test(value),
  },
  {
    label: "One special character",
    test: (value: string) => /[^A-Za-z0-9]/.test(value),
  },
  {
    label: "No spaces",
    test: (value: string) => value.length > 0 && !/\s/.test(value),
  },
];

export const strongPasswordSchema = z
  .string()
  .min(12, "Password must be at least 12 characters")
  .regex(/[A-Z]/, "Password must include one uppercase letter")
  .regex(/[a-z]/, "Password must include one lowercase letter")
  .regex(/\d/, "Password must include one number")
  .regex(/[^A-Za-z0-9]/, "Password must include one special character")
  .regex(/^\S+$/, "Password cannot contain spaces");

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Name is required"),
    email: z.string().trim().email("Valid email is required").toLowerCase(),
    password: strongPasswordSchema,
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().trim().email("Valid email is required").toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

export const verifyEmailSchema = z.object({
  email: z.string().trim().email("Valid email is required").toLowerCase(),
  code: z.string().trim().regex(/^\d{6}$/, "Enter the 6-digit code"),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: strongPasswordSchema,
    confirmPassword: z.string().min(1, "Confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from the old password",
    path: ["newPassword"],
  });
