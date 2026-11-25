import { NextRequest } from "next/server";
import UserStatus from "@/server/models/UserStatus";
import { uploadToCloudinary } from "@/server/services/cloudinaryService";
import { getCurrentUserId } from "@/server/utils/getCurrentUser";
import { response } from "@/server/utils/responseHandler";
import { withErrorHandler } from "@/server/utils/errorHandler";
import { BadRequestError } from "@/server/utils/errors";

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50 MB
const ALLOWED_MEDIA_TYPES = ["image", "video"] as const;
const DEFAULT_TEXT_STATUS_BG = "#008069"; // WhatsApp's iconic status teal/green
const HEX_COLOR_REGEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export const createStatus = withErrorHandler(async (req: NextRequest) => {
  const userId = await getCurrentUserId();
  const formData = await req.formData();

  // 1. Extract and sanitize inputs
  // If frontend sends empty string or spaces, trim() + || undefined ensures it won't store blank strings
  const content = (formData.get("content") as string | null)?.trim() || undefined;
  const rawTemplateBg = (formData.get("templateBg") as string | null)?.trim() || undefined;
  const file = formData.get("file") as File | null;
  const hasValidFile = file instanceof File && file.size > 0;

  // 2. Validate presence of content or file
  if (!content && !hasValidFile) {
    throw new BadRequestError("Status must contain either text content or a media file");
  }

  // 3. Process media upload if a file was provided
  let media: { url: string; type: "image" | "video" } | undefined = undefined;

  if (hasValidFile && file) {
    const mimePrefix = file.type.split("/")[0] as "image" | "video";

    if (!ALLOWED_MEDIA_TYPES.includes(mimePrefix)) {
      throw new BadRequestError(`Unsupported media type: ${file.type}. Only images and videos are supported.`);
    }

    if (mimePrefix === "image" && file.size > MAX_IMAGE_SIZE) {
      throw new BadRequestError("Image size exceeds the maximum limit of 10MB");
    }

    if (mimePrefix === "video" && file.size > MAX_VIDEO_SIZE) {
      throw new BadRequestError("Video size exceeds the maximum limit of 50MB");
    }

    // Upload to Cloudinary under the dedicated status folder
    // Note: If Cloudinary upload fails, it throws an error immediately,
    // which aborts execution before any MongoDB document is saved.
    const uploadResult = await uploadToCloudinary(file, "status-media");

    media = {
      url: uploadResult.secure_url,
      type: mimePrefix,
    };
  }

  // 4. Create and save status in MongoDB
  // Text status ALWAYS requires a background color.
  // If frontend didn't supply one or sent an invalid hex, fallback to WhatsApp's default teal.
  // For media statuses (image/video), templateBg is not applicable.
  let templateBg: string | undefined = undefined;
  if (!media) {
    templateBg =
      rawTemplateBg && HEX_COLOR_REGEX.test(rawTemplateBg)
        ? rawTemplateBg
        : DEFAULT_TEXT_STATUS_BG;
  }

  const status = await UserStatus.create({
    user: userId,
    content,
    media,
    templateBg,
  });

  return response(201, "Status created successfully", { status });
});
