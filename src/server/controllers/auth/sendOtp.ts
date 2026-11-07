import User from "@/server/models/User";
import { otpGenerator } from "@/server/utils/otpGenerator";
import { response } from "@/server/utils/responseHandler";
import { NextRequest } from "next/server";
import { sendOtpToPhoneNumber } from "@/server/services/twilioService";
import { sendOtpEmail } from "@/server/services/emailService";
import { sendOtpSchema } from "@/server/schemas/auth.schema";

export const sendOtp = async (req: NextRequest) => {
  try {
    const rawBody = await req.json();

    // 1. Validate the incoming body with Zod
    const validation = sendOtpSchema.safeParse(rawBody);

    if (!validation.success) {
      // Pick the first error message to display cleanly to the user
      const firstError = validation.error.issues[0]?.message || "Invalid input";
      return response(400, firstError);
    }

    // 2. validation.data is now 100% type-safe and validated
    const { phoneNumber, phoneSuffix, email } = validation.data;
    const otp = otpGenerator();
    const expiry = new Date(Date.now() + 5 * 60 * 1000);

    let user: InstanceType<typeof User> | null = null;

    if (email) {
      user = await User.findOne({ email });

      if (!user) {
        user = new User({ email });
      }

      user.emailOtp = otp;
      user.emailOtpExpires = expiry;

      await user.save();
      await sendOtpEmail(email, otp);

      return response(200, "Otp sent to your email", { email });
    }

    if (phoneNumber && phoneSuffix) {
      const fullPhoneNumber = `${phoneSuffix}${phoneNumber}`;

      user = await User.findOne({ phoneNumber });
      if (!user) {
        user = new User({ phoneNumber, phoneSuffix });
      }

      await user.save();
      await sendOtpToPhoneNumber(fullPhoneNumber);

      return response(200, "Otp sent successfully", user);
    }

    return response(400, "Phone number or email is required");
  } catch (err) {
    console.error("sendOtp error:", err);
    return response(500, "Internal server error");
  }
};
