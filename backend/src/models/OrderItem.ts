/**
 * OrderItem Model
 * Handles all database queries and operations for order_items table
 */

import { query } from '../config/database';
import { logger } from '../utils/logger';

export interface OrderItem {
  item_id: number;
  order_id: number;
  product_id: string;
  color_id?: number;
  size_id?: number;
  quantity: number;
  sold_price: number;
  total_price: number;
  created_at: Date;
}

class OrderItemModel {
  /**
   * Get all order items for an order
   */
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    try {
      const results = await query('SELECT * FROM order_items WHERE order_id = ? ORDER BY item_id ASC', [orderId]);
      logger.debug('Retrieved order items', { orderId, count: (results as any[]).length });
      return results as OrderItem[];
    } catch (error) {
      logger.error('Error fetching order items:', error);
      throw error;
    }
  }

  /**
   * Get order item by ID
   */
  async getOrderItemById(itemId: number): Promise<OrderItem | null> {
    try {
      const results = await query('SELECT * FROM order_items WHERE item_id = ?', [itemId]);
      const item = (results as OrderItem[])[0] || null;
      logger.debug('Retrieved order item by ID', { itemId });
      return item;
    } catch (error) {
      logger.error('Error fetching order item by ID:', error);
      throw error;
    }
  }

  /**
   * Create new order item
   */
  async createOrderItem(itemData: Omit<OrderItem, 'item_id' | 'created_at'>): Promise<number> {
    try {
      const { order_id, product_id, color_id, size_id, quantity, sold_price, total_price } = itemData;

      const results = await query(
        `INSERT INTO order_items (order_id, product_id, color_id, size_id, quantity, sold_price, total_price)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [order_id, product_id, color_id || null, size_id || null, quantity, sold_price, total_price]
      );

      const itemId = (results as any).insertId;
      logger.info('Order item created successfully', { itemId, order_id, product_id });
      return itemId;
    } catch (error) {
      logger.error('Error creating order item:', error);
      throw error;
    }
  }

  /**
   * Create multiple order items
   */
  async createOrderItems(items: Array<Omit<OrderItem, 'item_id' | 'created_at'>>): Promise<number[]> {
    try {
      const itemIds: number[] = [];

      for (const item of items) {
        const itemId = await this.createOrderItem(item);
        itemIds.push(itemId);
      }

      logger.info('Multiple order items created successfully', { count: itemIds.length });
      return itemIds;
    } catch (error) {
      logger.error('Error creating multiple order items:', error);
      throw error;
    }
  }

  /**
   * Update order item
   */
  async updateOrderItem(itemId: number, itemData: Partial<Omit<OrderItem, 'item_id' | 'created_at'>>): Promise<boolean> {
    try {
      const fields: string[] = [];
      const values: any[] = [];

      const updateableFields: (keyof Omit<OrderItem, 'item_id' | 'created_at'>)[] = ['quantity', 'sold_price', 'total_price'];

      for (const field of updateableFields) {
        if (field in itemData) {
          fields.push(`${field} = ?`);
          values.push(itemData[field]);
        }
      }

      if (fields.length === 0) return false;

      values.push(itemId);

      const results = await query(`UPDATE order_items SET ${fields.join(', ')} WHERE item_id = ?`, values);
      const affectedRows = (results as any).affectedRows;

      logger.info('Order item updated successfully', { itemId, affectedRows });
      return affectedRows > 0;
    } catch (error) {
      logger.error('Error updating order item:', error);
      throw error;
    }
  }

  /**
   * Delete order item
   */
  async deleteOrderItem(itemId: number): Promise<boolean> {
    try {
      const results = await query('DELETE FROM order_items WHERE item_id = ?', [itemId]);
      const affectedRows = (results as any).affectedRows;

      logger.info('Order item deleted', { itemId });
      return affectedRows > 0;
    } catch (error) {
      logger.error('Error deleting order item:', error);
      throw error;
    }
  }

  /**
   * Get order items with product details
   */
  async getOrderItemsWithDetails(orderId: number): Promise<any[]> {
    try {
      const results = await query(
        `SELECT
         oi.item_id,
         oi.order_id,
         oi.product_id,
         oi.color_id,
         oi.size_id,
         oi.quantity,
         oi.sold_price,
         oi.total_price,
         p.product_name,
         p.product_cost,
         p.print_cost,
         p.sewing_cost,
         p.extra_cost,
         c.color_name,
         s.size_name
         FROM order_items oi
         JOIN products p ON oi.product_id = p.product_id
         LEFT JOIN colors c ON oi.color_id = c.color_id
         LEFT JOIN sizes s ON oi.size_id = s.size_id
         WHERE oi.order_id = ?
         ORDER BY oi.item_id ASC`,
        [orderId]
      );

      logger.debug('Retrieved order items with details', { orderId, count: (results as any[]).length });
      return results as any[];
    } catch (error) {
      logger.error('Error fetching order items with details:', error);
      throw error;
    }
  }

  /**
   * Get order items GROUPED by product_id and sold_price
   * This reduces the number of rows by combining items with same product and price
   * Includes detailed cost breakdowns and profit calculations
   */
  async getOrderItemsGrouped(orderId: number): Promise<any[]> {
    try {
      const results = await query(
        `SELECT
         oi.product_id,
         p.product_name,
         oi.sold_price as unit_price,
         SUM(oi.quantity) as total_quantity,
         p.product_cost,
         p.print_cost,
         p.sewing_cost,
         p.extra_cost,
         (p.product_cost * SUM(oi.quantity)) as total_product_cost,
         (p.print_cost * SUM(oi.quantity)) as total_print_cost,
         (p.sewing_cost * SUM(oi.quantity)) as total_sewing_cost,
         (p.extra_cost * SUM(oi.quantity)) as total_extra_cost,
         ((p.product_cost + p.print_cost + p.sewing_cost + p.extra_cost) * SUM(oi.quantity)) as total_cost,
         SUM(oi.total_price) as total_sold,
         (SUM(oi.total_price) - ((p.product_cost + p.print_cost + p.sewing_cost + p.extra_cost) * SUM(oi.quantity))) as profit
         FROM order_items oi
         JOIN products p ON oi.product_id = p.product_id
         WHERE oi.order_id = ?
         GROUP BY oi.product_id, oi.sold_price
         ORDER BY oi.product_id, oi.sold_price`,
        [orderId]
      );

      logger.debug('Retrieved grouped order items', { orderId, count: (results as any[]).length });
      return results as any[];
    } catch (error) {
      logger.error('Error fetching grouped order items:', error);
      throw error;
    }
  }

  /**
   * Get items sold for a product
   */
  async getItemsSoldByProduct(productId: number, days: number = 30): Promise<any> {
    try {
      const results = await query(
        `SELECT
         COUNT(*) as total_units,
         SUM(total_price) as total_revenue
         FROM order_items oi
         JOIN orders o ON oi.order_id = o.order_id
         WHERE oi.product_id = ? AND o.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)`,
        [productId, days]
      );

      const stats = (results as any[])[0] || { total_units: 0, total_revenue: 0 };
      logger.debug('Retrieved product sales stats', { productId, days });
      return stats;
    } catch (error) {
      logger.error('Error fetching product sales stats:', error);
      throw error;
    }
  }

  /**
   * Delete all items for an order
   */
  async deleteOrderItems(orderId: number): Promise<number> {
    try {
      const results = await query('DELETE FROM order_items WHERE order_id = ?', [orderId]);
      const affectedRows = (results as any).affectedRows;

      logger.info('Order items deleted', { orderId, count: affectedRows });
      return affectedRows;
    } catch (error) {
      logger.error('Error deleting order items:', error);
      throw error;
    }
  }
}

export default new OrderItemModel();
