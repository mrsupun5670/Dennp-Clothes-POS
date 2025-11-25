/**
 * Bank Collection Routes
 * Handles all bank collection and reconciliation endpoints
 */

import { Router, Request, Response } from 'express';
import bankCollectionModel from '../models/BankCollection';
import { logger } from '../utils/logger';

const router = Router();

/**
 * GET /bank-collections/pending
 * Get pending collections for a shop
 */
router.get('/pending', async (req: Request, res: Response) => {
  try {
    const shopId = req.query.shop_id as string;

    if (!shopId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameter: shop_id',
      });
    }

    const data = await bankCollectionModel.getPendingCollections(parseInt(shopId));

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    logger.error('Error in pending collections endpoint:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch pending collections',
      error: (error as Error).message,
    });
  }
});

/**
 * GET /bank-collections/history
 * Get collection history (completed collections)
 */
router.get('/history', async (req: Request, res: Response) => {
  try {
    const shopId = req.query.shop_id as string;

    if (!shopId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameter: shop_id',
      });
    }

    const data = await bankCollectionModel.getCollectionHistory(parseInt(shopId));

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    logger.error('Error in collection history endpoint:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch collection history',
      error: (error as Error).message,
    });
  }
});

/**
 * GET /bank-collections/details/:collectionId
 * Get collection details
 */
router.get('/details/:collectionId', async (req: Request, res: Response) => {
  try {
    const shopId = req.query.shop_id as string;
    const collectionId = req.params.collectionId;

    if (!shopId || !collectionId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: shop_id, collectionId',
      });
    }

    const data = await bankCollectionModel.getCollectionDetails(
      parseInt(shopId),
      parseInt(collectionId)
    );

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    logger.error('Error in collection details endpoint:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch collection details',
      error: (error as Error).message,
    });
  }
});

/**
 * POST /bank-collections/record
 * Record a new collection
 */
router.post('/record', async (req: Request, res: Response) => {
  try {
    const { shopId, bankAccountId, amount, collectionDate, notes } = req.body;

    if (!shopId || !bankAccountId || !amount || !collectionDate) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: shopId, bankAccountId, amount, collectionDate',
      });
    }

    const collectionId = await bankCollectionModel.recordCollection(
      parseInt(shopId),
      parseInt(bankAccountId),
      parseFloat(amount),
      collectionDate,
      notes
    );

    return res.json({
      success: true,
      message: 'Collection recorded successfully',
      data: { collectionId },
    });
  } catch (error) {
    logger.error('Error in record collection endpoint:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to record collection',
      error: (error as Error).message,
    });
  }
});

/**
 * GET /bank-collections/reconciliation-summary
 * Get reconciliation summary for a date range
 */
router.get('/reconciliation-summary', async (req: Request, res: Response) => {
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

    const data = await bankCollectionModel.getReconciliationSummary(
      parseInt(shopId),
      startDate,
      endDate
    );

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    logger.error('Error in reconciliation summary endpoint:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch reconciliation summary',
      error: (error as Error).message,
    });
  }
});

export default router;
