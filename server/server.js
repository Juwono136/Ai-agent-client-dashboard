import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import sequelize from "./config/database.js";
import logger from "./utils/logger.js";

// Import Routes
import authRoutes from "./routes/authRoutes.js";

// Load Config
dotenv.config();

const app = express();

// Middlewares
app.use(helmet()); // Security Header
app.use(cors()); // Allow Frontend access
app.use(express.json()); // Parse JSON body
app.use(morgan("dev")); // Log HTTP request di console

// Routes
app.use("/api/auth", authRoutes);

// Health Check
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Database Sync & Server Start
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Force: false agar data tidak hilang saat restart. Ubah true jika ingin reset DB.
    await sequelize.sync({ force: false });
    logger.info("Database Connected & Models Synced");

    app.listen(PORT, () => {
      logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
  } catch (error) {
    logger.error(`Error starting server: ${error.message}`);
  }
};

startServer();
