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

// Routes
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
const PORT = process.env.PORT || 5000;

let server;

// ==============================
// TRUST PROXY (WAJIB untuk VPS + Nginx)
// ==============================
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

// ==============================
// GLOBAL MIDDLEWARES
// ==============================
app.use(helmet());

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);

app.use(compression());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
app.use(cookieParser());

app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// Rate limit semua endpoint /api
app.use("/api", apiLimiter);

// ==============================
// HEALTH CHECK (untuk PM2 / Load Balancer)
// ==============================
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "UP",
    uptime: process.uptime(),
    timestamp: Date.now(),
  });
});

// ==============================
// BASE ROUTE
// ==============================
app.get("/", (req, res) => {
  res.json({
    message: "API is Running...",
    status: "OK",
    version: "1.0.0",
  });
});

// ==============================
// ROUTES
// ==============================
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/agents", agentRoutes);
app.use("/api/platforms", platformRoutes);
app.use("/api/analytics", analyticsRoutes);

// ==============================
// ERROR HANDLER
// ==============================
app.use(errorHandler);

// ==============================
// DATABASE RELATIONS
// ==============================

User.hasMany(Agent, { foreignKey: "userId", onDelete: "CASCADE" });
Agent.belongsTo(User, { foreignKey: "userId" });

Agent.hasMany(KnowledgeSource, { foreignKey: "agentId", onDelete: "CASCADE" });
KnowledgeSource.belongsTo(Agent, { foreignKey: "agentId" });

User.hasMany(ConnectedPlatform, { foreignKey: "userId", onDelete: "CASCADE" });
ConnectedPlatform.belongsTo(User, { foreignKey: "userId" });

Agent.hasMany(ConnectedPlatform, { foreignKey: "agentId" });
ConnectedPlatform.belongsTo(Agent, { foreignKey: "agentId" });

Agent.hasMany(ConversationLog, { foreignKey: "agentId", onDelete: "CASCADE" });
ConversationLog.belongsTo(Agent, { foreignKey: "agentId" });

ConnectedPlatform.hasMany(ConversationLog, {
  foreignKey: "platformId",
  onDelete: "SET NULL",
});
ConversationLog.belongsTo(ConnectedPlatform, {
  foreignKey: "platformId",
});

// ==============================
// START SERVER
// ==============================
const startServer = async () => {
  try {
    await sequelize.authenticate();
    logger.info("Database Connected Successfully.");

    const useAlter = process.env.NODE_ENV !== "production" || process.env.SYNC_ALTER === "true";

    await sequelize.sync({ alter: useAlter });
    logger.info("Database Models Synced.");

    // Init MinIO setelah DB ready
    initMinio();
    logger.info("MinIO Initialized.");

    server = app.listen(PORT, () => {
      logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
  } catch (error) {
    logger.error(`Error starting server: ${error.message}`);
    process.exit(1);
  }
};

startServer();

// ==============================
// GRACEFUL SHUTDOWN (PM2)
// ==============================
const shutdown = async (signal) => {
  logger.warn(`Received ${signal}. Shutting down gracefully...`);

  try {
    if (server) {
      server.close(async () => {
        logger.info("HTTP server closed.");
        await sequelize.close();
        logger.info("Database connection closed.");
        process.exit(0);
      });
    }
  } catch (err) {
    logger.error("Error during shutdown:", err);
    process.exit(1);
  }
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

// ==============================
// GLOBAL ERROR CATCHER
// ==============================
process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled Rejection:", reason);
});

process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception:", err);
  process.exit(1);
});
