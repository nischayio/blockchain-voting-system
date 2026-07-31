import { ethers } from "ethers";
import User from "../models/User.js";
import Admin from "../models/Admin.js";
import { validatePassword } from "../utils/validatePassword.js";

import { hashPassword, comparePassword } from "../utils/hashPassword.js";

import { generateToken } from "../utils/generateToken.js";

// USER SIGNUP
export const signupUser = async (req, res) => {
  try {
    const { name, email, password, profilePic } = req.body;

    // normalize email
    const normalizedEmail = email?.toLowerCase().trim();

    // validate fields
    if (!name || !normalizedEmail || !password) {
      return res.status(400).json({
        success: false,
        message: "All required fields are required",
      });
    }

    // check existing user
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // Password strength validation
    const passwordError = validatePassword(password);

    if (passwordError) {
      return res.status(400).json({
        success: false,
        message: passwordError,
      });
    }

    // hash password
    const hashedPassword = await hashPassword(password);

    // create user
    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      profilePic,
    });

    // generate token
    const token = generateToken(user._id, "user");

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          profilePic: user.profilePic,
          walletAddress: user.walletAddress || null,
        },
      },
    });
  } catch (error) {
    console.error("USER SIGNUP ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// USER LOGIN
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // validate fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // find user
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // compare password
    const isMatch = await comparePassword(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // generate token
    const token = generateToken(user._id, "user");

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          profilePicture: user.profilePicture,
          walletAddress: user.walletAddress || null,
        },
      },
    });
  } catch (error) {
    console.error("USER LOGIN ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ADMIN SIGNUP
export const signupAdmin = async (req, res) => {
  try {
    const { name, email, password, profilePic, secretCode } = req.body;

    // normalize email
    const normalizedEmail = email?.toLowerCase().trim();

    // validate fields
    if (!name || !normalizedEmail || !password || !secretCode) {
      return res.status(400).json({
        success: false,
        message: "All required fields are required",
      });
    }

    // secret code validation
    if (secretCode !== process.env.ADMIN_SECRET_CODE) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin secret code",
      });
    }

    // check existing admin
    const existingAdmin = await Admin.findOne({ email: normalizedEmail });

    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: "Admin already exists",
      });
    }

    // Password strength validation
    const passwordError = validatePassword(password);

    if (passwordError) {
      return res.status(400).json({
        success: false,
        message: passwordError,
      });
    }

    // hash password
    const hashedPassword = await hashPassword(password);

    // create admin
    const admin = await Admin.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      profilePic,
    });

    // generate token
    const token = generateToken(admin._id, "admin");

    return res.status(201).json({
      success: true,
      message: "Admin created successfully",
      data: {
        token,
        role: "admin",

        user: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          profilePic: admin.profilePic,
        },
      },
    });
  } catch (error) {
    console.error("ADMIN SIGNUP ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ADMIN LOGIN
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // validate fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // find admin
    const admin = await Admin.findOne({ email: normalizedEmail });

    if (!admin) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // compare password
    const isMatch = await comparePassword(password, admin.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // generate token
    const token = generateToken(admin._id, "admin");

    return res.status(200).json({
      success: true,
      message: "Admin login successful",
      data: {
        token,
        role: "admin",
        user: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          profilePic: admin.profilePic,
        },
      },
    });
  } catch (error) {
    console.error("ADMIN LOGIN ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// VALIDATING USER WALLET
export const validateWallet = async (req, res) => {
  try {
    const { walletAddress, signature } = req.body;

    const userId = req.user.id;

    // validate fields
    if (!walletAddress || !signature) {
      return res.status(400).json({
        success: false,
        message: "walletAddress and signature are required",
      });
    }

    // normalize
    const normalizedWallet = walletAddress.toLowerCase();

    // find user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // linked wallet change prevention
    if (user.walletAddress && user.walletAddress !== normalizedWallet) {
      return res.status(401).json({
        success: false,
        message: "Account already linked to another wallet",
      });
    }

    // duplicate wallet usage prevention
    const existingWalletUser = await User.findOne({
      walletAddress: normalizedWallet,
      _id: { $ne: userId },
    });

    if (existingWalletUser) {
      return res.status(400).json({
        success: false,
        message: "Wallet already linked to another account",
      });
    }

    // signature Verification
    const message = `Link wallet to voting account: ${userId}`;

    const recoveredAddress = ethers.utils.verifyMessage(message, signature);

    if (recoveredAddress.toLowerCase() !== normalizedWallet) {
      return res.status(401).json({
        success: false,
        message: "Invalid wallet signature",
      });
    }

    // link wallet
    user.walletAddress = normalizedWallet;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Wallet linked successfully",
      data: {
        walletAddress: normalizedWallet,
      },
    });
  } catch (error) {
    console.error("VALIDATE WALLET ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// CHANGE PASSWORD (USER and ADMIN)
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const { id, role } = req.user;

    // validate fields
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    // choose model based on role
    const Model = role === "admin" ? Admin : User;

    // find account
    const account = await Model.findById(id);

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Account not found",
      });
    }

    // verify current password
    const isMatch = await comparePassword(currentPassword, account.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // prevent same password reuse
    const isSamePassword = await comparePassword(newPassword, account.password);

    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: "New password cannot be same as current password",
      });
    }

    // validate password strength
    const passwordError = validatePassword(newPassword);

    if (passwordError) {
      return res.status(400).json({
        success: false,
        message: passwordError,
      });
    }

    // hash new password
    const hashedPassword = await hashPassword(newPassword);

    // update password
    account.password = hashedPassword;

    await account.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("CHANGE PASSWORD ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
