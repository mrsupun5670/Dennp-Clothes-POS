/**
 * Bank Collection Model
 * Handles all database queries for bank collections and reconciliation tracking
 */

import { query } from '../config/database';
import { logger } from '../utils/logger';

export interface PendingCollection {
  id: string;
  bankName: string;
  branchName: string;
  pendingAmount: number;
  fromDate: string;
  toDate: string;
  ordersCount: number;
  status: 'pending' | 'collected';
  collectedDate?: string;
  collectedAmount?: number;
}

export interface CollectionRecord {
  collectionId: number;
  bankName: string;
  branchName: string;
  pendingAmount: number;
  collectedAmount: number;
  fromDate: string;
  toDate: string;
  ordersCount: number;
  collectionDate: string;
  status: string;
  notes?: string;
}

class BankCollectionModel {
  /**
   * Get pending collections for a shop
   * Collections are based on orders with payment_status = 'unpaid' or 'partial'
   */
  async getPendingCollections(shopId: number): Promise<PendingCollection[]> {
    try {
      const results = await query(
        `SELECT
          ba.bank_account_id,
          ba.bank_name,
          ba.branch_name,
          SUM(o.balance_due) as pendingAmount,
          COUNT(DISTINCT o.order_id) as ordersCount,
          CURDATE() as fromDate,
          CURDATE() as toDate
         FROM orders o
         JOIN bank_accounts ba ON o.shop_id = ba.shop_id
         WHERE o.shop_id = ?
         AND (o.payment_status = 'unpaid' OR o.payment_status = 'partial')
         AND o.order_status NOT IN ('cancelled')
         AND ba.status = 'active'
         GROUP BY ba.bank_account_id
         HAVING SUM(o.balance_due) > 0
         ORDER BY SUM(o.balance_due) DESC`,
        [shopId]
      );

      return (results as any[]).map((row, index) => ({
        id: `COL-${row.bank_account_id}-${index}`,
        bankName: row.bank_name,
        branchName: row.branch_name,
        pendingAmount: parseFloat(row.pendingAmount) || 0,
        fromDate: row.fromDate,
        toDate: row.toDate,
        ordersCount: parseInt(row.ordersCount) || 0,
        status: 'pending' as const,
      }));
    } catch (error) {
      logger.error('Error fetching pending collections:', error);
      throw error;
    }
  }

  /**
   * Get collection history (completed collections)
   */
  async getCollectionHistory(shopId: number): Promise<CollectionRecord[]> {
    try {
      const results = await query(
        `SELECT
          p.payment_id as collectionId,
          ba.bank_name,
          ba.branch_name,
          0 as pendingAmount,
          p.payment_amount as collectedAmount,
          DATE(o.order_date) as fromDate,
          DATE(o.order_date) as toDate,
          COUNT(DISTINCT o.order_id) as ordersCount,
          DATE(p.payment_date) as collectionDate,
          p.payment_status as status,
          p.notes
         FROM payments p
         JOIN orders o ON p.order_id = o.order_id
         JOIN bank_accounts ba ON p.bank_account_id = ba.bank_account_id
         WHERE o.shop_id = ?
         AND p.payment_status IN ('completed')
         GROUP BY p.payment_id, ba.bank_account_id
         ORDER BY p.payment_date DESC`,
        [shopId]
      );

      return (results as any[]).map((row) => ({
        collectionId: row.collectionId,
        bankName: row.bank_name,
        branchName: row.branch_name,
        pendingAmount: 0,
        collectedAmount: parseFloat(row.collectedAmount) || 0,
        fromDate: row.fromDate,
        toDate: row.toDate,
        ordersCount: parseInt(row.ordersCount) || 0,
        collectionDate: row.collectionDate,
        status: row.status,
        notes: row.notes,
      }));
    } catch (error) {
      logger.error('Error fetching collection history:', error);
      throw error;
    }
  }

  /**
   * Get collection details for a specific collection
   */
  async getCollectionDetails(shopId: number, collectionId: number): Promise<any> {
    try {
      const results = await query(
        `SELECT
          p.payment_id,
          p.payment_amount,
          p.payment_date,
          p.transaction_id,
          ba.bank_name,
          ba.branch_name,
          ba.account_number,
          o.order_id,
          o.order_number,
          o.total_amount,
          c.first_name,
          c.last_name
         FROM payments p
         JOIN orders o ON p.order_id = o.order_id
         JOIN bank_accounts ba ON p.bank_account_id = ba.bank_account_id
         JOIN customers c ON p.customer_id = c.customer_id
         WHERE p.payment_id = ? AND o.shop_id = ?`,
        [collectionId, shopId]
      );

      return (results as any[])[0] || null;
    } catch (error) {
      logger.error('Error fetching collection details:', error);
      throw error;
    }
  }

  /**
   * Mark a collection as completed/reconciled
   */
  async recordCollection(
    shopId: number,
    bankAccountId: number,
    amount: number,
    collectionDate: string,
    notes?: string
  ): Promise<number> {
    try {
      const results = await query(
        `INSERT INTO payments (shop_id, bank_account_id, payment_amount, payment_date, payment_status, notes, created_at, updated_at)
         VALUES (?, ?, ?, ?, 'completed', ?, NOW(), NOW())`,
        [shopId, bankAccountId, amount, collectionDate, notes || '']
      );

      const paymentId = (results as any).insertId;
      logger.info('Collection recorded', { paymentId, bankAccountId, amount });
      return paymentId;
    } catch (error) {
      logger.error('Error recording collection:', error);
      throw error;
    }
  }

  /**
   * Get reconciliation summary for a date range
   */
  async getReconciliationSummary(
    shopId: number,
    startDate: string,
    endDate: string
  ): Promise<any> {
    try {
      const results = await query(
        `SELECT
          ba.bank_name,
          ba.branch_name,
          SUM(CASE WHEN p.payment_status = 'completed' THEN p.payment_amount ELSE 0 END) as collectedAmount,
          SUM(CASE WHEN o.payment_status IN ('unpaid', 'partial') THEN o.remaining_amount ELSE 0 END) as pendingAmount,
          COUNT(DISTINCT CASE WHEN p.payment_status = 'completed' THEN p.payment_id END) as completedPayments,
          COUNT(DISTINCT CASE WHEN o.payment_status IN ('unpaid', 'partial') THEN o.order_id END) as pendingPayments
         FROM bank_accounts ba
         LEFT JOIN payments p ON ba.bank_account_id = p.bank_account_id
         LEFT JOIN orders o ON ba.bank_account_id = o.payment_method
         WHERE ba.shop_id = ?
         AND DATE(COALESCE(p.payment_date, o.order_date)) BETWEEN ? AND ?
         GROUP BY ba.bank_account_id`,
        [shopId, startDate, endDate]
      );

      return (results as any[]).map((row) => ({
        bankName: row.bank_name,
        branchName: row.branch_name,
        collectedAmount: parseFloat(row.collectedAmount) || 0,
        pendingAmount: parseFloat(row.pendingAmount) || 0,
        completedPayments: parseInt(row.completedPayments) || 0,
        pendingPayments: parseInt(row.pendingPayments) || 0,
      }));
    } catch (error) {
      logger.error('Error fetching reconciliation summary:', error);
      throw error;
    }
  }
}

export default new BankCollectionModel();
