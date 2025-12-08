import { Request, Response } from 'express';
import BankCollectionModel from '../models/BankCollection';
import { logger } from '../utils/logger';

class BankCollectionController {
  /**
   * Get all bank collections
   */
  async getAllCollections(_req: Request, res: Response): Promise<void> {
    try {
      const collections = await BankCollectionModel.getAllCollections();
      res.json({ success: true, data: collections, message: 'Collections retrieved successfully' });
    } catch (error) {
      logger.error('Error in getAllCollections:', error);
      res.status(500).json({ success: false, message: 'Failed to retrieve collections' });
    }
  }

  /**
   * Get collections for a specific bank account
   */
  async getBankAccountCollections(req: Request, res: Response): Promise<void> {
    try {
      const { bankAccountId } = req.params;
      const bankAccountIdNum = Number(bankAccountId);

      if (!bankAccountIdNum) {
        res.status(400).json({ success: false, message: 'Invalid bank account ID' });
        return;
      }

      const collections = await BankCollectionModel.getBankAccountCollections(bankAccountIdNum);
      res.json({ success: true, data: collections, message: 'Bank account collections retrieved successfully' });
    } catch (error) {
      logger.error('Error in getBankAccountCollections:', error);
      res.status(500).json({ success: false, message: 'Failed to retrieve bank account collections' });
    }
  }

  /**
   * Create a new collection
   */
  async createCollection(req: Request, res: Response): Promise<void> {
    try {
      const { bank_account_id, collection_amount, collection_date, notes } = req.body;

      // Validate required fields
      if (!bank_account_id) {
        res.status(400).json({ success: false, message: 'Bank account ID is required' });
        return;
      }

      if (!collection_amount || parseFloat(collection_amount) <= 0) {
        res.status(400).json({ success: false, message: 'Collection amount must be greater than 0' });
        return;
      }

      if (!collection_date) {
        res.status(400).json({ success: false, message: 'Collection date is required' });
        return;
      }

      const collectionId = await BankCollectionModel.createCollection({
        bank_account_id,
        collection_amount: parseFloat(collection_amount),
        collection_date,
        notes
      });

      res.status(201).json({
        success: true,
        data: { collection_id: collectionId },
        message: 'Collection recorded successfully'
      });
    } catch (error: any) {
      logger.error('Error in createCollection:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create collection'
      });
    }
  }

  /**
   * Get collection summary
   */
  async getCollectionSummary(_req: Request, res: Response): Promise<void> {
    try {
      const summary = await BankCollectionModel.getCollectionSummary();
      res.json({ success: true, data: summary, message: 'Collection summary retrieved successfully' });
    } catch (error) {
      logger.error('Error in getCollectionSummary:', error);
      res.status(500).json({ success: false, message: 'Failed to retrieve collection summary' });
    }
  }

  /**
   * Get collections by date range
   */
  async getCollectionsByDateRange(req: Request, res: Response): Promise<void> {
    try {
      const { start_date, end_date } = req.query;

      if (!start_date || !end_date) {
        res.status(400).json({ success: false, message: 'Start date and end date are required' });
        return;
      }

      const collections = await BankCollectionModel.getCollectionsByDateRange(
        String(start_date),
        String(end_date)
      );

      res.json({ success: true, data: collections, message: 'Collections retrieved successfully' });
    } catch (error) {
      logger.error('Error in getCollectionsByDateRange:', error);
      res.status(500).json({ success: false, message: 'Failed to retrieve collections' });
    }
  }
}

export default new BankCollectionController();
