/**
 * Reports Service
 * Handles API calls for reports and cost breakdown data
 */

import axios from 'axios';
import { API_URL } from '../config/api';

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

/**
 * Get all sold items with detailed cost breakdown
 */
export const getSoldItems = async (
  shopId: number,
  startDate: string,
  endDate: string
): Promise<SoldItem[]> => {
  try {
    const response = await axios.get(`${API_URL}/reports/sold-items`, {
      params: {
        shop_id: shopId,
        start_date: startDate,
        end_date: endDate,
      },
    });

    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching sold items:', error);
    throw error;
  }
};

/**
 * Get cost breakdown for a date range
 */
export const getCostBreakdown = async (
  shopId: number,
  startDate: string,
  endDate: string
): Promise<CostBreakdown> => {
  try {
    const response = await axios.get(`${API_URL}/reports/cost-breakdown`, {
      params: {
        shop_id: shopId,
        start_date: startDate,
        end_date: endDate,
      },
    });

    return response.data.data;
  } catch (error) {
    console.error('Error fetching cost breakdown:', error);
    throw error;
  }
};

/**
 * Get cost details breakdown (product, print, delivery)
 */
export const getCostDetails = async (
  shopId: number,
  startDate: string,
  endDate: string
): Promise<CostDetails[]> => {
  try {
    const response = await axios.get(`${API_URL}/reports/cost-details`, {
      params: {
        shop_id: shopId,
        start_date: startDate,
        end_date: endDate,
      },
    });

    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching cost details:', error);
    throw error;
  }
};

/**
 * Get cost breakdown for multiple periods
 */
export const getMultiPeriodBreakdown = async (shopId: number): Promise<{
  today: CostBreakdown;
  thisWeek: CostBreakdown;
  thisMonth: CostBreakdown;
}> => {
  try {
    const response = await axios.get(`${API_URL}/reports/multi-period-breakdown`, {
      params: {
        shop_id: shopId,
      },
    });

    return response.data.data;
  } catch (error) {
    console.error('Error fetching multi-period breakdown:', error);
    throw error;
  }
};
