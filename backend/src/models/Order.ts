/**
 * Order Model
 * Handles all database queries and operations for orders table
 */

import { query } from '../config/database';
import { logger } from '../utils/logger';

export interface Order {
  order_id: number;
  order_number: string;
  shop_id: number;
  customer_id?: number;
  user_id?: number;
  total_items: number;
  total_amount: number;
  delivery_charge?: number;
  final_amount: number;
  advance_paid: number;
  balance_due: number;
  payment_status: 'unpaid' | 'partial' | 'fully_paid';
  payment_method?: 'cash' | 'card' | 'online' | 'check' | 'other';
  order_status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  notes?: string;
  tracking_number?: string | null;
  order_date: Date;
  created_at?: Date;
  updated_at?: Date;
  delivery_line1?: string;
  delivery_line2?: string;
  delivery_postal_code?: string;
  delivery_city?: string;
  delivery_district?: string;
  delivery_province?: string;
  recipient_name?: string;
  recipient_phone?: string;
  recipient_phone1?: string;
  delivery_address?: any;
}

class OrderModel {
  /**
   * Get all orders
   */
  async getAllOrders(shopId?: number): Promise<Order[]> {
    try {
      let sql = 'SELECT * FROM orders ORDER BY created_at DESC';
      let params: any[] = [];

      if (shopId) {
        sql = 'SELECT * FROM orders WHERE shop_id = ? ORDER BY created_at DESC';
        params = [shopId];
      }

      const results = await query(sql, params);
      logger.info('Retrieved all orders', { count: (results as any[]).length, shopId });
      return results as Order[];
    } catch (error) {
      logger.error('Error fetching all orders:', error);
      throw error;
    }
  }

  /**
   * Get order by ID
   */
  async getOrderById(orderId: number, shopId: number): Promise<Order | null> {
    try {
      const results = await query('SELECT * FROM orders WHERE order_id = ? AND shop_id = ?', [orderId, shopId]);
      const order = (results as Order[])[0] || null;
      logger.debug('Retrieved order by ID', { orderId, shopId });
      return order;
    } catch (error) {
      logger.error('Error fetching order by ID:', error);
      throw error;
    }
  }

  /**
   * Get orders by customer
   */
  async getOrdersByCustomer(customerId: number, shopId: number): Promise<Order[]> {
    try {
      const results = await query('SELECT * FROM orders WHERE customer_id = ? AND shop_id = ? ORDER BY created_at DESC', [customerId, shopId]);
      logger.debug('Retrieved orders by customer', { customerId, shopId, count: (results as any[]).length });
      return results as Order[];
    } catch (error) {
      logger.error('Error fetching orders by customer:', error);
      throw error;
    }
  }

  /**
   * Create new order
   */
  async createOrder(orderData: Omit<Order, 'order_id' | 'created_at' | 'updated_at'>): Promise<number> {
    try {
      const {
        order_number,
        shop_id,
        customer_id,
        user_id,
        total_items,
        total_amount,
        delivery_charge,
        final_amount,
        advance_paid,
        balance_due,
        payment_status,
        payment_method,
        order_status,
        recipient_phone,
        notes,
        order_date,
      } = orderData;

      const results = await query(
        `INSERT INTO orders
        (order_number, shop_id, customer_id, user_id, total_items, total_amount, delivery_charge, final_amount,
         advance_paid, balance_due, payment_status, payment_method, order_status, recipient_phone, notes, order_date)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          order_number,
          shop_id,
          customer_id || null,
          user_id || null,
          total_items,
          total_amount,
          delivery_charge || 0,
          final_amount,
          advance_paid,
          balance_due,
          payment_status,
          payment_method || null,
          order_status,
          recipient_phone || null,
          notes || null,
          order_date,
        ]
      );

      const orderId = (results as any).insertId;
      logger.info('Order created successfully', { orderId, order_number });
      return orderId;
    } catch (error) {
      logger.error('Error creating order:', error);
      throw error;
    }
  }

  /**
   * Update order
   */
  async updateOrder(orderId: number, shopId: number, orderData: Partial<Omit<Order, 'order_id' | 'created_at' | 'updated_at' | 'shop_id'>>): Promise<boolean> {
    try {
      // Verify ownership first
      const ownership = await query(
        'SELECT order_id FROM orders WHERE order_id = ? AND shop_id = ?',
        [orderId, shopId]
      );
      if ((ownership as any[]).length === 0) {
        logger.warn('Order not found or does not belong to shop', { orderId, shopId });
        return false;
      }

      const fields: string[] = [];
      const values: any[] = [];

      const updateableFields: (keyof Omit<Order, 'order_id' | 'created_at' | 'updated_at' | 'shop_id'>)[] = [
        'order_number',
        'customer_id',
        'total_items',
        'total_amount',
        'delivery_charge',
        'final_amount',
        'advance_paid',
        'balance_due',
        'payment_status',
        'payment_method',
        'order_status',
        'recipient_phone',
        'notes',
        'tracking_number',
      ];

      for (const field of updateableFields) {
        if (field in orderData) {
          fields.push(`${field} = ?`);
          values.push(orderData[field]);
        }
      }

      // Handle delivery_address separately (it's a JSON field)
      if ('delivery_address' in orderData) {
        fields.push('delivery_address = ?');
        values.push(JSON.stringify(orderData.delivery_address));
      }

      if (fields.length === 0) {
        logger.warn('No fields to update');
        return false;
      }

      fields.push('updated_at = NOW()');
      values.push(orderId);
      values.push(shopId);

      const sql = `UPDATE orders SET ${fields.join(', ')} WHERE order_id = ? AND shop_id = ?`;
      const results = await query(sql, values);
      const affectedRows = (results as any).affectedRows;

      logger.info('Order updated successfully', { orderId, shopId, affectedRows });
      return affectedRows > 0;
    } catch (error) {
      logger.error('Error updating order:', error);
      throw error;
    }
  }

  /**
   * Record payment for an order
   * Note: Calculations now include delivery_charge in the grand total
   */
  async recordPayment(orderId: number, shopId: number, amountPaid: number, paymentType: 'advance' | 'balance' | 'full'): Promise<boolean> {
    try {
      // Get current order data
      const order = await this.getOrderById(orderId, shopId);
      if (!order) throw new Error('Order not found');

      // Calculate grand total including delivery charge
      const grandTotal = order.total_amount + (order.delivery_charge || 0);

      let newAdvancePaid = order.advance_paid;
      let newBalanceDue = order.balance_due;
      let newFinalAmount = order.final_amount;

      if (paymentType === 'advance') {
        newAdvancePaid += amountPaid;
        newFinalAmount = newAdvancePaid;
      } else if (paymentType === 'balance') {
        newBalanceDue = Math.max(0, order.balance_due - amountPaid);
        newFinalAmount = order.final_amount + amountPaid;
      } else if (paymentType === 'full') {
        // Full payment means paying the grand total (order + delivery)
        newFinalAmount = grandTotal;
        newAdvancePaid = 0;
        newBalanceDue = 0;
      }

      let paymentStatus: 'unpaid' | 'partial' | 'fully_paid' = 'unpaid';
      if (newBalanceDue <= 0) {
        paymentStatus = 'fully_paid';
      } else if (newAdvancePaid > 0 || newFinalAmount > 0) {
        paymentStatus = 'partial';
      }

      const results = await query(
        `UPDATE orders
         SET final_amount = ?, advance_paid = ?, balance_due = ?, payment_status = ?, updated_at = NOW()
         WHERE order_id = ? AND shop_id = ?`,
        [newFinalAmount, newAdvancePaid, newBalanceDue, paymentStatus, orderId, shopId]
      );

      logger.info('Payment recorded for order', { orderId, shopId, amountPaid, paymentType, newPaymentStatus: paymentStatus, grandTotal });
      return (results as any).affectedRows > 0;
    } catch (error) {
      logger.error('Error recording payment:', error);
      throw error;
    }
  }

  /**
   * Get pending/unpaid orders
   */
  async getPendingOrders(shopId?: number): Promise<Order[]> {
    try {
      let sql = "SELECT * FROM orders WHERE payment_status != 'fully_paid' ORDER BY created_at DESC";
      let params: any[] = [];

      if (shopId) {
        sql = "SELECT * FROM orders WHERE shop_id = ? AND payment_status != 'fully_paid' ORDER BY created_at DESC";
        params = [shopId];
      }

      const results = await query(sql, params);
      logger.debug('Retrieved pending orders', { count: (results as any[]).length, shopId });
      return results as Order[];
    } catch (error) {
      logger.error('Error fetching pending orders:', error);
      throw error;
    }
  }

  /**
   * Get order summary for a date range
   */
  async getOrderSummary(shopId: number, startDate: Date, endDate: Date): Promise<any> {
    try {
      const results = await query(
        `SELECT
         COUNT(*) as total_orders,
         SUM(total_amount) as total_revenue,
         SUM(total_paid) as total_collected,
         SUM(remaining_amount) as total_pending,
         COUNT(CASE WHEN payment_status = 'fully_paid' THEN 1 END) as fully_paid_count
         FROM orders
         WHERE shop_id = ? AND order_date BETWEEN ? AND ?`,
        [shopId, startDate, endDate]
      );

      const summary = (results as any[])[0];
      logger.debug('Retrieved order summary', { shopId, startDate, endDate });
      return summary;
    } catch (error) {
      logger.error('Error fetching order summary:', error);
      throw error;
    }
  }
}

export default new OrderModel();
