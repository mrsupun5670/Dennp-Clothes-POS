import mysql from 'mysql2/promise';
import { logger } from '../utils/logger';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'pos_system',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

pool.on('connection', () => {
  logger.info('Database connection established');
});

pool.on('error', (err) => {
  logger.error('Database pool error:', err);
});

export const getConnection = async () => {
  try {
    const connection = await pool.getConnection();
    return connection;
  } catch (error) {
    logger.error('Failed to get database connection:', error);
    throw error;
  }
};

export const query = async (sql: string, values?: any[]) => {
  const connection = await getConnection();
  try {
    const [results] = await connection.execute(sql, values);
    return results;
  } finally {
    connection.release();
  }
};

export default pool;
