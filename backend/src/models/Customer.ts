/**
 * Customer Model
 * Handles all database queries and operations for customers table
 */

import { query } from '../config/database';
import { logger } from '../utils/logger';

export interface Customer {
  customer_id: number;
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
   * Get all customers
   */
  async getAllCustomers(): Promise<Customer[]> {
    try {
      const results = await query('SELECT * FROM customers ORDER BY created_at DESC');
      logger.info('Retrieved all customers', { count: (results as any[]).length });
      return results as Customer[];
    } catch (error) {
      logger.error('Error fetching all customers:', error);
      throw error;
    }
  }

  /**
   * Get customer by ID
   */
  async getCustomerById(customerId: number): Promise<Customer | null> {
    try {
      const results = await query('SELECT * FROM customers WHERE customer_id = ?', [customerId]);
      const customer = (results as Customer[])[0] || null;
      logger.debug('Retrieved customer by ID', { customerId });
      return customer;
    } catch (error) {
      logger.error('Error fetching customer by ID:', error);
      throw error;
    }
  }

  /**
   * Get customer by mobile number
   */
  async getCustomerByMobile(mobile: string): Promise<Customer | null> {
    try {
      const results = await query('SELECT * FROM customers WHERE mobile = ?', [mobile]);
      const customer = (results as Customer[])[0] || null;
      logger.debug('Retrieved customer by mobile', { mobile });
      return customer;
    } catch (error) {
      logger.error('Error fetching customer by mobile:', error);
      throw error;
    }
  }

  /**
   * Create new customer
   */
  async createCustomer(customerData: Omit<Customer, 'customer_id' | 'created_at' | 'orders_count' | 'total_spent'>): Promise<number> {
    try {
      const { first_name, last_name, mobile, email, customer_status } = customerData;

      const results = await query(
        `INSERT INTO customers (first_name, last_name, mobile, email, customer_status, orders_count, total_spent)
         VALUES (?, ?, ?, ?, ?, 0, 0)`,
        [first_name, last_name, mobile, email || null, customer_status]
      );

      const customerId = (results as any).insertId;
      logger.info('Customer created successfully', { customerId, mobile });
      return customerId;
    } catch (error) {
      logger.error('Error creating customer:', error);
      throw error;
    }
  }

  /**
   * Update customer
   */
  async updateCustomer(customerId: number, customerData: Partial<Omit<Customer, 'customer_id' | 'created_at' | 'orders_count' | 'total_spent'>>): Promise<boolean> {
    try {
      const fields: string[] = [];
      const values: any[] = [];

      const updateableFields: (keyof Omit<Customer, 'customer_id' | 'created_at' | 'orders_count' | 'total_spent'>)[] = [
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

      const results = await query(`UPDATE customers SET ${fields.join(', ')} WHERE customer_id = ?`, values);
      const affectedRows = (results as any).affectedRows;

      logger.info('Customer updated successfully', { customerId, affectedRows });
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
  async updateCustomerStats(customerId: number): Promise<boolean> {
    try {
      const results = await query(
        `UPDATE customers
         SET orders_count = (SELECT COUNT(*) FROM orders WHERE customer_id = ?),
             total_spent = (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE customer_id = ? AND order_status = 'completed')
         WHERE customer_id = ?`,
        [customerId, customerId, customerId]
      );

      logger.debug('Customer stats updated', { customerId });
      return (results as any).affectedRows > 0;
    } catch (error) {
      logger.error('Error updating customer stats:', error);
      throw error;
    }
  }

  /**
   * Search customers by name or mobile
   */
  async searchCustomers(searchTerm: string): Promise<Customer[]> {
    try {
      const searchPattern = `%${searchTerm}%`;
      const results = await query(
        'SELECT * FROM customers WHERE (first_name LIKE ? OR last_name LIKE ? OR mobile LIKE ?) AND customer_status = "active" ORDER BY first_name ASC',
        [searchPattern, searchPattern, searchPattern]
      );

      logger.debug('Searched customers', { searchTerm, count: (results as any[]).length });
      return results as Customer[];
    } catch (error) {
      logger.error('Error searching customers:', error);
      throw error;
    }
  }

  /**
   * Get active customers with pagination
   */
  async getActiveCustomers(page: number = 1, limit: number = 10): Promise<{ customers: Customer[]; total: number }> {
    try {
      const offset = (page - 1) * limit;

      const customers = await query(
        'SELECT * FROM customers WHERE customer_status = "active" ORDER BY created_at DESC LIMIT ?, ?',
        [offset, limit]
      );

      const countResults = await query('SELECT COUNT(*) as total FROM customers WHERE customer_status = "active"');
      const total = (countResults as any)[0].total;

      logger.debug('Retrieved active customers', { page, limit, count: (customers as any[]).length, total });
      return { customers: customers as Customer[], total };
    } catch (error) {
      logger.error('Error fetching active customers:', error);
      throw error;
    }
  }

  /**
   * Get top customers by spending
   */
  async getTopCustomers(limit: number = 10): Promise<Customer[]> {
    try {
      const results = await query('SELECT * FROM customers ORDER BY total_spent DESC LIMIT ?', [limit]);
      logger.debug('Retrieved top customers by spending', { limit, count: (results as any[]).length });
      return results as Customer[];
    } catch (error) {
      logger.error('Error fetching top customers:', error);
      throw error;
    }
  }

  /**
   * Block customer (soft delete)
   */
  async blockCustomer(customerId: number): Promise<boolean> {
    try {
      const results = await query('UPDATE customers SET customer_status = "blocked" WHERE customer_id = ?', [customerId]);
      logger.info('Customer blocked', { customerId });
      return (results as any).affectedRows > 0;
    } catch (error) {
      logger.error('Error blocking customer:', error);
      throw error;
    }
  }
}

export default new CustomerModel();
