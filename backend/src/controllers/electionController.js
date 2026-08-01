import Election from "../models/Election.js";
import Vote from "../models/Vote.js";
import {
  uploadCandidateImage,
  deleteCloudinaryImage,
} from "../services/cloudinaryService.js";

// CREATE ELECTION
export const createElection = async (req, res) => {
  const uploadedImages = [];

  try {
    const { title, description, candidates, startTime, endTime } = req.body;

    // Validate required fields
    if (!title || !candidates || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: "All required fields are required",
      });
    }

    // Parse candidates from multipart/form-data
    let parsedCandidates;

    try {
      parsedCandidates = JSON.parse(candidates);
    } catch {
      return res.status(400).json({
        success: false,
        message: "Invalid candidates format",
      });
    }

    // Validate candidates
    if (!Array.isArray(parsedCandidates)) {
      return res.status(400).json({
        success: false,
        message: "Candidates must be an array",
      });
    }

    const normalizedCandidates = parsedCandidates
      .map((candidate) => candidate.trim())
      .filter(Boolean);

    if (normalizedCandidates.length < 2) {
      return res.status(400).json({
        success: false,
        message: "At least 2 candidates are required",
      });
    }

    // Duplicate candidate check
    const uniqueCandidates = new Set(
      normalizedCandidates.map((candidate) => candidate.toLowerCase()),
    );

    if (uniqueCandidates.size !== normalizedCandidates.length) {
      return res.status(400).json({
        success: false,
        message: "Duplicate candidates are not allowed",
      });
    }

    // Every candidate must have an image
    if (!req.files || req.files.length !== normalizedCandidates.length) {
      return res.status(400).json({
        success: false,
        message: "Each candidate must have an image",
      });
    }

    // Validate dates
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid start or end time",
      });
    }

    if (end <= start) {
      return res.status(400).json({
        success: false,
        message: "End time must be after start time",
      });
    }

    // Determine initial election status
    const now = new Date();

    let status = "upcoming";

    if (now >= start && now <= end) {
      status = "active";
    }

    if (now > end) {
      status = "ended";
    }

    // Upload candidate images
    const candidateData = [];

    for (let i = 0; i < normalizedCandidates.length; i++) {
      const result = await uploadCandidateImage(req.files[i].buffer);

      uploadedImages.push(result.public_id);

      candidateData.push({
        name: normalizedCandidates[i],
        image: result.secure_url,
        imagePublicId: result.public_id,
      });
    }

    // Create election
    const election = await Election.create({
      title: title.trim(),

      description: description?.trim() || "",

      candidates: candidateData,

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

    // Clean up Cloudinary images if creation fails
    if (uploadedImages.length > 0) {
      await Promise.allSettled(
        uploadedImages.map((publicId) => deleteCloudinaryImage(publicId)),
      );
    }

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

    const { title, description, startTime, endTime } = req.body;

    const election = await Election.findById(id);

    if (!election) {
      return res.status(404).json({
        success: false,
        message: "Election not found",
      });
    }

    const now = new Date();

    // Determine current election state from timestamps
    const isUpcoming = now < election.startTime;

    const isActive = now >= election.startTime && now <= election.endTime;

    const isEnded = now > election.endTime;

    // Ended elections cannot be modified
    if (isEnded) {
      return res.status(400).json({
        success: false,
        message: "Ended elections cannot be updated",
      });
    }

    // Active elections: only endTime can be extended
    if (isActive) {
      // Prevent updating any other field
      if (
        title !== undefined ||
        description !== undefined ||
        startTime !== undefined
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Only the election end time can be updated after voting has started",
        });
      }

      if (endTime === undefined) {
        return res.status(400).json({
          success: false,
          message: "End time is required",
        });
      }

      const newEndTime = new Date(endTime);

      if (Number.isNaN(newEndTime.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid end time",
        });
      }

      // New end time must be in the future
      if (newEndTime <= now) {
        return res.status(400).json({
          success: false,
          message: "End time must be in the future",
        });
      }

      // Only allow extending the election
      if (newEndTime <= election.endTime) {
        return res.status(400).json({
          success: false,
          message:
            "New end time must be later than the current election end time",
        });
      }

      election.endTime = newEndTime;

      await election.save();

      return res.status(200).json({
        success: true,
        message: "Election end time updated successfully",
        data: election,
      });
    }

    // Safety check
    if (!isUpcoming) {
      return res.status(400).json({
        success: false,
        message: "Only upcoming elections can be fully updated",
      });
    }
    
    // Update title
    if (title !== undefined) {
      const normalizedTitle = title.trim();

      if (!normalizedTitle) {
        return res.status(400).json({
          success: false,
          message: "Title cannot be empty",
        });
      }

      election.title = normalizedTitle;
    }

    // Update description
    if (description !== undefined) {
      election.description = description.trim();
    }

    // Determine final dates
    const newStartTime =
      startTime !== undefined ? new Date(startTime) : election.startTime;

    const newEndTime =
      endTime !== undefined ? new Date(endTime) : election.endTime;

    // Validate start time
    if (Number.isNaN(newStartTime.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid start time",
      });
    }

    // Validate end time
    if (Number.isNaN(newEndTime.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid end time",
      });
    }

    // End must be after start
    if (newEndTime <= newStartTime) {
      return res.status(400).json({
        success: false,
        message: "End time must be after start time",
      });
    }

    election.title = election.title.trim();
    election.description = election.description.trim();
    election.startTime = newStartTime;
    election.endTime = newEndTime;

    // Recalculate status
    if (now < newStartTime) {
      election.status = "upcoming";
    } else if (now <= newEndTime) {
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

    // Find election
    const election = await Election.findById(id);

    if (!election) {
      return res.status(404).json({
        success: false,
        message: "Election not found",
      });
    }

    // Active election delete prevention
    if (election.status === "active") {
      return res.status(400).json({
        success: false,
        message: "Active elections cannot be deleted",
      });
    }

    // Check whether election has votes
    const voteExists = await Vote.exists({
      electionId: id,
    });

    if (voteExists) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete election with votes",
      });
    }

    // Store candidate image public IDs before deleting election
    const candidateImagePublicIds = election.candidates
      .map((candidate) => candidate.imagePublicId)
      .filter(Boolean);

    // Delete election from MongoDB first
    await Election.findByIdAndDelete(id);

    // Delete candidate images from Cloudinary
    if (candidateImagePublicIds.length > 0) {
      const deletionResults = await Promise.allSettled(
        candidateImagePublicIds.map((publicId) =>
          deleteCloudinaryImage(publicId),
        ),
      );

      // Log any Cloudinary deletion failures
      deletionResults.forEach((result, index) => {
        if (result.status === "rejected") {
          console.error(
            `FAILED TO DELETE CANDIDATE IMAGE: ${candidateImagePublicIds[index]}`,
            result.reason,
          );
        }
      });
    }

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
  let uploadedPublicId = null;

  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Candidate name is required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Candidate image is required",
      });
    }

    const election = await Election.findById(id);

    if (!election) {
      return res.status(404).json({
        success: false,
        message: "Election not found",
      });
    }

    // Candidates can only be modified before election starts
    if (election.status !== "upcoming") {
      return res.status(400).json({
        success: false,
        message: "Candidates can only be modified before election starts",
      });
    }

    const candidateName = name.trim();

    // Duplicate candidate check
    const exists = election.candidates.some(
      (candidate) =>
        candidate.name.toLowerCase() === candidateName.toLowerCase(),
    );

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Candidate already exists",
      });
    }

    // Upload image
    const result = await uploadCandidateImage(req.file.buffer);

    uploadedPublicId = result.public_id;

    // Add candidate
    election.candidates.push({
      name: candidateName,
      image: result.secure_url,
      imagePublicId: result.public_id,
    });

    await election.save();

    return res.status(200).json({
      success: true,
      message: "Candidate added successfully",
      data: election,
    });
  } catch (error) {
    console.error("ADD CANDIDATE ERROR:", error);

    // Remove uploaded image if MongoDB operation failed
    if (uploadedPublicId) {
      try {
        await deleteCloudinaryImage(uploadedPublicId);
      } catch (cleanupError) {
        console.error("CANDIDATE IMAGE CLEANUP ERROR:", cleanupError);
      }
    }

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// REMOVE CANDIDATE
export const removeCandidate = async (req, res) => {
  try {
    const { id, candidateId } = req.params;

    // Find election
    const election = await Election.findById(id);

    if (!election) {
      return res.status(404).json({
        success: false,
        message: "Election not found",
      });
    }

    // Candidates can only be modified before election starts
    if (election.status !== "upcoming") {
      return res.status(400).json({
        success: false,
        message: "Candidates can only be modified before election starts",
      });
    }

    // Election must always have at least 2 candidates
    if (election.candidates.length <= 2) {
      return res.status(400).json({
        success: false,
        message: "Election must have at least 2 candidates",
      });
    }

    // Find candidate
    const candidate = election.candidates.id(candidateId);

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    // Store Cloudinary public ID before removing candidate
    const imagePublicId = candidate.imagePublicId;

    // Remove candidate from election
    election.candidates.pull(candidateId);

    await election.save();

    // Delete candidate image only after MongoDB update succeeds
    if (imagePublicId) {
      try {
        await deleteCloudinaryImage(imagePublicId);
      } catch (error) {
        console.error("CANDIDATE IMAGE DELETE ERROR:", error);
      }
    }

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

    // fetch only finalized / batched votes
    const votes = await Vote.find({
      electionId: id,
      status: "batched",
    });

    const totalVotes = votes.length;

    // initialize candidate counts
    const counts = {};

    election.candidates.forEach((candidate) => {
      counts[candidate.name] = 0;
    });

    // aggregate votes
    votes.forEach((vote) => {
      if (counts[vote.candidate] !== undefined) {
        counts[vote.candidate] += 1;
      }
    });

    // build results with candidate information
    const results = election.candidates.map((candidate) => {
      const candidateVotes = counts[candidate.name];

      return {
        candidateId: candidate._id,
        name: candidate.name,
        image: candidate.image,
        votes: candidateVotes,

        percentage:
          totalVotes > 0
            ? Number(((candidateVotes / totalVotes) * 100).toFixed(2))
            : 0,
      };
    });

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
        election: {
          id: election._id,
          title: election.title,
          description: election.description,
          status: "ended",
          startTime: election.startTime,
          endTime: election.endTime,
        },

        totalVotes,

        winner: winner
          ? {
              candidateId: winner.candidateId,
              name: winner.name,
              image: winner.image,
              votes: winner.votes,
              percentage: winner.percentage,
            }
          : null,

        isTie,

        results,
      },
    });
  } catch (error) {
    console.error("GET ELECTION RESULTS ERROR:", error);

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
