import User from "@/server/models/User";
import { otpGenerator } from "@/server/utils/otpGenerator";
import { response } from "@/server/utils/responseHandler";
import { withErrorHandler } from "@/server/utils/errorHandler";
import { BadRequestError } from "@/server/utils/errors";
import { NextRequest } from "next/server";
import { sendOtpToPhoneNumber } from "@/server/services/twilioService";
import { sendOtpEmail } from "@/server/services/emailService";
import { sendOtpSchema } from "@/server/schemas/auth.schema";

export const sendOtp = withErrorHandler(async (req: NextRequest) => {
  const rawBody = await req.json();

  // Validate incoming body (throws ZodError on failure, handled by withErrorHandler)
  const { phoneNumber, phoneSuffix, email } = sendOtpSchema.parse(rawBody);

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

  throw new BadRequestError("Phone number or email is required");
});
