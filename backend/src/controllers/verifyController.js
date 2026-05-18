import Vote from "../models/Vote.js";
import Batch from "../models/Batch.js";
import { generateProof } from "../utils/proof.js";

export const verifyVote = async (req, res) => {
  try {
    const { voteHash } = req.params;

    // find vote
    const vote = await Vote.findOne({ voteHash });

    if (!vote) {
      return res.status(404).json({
        success: false,
        message: "Vote not found",
      });
    }

    // vote batching status check === pending
    if (vote.status === "pending") {
      return res.json({
        success: true,
        data: {
          status: "pending",
          message: "Vote is waiting for batch processing",
        },
      });
    }

    // vote batching status check === processing
    if (vote.status === "processing") {
      return res.json({
        success: true,
        data: {
          status: "processing",
          message: "Vote batch is being processed",
        },
      });
    }

    // vote batching status check === failed
    if (vote.status === "failed") {
      return res.json({
        success: true,
        data: {
          status: "failed",
          message: "Batch processing failed",
        },
      });
    }

    // find batch
    const batch = await Batch.findOne({
      batchId: vote.batchId,
    });

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch record not found",
      });
    }

    // generate Merkle proof
    const proof = await generateProof(vote.voteHash);

    // vote batching verified response
    return res.json({
      success: true,
      data: {
        status: "verified",

        voteHash: vote.voteHash,

        batchId: batch.batchId,

        merkleRoot: batch.merkleRoot,

        transactionHash: batch.transactionHash,

        batchStatus: batch.status,

        proof,
      },
    });
  } catch (err) {
    console.error("VERIFY ERROR:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
