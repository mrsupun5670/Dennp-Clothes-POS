/**
 * Customer Model
 * Handles all database queries and operations for customers table
 */

import { query } from '../config/database';
import { logger } from '../utils/logger';

export interface Customer {
  customer_id: number;
  shop_id: number;
  first_name: string;
  last_name: string;
  mobile: string;
  email?: string;
  orders_count: number;
  customer_status: 'active' | 'inactive' | 'blocked';
  total_spent: number;
  created_at: Date;
}

class CustomerModel {
  /**
   * Get all customers for a shop
   */
  async getAllCustomers(shopId: number): Promise<Customer[]> {
    try {
      const results = await query('SELECT * FROM customers WHERE shop_id = ? ORDER BY created_at DESC', [shopId]);
      logger.info('Retrieved all customers', { shopId, count: (results as any[]).length });
      return results as Customer[];
    } catch (error) {
      logger.error('Error fetching all customers:', error);
      throw error;
    }
  }

  /**
   * Get customer by ID
   */
  async getCustomerById(customerId: number, shopId: number): Promise<Customer | null> {
    try {
      const results = await query('SELECT * FROM customers WHERE customer_id = ? AND shop_id = ?', [customerId, shopId]);
      const customer = (results as Customer[])[0] || null;
      logger.debug('Retrieved customer by ID', { customerId, shopId });
      return customer;
    } catch (error) {
      logger.error('Error fetching customer by ID:', error);
      throw error;
    }
  }

  /**
   * Get customer by mobile number
   */
  async getCustomerByMobile(mobile: string, shopId: number): Promise<Customer | null> {
    try {
      const results = await query('SELECT * FROM customers WHERE mobile = ? AND shop_id = ?', [mobile, shopId]);
      const customer = (results as Customer[])[0] || null;
      logger.debug('Retrieved customer by mobile', { mobile, shopId });
      return customer;
    } catch (error) {
      logger.error('Error fetching customer by mobile:', error);
      throw error;
    }
  }

  /**
   * Create new customer
   */
  async createCustomer(shopId: number, customerData: Omit<Customer, 'customer_id' | 'created_at' | 'orders_count' | 'total_spent' | 'shop_id'>): Promise<number> {
    try {
      const { first_name, last_name, mobile, email, customer_status } = customerData;

      const results = await query(
        `INSERT INTO customers (shop_id, first_name, last_name, mobile, email, customer_status, orders_count, total_spent)
         VALUES (?, ?, ?, ?, ?, ?, 0, 0)`,
        [shopId, first_name, last_name, mobile, email || null, customer_status]
      );

      const customerId = (results as any).insertId;
      logger.info('Customer created successfully', { customerId, shopId, mobile });
      return customerId;
    } catch (error) {
      logger.error('Error creating customer:', error);
      throw error;
    }
  }

  /**
   * Create new customer with specific customer_id
   */
  async createCustomerWithId(shopId: number, customerId: number, customerData: Omit<Customer, 'customer_id' | 'created_at' | 'orders_count' | 'total_spent' | 'shop_id'>): Promise<number> {
    try {
      const { mobile, email } = customerData;

      await query(
        `INSERT INTO customers (customer_id, shop_id, mobile, email)
         VALUES (?, ?, ?, ?)`,
        [customerId, shopId, mobile, email || null]
      );

      logger.info('Customer created successfully with specific ID', { customerId, shopId, mobile });
      return customerId;
    } catch (error) {
      logger.error('Error creating customer with ID:', error);
      throw error;
    }
  }

  /**
   * Update customer
   */
  async updateCustomer(customerId: number, shopId: number, customerData: Partial<Omit<Customer, 'customer_id' | 'created_at' | 'orders_count' | 'total_spent' | 'shop_id'>>): Promise<boolean> {
    try {
      // Verify ownership first
      const ownership = await query(
        'SELECT customer_id FROM customers WHERE customer_id = ? AND shop_id = ?',
        [customerId, shopId]
      );
      if ((ownership as any[]).length === 0) {
        logger.warn('Customer not found or does not belong to shop', { customerId, shopId });
        return false;
      }

      // Validate mobile number if provided
      if ('mobile' in customerData && customerData.mobile) {
        const mobileRegex = /^[0-9\-\+\s]{7,}$/;
        if (!mobileRegex.test(customerData.mobile)) {
          const error = new Error('Invalid mobile number format');
          (error as any).statusCode = 400;
          throw error;
        }
      }

      // Validate email if provided
      if ('email' in customerData && customerData.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(customerData.email)) {
          const error = new Error('Invalid email format');
          (error as any).statusCode = 400;
          throw error;
        }
      }

      const fields: string[] = [];
      const values: any[] = [];

      const updateableFields: (keyof Omit<Customer, 'customer_id' | 'created_at' | 'orders_count' | 'total_spent' | 'shop_id'>)[] = [
        'first_name',
        'last_name',
        'mobile',
        'email',
        'customer_status',
      ];

      for (const field of updateableFields) {
        if (field in customerData) {
          fields.push(`${field} = ?`);
          values.push(customerData[field]);
        }
      }

      if (fields.length === 0) return false;

      values.push(customerId);
      values.push(shopId);

      const results = await query(`UPDATE customers SET ${fields.join(', ')} WHERE customer_id = ? AND shop_id = ?`, values);
      const affectedRows = (results as any).affectedRows;

      logger.info('Customer updated successfully', { customerId, shopId, affectedRows, updatedFields: fields.length });
      return affectedRows > 0;
    } catch (error) {
      logger.error('Error updating customer:', error);
      throw error;
    }
  }

  /**
   * Update customer order count and total spent
   * Called after each order is created/updated
   */
  async updateCustomerStats(customerId: number, shopId: number): Promise<boolean> {
    try {
      const results = await query(
        `UPDATE customers
         SET orders_count = (SELECT COUNT(*) FROM orders WHERE customer_id = ? AND shop_id = ?),
             total_spent = (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE customer_id = ? AND shop_id = ? AND order_status = 'completed')
         WHERE customer_id = ? AND shop_id = ?`,
        [customerId, shopId, customerId, shopId, customerId, shopId]
      );

      logger.debug('Customer stats updated', { customerId, shopId });
      return (results as any).affectedRows > 0;
    } catch (error) {
      logger.error('Error updating customer stats:', error);
      throw error;
    }
  }

  /**
   * Search customers by name or mobile
   */
  async searchCustomers(shopId: number, searchTerm: string): Promise<Customer[]> {
    try {
      const searchPattern = `%${searchTerm}%`;
      const results = await query(
        'SELECT * FROM customers WHERE shop_id = ? AND (customer_name LIKE ? OR mobile LIKE ?) ORDER BY customer_name ASC',
        [shopId, searchPattern, searchPattern]
      );

      logger.debug('Searched customers', { shopId, searchTerm, count: (results as any[]).length });
      return results as Customer[];
    } catch (error) {
      logger.error('Error searching customers:', error);
      throw error;
    }
  }

  /**
   * Get active customers with pagination
   */
  async getActiveCustomers(shopId: number, page: number = 1, limit: number = 10): Promise<{ customers: Customer[]; total: number }> {
    try {
      const offset = (page - 1) * limit;

      const customers = await query(
        'SELECT * FROM customers WHERE shop_id = ? AND customer_status = "active" ORDER BY created_at DESC LIMIT ?, ?',
        [shopId, offset, limit]
      );

      const countResults = await query('SELECT COUNT(*) as total FROM customers WHERE shop_id = ? AND customer_status = "active"', [shopId]);
      const total = (countResults as any)[0].total;

      logger.debug('Retrieved active customers', { shopId, page, limit, count: (customers as any[]).length, total });
      return { customers: customers as Customer[], total };
    } catch (error) {
      logger.error('Error fetching active customers:', error);
      throw error;
    }
  }

  /**
   * Get top customers by spending
   */
  async getTopCustomers(shopId: number, limit: number = 10): Promise<Customer[]> {
    try {
      const results = await query('SELECT * FROM customers WHERE shop_id = ? ORDER BY total_spent DESC LIMIT ?', [shopId, limit]);
      logger.debug('Retrieved top customers by spending', { shopId, limit, count: (results as any[]).length });
      return results as Customer[];
    } catch (error) {
      logger.error('Error fetching top customers:', error);
      throw error;
    }
  }

  /**
   * Block customer (soft delete)
   */
  async blockCustomer(customerId: number, shopId: number): Promise<boolean> {
    try {
      const results = await query('UPDATE customers SET customer_status = "blocked" WHERE customer_id = ? AND shop_id = ?', [customerId, shopId]);
      logger.info('Customer blocked', { customerId, shopId });
      return (results as any).affectedRows > 0;
    } catch (error) {
      logger.error('Error blocking customer:', error);
      throw error;
    }
  }
}

export default new CustomerModel();
