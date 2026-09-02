import { NextRequest } from "next/server";
import User from "@/server/models/User";
import { getCurrentUserId } from "@/server/utils/getCurrentUser";
import { response } from "@/server/utils/responseHandler";
import { uploadToCloudinary } from "@/server/services/cloudinaryService";

export const updateProfile = async (req: NextRequest) => {
  try {
    const userId = await getCurrentUserId();

    const formData = await req.formData();

    const username = formData.get("username");
    const agreed = formData.get("agreed");
    const about = formData.get("about");
    const file = formData.get("file");
    const profilePicture = formData.get("profilePicture");

    const user = await User.findById(userId);

    if (!user) {
      return response(404, "User not found");
    }

    if (username) {
    user.username = username.toString();
    }

    if (agreed) {
    user.agreed = agreed === "true";
    }

    if (about) {
    user.about = about.toString();
    }

    // update user fields...

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
    console.error(err);
    return response(500, "Internal server error");
  }
};