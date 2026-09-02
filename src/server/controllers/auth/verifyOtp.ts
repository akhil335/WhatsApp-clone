import User from "@/server/models/User";
import { verifyTwilioOtp } from "@/server/services/twilioService";
import { generateToken } from "@/server/utils/generateToken";
import { response } from "@/server/utils/responseHandler";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

export const verifyOtp = async (req: NextRequest) => {
  const body = await req.json();
  const { phoneNumber, phoneSuffix, email, otp } = body;

  try {
    let user: InstanceType<typeof User> | null = null;

    if (email) {
      user = await User.findOne({ email }).select("+emailOtp +emailOtpExpires");

      if (!user) {
        return response(404, "User not found");
      }
      
      if (
        !user.emailOtp ||
        String(user.emailOtp) !== String(otp) ||
        !user.emailOtpExpires ||
        user.emailOtpExpires < new Date()
      ) {
        return response(400, "Invalid or expired OTP");
      }

      user.isVerified = true;
      user.emailOtp = null;
      user.emailOtpExpires = null;

      await user.save();
    } else {
      if (!phoneNumber || !phoneSuffix) {
        return response(400, "Phone number and phone suffix are required");
      }

      const fullPhoneNumber = `${phoneSuffix}${phoneNumber}`;
      user = await User.findOne({ phoneNumber });

      if (!user) {
        return response(404, "User not found");
      }

      const result = await verifyTwilioOtp(fullPhoneNumber, otp);
     
      if (result.status !== "approved") {
        return response(400, "Invalid or expired OTP");
      }

      user.isVerified = true;
      await user.save();
    }

    const cookieStore = await cookies();
    const token = generateToken(String(user._id));

    cookieStore.set({
      name: "auth_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });

    return response(200, "Otp verified successfully", { user });
  } catch (err) {
    console.log(err);
    return response(500, "Internal server error");
  }
};
