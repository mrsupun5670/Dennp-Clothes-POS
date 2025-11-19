/**
 * Database Service - Core database connection and operations
 * Handles connection pool management, queries, and error handling
 * Uses mysql2/promise for async/await support
 */

import mysql, { Pool, PoolConnection, RowDataPacket, OkPacket } from 'mysql2/promise';
import config from '../config';
import { databaseConfig } from '../config/database.config';
import logger from '../utils/logger';

class DatabaseService {
  private pool: Pool | null = null;
  private isInitialized = false;

  /**
   * Initialize the database connection pool
   */
  async initialize(): Promise<void> {
    try {
      if (this.isInitialized) {
        logger.info('Database pool already initialized');
        return;
      }

      logger.info(`Initializing MySQL connection pool to ${config.database.host}:${config.database.port}`);
      logger.debug(`Database: ${config.database.name}`);

      this.pool = mysql.createPool(databaseConfig);

      // Test the connection
      const connection = await this.pool.getConnection();
      const result = await connection.query('SELECT 1');
      connection.release();

      logger.info('✅ Database connection pool initialized successfully');
      this.isInitialized = true;
    } catch (error: any) {
      logger.error('❌ Failed to initialize database connection pool', {
        error: error.message,
        code: error.code,
        errno: error.errno,
      });
      throw new Error(`Database connection failed: ${error.message}`);
    }
  }

  /**
   * Get a connection from the pool
   */
  async getConnection(): Promise<PoolConnection> {
    if (!this.pool) {
      throw new Error('Database pool not initialized. Call initialize() first.');
    }
    return await this.pool.getConnection();
  }

  /**
   * Execute a SELECT query and return results
   */
  async query<T extends RowDataPacket[]>(
    sql: string,
    values?: any[]
  ): Promise<T> {
    const connection = await this.getConnection();
    try {
      logger.debug('Executing query', { sql: sql.substring(0, 100), hasValues: !!values });
      const [rows] = await connection.query<T>(sql, values || []);
      return rows;
    } catch (error: any) {
      logger.error('Query execution failed', { sql, error: error.message });
      throw new Error(`Query failed: ${error.message}`);
    } finally {
      connection.release();
    }
  }

  /**
   * Execute an INSERT, UPDATE, or DELETE query
   */
  async execute(sql: string, values?: any[]): Promise<OkPacket> {
    const connection = await this.getConnection();
    try {
      logger.debug('Executing statement', { sql: sql.substring(0, 100), hasValues: !!values });
      const [result] = await connection.execute(sql, values || []);
      return result as OkPacket;
    } catch (error: any) {
      logger.error('Statement execution failed', { sql, error: error.message });
      throw new Error(`Execution failed: ${error.message}`);
    } finally {
      connection.release();
    }
  }

  /**
   * Execute multiple statements in a transaction
   */
  async transaction<T>(
    callback: (connection: PoolConnection) => Promise<T>
  ): Promise<T> {
    const connection = await this.getConnection();
    try {
      logger.debug('Starting database transaction');
      await connection.beginTransaction();

      const result = await callback(connection);

      await connection.commit();
      logger.debug('Transaction committed successfully');
      return result;
    } catch (error: any) {
      await connection.rollback();
      logger.error('Transaction failed and rolled back', { error: error.message });
      throw new Error(`Transaction failed: ${error.message}`);
    } finally {
      connection.release();
    }
  }

  /**
   * Execute raw SQL with manual connection management
   * Used for complex operations or debugging
   */
  async rawQuery<T extends RowDataPacket[]>(
    sql: string,
    values?: any[]
  ): Promise<T> {
    return this.query<T>(sql, values);
  }

  /**
   * Get a single record (returns first row or null)
   */
  async getOne<T extends RowDataPacket>(
    sql: string,
    values?: any[]
  ): Promise<T | null> {
    const results = await this.query<(T & RowDataPacket)[]>(sql, values);
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Count records matching a condition
   */
  async count(
    sql: string,
    values?: any[]
  ): Promise<number> {
    const result = await this.getOne<{ count: number }>(sql, values);
    return result?.count || 0;
  }

  /**
   * Insert a record and return the inserted ID
   */
  async insert(sql: string, values?: any[]): Promise<number> {
    const result = await this.execute(sql, values);
    return result.insertId;
  }

  /**
   * Update records and return affected row count
   */
  async update(sql: string, values?: any[]): Promise<number> {
    const result = await this.execute(sql, values);
    return result.affectedRows;
  }

  /**
   * Delete records and return affected row count
   */
  async delete(sql: string, values?: any[]): Promise<number> {
    const result = await this.execute(sql, values);
    return result.affectedRows;
  }

  /**
   * Check if a record exists
   */
  async exists(sql: string, values?: any[]): Promise<boolean> {
    const result = await this.getOne<{ exists: number }>(
      `SELECT EXISTS(${sql}) as exists`,
      values
    );
    return (result?.exists || 0) > 0;
  }

  /**
   * Get paginated results
   */
  async paginate<T extends RowDataPacket>(
    sql: string,
    page: number = 1,
    limit: number = 10,
    countSql?: string,
    values?: any[]
  ): Promise<{ data: T[]; total: number; page: number; limit: number; pages: number }> {
    const offset = (page - 1) * limit;
    const paginatedSql = `${sql} LIMIT ${offset}, ${limit}`;

    // Get data
    const data = await this.query<T[]>(paginatedSql, values);

    // Get total count
    const totalSql = countSql || `SELECT COUNT(*) as total FROM (${sql}) as counted`;
    const countResult = await this.getOne<{ total: number }>(totalSql, values);
    const total = countResult?.total || 0;

    const pages = Math.ceil(total / limit);

    return { data, total, page, limit, pages };
  }

  /**
   * Close the connection pool
   */
  async close(): Promise<void> {
    if (this.pool) {
      try {
        await this.pool.end();
        this.pool = null;
        this.isInitialized = false;
        logger.info('Database connection pool closed');
      } catch (error: any) {
        logger.error('Failed to close database connection pool', { error: error.message });
      }
    }
  }

  /**
   * Get pool statistics
   */
  getPoolStats(): { activeConnections: number; idleConnections: number; queueLength: number } {
    if (!this.pool) {
      return { activeConnections: 0, idleConnections: 0, queueLength: 0 };
    }

    return {
      activeConnections: (this.pool as any)._allConnections?.length || 0,
      idleConnections: (this.pool as any)._freeConnections?.length || 0,
      queueLength: (this.pool as any)._connectionQueue?.length || 0,
    };
  }

  /**
   * Health check - verify database connectivity
   */
  async healthCheck(): Promise<boolean> {
    try {
      const connection = await this.getConnection();
      const result = await connection.query('SELECT 1');
      connection.release();
      return true;
    } catch (error) {
      logger.error('Health check failed', { error });
      return false;
    }
  }
}

// Export singleton instance
export const databaseService = new DatabaseService();
export default databaseService;
