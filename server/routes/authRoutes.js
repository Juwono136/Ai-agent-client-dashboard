import express from "express";
import {
  loginUser,
  registerUser,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register", protect, adminOnly, registerUser); // Hanya admin bisa add user
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:resetToken", resetPassword);

export default router;
