import winston from "winston";

// Format log custom
const logFormat = winston.format.printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level.toUpperCase()}]: ${stack || message}`;
});

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true }),
    logFormat
  ),
  transports: [
    // Simpan semua log error ke file error.log
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    // Simpan semua log ke file combined.log
    new winston.transports.File({ filename: "logs/combined.log" }),
  ],
});

// Jika tidak di production, tampilkan juga di console terminal agar mudah dibaca
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), logFormat),
    })
  );
}

export default logger;
