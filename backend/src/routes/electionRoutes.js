import express from "express";

import {
  createElection,
  getAllElections,
  getElectionById,
  updateElection,
  deleteElection,
  addCandidate,
  removeCandidate,
  getElectionResults,
  getActiveElection,
  getPublicElections,
} from "../controllers/electionController.js";

import { protect, adminOnly } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// PUBLIC

// active electionS
router.get("/active/current", getActiveElection);

// election results
router.get("/:id/results", getElectionResults);

// ADMIN

// create election
router.post(
  "/",
  protect,
  adminOnly,
  upload.array("candidateImages", 20),
  createElection,
);

// get all elections
router.get("/admin/all", protect, adminOnly, getAllElections);

// add candidate
router.post(
  "/:id/candidates",
  protect,
  adminOnly,
  upload.single("candidateImage", 20),
  addCandidate,
);

// remove candidate
router.delete(
  "/:id/candidates/:candidateId",
  protect,
  adminOnly,
  removeCandidate,
);

// update election
router.put("/:id", protect, adminOnly, updateElection);

// delete election
router.delete("/:id", protect, adminOnly, deleteElection);

// election
router.get("/", getPublicElections);
router.get("/active", getActiveElection);
router.get("/:id", getElectionById);

export default router;
