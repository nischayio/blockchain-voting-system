import mongoose from "mongoose";

// USER MODEL
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    walletAddress: { type: String, unique: true, sparse: true },
    profilePicture: { type: String, default: "" },
    profilePicturePublicId: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("User", userSchema);
