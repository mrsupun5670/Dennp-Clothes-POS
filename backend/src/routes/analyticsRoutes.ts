/**
 * Analytics Routes
 * Handles all analytics and reporting endpoints
 */

import { Router, Request, Response } from 'express';
import analyticsModel from '../models/Analytics';
import { logger } from '../utils/logger';

const router = Router();

/**
 * GET /analytics/sales-analysis
 * Get sales analysis for a date range
 */
router.get('/sales-analysis', async (req: Request, res: Response) => {
  try {
    const shopId = req.query.shop_id as string;
    const startDate = req.query.start_date as string;
    const endDate = req.query.end_date as string;

    if (!shopId || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: shop_id, start_date, end_date',
      });
    }

    const data = await analyticsModel.getSalesAnalysis(
      parseInt(shopId),
      startDate,
      endDate
    );

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    logger.error('Error in sales analysis endpoint:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch sales analysis',
      error: (error as Error).message,
    });
  }
});

/**
 * GET /analytics/top-items
 * Get top selling items for a date range
 */
router.get('/top-items', async (req: Request, res: Response) => {
  try {
    const shopId = req.query.shop_id as string;
    const startDate = req.query.start_date as string;
    const endDate = req.query.end_date as string;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

    if (!shopId || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: shop_id, start_date, end_date',
      });
    }

    const data = await analyticsModel.getTopSellingItems(
      parseInt(shopId),
      startDate,
      endDate,
      limit
    );

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    logger.error('Error in top items endpoint:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch top items',
      error: (error as Error).message,
    });
  }
});

/**
 * GET /analytics/top-customers
 * Get top customers by spending
 */
router.get('/top-customers', async (req: Request, res: Response) => {
  try {
    const shopId = req.query.shop_id as string;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;

    if (!shopId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameter: shop_id',
      });
    }

    const data = await analyticsModel.getTopCustomers(parseInt(shopId), limit);

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    logger.error('Error in top customers endpoint:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch top customers',
      error: (error as Error).message,
    });
  }
});

/**
 * GET /analytics/metrics
 * Get sales metrics for a date range
 */
router.get('/metrics', async (req: Request, res: Response) => {
  try {
    const shopId = req.query.shop_id as string;
    const startDate = req.query.start_date as string;
    const endDate = req.query.end_date as string;

    if (!shopId || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: shop_id, start_date, end_date',
      });
    }

    const data = await analyticsModel.getSalesMetrics(
      parseInt(shopId),
      startDate,
      endDate
    );

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    logger.error('Error in metrics endpoint:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch metrics',
      error: (error as Error).message,
    });
  }
});

export default router;
