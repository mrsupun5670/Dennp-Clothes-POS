/**
 * Database Migration Runner Script
 * Executes all SQL migration files in the migrations directory in order
 *
 * Usage: npm run migrate
 */

import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import { logger } from '../utils/logger';

async function runMigrations(): Promise<void> {
  let connection: mysql.Connection | null = null;

  try {
    // Create connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'pos_system',
    });

    logger.info('✅ Connected to database');

    // Get migrations directory path
    const migrationsDir = path.join(__dirname, '../../migrations');

    // Read all migration files
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql') && file !== 'MIGRATION_GUIDE.md')
      .sort();

    if (files.length === 0) {
      logger.info('No migration files found');
      return;
    }

    logger.info(`Found ${files.length} migration files`);

    // Execute each migration
    for (const file of files) {
      const filePath = path.join(migrationsDir, file);
      logger.info(`\n📝 Running migration: ${file}`);

      try {
        // Read the migration file
        const sql = fs.readFileSync(filePath, 'utf-8');

        // Execute the migration - split by semicolon and execute each statement
        const statements = sql
          .split(';')
          .map(stmt => stmt.trim())
          .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

        for (const statement of statements) {
          await connection.execute(statement);
        }

        logger.info(`✅ Migration completed: ${file}`);
      } catch (error: any) {
        // Check if error is expected for idempotent migrations
        const errorMsg = error.message || '';
        if (errorMsg.includes('Duplicate column name') ||
            errorMsg.includes('already exists') ||
            errorMsg.includes('Duplicate key')) {
          logger.info(`⚠️  Already exists (idempotent migration): ${file}`);
        } else {
          logger.error(`❌ Migration failed: ${file}`);
          logger.error(`Error message: ${error.message}`);
          throw error;
        }
      }
    }

    logger.info('\n✅ All migrations completed successfully!');
  } catch (error: any) {
    logger.error('❌ Migration execution failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run migrations
runMigrations().catch((error) => {
  logger.error('Failed to run migrations:', error);
  process.exit(1);
});
