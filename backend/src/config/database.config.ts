/**
 * Database Configuration File
 * Contains all database-related settings and connection pool configuration
 *
 * For Hostinger MySQL:
 * 1. Update DB_HOST with your Hostinger MySQL host (usually provided in cPanel)
 * 2. Update DB_USER with your MySQL username
 * 3. Update DB_PASSWORD with your MySQL password
 * 4. Update DB_NAME with your database name
 */

import { PoolOptions } from 'mysql2';
import config from './env';

export const databaseConfig: PoolOptions = {
  // Connection Settings
  host: config.database.host,
  port: config.database.port,
  user: config.database.user,
  password: config.database.password,
  database: config.database.name,

  // Connection Pool Settings
  waitForConnections: true,
  connectionLimit: config.server.nodeEnv === 'production' ? 20 : 10,
  queueLimit: 0,

  // Connection Timeout Settings
  connectTimeout: 10000, // 10 seconds

  // MySQL-specific options
  charset: 'utf8mb4',
  collate: 'utf8mb4_unicode_ci',
  timezone: '+00:00',

  // SSL Configuration for production (optional)
  // Uncomment if your Hostinger requires SSL connection
  // ssl: {
  //   rejectUnauthorized: false
  // },

  // Other options
  supportBigNumbers: true,
  bigNumberStrings: true,
  dateStrings: true,
  insecureAuth: false,
};

/**
 * Database Connection Pool Settings Guide
 *
 * For Development (localhost):
 * - connectionLimit: 10
 * - Good for local testing without high concurrency
 *
 * For Production (Hostinger):
 * - connectionLimit: 15-20
 * - Adjust based on your Hostinger hosting plan limits
 * - Check Hostinger Max Connections limit in cPanel
 *
 * Connection Timeout:
 * - connectTimeout: Increase if on slow connection
 * - For Hostinger remote connections: 10000-15000ms recommended
 *
 * SSL Connection (if required by Hostinger):
 * - Set ssl: { rejectUnauthorized: false }
 * - Only for secure connections to Hostinger MySQL
 */

export default databaseConfig;
