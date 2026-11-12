import { NextRequest } from "next/server";
import User from "@/server/models/User";
import { getCurrentUserId } from "@/server/utils/getCurrentUser";
import { response } from "@/server/utils/responseHandler";
import { withErrorHandler } from "@/server/utils/errorHandler";
import { NotFoundError } from "@/server/utils/errors";
import { uploadToCloudinary } from "@/server/services/cloudinaryService";
import { updateProfileSchema } from "@/server/schemas/profile.schema";

export const updateProfile = withErrorHandler(async (req: NextRequest) => {
  const userId = await getCurrentUserId();
  const formData = await req.formData();

  const rawUsername = formData.get("username")?.toString() || undefined;
  const rawAbout = formData.get("about")?.toString() || undefined;
  const rawAgreed = formData.get("agreed");
  const termsAccepted = rawAgreed !== null ? rawAgreed === "true" : undefined;

  // Validate fields with Zod (throws ZodError on failure, caught by withErrorHandler)
  const validated = updateProfileSchema.parse({
    username: rawUsername,
    about: rawAbout,
    termsAccepted,
  });

  const user = await User.findById(userId);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  const { username, about, termsAccepted: accepted } = validated;

  if (username !== undefined) {
    user.username = username;
  }

  if (accepted !== undefined) {
    user.termsAccepted = accepted;
  }

  if (about !== undefined) {
    user.about = about;
  }

  const file = formData.get("file");
  if (file && file instanceof File && file.size > 0) {
    const uploadResult = await uploadToCloudinary(
      file,
      "profile-pictures"
    );

    user.profilePicture = uploadResult.secure_url;
  }

  await user.save();

  return response(200, "Profile updated successfully", {
    user,
  });
});
