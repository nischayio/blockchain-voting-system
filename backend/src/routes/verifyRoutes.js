import express from 'express'
import { verifyVote } from '../controllers/verifyController.js'

const router = express.Router();

// verify vote
router.get("/:voteHash", verifyVote)

export default router;