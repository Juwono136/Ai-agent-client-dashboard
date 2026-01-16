import User from "../models/User.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import logger from "../utils/logger.js";
// Nanti kita tambahkan fitur kirim email di sini

// Helper: Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

// @desc    Register new user (Admin can add customer)
// @route   POST /api/auth/register
export const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const userExists = await User.findOne({ where: { email } });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || "customer",
    });

    logger.info(`New user registered: ${email}`);

    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user.id),
    });
  } catch (error) {
    logger.error(`Register Error: ${error.message}`);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (user && (await user.matchPassword(password))) {
      logger.info(`User logged in: ${email}`);
      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user.id),
      });
    } else {
      logger.warn(`Failed login attempt for: ${email}`);
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    logger.error(`Login Error: ${error.message}`);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Forgot Password (Generate Token)
// @route   POST /api/auth/forgot-password
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate Reset Token (Random String)
    const resetToken = crypto.randomBytes(20).toString("hex");

    // Hash token dan simpan ke database
    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 Menit

    await user.save();

    // TODO: Kirim Email menggunakan Nodemailer di sini
    // Untuk sekarang kita return tokennya dulu untuk testing
    logger.info(`Password reset requested for: ${email}`);

    res.status(200).json({
      message: "Email sent",
      resetTokenRaw: resetToken, // HAPUS INI DI PRODUCTION, HANYA UNTUK DEV
    });
  } catch (error) {
    logger.error(`Forgot Password Error: ${error.message}`);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Reset Password
// @route   PUT /api/auth/reset-password/:resetToken
export const resetPassword = async (req, res) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resetToken)
    .digest("hex");

  try {
    const user = await User.findOne({
      where: {
        resetPasswordToken,
        resetPasswordExpire: { [Sequelize.Op.gt]: Date.now() }, // Token belum expired
      },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid token" });
    }

    // Set password baru
    user.password = req.body.password;
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;
    await user.save();

    logger.info(`Password reset successful for user ID: ${user.id}`);
    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    logger.error(`Reset Password Error: ${error.message}`);
    res.status(500).json({ message: "Server Error" });
  }
};
