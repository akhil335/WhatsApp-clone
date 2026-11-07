import { NextRequest } from "next/server";
import User from "@/server/models/User";
import { getCurrentUserId } from "@/server/utils/getCurrentUser";
import { response } from "@/server/utils/responseHandler";
import { uploadToCloudinary } from "@/server/services/cloudinaryService";
import { updateProfileSchema } from "@/server/schemas/profile.schema";

export const updateProfile = async (req: NextRequest) => {
  try {
    const userId = await getCurrentUserId();
    const formData = await req.formData();

    const rawUsername = formData.get("username")?.toString() || undefined;
    const rawAbout = formData.get("about")?.toString() || undefined;
    const rawAgreed = formData.get("agreed");
    const termsAccepted = rawAgreed !== null ? rawAgreed === "true" : undefined;

    // 1. Validate fields with Zod
    const validation = updateProfileSchema.safeParse({
      username: rawUsername,
      about: rawAbout,
      termsAccepted,
    });

    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message || "Invalid input";
      return response(400, firstError);
    }

    const user = await User.findById(userId);

    if (!user) {
      return response(404, "User not found");
    }

    const { username, about, termsAccepted: accepted } = validation.data;

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
  } catch (err) {
    console.error("updateProfile error:", err);
    return response(500, "Internal server error");
  }
};
