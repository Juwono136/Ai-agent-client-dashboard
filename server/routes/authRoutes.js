import express from "express";
import {
  login,
  logout, // Tambahan: Import logout
  forgotPassword,
  resetPasswordFinal,
  updatePassword,
} from "../controllers/authController.js";

import {
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
} from "../validators/authValidator.js";

// Import Handler Validasi Modular
import { runValidation } from "../validators/validatorHandler.js";

import { protect } from "../middlewares/authMiddleware.js";
import { authLimiter } from "../middlewares/rateLimitMiddleware.js";

const router = express.Router();

// --- Public Routes ---

// Login: Rate limit ketat -> Validasi -> Cek User -> Set Cookie
router.post("/login", authLimiter, loginValidator, runValidation, login);

// Logout: Hapus Cookie
router.get("/logout", logout);

// Forgot Password: Rate limit -> Validasi Email -> Kirim Link
router.post("/forgot-password", authLimiter, forgotPasswordValidator, runValidation, forgotPassword);

// Reset Password Final: Validasi Password Baru -> Update DB -> Auto Login
router.put(
  "/reset-password/:resetToken",
  resetPasswordValidator,
  runValidation,
  resetPasswordFinal,
);

// --- Protected Routes (Butuh Login) ---

// Change Password: Cek Token Login -> Validasi Password Baru -> Update DB
router.put("/change-password", protect, resetPasswordValidator, runValidation, updatePassword);

export default router;
