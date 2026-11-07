import { z } from "zod";

/**
 * Zod Schema for Sending OTP
 * 
 * Concepts used here:
 * 1. z.string().email(): Validates email format.
 * 2. .optional(): Field is not required (can be undefined).
 * 3. .refine(): Custom business logic validation.
 *    Here we check: "Did the user provide at least an email OR (phoneNumber + phoneSuffix)?"
 */
export const sendOtpSchema = z
  .object({
    email: z.string().email("Invalid email address").optional(),
    phoneNumber: z.string().min(5, "Phone number is too short").optional(),
    phoneSuffix: z.string().min(1, "Phone prefix/suffix is required").optional(),
  })
  .refine(
    (data) => {
      const hasEmail = Boolean(data.email);
      const hasPhone = Boolean(data.phoneNumber && data.phoneSuffix);
      return hasEmail || hasPhone;
    },
    {
      message: "You must provide either an email OR both phoneNumber and phoneSuffix",
      path: ["email"], // Attaches the error to the email field if both are missing
    }
  );

export type SendOtpInput = z.infer<typeof sendOtpSchema>;

/**
 * Zod Schema for Verifying OTP
 * 
 * Concepts used here:
 * 1. z.string().regex(/^\d{6}$/): Ensures OTP is exactly 6 numeric digits.
 */
export const verifyOtpSchema = z
  .object({
    email: z.string().email("Invalid email address").optional(),
    phoneNumber: z.string().min(5).optional(),
    phoneSuffix: z.string().min(1).optional(),
    otp: z.string().regex(/^\d{6}$/, "OTP must be exactly 6 digits"),
  })
  .refine(
    (data) => {
      const hasEmail = Boolean(data.email);
      const hasPhone = Boolean(data.phoneNumber && data.phoneSuffix);
      return hasEmail || hasPhone;
    },
    {
      message: "You must provide either an email OR both phoneNumber and phoneSuffix",
      path: ["email"],
    }
  );

export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;

