import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import cookieParser from "cookie-parser";
import sequelize from "./config/database.js";
import logger from "./utils/logger.js";
import { initMinio } from "./config/minio.js";

import errorHandler from "./middlewares/errorMiddleware.js";
import { apiLimiter } from "./middlewares/rateLimitMiddleware.js";

// Import Models/Routes
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import agentRoutes from "./routes/agentRoutes.js";
import platformRoutes from "./routes/platformRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";

// Models
import User from "./models/User.js";
import Agent from "./models/Agent.js";
import KnowledgeSource from "./models/KnowledgeSource.js";
import ConversationLog from "./models/ConversationLog.js";
import ConnectedPlatform from "./models/ConnectedPlatform.js";

dotenv.config();

const app = express();

// Trust proxy (satu hop) agar rate limit & IP benar saat di belakang Nginx/load balancer di VPS
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

const PORT = process.env.PORT || 5000;

// --- Middlewares Global ---
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(compression()); // Gzip responses untuk performa & bandwidth
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
app.use(cookieParser());
app.use(morgan(process.env.NODE_ENV === "production" ? "short" : "dev"));

// Rate limit untuk semua /api (lindungi dari abuse, siap lalu lintas tinggi)
app.use("/api", apiLimiter);

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
app.use("/api/agents", agentRoutes);
app.use("/api/platforms", platformRoutes);
app.use("/api/analytics", analyticsRoutes);

// --- Error Handling Middleware ---
// HAPUS blok app.use((err...)) yang lama (manual).
// GANTI dengan middleware modular kita.
// Ini akan menangkap AppError dari controller dan mengirim pesan yang benar (misal: "Password salah")
app.use(errorHandler);

// INIT MINIO
initMinio();

// RELASI DATABASE
// 1. User -> Agent
User.hasMany(Agent, { foreignKey: "userId", onDelete: "CASCADE" });
Agent.belongsTo(User, { foreignKey: "userId" });

// 2. Agent -> KnowledgeSource
Agent.hasMany(KnowledgeSource, { foreignKey: "agentId", onDelete: "CASCADE" });
KnowledgeSource.belongsTo(Agent, { foreignKey: "agentId" });

// 3. User -> ConnectedPlatform (BARU)
User.hasMany(ConnectedPlatform, { foreignKey: "userId", onDelete: "CASCADE" });
ConnectedPlatform.belongsTo(User, { foreignKey: "userId" });

// 4. Agent <-> ConnectedPlatform (One-to-One atau One-to-Many tergantung kebutuhan)
// Skenario: 1 Agent bisa dipakai di banyak nomor? Atau 1 Agent 1 Nomor?
// Untuk simplifikasi SaaS vlow.ai: 1 Platform punya 1 Active Agent.
Agent.hasMany(ConnectedPlatform, { foreignKey: "agentId" });
ConnectedPlatform.belongsTo(Agent, { foreignKey: "agentId" });

// 5. Agent -> ConversationLog
Agent.hasMany(ConversationLog, { foreignKey: "agentId", onDelete: "CASCADE" });
ConversationLog.belongsTo(Agent, { foreignKey: "agentId" });

// 6. ConnectedPlatform -> ConversationLog (optional)
ConnectedPlatform.hasMany(ConversationLog, { foreignKey: "platformId", onDelete: "SET NULL" });
ConversationLog.belongsTo(ConnectedPlatform, { foreignKey: "platformId" });

const startServer = async () => {
  try {
    await sequelize.authenticate();
    logger.info("Database Connected Successfully.");

    // Di production, hindari alter otomatis (set SYNC_ALTER=true hanya saat deploy schema baru)
    const useAlter = process.env.NODE_ENV !== "production" || process.env.SYNC_ALTER === "true";
    await sequelize.sync({ alter: useAlter });
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
