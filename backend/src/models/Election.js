import mongoose from "mongoose";

// CANDIDATE SCHEMA
const candidateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },

  image: {
    type: String,
    required: true,
  },

  imagePublicId: {
    type: String,
    required: true,
  },
});

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

    candidates: {
      type: [candidateSchema],
      required: true,
    },

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
