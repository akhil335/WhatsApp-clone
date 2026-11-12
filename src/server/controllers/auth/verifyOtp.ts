import User from "@/server/models/User";
import { verifyTwilioOtp } from "@/server/services/twilioService";
import { generateToken } from "@/server/utils/generateToken";
import { response } from "@/server/utils/responseHandler";
import { withErrorHandler } from "@/server/utils/errorHandler";
import { NotFoundError, BadRequestError } from "@/server/utils/errors";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { verifyOtpSchema } from "@/server/schemas/auth.schema";

export const verifyOtp = withErrorHandler(async (req: NextRequest) => {
  const rawBody = await req.json();

  // Validate incoming body (throws ZodError on failure, handled by withErrorHandler)
  const { phoneNumber, phoneSuffix, email, otp } = verifyOtpSchema.parse(rawBody);

  let user: InstanceType<typeof User> | null = null;

  if (email) {
    user = await User.findOne({ email }).select("+emailOtp +emailOtpExpires");

    if (!user) {
      throw new NotFoundError("User not found");
    }

    if (
      !user.emailOtp ||
      String(user.emailOtp) !== String(otp) ||
      !user.emailOtpExpires ||
      user.emailOtpExpires < new Date()
    ) {
      throw new BadRequestError("Invalid or expired OTP");
    }

    user.isVerified = true;
    user.emailOtp = null;
    user.emailOtpExpires = null;

    await user.save();
  } else {
    if (!phoneNumber || !phoneSuffix) {
      throw new BadRequestError("Phone number and phone suffix are required");
    }

    const fullPhoneNumber = `${phoneSuffix}${phoneNumber}`;
    user = await User.findOne({ phoneNumber });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    const result = await verifyTwilioOtp(fullPhoneNumber, otp);

    if (result.status !== "approved") {
      throw new BadRequestError("Invalid or expired OTP");
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
});
