/**
 * Payment Model
 * Handles all database queries and operations for payments table
 */

import { query } from '../config/database';
import { logger } from '../utils/logger';

export interface Payment {
  payment_id: number;
  order_id: number;
  payment_type: 'advance' | 'balance' | 'full';
  amount_paid: number;
  payment_method: 'cash' | 'card' | 'online' | 'check' | 'other';
  bank_name?: string;
  branch_name?: string;
  is_online_transfer: boolean;
  payment_date: Date;
  created_at: Date;
  updated_at: Date;
}

class PaymentModel {
  /**
   * Get all payments
   */
  async getAllPayments(): Promise<Payment[]> {
    try {
      const results = await query('SELECT * FROM payments ORDER BY payment_date DESC');
      logger.info('Retrieved all payments', { count: (results as any[]).length });
      return results as Payment[];
    } catch (error) {
      logger.error('Error fetching all payments:', error);
      throw error;
    }
  }

  /**
   * Get payment by ID
   */
  async getPaymentById(paymentId: number): Promise<Payment | null> {
    try {
      const results = await query('SELECT * FROM payments WHERE payment_id = ?', [paymentId]);
      const payment = (results as Payment[])[0] || null;
      logger.debug('Retrieved payment by ID', { paymentId });
      return payment;
    } catch (error) {
      logger.error('Error fetching payment by ID:', error);
      throw error;
    }
  }

  /**
   * Get payments for an order
   */
  async getPaymentsByOrder(orderId: number): Promise<Payment[]> {
    try {
      const results = await query('SELECT * FROM payments WHERE order_id = ? ORDER BY payment_date DESC', [orderId]);
      logger.debug('Retrieved payments for order', { orderId, count: (results as any[]).length });
      return results as Payment[];
    } catch (error) {
      logger.error('Error fetching payments for order:', error);
      throw error;
    }
  }

  /**
   * Create new payment
   */
  async createPayment(paymentData: Omit<Payment, 'payment_id' | 'created_at' | 'updated_at'>): Promise<number> {
    try {
      const { order_id, payment_type, amount_paid, payment_method, bank_name, branch_name, is_online_transfer, payment_date } = paymentData;

      const results = await query(
        `INSERT INTO payments (order_id, payment_type, amount_paid, payment_method, bank_name, branch_name, is_online_transfer, payment_date)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [order_id, payment_type, amount_paid, payment_method, bank_name || null, branch_name || null, is_online_transfer ? 1 : 0, payment_date]
      );

      const paymentId = (results as any).insertId;
      logger.info('Payment created successfully', { paymentId, order_id, amount_paid });
      return paymentId;
    } catch (error) {
      logger.error('Error creating payment:', error);
      throw error;
    }
  }

  /**
   * Update payment
   */
  async updatePayment(paymentId: number, paymentData: Partial<Omit<Payment, 'payment_id' | 'created_at' | 'updated_at'>>): Promise<boolean> {
    try {
      const fields: string[] = [];
      const values: any[] = [];

      const updateableFields: (keyof Omit<Payment, 'payment_id' | 'created_at' | 'updated_at'>)[] = [
        'payment_type',
        'amount_paid',
        'payment_method',
        'bank_name',
        'branch_name',
        'is_online_transfer',
      ];

      for (const field of updateableFields) {
        if (field in paymentData) {
          fields.push(`${field} = ?`);
          values.push(paymentData[field]);
        }
      }

      if (fields.length === 0) return false;

      fields.push('updated_at = NOW()');
      values.push(paymentId);

      const results = await query(`UPDATE payments SET ${fields.join(', ')} WHERE payment_id = ?`, values);
      const affectedRows = (results as any).affectedRows;

      logger.info('Payment updated successfully', { paymentId, affectedRows });
      return affectedRows > 0;
    } catch (error) {
      logger.error('Error updating payment:', error);
      throw error;
    }
  }

  /**
   * Delete payment
   */
  async deletePayment(paymentId: number): Promise<boolean> {
    try {
      const results = await query('DELETE FROM payments WHERE payment_id = ?', [paymentId]);
      const affectedRows = (results as any).affectedRows;

      logger.info('Payment deleted', { paymentId });
      return affectedRows > 0;
    } catch (error) {
      logger.error('Error deleting payment:', error);
      throw error;
    }
  }

  /**
   * Get payments for a date range
   */
  async getPaymentsByDateRange(startDate: Date, endDate: Date, shopId?: number): Promise<Payment[]> {
    try {
      let sql = `SELECT p.* FROM payments p
                 JOIN orders o ON p.order_id = o.order_id
                 WHERE p.payment_date BETWEEN ? AND ?
                 ORDER BY p.payment_date DESC`;
      let params: any[] = [startDate, endDate];

      if (shopId) {
        sql += ' AND o.shop_id = ?';
        params.push(shopId);
      }

      const results = await query(sql, params);
      logger.debug('Retrieved payments by date range', { count: (results as any[]).length, shopId });
      return results as Payment[];
    } catch (error) {
      logger.error('Error fetching payments by date range:', error);
      throw error;
    }
  }

  /**
   * Get total payments for a date range
   */
  async getTotalPayments(startDate: Date, endDate: Date, shopId?: number): Promise<{ total: number; count: number }> {
    try {
      let sql = `SELECT SUM(amount_paid) as total, COUNT(*) as count FROM payments p
                 JOIN orders o ON p.order_id = o.order_id
                 WHERE p.payment_date BETWEEN ? AND ?`;
      let params: any[] = [startDate, endDate];

      if (shopId) {
        sql += ' AND o.shop_id = ?';
        params.push(shopId);
      }

      const results = await query(sql, params);
      const result = (results as any[])[0] || { total: 0, count: 0 };

      logger.debug('Retrieved total payments', { shopId, total: result.total, count: result.count });
      return { total: result.total || 0, count: result.count || 0 };
    } catch (error) {
      logger.error('Error fetching total payments:', error);
      throw error;
    }
  }

  /**
   * Get payments by method
   */
  async getPaymentsByMethod(method: string): Promise<Payment[]> {
    try {
      const results = await query('SELECT * FROM payments WHERE payment_method = ? ORDER BY payment_date DESC', [method]);
      logger.debug('Retrieved payments by method', { method, count: (results as any[]).length });
      return results as Payment[];
    } catch (error) {
      logger.error('Error fetching payments by method:', error);
      throw error;
    }
  }

  /**
   * Get payments by bank
   */
  async getPaymentsByBank(bankName: string): Promise<Payment[]> {
    try {
      const results = await query('SELECT * FROM payments WHERE bank_name = ? ORDER BY payment_date DESC', [bankName]);
      logger.debug('Retrieved payments by bank', { bankName, count: (results as any[]).length });
      return results as Payment[];
    } catch (error) {
      logger.error('Error fetching payments by bank:', error);
      throw error;
    }
  }
}

export default new PaymentModel();
