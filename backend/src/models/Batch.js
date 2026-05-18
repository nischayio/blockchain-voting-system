import mongoose from "mongoose";

// VOTES BATCH MODEL
const batchSchema = new mongoose.Schema(
  {
    batchId: {
      type: String,
      required: true,
      unique: true,
    },

    merkleRoot: {
      type: String,
      required: true,
    },

    transactionHash: {
      type: String,
      default: null,
    },

    voteCount: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["processing", "confirmed", "failed"],
      default: "processing",
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Batch", batchSchema);
