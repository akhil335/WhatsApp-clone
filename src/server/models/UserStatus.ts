import mongoose from "mongoose";

const UserStatusSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, trim: true }, // Text content or optional media caption
    media: {
      url: { type: String },
      type: { type: String, enum: ["image", "video"] },
    },
    viewers: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        viewedAt: { type: Date, default: Date.now },
      },
    ],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    templateBg: { type: String, trim: true }, // Background hex color for text status
    expiredAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
      required: true,
    },
  },
  { timestamps: true }
);

// TTL Index: Automatically purges status 24h after creation
UserStatusSchema.index({ expiredAt: 1 }, { expireAfterSeconds: 0 });

// Compound Index: Instantly query user's active statuses in reverse chronological order
UserStatusSchema.index({ user: 1, createdAt: -1 });

const UserStatus =
  mongoose.models.UserStatus || mongoose.model("UserStatus", UserStatusSchema);

export default UserStatus;
