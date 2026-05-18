import Election from "../models/Election.js";
import Vote from "../models/Vote.js";

// CREATE ELECTION
export const createElection = async (req, res) => {
  try {
    const { title, description, candidates, startTime, endTime } = req.body;

    // validate fields
    if (!title || !candidates || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: "All required fields are required",
      });
    }

    // validate candidates
    if (!Array.isArray(candidates)) {
      return res.status(400).json({
        success: false,
        message: "Candidates must be an array",
      });
    }

    const normalizedCandidates = candidates
      .map((candidate) => candidate.trim())
      .filter(Boolean);

    if (normalizedCandidates.length < 2) {
      return res.status(400).json({
        success: false,
        message: "At least 2 candidates are required",
      });
    }

    // duplicate candidates check
    const uniqueCandidates = new Set(
      normalizedCandidates.map((candidate) => candidate.toLowerCase()),
    );

    if (uniqueCandidates.size !== normalizedCandidates.length) {
      return res.status(400).json({
        success: false,
        message: "Duplicate candidates are not allowed",
      });
    }

    // validate dates
    const start = new Date(startTime);

    const end = new Date(endTime);

    if (end <= start) {
      return res.status(400).json({
        success: false,
        message: "End time must be after start time",
      });
    }

    // check initial status
    const now = new Date();

    let status = "upcoming";

    if (now >= start && now <= end) {
      status = "active";
    }

    if (now > end) {
      status = "ended";
    }

    // create election
    const election = await Election.create({
      title: title.trim(),

      description: description?.trim() || "",

      candidates: normalizedCandidates,

      startTime: start,
      endTime: end,
      status,
    });

    return res.status(201).json({
      success: true,
      message: "Election created successfully",

      data: election,
    });
  } catch (error) {
    console.error("CREATE ELECTION ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET ALL ELECTIONS
export const getAllElections = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;

    const limit = Number(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    // fetch elections
    const elections = await Election.find()
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(limit);

    const now = new Date();

    // runtime lifecycle sync
    for (const election of elections) {
      let currentStatus = election.status;

      if (now < election.startTime) {
        currentStatus = "upcoming";
      } else if (now >= election.startTime && now <= election.endTime) {
        currentStatus = "active";
      } else {
        currentStatus = "ended";
      }

      if (currentStatus !== election.status) {
        election.status = currentStatus;

        await election.save();
      }
    }

    const total = await Election.countDocuments();

    return res.status(200).json({
      success: true,

      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },

      data: elections,
    });
  } catch (error) {
    console.error("GET ELECTIONS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET ELECTIONS BY ID
export const getElectionById = async (req, res) => {
  try {
    const { id } = req.params;

    // find election
    const election = await Election.findById(id);

    if (!election) {
      return res.status(404).json({
        success: false,
        message: "Election not found",
      });
    }

    // runtime lifecycle sync
    const now = new Date();

    let currentStatus = election.status;

    if (now < election.startTime) {
      currentStatus = "upcoming";
    } else if (now >= election.startTime && now <= election.endTime) {
      currentStatus = "active";
    } else {
      currentStatus = "ended";
    }

    // sync db if changed
    if (currentStatus !== election.status) {
      election.status = currentStatus;

      await election.save();
    }

    return res.status(200).json({
      success: true,
      data: election,
    });
  } catch (error) {
    console.error("GET ELECTION ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE ELECTION
export const updateElection = async (req, res) => {
  try {
    const { id } = req.params;

    const { title, description, candidates, startTime, endTime } = req.body;

    // find election
    const election = await Election.findById(id);

    if (!election) {
      return res.status(404).json({
        success: false,
        message: "Election not found",
      });
    }

    // ended elections immutable
    if (election.status === "ended") {
      return res.status(400).json({
        success: false,
        message: "Ended elections cannot be edited",
      });
    }

    // active election restrictions
    if (election.status === "active") {
      if (
        candidates &&
        JSON.stringify(candidates) !== JSON.stringify(election.candidates)
      ) {
        return res.status(400).json({
          success: false,
          message: "Cannot modify candidates during active election",
        });
      }
    }

    // normalize candidates
    let normalizedCandidates = election.candidates;

    if (candidates) {
      if (!Array.isArray(candidates)) {
        return res.status(400).json({
          success: false,
          message: "Candidates must be an array",
        });
      }

      normalizedCandidates = candidates
        .map((candidate) => candidate.trim())
        .filter(Boolean);

      if (normalizedCandidates.length < 2) {
        return res.status(400).json({
          success: false,
          message: "At least 2 candidates are required",
        });
      }

      const uniqueCandidates = new Set(
        normalizedCandidates.map((candidate) => candidate.toLowerCase()),
      );

      if (uniqueCandidates.size !== normalizedCandidates.length) {
        return res.status(400).json({
          success: false,
          message: "Duplicate candidates are not allowed",
        });
      }
    }

    // validate dates
    const start = startTime ? new Date(startTime) : election.startTime;

    const end = endTime ? new Date(endTime) : election.endTime;

    if (end <= start) {
      return res.status(400).json({
        success: false,
        message: "End time must be after start time",
      });
    }

    // update fields
    election.title = title?.trim() || election.title;

    election.description = description?.trim() ?? election.description;

    election.candidates = normalizedCandidates;

    election.startTime = start;

    election.endTime = end;

    // runtime status recalculation
    const now = new Date();

    if (now < start) {
      election.status = "upcoming";
    } else if (now >= start && now <= end) {
      election.status = "active";
    } else {
      election.status = "ended";
    }

    await election.save();

    return res.status(200).json({
      success: true,
      message: "Election updated successfully",

      data: election,
    });
  } catch (error) {
    console.error("UPDATE ELECTION ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE ELECTION
export const deleteElection = async (req, res) => {
  try {
    const { id } = req.params;

    // find election
    const election = await Election.findById(id);

    if (!election) {
      return res.status(404).json({
        success: false,
        message: "Election not found",
      });
    }

    // active election delete prevention
    if (election.status === "active") {
      return res.status(400).json({
        success: false,
        message: "Active elections cannot be deleted",
      });
    }

    // check votes
    const voteExists = await Vote.exists({
      electionId: id,
    });

    if (voteExists) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete election with votes",
      });
    }

    // delete election
    await Election.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Election deleted successfully",
    });
  } catch (error) {
    console.error("DELETE ELECTION ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ADD CANDIDATE
export const addCandidate = async (req, res) => {
  try {
    const { id } = req.params;

    const { name } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Candidate name is required",
      });
    }

    const election = await Election.findById(id);

    if (!election) {
      return res.status(404).json({
        success: false,
        message: "Election not found",
      });
    }

    // lifecycle protection
    if (election.status !== "upcoming") {
      return res.status(400).json({
        success: false,
        message: "Candidates can only be modified before election starts",
      });
    }

    const candidateName = name.trim();

    const exists = election.candidates.some(
      (candidate) => candidate.toLowerCase() === candidateName.toLowerCase(),
    );

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Candidate already exists",
      });
    }

    election.candidates.push(candidateName);

    await election.save();

    return res.status(200).json({
      success: true,
      message: "Candidate added successfully",

      data: election,
    });
  } catch (error) {
    console.error("ADD CANDIDATE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// REMOVE CANDIDATE
export const removeCandidate = async (req, res) => {
  try {
    const { id, candidateName } = req.params;

    // find election
    const election = await Election.findById(id);

    if (!election) {
      return res.status(404).json({
        success: false,
        message: "Election not found",
      });
    }

    // lifecycle protection
    if (election.status !== "upcoming") {
      return res.status(400).json({
        success: false,
        message: "Candidates can only be modified before election starts",
      });
    }

    const filtered = election.candidates.filter(
      (candidate) => candidate !== candidateName,
    );

    if (filtered.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Election must have at least 2 candidates",
      });
    }

    election.candidates = filtered;

    await election.save();

    return res.status(200).json({
      success: true,
      message: "Candidate removed successfully",

      data: election,
    });
  } catch (error) {
    console.error("REMOVE CANDIDATE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET ELECTION RESULTS
export const getElectionResults = async (req, res) => {
  try {
    const { id } = req.params;

    // find election
    const election = await Election.findById(id);

    if (!election) {
      return res.status(404).json({
        success: false,
        message: "Election not found",
      });
    }

    // results only after election ends
    const now = new Date();

    const hasEnded = now > election.endTime;

    if (!hasEnded) {
      return res.status(400).json({
        success: false,
        message: "Election results are not available yet",
      });
    }

    // fetch finalized votes
    const votes = await Vote.find({
      electionId: id,
      status: "batched",
    });

    const totalVotes = votes.length;

    // initialize candidate counts
    const counts = {};

    election.candidates.forEach((candidate) => {
      counts[candidate] = 0;
    });

    // aggregate votes
    votes.forEach((vote) => {
      if (counts[vote.candidate] !== undefined) {
        counts[vote.candidate] += 1;
      }
    });

    // result array
    const results = Object.entries(counts).map(([candidate, votes]) => ({
      candidate,
      votes,
      percentage:
        totalVotes > 0 ? Number(((votes / totalVotes) * 100).toFixed(2)) : 0,
    }));

    // determine winner
    let winner = null;
    let isTie = false;

    if (totalVotes > 0) {
      const highestVoteCount = Math.max(
        ...results.map((result) => result.votes),
      );

      // candidates tie check
      const topCandidates = results.filter(
        (result) => result.votes === highestVoteCount,
      );
      
      if (topCandidates.length === 1) {
        winner = topCandidates[0];
      } else {
        isTie = true;
      }
    }

    return res.status(200).json({
      success: true,

      data: {
        electionId: election._id,

        title: election.title,

        status: "ended",

        totalVotes,

        winner: winner ? winner.candidate : null,

        isTie,

        results,
      },
    });
  } catch (error) {
    console.error("GET RESULTS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET ACTIVE ELECTIONS
export const getActiveElection = async (req, res) => {
  try {
    const now = new Date();

    // finding active elections
    const election = await Election.findOne({
      startTime: {
        $lte: now,
      },

      endTime: {
        $gte: now,
      },
    }).sort({
      createdAt: -1,
    });

    if (!election) {
      return res.status(404).json({
        success: false,
        message: "No active election found",
      });
    }

    // lifecycle sync
    if (election.status !== "active") {
      election.status = "active";

      await election.save();
    }

    return res.status(200).json({
      success: true,
      data: election,
    });
  } catch (error) {
    console.error("GET ACTIVE ELECTION ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET PUBLIC ELECTIONS
export const getPublicElections = async (req, res) => {
  try {
    const elections = await Election.find().sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      data: elections,
    });
  } catch (error) {
    console.error("GET PUBLIC ELECTIONS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
