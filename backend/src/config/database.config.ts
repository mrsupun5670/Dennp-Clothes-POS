import { PoolOptions } from "mysql2";
import config from "./env";

export const databaseConfig: PoolOptions = {
  // Connection Settings
  host: config.database.host,
  port: config.database.port,
  user: config.database.user,
  password: config.database.password,
  database: config.database.name,

  // Connection Pool Settings
  waitForConnections: true,
  connectionLimit: config.server.nodeEnv === "production" ? 20 : 10,
  queueLimit: 0,

  // Connection Timeout Settings
  connectTimeout: 10000, // 10 seconds

  // MySQL-specific options
  charset: "utf8mb4",
  timezone: "+00:00",

  // Other options
  supportBigNumbers: true,
  bigNumberStrings: true,
  dateStrings: true,
  insecureAuth: false,
};

export default databaseConfig;
