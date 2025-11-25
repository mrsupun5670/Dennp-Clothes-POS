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
  customer_id?: number;
  payment_amount: number;
  payment_date: string;
  payment_time?: string;
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
      const results = await query('SELECT * FROM payments WHERE shop_id = ? ORDER BY payment_date DESC, payment_time DESC', [shopId]);
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
      const results = await query('SELECT * FROM payments WHERE order_id = ? ORDER BY payment_date DESC', [orderId]);
      logger.debug('Retrieved payments for order', { orderId, count: (results as any[]).length });
      return results as Payment[];
    } catch (error) {
      logger.error('Error fetching order payments:', error);
      throw error;
    }
  }

  async createPayment(shopId: number, paymentData: any): Promise<number> {
    try {
      const results = await query(
        `INSERT INTO payments (shop_id, order_id, customer_id, payment_amount, payment_date, payment_time, payment_method, bank_name, branch_name, bank_account_id, transaction_id, payment_status, notes, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [shopId, paymentData.order_id || null, paymentData.customer_id || null, paymentData.payment_amount, paymentData.payment_date, paymentData.payment_time || null, paymentData.payment_method, paymentData.bank_name || null, paymentData.branch_name || null, paymentData.bank_account_id || null, paymentData.transaction_id || null, paymentData.payment_status || 'completed', paymentData.notes || null, paymentData.created_by || null]
      );

      const paymentId = (results as any).insertId;
      logger.info('Payment created successfully', { paymentId, shopId, amount: paymentData.payment_amount });
      return paymentId;
    } catch (error) {
      logger.error('Error creating payment:', error);
      throw error;
    }
  }

  async updatePayment(paymentId: number, shopId: number, updateData: Partial<Payment>): Promise<boolean> {
    try {
      const ownership = await query('SELECT payment_id FROM payments WHERE payment_id = ? AND shop_id = ?', [paymentId, shopId]);
      if ((ownership as any[]).length === 0) {
        logger.warn('Payment not found', { paymentId, shopId });
        return false;
      }

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

      fields.push('updated_at = NOW()');
      values.push(paymentId);
      values.push(shopId);

      const results = await query(`UPDATE payments SET ${fields.join(', ')} WHERE payment_id = ? AND shop_id = ?`, values);
      logger.info('Payment updated successfully', { paymentId, shopId });
      return (results as any).affectedRows > 0;
    } catch (error) {
      logger.error('Error updating payment:', error);
      throw error;
    }
  }

  async getPaymentsByDateRange(shopId: number, startDate: string, endDate: string): Promise<Payment[]> {
    try {
      const results = await query('SELECT * FROM payments WHERE shop_id = ? AND payment_date BETWEEN ? AND ? ORDER BY payment_date DESC', [shopId, startDate, endDate]);
      logger.debug('Retrieved payments by date range', { shopId, startDate, endDate, count: (results as any[]).length });
      return results as Payment[];
    } catch (error) {
      logger.error('Error fetching payments by date range:', error);
      throw error;
    }
  }

  async getPaymentsByMethod(shopId: number, method: string): Promise<Payment[]> {
    try {
      const results = await query('SELECT * FROM payments WHERE shop_id = ? AND payment_method = ? ORDER BY payment_date DESC', [shopId, method]);
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
