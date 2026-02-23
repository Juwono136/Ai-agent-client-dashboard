import logger from "../utils/logger.js";

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  // Log error (404 tidak di-log sebagai ERROR agar console tidak penuh saat client polling platform yang sudah dihapus)
  if (process.env.NODE_ENV === "development") {
    if (err.statusCode === 404) {
      console.warn("404 -", err.message, "-", req.originalUrl);
    } else {
      console.error("ERROR:", err);
    }
  } else if (err.statusCode !== 404) {
    logger.error(
      `${err.statusCode} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`,
    );
  }

  // --- RESPONSE LOGIC ---

  // 1. Jika ini Error Operasional (AppError) ATAU error dengan status code spesifik (bukan 500)
  // Kita percayai pesan error-nya aman untuk dikirim ke user (misal: "Password salah")
  if (err.isOperational || (err.statusCode !== 500 && err.message)) {
    return res.status(err.statusCode).json({
      success: false,
      status: err.status,
      message: err.message,
    });
  }

  // 2. Error Programming / Unknown (Status 500)
  // Sembunyikan detail error dari user agar aman
  return res.status(500).json({
    success: false,
    message: "Terjadi kesalahan internal pada server.", // Generic message
  });
};

export default errorHandler;
