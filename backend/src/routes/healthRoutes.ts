/**
 * Backend Health Check Route
 * Tests both server and database connectivity
 */

import { Router } from 'express';
import { query } from '../config/database';
import { logger } from '../utils/logger';

const router = Router();

/**
 * Health check endpoint
 * Returns 200 if healthy, 503 if unhealthy
 */
router.get('/health', async (_req, res) => {
  try {
    // Test database connection with a simple query
    await query('SELECT 1 as health_check');
    
    // If we get here, both server and database are working
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'connected',
      version: '1.0.0'
    });
    
    logger.debug('Health check passed');
  } catch (error) {
    // Database connection failed
    logger.error('Health check failed:', error);
    
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: 'Database connection failed'
    });
  }
});

export default router;
