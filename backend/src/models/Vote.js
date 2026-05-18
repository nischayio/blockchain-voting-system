import mongoose from "mongoose";

// VOTE MODEL
const voteSchema = new mongoose.Schema(
  {
    voteHash: {
      type: String,
      required: true,
      index: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    walletAddress: {
      type: String,
      required: true,
    },

    electionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Election",
      required: true,
    },

    candidate: {
      type: String,
      required: true,
    },

    nullifier: {
      type: String,
      required: true,
      unique: true,
    },

    batchId: {
      type: String,
      default: null,
    },

    merkleRoot: {
      type: String,
      default: null,
    },

    transactionHash: {
      type: String,
      default: null,
    },

    status: {
      type: String,
      enum: ["pending", "processing", "batched", "failed"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Vote", voteSchema);
