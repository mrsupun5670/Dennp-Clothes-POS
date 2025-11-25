/**
 * Reports Routes
 * Handles all reports and detailed cost breakdown endpoints
 */

import { Router, Request, Response } from 'express';
import reportsModel from '../models/Reports';
import { logger } from '../utils/logger';

const router = Router();

/**
 * GET /reports/sold-items
 * Get all sold items with detailed cost breakdown
 */
router.get('/sold-items', async (req: Request, res: Response) => {
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

    const data = await reportsModel.getSoldItems(
      parseInt(shopId),
      startDate,
      endDate
    );

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    logger.error('Error in sold items endpoint:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch sold items',
      error: (error as Error).message,
    });
  }
});

/**
 * GET /reports/cost-breakdown
 * Get cost breakdown for a date range
 */
router.get('/cost-breakdown', async (req: Request, res: Response) => {
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

    const data = await reportsModel.getCostBreakdown(
      parseInt(shopId),
      startDate,
      endDate
    );

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    logger.error('Error in cost breakdown endpoint:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch cost breakdown',
      error: (error as Error).message,
    });
  }
});

/**
 * GET /reports/cost-details
 * Get cost details breakdown (product, print, delivery)
 */
router.get('/cost-details', async (req: Request, res: Response) => {
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

    const data = await reportsModel.getCostDetails(
      parseInt(shopId),
      startDate,
      endDate
    );

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    logger.error('Error in cost details endpoint:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch cost details',
      error: (error as Error).message,
    });
  }
});

/**
 * GET /reports/multi-period-breakdown
 * Get cost breakdown for multiple periods (today, week, month)
 */
router.get('/multi-period-breakdown', async (req: Request, res: Response) => {
  try {
    const shopId = req.query.shop_id as string;

    if (!shopId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameter: shop_id',
      });
    }

    const data = await reportsModel.getMultiPeriodCostBreakdown(parseInt(shopId));

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    logger.error('Error in multi-period breakdown endpoint:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch multi-period breakdown',
      error: (error as Error).message,
    });
  }
});

export default router;
