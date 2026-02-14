import rateLimit from "express-rate-limit";

/**
 * Rate limit umum untuk semua route /api/*
 * Melindungi dari abuse dan menjaga stabilitas saat lalu lintas tinggi.
 * Di VPS bisa naikkan via env: RATE_LIMIT_MAX=1000 (request per 15 menit per IP).
 */
const RATE_WINDOW_MS = 15 * 60 * 1000; // 15 menit
const RATE_MAX = parseInt(process.env.RATE_LIMIT_MAX, 10) || 600;

export const apiLimiter = rateLimit({
  windowMs: RATE_WINDOW_MS,
  max: RATE_MAX,
  message: {
    success: false,
    message: "Terlalu banyak permintaan dari IP ini. Coba lagi dalam 15 menit.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limit khusus auth (login, forgot password) - lebih ketat untuk keamanan.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_AUTH_MAX, 10) || 20,
  message: {
    success: false,
    message: "Terlalu banyak percobaan. Coba lagi dalam 15 menit.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
