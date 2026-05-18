import mongoose from "mongoose";

// ELECTION MODEL
const electionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    candidates: [
      {
        type: String,
        required: true,
        trim: true,
      },
    ],

    startTime: {
      type: Date,
      required: true,
    },

    endTime: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["upcoming", "active", "ended"],
      default: "upcoming",
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Election", electionSchema);
