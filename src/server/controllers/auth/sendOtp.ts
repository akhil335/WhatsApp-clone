import User from "@/server/models/User";
import { otpGenerator } from "@/server/utils/otpGenerator";
import { response } from "@/server/utils/responseHandler";
import { NextRequest } from "next/server";
import { sendOtpToPhoneNumber } from "@/server/services/twilioService";
import { sendOtpEmail } from "@/server/services/emailService";

export const sendOtp = async (req: NextRequest) => {
  const body = await req.json();
  const { phoneNumber, phoneSuffix, email } = body;
  const otp = otpGenerator();
  const expiry = new Date(Date.now() + 5 * 60 * 1000);

  let user: InstanceType<typeof User> | null = null;

  try {
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

    if (!phoneNumber || !phoneSuffix) {
      return response(400, "Phone number and phone suffix are required");
    }

    const fullPhoneNumber = `${phoneSuffix}${phoneNumber}`;

    user = await User.findOne({ phoneNumber });
    if (!user) {
      user = new User({ phoneNumber, phoneSuffix });
    }

    await user.save();
    await sendOtpToPhoneNumber(fullPhoneNumber);

    return response(200, "Otp sent successfully", user);

  } catch (err) {

    console.log(err);
    return response(500, "Internal server error");
  }
};

