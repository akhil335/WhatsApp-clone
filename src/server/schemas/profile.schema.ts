import { z } from "zod";

/**
 * Zod Schema for Updating User Profile
 */
export const updateProfileSchema = z.object({
  username: z
    .string()
    .trim()
    .min(2, "Username must be at least 2 characters long")
    .max(50, "Username cannot exceed 50 characters")
    .optional(),
  about: z
    .string()
    .max(500, "About status cannot exceed 500 characters")
    .optional(),
  termsAccepted: z.boolean().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

