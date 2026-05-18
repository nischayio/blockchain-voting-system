import express from "express";
import {
  signupUser,
  loginUser,
  signupAdmin,
  loginAdmin,
  validateWallet,
  changePassword,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

// USER
router.post("/user/signup", authLimiter, signupUser);
router.post("/user/login", authLimiter, loginUser);
router.post("/validate-wallet", protect, validateWallet);
router.patch("/user/change-password", protect, changePassword);

// ADMIN
router.post("/admin/signup", authLimiter, signupAdmin);
router.post("/admin/login", authLimiter, loginAdmin);
router.patch("/admin/change-password", protect, changePassword);
export default router;
