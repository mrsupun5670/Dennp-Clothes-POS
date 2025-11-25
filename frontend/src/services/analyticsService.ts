/**
 * Analytics Service
 * Handles API calls for analytics and reporting data
 */

import axios from 'axios';
import { API_URL } from '../config/api';

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
  totalCost: number;
  profit: number;
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

/**
 * Get sales analysis for a date range
 */
export const getSalesAnalysis = async (
  shopId: number,
  startDate: string,
  endDate: string
): Promise<SalesAnalysisData[]> => {
  try {
    const response = await axios.get(`${API_URL}/analytics/sales-analysis`, {
      params: {
        shop_id: shopId,
        start_date: startDate,
        end_date: endDate,
      },
    });

    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching sales analysis:', error);
    throw error;
  }
};

/**
 * Get top selling items for a date range
 */
export const getTopSellingItems = async (
  shopId: number,
  startDate: string,
  endDate: string,
  limit: number = 10
): Promise<TopSellingItem[]> => {
  try {
    const response = await axios.get(`${API_URL}/analytics/top-items`, {
      params: {
        shop_id: shopId,
        start_date: startDate,
        end_date: endDate,
        limit,
      },
    });

    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching top selling items:', error);
    throw error;
  }
};

/**
 * Get top customers by spending
 */
export const getTopCustomers = async (
  shopId: number,
  limit: number = 5
): Promise<TopCustomer[]> => {
  try {
    const response = await axios.get(`${API_URL}/analytics/top-customers`, {
      params: {
        shop_id: shopId,
        limit,
      },
    });

    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching top customers:', error);
    throw error;
  }
};

/**
 * Get sales metrics for a date range
 */
export const getSalesMetrics = async (
  shopId: number,
  startDate: string,
  endDate: string
): Promise<SalesMetrics> => {
  try {
    const response = await axios.get(`${API_URL}/analytics/metrics`, {
      params: {
        shop_id: shopId,
        start_date: startDate,
        end_date: endDate,
      },
    });

    return response.data.data;
  } catch (error) {
    console.error('Error fetching sales metrics:', error);
    throw error;
  }
};
