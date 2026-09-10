import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, trim: true },

    email   : {
      type     : String,
      lowercase: true,
      validate : {
        validator: (v: string) => /^\S+@\S+\.\S+$/.test(v),
        message  : "Invalid email address",
      },
      unique: true,
      sparse: true,
    },

    phoneNumber    : { type: String, sparse: true, unique: true },
    phoneSuffix    : { type: String, unique: false },

    emailOtp       : { type: String, select: false },
    emailOtpExpires: { type: Date, select: false },

    profilePicture : { type: String },
    about          : { type: String, maxlength: 500 },

    lastSeen       : { type: Date, default: Date.now },
    isOnline       : { type: Boolean, default: false },

    // Set to true after successful OTP verification.
    isVerified     : { type: Boolean, default: false },

    // Set to true after the user accepts the required terms and conditions.
    termsAccepted         : { type: Boolean, default: false },
  },
  { timestamps: true },
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;

