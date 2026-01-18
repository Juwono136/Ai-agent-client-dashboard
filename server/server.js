import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import sequelize from "./config/database.js";
import logger from "./utils/logger.js";

// Import Middleware Error Handler kita yang sudah canggih
import errorHandler from "./middlewares/errorMiddleware.js";

// Import Models/Routes
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();

const app = express();

// --- Server Start & DB Connect ---
const PORT = process.env.PORT || 5000;

// --- Middlewares Global ---
app.use(helmet());

// UPDATE CORS: Agar Cookie bisa dikirim dari Frontend (Vite) ke Backend
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173", // Sesuaikan dengan port Frontend Vite Anda
    credentials: true, // Wajib true agar cookie token bisa lewat
  }),
);

app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

// --- Base Route ---
app.get("/", (req, res) => {
  res.send({
    message: "API is Running...",
    status: "OK",
    version: "1.0.0",
  });
});

// --- Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// --- Error Handling Middleware ---
// HAPUS blok app.use((err...)) yang lama (manual).
// GANTI dengan middleware modular kita.
// Ini akan menangkap AppError dari controller dan mengirim pesan yang benar (misal: "Password salah")
app.use(errorHandler);

const startServer = async () => {
  try {
    await sequelize.authenticate();
    logger.info("Database Connected Successfully.");

    await sequelize.sync({ alter: true });
    logger.info("Database Models Synced.");

    app.listen(PORT, () => {
      logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
  } catch (error) {
    logger.error(`Error starting server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
