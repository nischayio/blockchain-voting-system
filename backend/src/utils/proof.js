import { buildMerkleTree } from "./merkle.js";
import Vote from "../models/Vote.js";
import CryptoJS from "crypto-js";

const hash = (data) => CryptoJS.SHA256(data).toString();

// generate vote proof
export const generateProof = async (voteHash) => {
  const vote = await Vote.findOne({ voteHash });

  if (!vote) {
    throw new Error("Vote not found");
  }

  if (!vote.batchId) {
    return {
      pending: true,
      message: "Vote is recorded but not yet batched",
    };
  }

  const batchVotes = await Vote.find({
    batchId: vote.batchId,
  }).sort({ createdAt: 1 });

  const { tree } = buildMerkleTree(batchVotes);

  const leaf = hash(voteHash);
  const proof = tree.getProof(leaf).map((p) => ({
    position: p.position,
    data: p.data.toString("hex"),
  }));
  return {
    proof,
    root: vote.merkleRoot,
    leaf,
  };
};
