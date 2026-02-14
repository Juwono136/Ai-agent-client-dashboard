import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import logger from "../utils/logger.js";

dotenv.config();

const poolMax = parseInt(process.env.DB_POOL_MAX, 10) || 10;
const poolMin = parseInt(process.env.DB_POOL_MIN, 10) || 0;
const poolAcquire = parseInt(process.env.DB_POOL_ACQUIRE_MS, 10) || 30000;
const poolIdle = parseInt(process.env.DB_POOL_IDLE_MS, 10) || 10000;

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST,
  dialect: process.env.DB_DIALECT,
  logging: (msg) => logger.debug(msg),
  pool: {
    max: poolMax,
    min: poolMin,
    acquire: poolAcquire,
    idle: poolIdle,
  },
});

export default sequelize;
