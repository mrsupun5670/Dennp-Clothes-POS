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
  order_status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  notes?: string;
  tracking_number?: string | null;
  created_at: string;
  updated_at?: string;
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
  customer_mobile?: string;
}

class OrderModel {
  /**
   * Get all orders
   */
  async getAllOrders(shopId?: number): Promise<Order[]> {
    try {
      let sql = `
        SELECT o.*,
               COALESCE(c.mobile, o.recipient_phone) as customer_mobile,
               GROUP_CONCAT(DISTINCT p.payment_method SEPARATOR ', ') as payment_method
        FROM orders o
        LEFT JOIN customers c ON o.customer_id = c.customer_id
        LEFT JOIN payments p ON o.order_id = p.order_id
        GROUP BY o.order_id
        ORDER BY o.created_at DESC
      `;
      let params: any[] = [];

      if (shopId) {
        sql = `
          SELECT o.*,
                 COALESCE(c.mobile, o.recipient_phone) as customer_mobile,
                 GROUP_CONCAT(DISTINCT p.payment_method SEPARATOR ', ') as payment_method
          FROM orders o
          LEFT JOIN customers c ON o.customer_id = c.customer_id
          LEFT JOIN payments p ON o.order_id = p.order_id
          WHERE o.shop_id = ?
          GROUP BY o.order_id
          ORDER BY o.created_at DESC
        `;
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
        order_status,
        recipient_phone,
        notes,
      } = orderData;

      // Get Sri Lankan timezone datetime
      const sriLankanDate = new Date().toLocaleString("en-US", { timeZone: "Asia/Colombo" });
      const dateObj = new Date(sriLankanDate);
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, "0");
      const day = String(dateObj.getDate()).padStart(2, "0");
      const hours = String(dateObj.getHours()).padStart(2, "0");
      const minutes = String(dateObj.getMinutes()).padStart(2, "0");
      const seconds = String(dateObj.getSeconds()).padStart(2, "0");
      const created_at = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

      const results = await query(
        `INSERT INTO orders
        (order_number, shop_id, customer_id, user_id, total_items, total_amount, delivery_charge, final_amount,
         advance_paid, balance_due, payment_status, order_status, recipient_phone, notes, created_at, updated_at)
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
          order_status,
          recipient_phone || null,
          notes || null,
          created_at,
          created_at,
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
        // 'delivery_charge', // Handled specially below to add to balance_due
        'final_amount',
        'advance_paid',
        // 'balance_due', // Calculated by backend, not updated directly
        // 'payment_status', // Set by backend based on payment calculations
        'order_status',
        'recipient_phone',
        'recipient_phone1',
        'recipient_name',
        'delivery_line1',
        'delivery_line2',
        'delivery_city',
        'delivery_district',
        'delivery_province',
        'delivery_postal_code',
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


      // SIMPLE LOGIC: If delivery_charge is being added, add it to balance_due and set status to partial
      logger.info('=== DELIVERY CHARGE DEBUG ===', {
        orderId,
        hasDeliveryCharge: 'delivery_charge' in orderData,
        deliveryChargeValue: orderData.delivery_charge,
        deliveryChargeType: typeof orderData.delivery_charge
      });
      
      if ('delivery_charge' in orderData && typeof orderData.delivery_charge === 'number' && orderData.delivery_charge > 0) {
        // Get current order to get current balance_due
        const currentOrder = await this.getOrderById(orderId, shopId);
        if (currentOrder) {
          // IMPORTANT: Convert balance_due to number (it comes from DB as string)
          const currentBalance = parseFloat(currentOrder.balance_due as any) || 0;
          const deliveryCharge = orderData.delivery_charge;
          const newBalance = currentBalance + deliveryCharge;
          
          // Add delivery_charge field itself
          fields.push('delivery_charge = ?');
          values.push(deliveryCharge);
          
          // Add balance_due update to the query
          fields.push('balance_due = ?');
          values.push(newBalance);
          
          // Set payment_status to partial
          fields.push('payment_status = ?');
          values.push('partial');
          
          logger.error('DELIVERY CHARGE: ' + JSON.stringify({
            orderId,
            deliveryCharge,
            oldBalance: currentBalance,
            newBalance
          }));
        }
      }

      if (fields.length === 0) {
        logger.warn('No fields to update');
        return false;
      }

      // Get Sri Lankan timezone datetime for updated_at
      const sriLankanDate = new Date().toLocaleString("en-US", { timeZone: "Asia/Colombo" });
      const dateObj = new Date(sriLankanDate);
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, "0");
      const day = String(dateObj.getDate()).padStart(2, "0");
      const hours = String(dateObj.getHours()).padStart(2, "0");
      const minutes = String(dateObj.getMinutes()).padStart(2, "0");
      const seconds = String(dateObj.getSeconds()).padStart(2, "0");
      const updated_at = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

      fields.push('updated_at = ?');
      values.push(updated_at);
      values.push(orderId);
      values.push(shopId);

      const sql = `UPDATE orders SET ${fields.join(', ')} WHERE order_id = ? AND shop_id = ?`;
      
      logger.error('SQL QUERY: ' + sql);
      logger.error('SQL VALUES: ' + JSON.stringify(values));
      
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
   * Recalculate payment status when delivery_charge is added
   * Calculates: balance_due = (total_amount + delivery_charge) - final_amount
   */
  async recalculatePaymentStatus(orderId: number, shopId: number): Promise<boolean> {
    try {
      // Get current order
      const order = await this.getOrderById(orderId, shopId);
      if (!order) {
        logger.warn('Order not found for payment recalculation', { orderId, shopId });
        return false;
      }

      // Calculate grand total including delivery charge
      const grandTotal = order.total_amount + (order.delivery_charge || 0);
      
      // Calculate balance due: grand total minus what's been paid (final_amount)
      const totalPaid = order.final_amount || 0;
      const newBalanceDue = Math.max(0, grandTotal - totalPaid);

      // Determine payment status
      let paymentStatus: 'unpaid' | 'partial' | 'fully_paid';
      if (totalPaid === 0) {
        paymentStatus = 'unpaid';
      } else if (newBalanceDue > 0) {
        paymentStatus = 'partial';
      } else {
        paymentStatus = 'fully_paid';
      }

      // Get Sri Lankan timezone datetime for updated_at
      const sriLankanDate = new Date().toLocaleString("en-US", { timeZone: "Asia/Colombo" });
      const dateObj = new Date(sriLankanDate);
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, "0");
      const day = String(dateObj.getDate()).padStart(2, "0");
      const hours = String(dateObj.getHours()).padStart(2, "0");
      const minutes = String(dateObj.getMinutes()).padStart(2, "0");
      const seconds = String(dateObj.getSeconds()).padStart(2, "0");
      const updated_at = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

      // Update balance_due and payment_status
      const results = await query(
        `UPDATE orders
         SET balance_due = ?,
             payment_status = ?,
             updated_at = ?
         WHERE order_id = ? AND shop_id = ?`,
        [newBalanceDue, paymentStatus, updated_at, orderId, shopId]
      );

      const affectedRows = (results as any).affectedRows;
      logger.info('Payment status recalculated', {
        orderId,
        grandTotal,
        totalPaid,
        newBalanceDue,
        paymentStatus,
        affectedRows
      });

      return affectedRows > 0;
    } catch (error) {
      logger.error('Error recalculating payment status:', error);
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
         WHERE shop_id = ? AND DATE(created_at) BETWEEN DATE(?) AND DATE(?)`,
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

  /**
   * Generate next order number
   * Start from 0001000 if no orders exist, otherwise increment last order number by 1
   */
  async generateOrderNumber(shopId: number): Promise<string> {
    try {
      const results = await query(
        `SELECT order_number, order_id FROM orders WHERE shop_id = ? ORDER BY order_id DESC LIMIT 1`,
        [shopId]
      );

      let newOrderNumber: string;

      if ((results as any[]).length === 0) {
        // No orders exist, start from 0001000
        newOrderNumber = '0001000';
      } else {
        const lastOrderNumber = (results as any[])[0].order_number;
        const lastOrderId = (results as any[])[0].order_id;

        // Parse the last order number and increment by 1
        const lastNumber = parseInt(lastOrderNumber, 10);

        // Check if the order number is a timestamp (more than 7 digits) or invalid
        if (isNaN(lastNumber) || lastNumber > 9999999) {
          // Use order_id as base for proper order number
          // Start from 0001000 + order_id to ensure uniqueness
          newOrderNumber = String(1000000 + lastOrderId + 1).padStart(7, '0');
        } else {
          // Increment by 1 and pad with zeros to maintain 7 digits
          const nextNumber = lastNumber + 1;
          newOrderNumber = String(nextNumber).padStart(7, '0');
        }
      }

      logger.info('Generated order number', { shopId, newOrderNumber });
      return newOrderNumber;
    } catch (error) {
      logger.error('Error generating order number:', error);
      throw error;
    }
  }
}

export default new OrderModel();
