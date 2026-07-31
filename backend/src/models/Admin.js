import mongoose from "mongoose";

// ADMIN MODEL
const adminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: { type: String, required: true },

  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Admin", adminSchema);
