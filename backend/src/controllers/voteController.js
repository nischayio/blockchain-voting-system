import { ethers } from "ethers";

import Vote from "../models/Vote.js";
import User from "../models/User.js";
import Election from "../models/Election.js";

// SUBMIT VOTE
export const submitVote = async (req, res) => {
  try {
    const {
      electionId,
      candidate,
      voteHash,
      walletAddress,
      signature,
      nullifier,
      timestamp,
    } = req.body;

    // authenticated user JWT
    const userId = req.user.id;

    // validate fields
    if (
      !electionId ||
      !candidate ||
      !voteHash ||
      !walletAddress ||
      !signature ||
      !nullifier ||
      !timestamp
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // normalize wallet
    const normalizedWallet = walletAddress.toLowerCase();

    // find authenticated user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // wallet Validation
    if (!user.walletAddress) {
      return res.status(401).json({
        success: false,
        message: "Wallet not linked",
      });
    }

    // prevent wallet spoofing
    if (user.walletAddress !== normalizedWallet) {
      return res.status(401).json({
        success: false,
        message: "Wallet mismatch",
      });
    }

    // election Validation
    const election = await Election.findById(electionId);

    if (!election) {
      return res.status(404).json({
        success: false,
        message: "Election not found",
      });
    }

    const now = new Date();

    let effectiveStatus = "upcoming";

    if (now >= election.startTime && now <= election.endTime) {
      effectiveStatus = "active";
    } else if (now > election.endTime) {
      effectiveStatus = "ended";
    }

    // validate active election
    if (effectiveStatus !== "active") {
      return res.status(400).json({
        success: false,
        message: "Election is not active",
      });
    }

    // candidate validation
    if (!election.candidates.includes(candidate)) {
      return res.status(400).json({
        success: false,
        message: "Invalid candidate selected",
      });
    }

    // signature Freshness check
    const currentTimestamp = Date.now();

    const FIVE_MINUTES = 5 * 60 * 1000;

    if (Math.abs(currentTimestamp - Number(timestamp)) > FIVE_MINUTES) {
      return res.status(401).json({
        success: false,
        message: "Signature expired",
      });
    }

    // signature Verification
    const message = `
Blockchain Voting System

Election: ${electionId}
Candidate: ${candidate}

Vote Hash: ${voteHash}

Wallet: ${normalizedWallet}

Timestamp: ${timestamp}
`;

    const recoveredAddress = ethers.utils.verifyMessage(message, signature);

    if (recoveredAddress.toLowerCase() !== normalizedWallet) {
      return res.status(401).json({
        success: false,
        message: "Invalid signature",
      });
    }

    // Double Vote Prevention

    // nullifier check
    const existingNullifier = await Vote.findOne({ nullifier });

    if (existingNullifier) {
      return res.status(400).json({
        success: false,
        message: "User already voted",
      });
    }

    // duplicate vote hash check
    const existingVote = await Vote.findOne({
      userId: req.user.id,
      electionId,
    });

    if (existingVote) {
      return res.status(400).json({
        success: false,
        message: "You have already voted in this election",
      });
    }

    const duplicateHash = await Vote.findOne({ voteHash });

    if (duplicateHash) {
      return res.status(400).json({
        success: false,
        message: "Duplicate vote detected",
      });
    }

    // Create Vote
    try {
      const vote = await Vote.create({
        electionId,
        candidate,
        voteHash,
        nullifier,
        userId,
        walletAddress: normalizedWallet,
        status: "pending",
      });

      return res.status(201).json({
        success: true,
        message: "Vote submitted successfully",
        data: {
          id: vote._id,
          voteHash,
          walletAddress: normalizedWallet,
          status: vote.status,
        },
      });
    } catch (err) {
      // duplicate key error
      if (err.code === 11000) {
        return res.status(400).json({
          success: false,
          message: "User already voted",
        });
      }

      throw err;
    }
  } catch (error) {
    console.error("VOTE CONTROLLER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET USER VOTES
export const getMyVotes = async (req, res) => {
  try {
    // page & limit from query
    const page = Number(req.query.page) || 1;

    const limit = Number(req.query.limit) || 10;

    // calculate skip
    const skip = (page - 1) * limit;

    // total count
    const totalVotes = await Vote.countDocuments({
      userId: req.user.id,
    });

    // paginated votes
    const votes = await Vote.find({
      userId: req.user.id,
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      success: true,

      pagination: {
        total: totalVotes,
        page,
        limit,
        totalPages: Math.ceil(totalVotes / limit),
        hasNextPage: page * limit < totalVotes,
        hasPrevPage: page > 1,
      },

      data: votes.map((vote) => ({
        id: vote._id,
        voteHash: vote.voteHash,
        walletAddress: vote.walletAddress,
        batchId: vote.batchId,
        status: vote.status,
        createdAt: vote.createdAt,
      })),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
