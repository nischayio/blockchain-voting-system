import express from 'express'
import { getBatches } from '../controllers/batchController.js'

const router = express.Router()

// ALL BATCHES ROUTE
router.get("/", getBatches)

export default router;