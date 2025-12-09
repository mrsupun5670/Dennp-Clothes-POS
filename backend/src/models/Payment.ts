/**
 * Payment Model
 * Handles all database queries and operations for payments table
 */

import { query } from '../config/database';
import { logger } from '../utils/logger';

export interface Payment {
  payment_id: number;
  shop_id: number;
  order_id?: number;
  order_number?: string;
  customer_id?: number;
  payment_amount: number;
  payment_method: 'cash' | 'online_transfer' | 'bank_deposit';
  bank_name?: string;
  branch_name?: string;
  bank_account_id?: number;
  transaction_id?: string;
  payment_status: 'completed' | 'pending' | 'failed' | 'refunded';
  notes?: string;
  created_by?: number;
  created_at: string;
  updated_at: string;
}

class PaymentModel {
  async getShopPayments(shopId: number): Promise<Payment[]> {
    try {
      const results = await query(
        `SELECT p.*, o.order_number
         FROM payments p
         LEFT JOIN orders o ON p.order_id = o.order_id
         WHERE p.shop_id = ?
         ORDER BY p.updated_at DESC`,
        [shopId]
      );
      const paymentsList = results as Payment[];
      logger.info(`Retrieved ${paymentsList.length} payments for shop ${shopId}`, { shopId, count: paymentsList.length });
      return paymentsList;
    } catch (error) {
      logger.error('Error fetching shop payments:', error);
      throw error;
    }
  }

  async getPaymentById(paymentId: number, shopId: number): Promise<Payment | null> {
    try {
      const results = await query('SELECT * FROM payments WHERE payment_id = ? AND shop_id = ?', [paymentId, shopId]);
      const payment = (results as Payment[])[0] || null;
      logger.debug('Retrieved payment by ID', { paymentId, shopId });
      return payment;
    } catch (error) {
      logger.error('Error fetching payment by ID:', error);
      throw error;
    }
  }

  async getOrderPayments(orderId: number): Promise<Payment[]> {
    try {
      const results = await query('SELECT * FROM payments WHERE order_id = ? ORDER BY updated_at DESC', [orderId]);
      logger.debug('Retrieved payments for order', { orderId, count: (results as any[]).length });
      return results as Payment[];
    } catch (error) {
      logger.error('Error fetching order payments:', error);
      throw error;
    }
  }

  async createPayment(shopId: number, paymentData: any): Promise<number> {
    try {
      // Get current time in local timezone (YYYY-MM-DD HH:MM:SS format)
      const now = new Date();
      const localDateTime = new Date(now.getTime() - (now.getTimezoneOffset() * 60000))
        .toISOString()
        .slice(0, 19)
        .replace('T', ' ');

      // Generate unique transaction_id if not provided or make it unique
      let transactionId = paymentData.transaction_id;
      if (!transactionId || transactionId.trim() === '') {
        // Auto-generate if empty
        transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      } else {
        // Make user-provided transaction_id unique by appending timestamp
        transactionId = `${transactionId}-${Date.now()}`;
      }

      // Start transaction
      await query('START TRANSACTION', []);

      try {
        // Insert payment record
        const results = await query(
          `INSERT INTO payments (shop_id, order_id, customer_id, payment_amount, payment_method, bank_name, branch_name, bank_account_id, transaction_id, payment_status, notes, created_by, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [shopId, paymentData.order_id || null, paymentData.customer_id || null, paymentData.payment_amount, paymentData.payment_method, paymentData.bank_name || null, paymentData.branch_name || null, paymentData.bank_account_id || null, transactionId, paymentData.payment_status || 'completed', paymentData.notes || null, paymentData.created_by || null, localDateTime, localDateTime]
        );

        const paymentId = (results as any).insertId;

        // Update bank account balance if payment is for bank transfer/deposit and payment is completed
        if (
          paymentData.bank_account_id &&
          (paymentData.payment_method === 'online_transfer' || paymentData.payment_method === 'bank_deposit') &&
          (paymentData.payment_status === 'completed' || !paymentData.payment_status)
        ) {
          await query(
            `UPDATE bank_accounts
             SET current_balance = current_balance + ?,
                 updated_at = NOW()
             WHERE bank_account_id = ? AND shop_id = ?`,
            [paymentData.payment_amount, paymentData.bank_account_id, shopId]
          );
          logger.info('Bank account balance updated', {
            bankAccountId: paymentData.bank_account_id,
            amount: paymentData.payment_amount
          });
        }

        // Commit transaction
        await query('COMMIT', []);

        logger.info('Payment created successfully', { paymentId, shopId, amount: paymentData.payment_amount });
        return paymentId;
      } catch (error) {
        // Rollback transaction on error
        await query('ROLLBACK', []);
        throw error;
      }
    } catch (error) {
      logger.error('Error creating payment:', error);
      throw error;
    }
  }

  async updatePayment(paymentId: number, shopId: number, updateData: Partial<Payment>): Promise<boolean> {
    try {
      // Get the original payment details
      const originalPayment = await query('SELECT * FROM payments WHERE payment_id = ? AND shop_id = ?', [paymentId, shopId]);
      if ((originalPayment as any[]).length === 0) {
        logger.warn('Payment not found', { paymentId, shopId });
        return false;
      }

      const original = (originalPayment as Payment[])[0];

      const fields: string[] = [];
      const values: any[] = [];
      const updateableFields = ['payment_status', 'notes', 'payment_amount', 'payment_method', 'bank_name', 'branch_name', 'bank_account_id', 'transaction_id'];

      for (const field of updateableFields) {
        if (field in updateData) {
          fields.push(`${field} = ?`);
          values.push((updateData as any)[field]);
        }
      }

      if (fields.length === 0) return false;

      // Get current time in local timezone
      const now = new Date();
      const localDateTime = new Date(now.getTime() - (now.getTimezoneOffset() * 60000))
        .toISOString()
        .slice(0, 19)
        .replace('T', ' ');

      // Start transaction
      await query('START TRANSACTION', []);

      try {
        fields.push('updated_at = ?');
        values.push(localDateTime);
        values.push(paymentId);
        values.push(shopId);

        const results = await query(`UPDATE payments SET ${fields.join(', ')} WHERE payment_id = ? AND shop_id = ?`, values);

        // Handle bank account balance updates
        const isOriginalBankPayment = original.bank_account_id && (original.payment_method === 'online_transfer' || original.payment_method === 'bank_deposit') && original.payment_status === 'completed';
        const isNewBankPayment = (updateData.bank_account_id || original.bank_account_id) && ((updateData.payment_method || original.payment_method) === 'online_transfer' || (updateData.payment_method || original.payment_method) === 'bank_deposit') && (updateData.payment_status === 'completed' || (!updateData.payment_status && original.payment_status === 'completed'));

        // Case 1: Original was a completed bank payment, need to reverse it
        if (isOriginalBankPayment) {
          await query(
            `UPDATE bank_accounts
             SET current_balance = current_balance - ?,
                 updated_at = NOW()
             WHERE bank_account_id = ?`,
            [original.payment_amount, original.bank_account_id]
          );
          logger.info('Reversed original bank account balance', {
            bankAccountId: original.bank_account_id,
            amount: original.payment_amount
          });
        }

        // Case 2: New state is a completed bank payment, need to add it
        if (isNewBankPayment) {
          const newAmount = updateData.payment_amount !== undefined ? updateData.payment_amount : original.payment_amount;
          const newBankAccountId = updateData.bank_account_id !== undefined ? updateData.bank_account_id : original.bank_account_id;

          await query(
            `UPDATE bank_accounts
             SET current_balance = current_balance + ?,
                 updated_at = NOW()
             WHERE bank_account_id = ?`,
            [newAmount, newBankAccountId]
          );
          logger.info('Updated bank account balance', {
            bankAccountId: newBankAccountId,
            amount: newAmount
          });
        }

        // Commit transaction
        await query('COMMIT', []);

        logger.info('Payment updated successfully', { paymentId, shopId });
        return (results as any).affectedRows > 0;
      } catch (error) {
        // Rollback transaction on error
        await query('ROLLBACK', []);
        throw error;
      }
    } catch (error) {
      logger.error('Error updating payment:', error);
      throw error;
    }
  }

  async getPaymentsByDateRange(shopId: number, startDate: string, endDate: string): Promise<Payment[]> {
    try {
      const results = await query('SELECT * FROM payments WHERE shop_id = ? AND DATE(created_at) BETWEEN ? AND ? ORDER BY updated_at DESC', [shopId, startDate, endDate]);
      logger.debug('Retrieved payments by date range', { shopId, startDate, endDate, count: (results as any[]).length });
      return results as Payment[];
    } catch (error) {
      logger.error('Error fetching payments by date range:', error);
      throw error;
    }
  }

  async getPaymentsByMethod(shopId: number, method: string): Promise<Payment[]> {
    try {
      const results = await query('SELECT * FROM payments WHERE shop_id = ? AND payment_method = ? ORDER BY updated_at DESC', [shopId, method]);
      logger.debug('Retrieved payments by method', { shopId, method, count: (results as any[]).length });
      return results as Payment[];
    } catch (error) {
      logger.error('Error fetching payments by method:', error);
      throw error;
    }
  }

  async getPaymentSummary(shopId: number): Promise<any> {
    try {
      const results = await query(`SELECT COUNT(*) as total_count, COALESCE(SUM(payment_amount), 0) as total_amount, COUNT(CASE WHEN payment_status = 'completed' THEN 1 END) as completed_count FROM payments WHERE shop_id = ?`, [shopId]);
      logger.debug('Retrieved payment summary', { shopId });
      const summary = (results as any[])[0] || { total_count: 0, total_amount: 0, completed_count: 0 };
      return {
        total_count: summary.total_count || 0,
        total_amount: summary.total_amount || 0,
        completed_count: summary.completed_count || 0
      };
    } catch (error) {
      logger.error('Error fetching payment summary:', error);
      throw error;
    }
  }
}

export default new PaymentModel();
