import Vote from "../models/Vote.js";
import Batch from "../models/Batch.js";
import { buildMerkleTree } from "../utils/merkle.js";
import { storeOnChain } from "./blockchainService.js";

// CREATE BATCH
export const processBatch = async () => {
  try {
    // get only pending votes
    const votes = await Vote.find({
      status: "pending",
      batchId: null,
    }).sort({ createdAt: 1 });

    if (votes.length === 0) {
      console.log("No votes to batch");
      return;
    }

    // lock votes temporarily
    await Vote.updateMany(
      {
        _id: { $in: votes.map((v) => v._id) },
      },
      {
        status: "processing",
      },
    );

    // generate merkle tree
    const { root } = buildMerkleTree(votes);

    // generate batch ID
    const batchId = `batch-${Date.now()}`;

    // create batch record
    const batch = await Batch.create({
      batchId,
      merkleRoot: root,
      voteCount: votes.length,
      status: "processing",
    });

    let transactionHash = null;

    try {
      // store on blockchain
      const tx = await storeOnChain(batchId, root);

      // if blockchain service returns tx hash
      transactionHash = tx?.hash || null;

      // update batch as confirmed
      batch.status = "confirmed";
      batch.transactionHash = transactionHash;

      await batch.save();

      // update votes
      await Vote.updateMany(
        {
          _id: { $in: votes.map((v) => v._id) },
        },
        {
          batchId,
          merkleRoot: root,
          transactionHash,
          status: "batched",
        },
      );

      console.log("Batch processed successfully");
      console.log("Batch ID:", batchId);
      console.log("Merkle Root:", root);
    } catch (blockchainErr) {
      console.error("Blockchain storage failed:", blockchainErr);

      // mark batch failed
      batch.status = "failed";
      await batch.save();

      // rollback votes
      await Vote.updateMany(
        {
          _id: { $in: votes.map((v) => v._id) },
        },
        {
          status: "failed",
        },
      );
    }
  } catch (err) {
    console.error("BATCH PROCESS ERROR:", err);
  }
};
