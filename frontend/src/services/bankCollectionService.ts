/**
 * Bank Collection Service
 * Handles API calls for bank collections and reconciliation data
 */

import axios from 'axios';
import { API_URL } from '../config/api';

export interface PendingCollection {
  id: string;
  bankName: string;
  branchName: string;
  pendingAmount: number;
  fromDate: string;
  toDate: string;
  ordersCount: number;
  status: 'pending' | 'collected';
  collectedDate?: string;
  collectedAmount?: number;
}

export interface CollectionRecord {
  collectionId: number;
  bankName: string;
  branchName: string;
  pendingAmount: number;
  collectedAmount: number;
  fromDate: string;
  toDate: string;
  ordersCount: number;
  collectionDate: string;
  status: string;
  notes?: string;
}

/**
 * Get pending collections for a shop
 */
export const getPendingCollections = async (shopId: number): Promise<PendingCollection[]> => {
  try {
    const response = await axios.get(`${API_URL}/bank-collections/pending`, {
      params: {
        shop_id: shopId,
      },
    });

    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching pending collections:', error);
    throw error;
  }
};

/**
 * Get collection history
 */
export const getCollectionHistory = async (shopId: number): Promise<CollectionRecord[]> => {
  try {
    const response = await axios.get(`${API_URL}/bank-collections/history`, {
      params: {
        shop_id: shopId,
      },
    });

    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching collection history:', error);
    throw error;
  }
};

/**
 * Get collection details
 */
export const getCollectionDetails = async (
  shopId: number,
  collectionId: number
): Promise<any> => {
  try {
    const response = await axios.get(
      `${API_URL}/bank-collections/details/${collectionId}`,
      {
        params: {
          shop_id: shopId,
        },
      }
    );

    return response.data.data;
  } catch (error) {
    console.error('Error fetching collection details:', error);
    throw error;
  }
};

/**
 * Record a new collection
 */
export const recordCollection = async (
  shopId: number,
  bankAccountId: number,
  amount: number,
  collectionDate: string,
  notes?: string
): Promise<any> => {
  try {
    const response = await axios.post(`${API_URL}/bank-collections/record`, {
      shopId,
      bankAccountId,
      amount,
      collectionDate,
      notes,
    });

    return response.data;
  } catch (error) {
    console.error('Error recording collection:', error);
    throw error;
  }
};

/**
 * Get reconciliation summary
 */
export const getReconciliationSummary = async (
  shopId: number,
  startDate: string,
  endDate: string
): Promise<any[]> => {
  try {
    const response = await axios.get(
      `${API_URL}/bank-collections/reconciliation-summary`,
      {
        params: {
          shop_id: shopId,
          start_date: startDate,
          end_date: endDate,
        },
      }
    );

    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching reconciliation summary:', error);
    throw error;
  }
};
