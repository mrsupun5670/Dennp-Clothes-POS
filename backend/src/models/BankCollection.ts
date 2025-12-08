/**
 * Bank Collection Model
 * Tracks money withdrawn/collected from bank accounts
 *
 * Flow:
 * - Payments ADD money to bank accounts (handled in Payment model)
 * - Collections SUBTRACT money when shop owner collects/withdraws from bank
 * - This model tracks the collection history
 */

import { query } from '../config/database';
import { logger } from '../utils/logger';

// Simple bank collection record
export interface BankCollection {
  collection_id: number;
  bank_account_id: number;
  bank_name?: string; // Joined from bank_accounts table
  collection_amount: number;
  collection_date: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

class BankCollectionModel {
  /**
   * Get all collections with bank details
   */
  async getAllCollections(): Promise<BankCollection[]> {
    try {
      const results = await query(
        `SELECT bc.*, ba.bank_name
         FROM bank_collections bc
         JOIN bank_accounts ba ON bc.bank_account_id = ba.bank_account_id
         ORDER BY bc.collection_date DESC, bc.created_at DESC`,
        []
      );
      logger.info(`Retrieved ${(results as any[]).length} bank collections`);
      return results as BankCollection[];
    } catch (error) {
      logger.error('Error fetching collections:', error);
      throw error;
    }
  }

  /**
   * Get collections for a specific bank account
   */
  async getBankAccountCollections(bankAccountId: number): Promise<BankCollection[]> {
    try {
      const results = await query(
        `SELECT bc.*, ba.bank_name
         FROM bank_collections bc
         JOIN bank_accounts ba ON bc.bank_account_id = ba.bank_account_id
         WHERE bc.bank_account_id = ?
         ORDER BY bc.collection_date DESC, bc.created_at DESC`,
        [bankAccountId]
      );
      return results as BankCollection[];
    } catch (error) {
      logger.error('Error fetching bank account collections:', error);
      throw error;
    }
  }

  /**
   * Create a new collection and update bank balance
   * This SUBTRACTS money from the bank account
   */
  async createCollection(collectionData: {
    bank_account_id: number;
    collection_amount: number;
    collection_date: string;
    notes?: string;
  }): Promise<number> {
    try {
      // Start transaction
      await query('START TRANSACTION', []);

      try {
        // Verify bank account exists
        const bankAccount = await query(
          'SELECT bank_account_id, current_balance, bank_name FROM bank_accounts WHERE bank_account_id = ?',
          [collectionData.bank_account_id]
        );

        if ((bankAccount as any[]).length === 0) {
          throw new Error('Bank account not found');
        }

        const currentBalance = parseFloat((bankAccount as any[])[0].current_balance);
        const bankName = (bankAccount as any[])[0].bank_name;

        // Check if sufficient balance
        if (currentBalance < collectionData.collection_amount) {
          throw new Error(`Insufficient bank balance. Current: Rs. ${currentBalance.toFixed(2)}, Requested: Rs. ${collectionData.collection_amount.toFixed(2)}`);
        }

        // Get current time in Sri Lankan timezone (UTC+5:30)
        const now = new Date();
        const slTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000)); // Add 5 hours 30 minutes
        const slDateTime = slTime.toISOString().slice(0, 19).replace('T', ' ');

        // Insert collection record
        const results = await query(
          `INSERT INTO bank_collections (bank_account_id, collection_amount, collection_date, notes, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            collectionData.bank_account_id,
            collectionData.collection_amount,
            collectionData.collection_date,
            collectionData.notes || null,
            slDateTime,
            slDateTime
          ]
        );

        const collectionId = (results as any).insertId;

        // Update bank account balance (SUBTRACT the collected amount)
        await query(
          `UPDATE bank_accounts
           SET current_balance = current_balance - ?,
               updated_at = NOW()
           WHERE bank_account_id = ?`,
          [collectionData.collection_amount, collectionData.bank_account_id]
        );

        // Commit transaction
        await query('COMMIT', []);

        logger.info('Collection created successfully', {
          collectionId,
          bankAccountId: collectionData.bank_account_id,
          bankName,
          amount: collectionData.collection_amount
        });

        return collectionId;
      } catch (error) {
        // Rollback transaction on error
        await query('ROLLBACK', []);
        throw error;
      }
    } catch (error) {
      logger.error('Error creating collection:', error);
      throw error;
    }
  }

  /**
   * Get collection summary for all banks
   */
  async getCollectionSummary(): Promise<{
    total_collections: number;
    total_amount: number;
    last_collection_date: string | null;
  }> {
    try {
      const results = await query(
        `SELECT
          COUNT(*) as total_collections,
          COALESCE(SUM(collection_amount), 0) as total_amount,
          MAX(collection_date) as last_collection_date
         FROM bank_collections`,
        []
      );

      const summary = (results as any[])[0] || {
        total_collections: 0,
        total_amount: 0,
        last_collection_date: null
      };

      return summary;
    } catch (error) {
      logger.error('Error fetching collection summary:', error);
      throw error;
    }
  }

  /**
   * Get collections by date range
   */
  async getCollectionsByDateRange(
    startDate: string,
    endDate: string
  ): Promise<BankCollection[]> {
    try {
      const results = await query(
        `SELECT bc.*, ba.bank_name
         FROM bank_collections bc
         JOIN bank_accounts ba ON bc.bank_account_id = ba.bank_account_id
         WHERE bc.collection_date BETWEEN ? AND ?
         ORDER BY bc.collection_date DESC, bc.created_at DESC`,
        [startDate, endDate]
      );
      return results as BankCollection[];
    } catch (error) {
      logger.error('Error fetching collections by date range:', error);
      throw error;
    }
  }
}

export default new BankCollectionModel();
