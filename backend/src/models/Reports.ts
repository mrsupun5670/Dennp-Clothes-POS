/**
 * Reports Model
 * Handles all database queries for detailed reports with cost breakdowns
 */

import { query } from '../config/database';
import { logger } from '../utils/logger';

export interface SoldItem {
  itemId: number;
  orderId: number;
  orderNumber: string;
  orderDate: string;
  productCode: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  soldPrice: number;
  totalPrice: number;
  productCost: number;
  printCost: number;
  totalCost: number;
  profit: number;
}

export interface CostBreakdown {
  period: string;
  totalRevenue: number;
  totalProductCost: number;
  totalPrintCost: number;
  totalDeliveryCost: number;
  totalCost: number;
  totalProfit: number;
  profitMargin: number;
  itemCount: number;
  orderCount: number;
}

export interface CostDetails {
  costType: string;
  amount: number;
  percentage: number;
  itemCount?: number;
}

class ReportsModel {
  /**
   * Get all sold items with detailed cost breakdown
   */
  async getSoldItems(
    shopId: number,
    startDate: string,
    endDate: string
  ): Promise<SoldItem[]> {
    try {
      const results = await query(
        `SELECT oi.item_id as itemId,
                oi.order_id as orderId,
                o.order_number as orderNumber,
                DATE(o.created_at) as orderDate,
                p.product_id as productCode,
                p.product_name as productName,
                oi.quantity,
                p.retail_price as unitPrice,
                oi.sold_price as soldPrice,
                oi.total_price as totalPrice,
                p.product_cost as productCost,
                p.print_cost as printCost,
                (oi.quantity * p.product_cost) as totalProductCost,
                (oi.quantity * p.print_cost) as totalPrintCost,
                (oi.quantity * (p.product_cost + p.print_cost)) as totalCost,
                (oi.total_price - (oi.quantity * (p.product_cost + p.print_cost))) as profit
         FROM order_items oi
         JOIN orders o ON oi.order_id = o.order_id
         JOIN products p ON oi.product_id = p.product_id
         WHERE o.shop_id = ?
         AND DATE(o.created_at) >= ?
         AND DATE(o.created_at) <= ?
         AND o.order_status != 'cancelled'
         ORDER BY o.created_at DESC, o.order_id DESC`,
        [shopId, startDate, endDate]
      );

      logger.debug('Retrieved sold items', { shopId, startDate, endDate, count: (results as any[]).length });
      return (results as any[]).map((row) => ({
        itemId: row.itemId,
        orderId: row.orderId,
        orderNumber: row.orderNumber,
        orderDate: row.orderDate,
        productCode: row.productCode,
        productName: row.productName,
        quantity: parseInt(row.quantity) || 0,
        unitPrice: parseFloat(row.unitPrice) || 0,
        soldPrice: parseFloat(row.soldPrice) || 0,
        totalPrice: parseFloat(row.totalPrice) || 0,
        productCost: parseFloat(row.productCost) || 0,
        printCost: parseFloat(row.printCost) || 0,
        totalCost: parseFloat(row.totalCost) || 0,
        profit: parseFloat(row.profit) || 0,
      }));
    } catch (error) {
      logger.error('Error fetching sold items:', error);
      throw error;
    }
  }

  /**
   * Get cost breakdown by period (today, week, month)
   */
  async getCostBreakdown(
    shopId: number,
    startDate: string,
    endDate: string
  ): Promise<CostBreakdown> {
    try {
      const results = await query(
        `SELECT SUM(oi.total_price) as totalRevenue,
                SUM(oi.quantity * p.product_cost) as totalProductCost,
                SUM(oi.quantity * p.print_cost) as totalPrintCost,
                SUM(o.delivery_charge) as totalDeliveryCost,
                SUM(oi.quantity * (p.product_cost + p.print_cost) + COALESCE(o.delivery_charge, 0)) as totalCost,
                COUNT(DISTINCT oi.item_id) as itemCount,
                COUNT(DISTINCT o.order_id) as orderCount
         FROM order_items oi
         JOIN orders o ON oi.order_id = o.order_id
         JOIN products p ON oi.product_id = p.product_id
         WHERE o.shop_id = ?
         AND DATE(o.created_at) >= ?
         AND DATE(o.created_at) <= ?
         AND o.order_status != 'cancelled'`,
        [shopId, startDate, endDate]
      );

      const row = (results as any[])[0];
      const totalRevenue = parseFloat(row.totalRevenue) || 0;
      const totalProductCost = parseFloat(row.totalProductCost) || 0;
      const totalPrintCost = parseFloat(row.totalPrintCost) || 0;
      const totalDeliveryCost = parseFloat(row.totalDeliveryCost) || 0;
      const totalCost = totalProductCost + totalPrintCost + totalDeliveryCost;
      const totalProfit = totalRevenue - totalCost;

      logger.debug('Retrieved cost breakdown', { shopId, startDate, endDate });
      return {
        period: `${startDate} to ${endDate}`,
        totalRevenue,
        totalProductCost,
        totalPrintCost,
        totalDeliveryCost,
        totalCost,
        totalProfit,
        profitMargin: totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0,
        itemCount: parseInt(row.itemCount) || 0,
        orderCount: parseInt(row.orderCount) || 0,
      };
    } catch (error) {
      logger.error('Error fetching cost breakdown:', error);
      throw error;
    }
  }

  /**
   * Get cost breakdown details (product cost, print cost, delivery cost)
   */
  async getCostDetails(
    shopId: number,
    startDate: string,
    endDate: string
  ): Promise<CostDetails[]> {
    try {
      const results = await query(
        `SELECT SUM(oi.total_price) as totalRevenue,
                SUM(oi.quantity * p.product_cost) as productCost,
                SUM(oi.quantity * p.print_cost) as printCost,
                SUM(o.delivery_charge) as deliveryCost
         FROM order_items oi
         JOIN orders o ON oi.order_id = o.order_id
         JOIN products p ON oi.product_id = p.product_id
         WHERE o.shop_id = ?
         AND DATE(o.created_at) >= ?
         AND DATE(o.created_at) <= ?
         AND o.order_status != 'cancelled'`,
        [shopId, startDate, endDate]
      );

      const row = (results as any[])[0];
      const totalRevenue = parseFloat(row.totalRevenue) || 1;
      const productCost = parseFloat(row.productCost) || 0;
      const printCost = parseFloat(row.printCost) || 0;
      const deliveryCost = parseFloat(row.deliveryCost) || 0;

      logger.debug('Retrieved cost details', { shopId, startDate, endDate });
      return [
        {
          costType: 'Product Cost',
          amount: productCost,
          percentage: (productCost / totalRevenue) * 100,
        },
        {
          costType: 'Print Cost',
          amount: printCost,
          percentage: (printCost / totalRevenue) * 100,
        },
        {
          costType: 'Delivery Cost',
          amount: deliveryCost,
          percentage: (deliveryCost / totalRevenue) * 100,
        },
      ];
    } catch (error) {
      logger.error('Error fetching cost details:', error);
      throw error;
    }
  }

  /**
   * Get cost summary for specific periods (today, this week, this month)
   */
  async getMultiPeriodCostBreakdown(shopId: number): Promise<{
    today: CostBreakdown;
    thisWeek: CostBreakdown;
    thisMonth: CostBreakdown;
  }> {
    try {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];

      // This week
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      const weekStartStr = weekStart.toISOString().split('T')[0];

      // This month
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const monthStartStr = monthStart.toISOString().split('T')[0];

      const [todayBreakdown, weekBreakdown, monthBreakdown] = await Promise.all([
        this.getCostBreakdown(shopId, todayStr, todayStr),
        this.getCostBreakdown(shopId, weekStartStr, todayStr),
        this.getCostBreakdown(shopId, monthStartStr, todayStr),
      ]);

      logger.debug('Retrieved multi-period cost breakdown', { shopId });
      return {
        today: todayBreakdown,
        thisWeek: weekBreakdown,
        thisMonth: monthBreakdown,
      };
    } catch (error) {
      logger.error('Error fetching multi-period cost breakdown:', error);
      throw error;
    }
  }
}

export default new ReportsModel();
