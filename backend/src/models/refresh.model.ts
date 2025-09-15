import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema({
  token: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
  device: {
    name: { type: String }, // e.g., "Chrome on Mac"
    ip: { type: String }, // optional: IP address
    userAgent: { type: String }, // browser user agent
  },
  expiresAt: { type: Date, required: true }, // optional but recommended
});

refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RefreshToken = mongoose.model("RefreshToken", refreshTokenSchema);
