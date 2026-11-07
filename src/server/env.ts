import { z } from "zod";

/**
 * 1. Define the Schema
 * z.object(...) declares what properties MUST exist and what types they must be.
 */
const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  // Database
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),

  // Auth / JWT
  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),

  // Email (Nodemailer)
  EMAIL_USER: z.string().email("EMAIL_USER must be a valid email address"),
  EMAIL_PASS: z.string().min(1, "EMAIL_PASS is required"),

  // Twilio
  TWILIO_SERVICE_SID: z.string().min(1, "TWILIO_SERVICE_SID is required"),
  TWILIO_ACCOUNT_SID: z.string().min(1, "TWILIO_ACCOUNT_SID is required"),
  TWILIO_AUTH_TOKEN: z.string().min(1, "TWILIO_AUTH_TOKEN is required"),

  // Cloudinary (Handling both NEXT_PUBLIC_ and non-prefixed names)
  CLOUDINARY_CLOUD_NAME: z
    .string()
    .min(1)
    .default(process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || ""),
  CLOUDINARY_API_KEY: z
    .string()
    .min(1)
    .default(process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || ""),
  CLOUDINARY_API_SECRET: z.string().min(1, "CLOUDINARY_API_SECRET is required"),
});

/**
 * 2. Validate process.env using safeParse()
 * safeParse returns an object:
 * - If valid: { success: true, data: { ...typed values } }
 * - If invalid: { success: false, error: ZodError }
 */
const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error(
    "❌ Invalid environment variables:",
    JSON.stringify(parsedEnv.error.format(), null, 2)
  );
  throw new Error(
    "Invalid or missing environment variables. Check the server logs above."
  );
}

// 3. Export the validated data with 100% accurate TypeScript types
export const env = parsedEnv.data;
