/**
 * Bank Collection Service
 * Handles API calls for bank collections (withdrawals from bank accounts)
 */

import axios from 'axios';
import { API_URL } from '../config/api';

export interface BankCollection {
  collection_id: number;
  bank_account_id: number;
  bank_name?: string;
  collection_amount: number;
  collection_date: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Get all bank collections
 */
export const getAllCollections = async (): Promise<BankCollection[]> => {
  try {
    const response = await axios.get(`${API_URL}/bank-collections`);
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching collections:', error);
    throw error;
  }
};

/**
 * Get collections for a specific bank account
 */
export const getBankAccountCollections = async (bankAccountId: number): Promise<BankCollection[]> => {
  try {
    const response = await axios.get(`${API_URL}/bank-collections/bank/${bankAccountId}`);
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching bank account collections:', error);
    throw error;
  }
};

/**
 * Create a new collection (withdrawal)
 */
export const createCollection = async (
  bankAccountId: number,
  amount: number,
  collectionDate: string,
  notes?: string
): Promise<any> => {
  try {
    const response = await axios.post(`${API_URL}/bank-collections`, {
      bank_account_id: bankAccountId,
      collection_amount: amount,
      collection_date: collectionDate,
      notes,
    });
    return response.data;
  } catch (error) {
    console.error('Error creating collection:', error);
    throw error;
  }
};

/**
 * Get collection summary
 */
export const getCollectionSummary = async (): Promise<{
  total_collections: number;
  total_amount: number;
  last_collection_date: string | null;
}> => {
  try {
    const response = await axios.get(`${API_URL}/bank-collections/summary`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching collection summary:', error);
    throw error;
  }
};

/**
 * Get collections by date range
 */
export const getCollectionsByDateRange = async (
  startDate: string,
  endDate: string
): Promise<BankCollection[]> => {
  try {
    const response = await axios.get(`${API_URL}/bank-collections/date-range`, {
      params: {
        start_date: startDate,
        end_date: endDate,
      },
    });
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching collections by date range:', error);
    throw error;
  }
};
