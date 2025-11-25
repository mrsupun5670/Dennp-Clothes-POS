/**
 * Analytics Model
 * Handles all database queries for analytics and reporting
 */

import { query } from '../config/database';
import { logger } from '../utils/logger';

export interface SalesAnalysisData {
  date: string;
  sales: number;
  cost: number;
  profit: number;
}

export interface TopSellingItem {
  rank?: number;
  productCode: string;
  productName: string;
  unitsSold: number;
  revenue: number;
}

export interface TopCustomer {
  rank?: number;
  customerId: number;
  customerName: string;
  totalSpent: number;
  orders: number;
}

export interface SalesMetrics {
  totalSales: number;
  totalCost: number;
  totalProfit: number;
  avgDaily: number;
  profitMargin: number;
  daysInPeriod: number;
  bestDay: {
    date: string;
    sales: number;
  } | null;
  worstDay: {
    date: string;
    sales: number;
  } | null;
}

class AnalyticsModel {
  /**
   * Get sales analysis for a date range
   */
  async getSalesAnalysis(
    shopId: number,
    startDate: string,
    endDate: string
  ): Promise<SalesAnalysisData[]> {
    try {
      const results = await query(
        `SELECT DATE(o.order_date) as date,
                SUM(o.total_amount) as sales,
                SUM(oi.quantity * p.product_cost) as cost,
                (SUM(o.total_amount) - SUM(oi.quantity * p.product_cost)) as profit
         FROM orders o
         LEFT JOIN order_items oi ON o.order_id = oi.order_id
         LEFT JOIN products p ON oi.product_id = p.product_id
         WHERE o.shop_id = ?
         AND DATE(o.order_date) >= ?
         AND DATE(o.order_date) <= ?
         AND o.order_status != 'cancelled'
         GROUP BY DATE(o.order_date)
         ORDER BY DATE(o.order_date) ASC`,
        [shopId, startDate, endDate]
      );

      logger.debug('Retrieved sales analysis', { shopId, startDate, endDate, count: (results as any[]).length });
      return (results as any[]).map(row => ({
        date: row.date,
        sales: parseFloat(row.sales) || 0,
        cost: parseFloat(row.cost) || 0,
        profit: parseFloat(row.profit) || 0,
      }));
    } catch (error) {
      logger.error('Error fetching sales analysis:', error);
      throw error;
    }
  }

  /**
   * Get top selling items for a date range
   */
  async getTopSellingItems(
    shopId: number,
    startDate: string,
    endDate: string,
    limit: number = 10
  ): Promise<TopSellingItem[]> {
    try {
      const results = await query(
        `SELECT p.sku as productCode,
                p.product_name as productName,
                SUM(oi.quantity) as unitsSold,
                SUM(oi.total_price) as revenue
         FROM order_items oi
         JOIN orders o ON oi.order_id = o.order_id
         JOIN products p ON oi.product_id = p.product_id
         WHERE o.shop_id = ?
         AND DATE(o.order_date) >= ?
         AND DATE(o.order_date) <= ?
         AND o.order_status != 'cancelled'
         GROUP BY oi.product_id
         ORDER BY unitsSold DESC
         LIMIT ?`,
        [shopId, startDate, endDate, limit]
      );

      logger.debug('Retrieved top selling items', { shopId, limit, count: (results as any[]).length });
      return (results as any[]).map((row, index) => ({
        rank: index + 1,
        productCode: row.productCode,
        productName: row.productName,
        unitsSold: parseInt(row.unitsSold) || 0,
        revenue: parseFloat(row.revenue) || 0,
      }));
    } catch (error) {
      logger.error('Error fetching top selling items:', error);
      throw error;
    }
  }

  /**
   * Get top customers by spending
   */
  async getTopCustomers(shopId: number, limit: number = 5): Promise<TopCustomer[]> {
    try {
      const results = await query(
        `SELECT c.customer_id as customerId,
                CONCAT(COALESCE(c.first_name, ''), ' ', COALESCE(c.last_name, '')) as customerName,
                COALESCE(c.total_spent, 0) as totalSpent,
                COUNT(DISTINCT o.order_id) as orders
         FROM customers c
         LEFT JOIN orders o ON c.customer_id = o.customer_id
         WHERE c.shop_id = ?
         GROUP BY c.customer_id
         ORDER BY c.total_spent DESC
         LIMIT ?`,
        [shopId, limit]
      );

      logger.debug('Retrieved top customers', { shopId, limit, count: (results as any[]).length });
      return (results as any[]).map((row, index) => ({
        rank: index + 1,
        customerId: row.customerId,
        customerName: row.customerName.trim(),
        totalSpent: parseFloat(row.totalSpent) || 0,
        orders: parseInt(row.orders) || 0,
      }));
    } catch (error) {
      logger.error('Error fetching top customers:', error);
      throw error;
    }
  }

  /**
   * Get sales metrics for a date range
   */
  async getSalesMetrics(
    shopId: number,
    startDate: string,
    endDate: string
  ): Promise<SalesMetrics> {
    try {
      const results = await query(
        `SELECT SUM(o.total_amount) as totalSales,
                SUM(oi.quantity * p.product_cost) as totalCost,
                COUNT(DISTINCT DATE(o.order_date)) as daysInPeriod,
                MAX(CASE WHEN DATE(o.order_date) = (
                  SELECT DATE(order_date) FROM orders
                  WHERE shop_id = ? AND DATE(order_date) >= ? AND DATE(order_date) <= ?
                  AND order_status != 'cancelled'
                  GROUP BY DATE(order_date)
                  ORDER BY SUM(total_amount) DESC LIMIT 1
                ) THEN DATE(o.order_date) END) as bestDay,
                MAX(CASE WHEN DATE(o.order_date) = (
                  SELECT DATE(order_date) FROM orders
                  WHERE shop_id = ? AND DATE(order_date) >= ? AND DATE(order_date) <= ?
                  AND order_status != 'cancelled'
                  GROUP BY DATE(order_date)
                  ORDER BY SUM(total_amount) ASC LIMIT 1
                ) THEN DATE(o.order_date) END) as worstDay
         FROM orders o
         LEFT JOIN order_items oi ON o.order_id = oi.order_id
         LEFT JOIN products p ON oi.product_id = p.product_id
         WHERE o.shop_id = ?
         AND DATE(o.order_date) >= ?
         AND DATE(o.order_date) <= ?
         AND o.order_status != 'cancelled'`,
        [shopId, startDate, endDate, shopId, startDate, endDate, shopId, startDate, endDate]
      );

      const row = (results as any[])[0];
      const totalSales = parseFloat(row.totalSales) || 0;
      const totalCost = parseFloat(row.totalCost) || 0;
      const totalProfit = totalSales - totalCost;
      const daysInPeriod = parseInt(row.daysInPeriod) || 1;

      // Get best and worst day sales
      let bestDay = null;
      let worstDay = null;

      if (row.bestDay) {
        const bestDaySales = await query(
          `SELECT SUM(total_amount) as sales FROM orders
           WHERE shop_id = ? AND DATE(order_date) = ? AND order_status != 'cancelled'`,
          [shopId, row.bestDay]
        );
        bestDay = {
          date: row.bestDay,
          sales: parseFloat((bestDaySales as any[])[0]?.sales) || 0,
        };
      }

      if (row.worstDay) {
        const worstDaySales = await query(
          `SELECT SUM(total_amount) as sales FROM orders
           WHERE shop_id = ? AND DATE(order_date) = ? AND order_status != 'cancelled'`,
          [shopId, row.worstDay]
        );
        worstDay = {
          date: row.worstDay,
          sales: parseFloat((worstDaySales as any[])[0]?.sales) || 0,
        };
      }

      logger.debug('Retrieved sales metrics', { shopId, startDate, endDate });
      return {
        totalSales,
        totalCost,
        totalProfit,
        avgDaily: totalSales / daysInPeriod,
        profitMargin: totalSales > 0 ? (totalProfit / totalSales) * 100 : 0,
        daysInPeriod,
        bestDay,
        worstDay,
      };
    } catch (error) {
      logger.error('Error fetching sales metrics:', error);
      throw error;
    }
  }

  /**
   * Get daily sales for best and worst day
   */
  async getBestAndWorstDay(
    shopId: number,
    startDate: string,
    endDate: string
  ): Promise<{ best: any; worst: any }> {
    try {
      const results = await query(
        `SELECT DATE(order_date) as date,
                SUM(total_amount) as sales
         FROM orders
         WHERE shop_id = ?
         AND DATE(order_date) >= ?
         AND DATE(order_date) <= ?
         AND order_status != 'cancelled'
         GROUP BY DATE(order_date)
         ORDER BY sales DESC`,
        [shopId, startDate, endDate]
      );

      const rows = results as any[];
      return {
        best: rows[0] ? { date: rows[0].date, sales: parseFloat(rows[0].sales) } : null,
        worst: rows[rows.length - 1] ? { date: rows[rows.length - 1].date, sales: parseFloat(rows[rows.length - 1].sales) } : null,
      };
    } catch (error) {
      logger.error('Error fetching best and worst day:', error);
      throw error;
    }
  }
}

export default new AnalyticsModel();
