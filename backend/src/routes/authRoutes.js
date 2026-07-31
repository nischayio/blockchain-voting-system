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

import upload from "../middleware/uploadMiddleware.js";
import { uploadProfilePicture } from "../controllers/userController.js";

const router = express.Router();

// USER
router.post("/user/signup", authLimiter, signupUser);
router.post("/user/login", authLimiter, loginUser);
router.post("/user/validate-wallet", protect, validateWallet);
router.patch("/user/change-password", protect, changePassword);
router.patch(
  "/user/profile-picture",
  protect,
  upload.single("profilePicture"),
  uploadProfilePicture,
);

// ADMIN
router.post("/admin/signup", authLimiter, signupAdmin);
router.post("/admin/login", authLimiter, loginAdmin);
router.patch("/admin/change-password", protect, changePassword);
export default router;
