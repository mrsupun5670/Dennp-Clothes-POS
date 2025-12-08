import axios from 'axios';
import { API_URL } from '../config/api';

export interface BankAccount {
  bank_account_id: number;
  shop_id: number;
  bank_name: string;
  branch_name?: string;
  initial_balance: number;
  current_balance: number;
  created_at: string;
  updated_at: string;
}

/**
 * Get all bank accounts for a specific shop
 */
export const getShopBankAccounts = async (shopId: number): Promise<BankAccount[]> => {
  try {
    if (!shopId || isNaN(shopId)) {
      console.error('Invalid shop ID provided to getShopBankAccounts:', shopId);
      throw new Error('Invalid shop ID provided');
    }

    const response = await axios.get(`${API_URL}/bank-accounts/${shopId}`);

    if (!response.data) {
      console.error('No data received from server');
      return [];
    }

    if (!response.data.success) {
      console.error('Server returned error:', response.data.message);
      throw new Error(response.data.message || 'Failed to fetch bank accounts');
    }

    return response.data.data || [];
  } catch (error: any) {
    console.error('Error fetching bank accounts:', {
      message: error?.message,
      response: error?.response?.data,
      shopId,
    });

    if (error?.response?.data?.message) {
      throw new Error(error.response.data.message);
    }

    throw new Error(error?.message || 'Unable to fetch bank accounts. Please check your connection and try again.');
  }
};

/**
 * Get only active bank accounts for a shop
 */
export const getActiveBankAccounts = async (shopId: number): Promise<BankAccount[]> => {
  try {
    if (!shopId || isNaN(shopId)) {
      console.error('Invalid shop ID provided to getActiveBankAccounts:', shopId);
      throw new Error('Invalid shop ID provided');
    }

    const response = await axios.get(`${API_URL}/bank-accounts/active/${shopId}`);

    if (!response.data) {
      console.error('No data received from server');
      return [];
    }

    if (!response.data.success) {
      console.error('Server returned error:', response.data.message);
      throw new Error(response.data.message || 'Failed to fetch active bank accounts');
    }

    return response.data.data || [];
  } catch (error: any) {
    console.error('Error fetching active bank accounts:', {
      message: error?.message,
      response: error?.response?.data,
      shopId,
    });

    if (error?.response?.data?.message) {
      throw new Error(error.response.data.message);
    }

    throw new Error(error?.message || 'Unable to fetch active bank accounts. Please try again.');
  }
};

/**
 * Get a single bank account by ID
 */
export const getBankAccountById = async (
  bankAccountId: number,
  shopId: number
): Promise<BankAccount> => {
  try {
    if (!bankAccountId || isNaN(bankAccountId)) {
      throw new Error('Invalid bank account ID');
    }

    if (!shopId || isNaN(shopId)) {
      throw new Error('Invalid shop ID');
    }

    const response = await axios.get(
      `${API_URL}/bank-accounts/single/${bankAccountId}?shop_id=${shopId}`
    );

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Failed to fetch bank account');
    }

    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching bank account:', {
      message: error?.message,
      response: error?.response?.data,
      bankAccountId,
      shopId,
    });

    if (error?.response?.data?.message) {
      throw new Error(error.response.data.message);
    }

    throw new Error(error?.message || 'Unable to fetch bank account details. Please try again.');
  }
};

/**
 * Create a new bank account
 */
export const createBankAccount = async (
  shopId: number,
  bankName: string,
  initialBalance: number
): Promise<{ bank_account_id: number }> => {
  try {
    if (!shopId || isNaN(shopId)) {
      throw new Error('Invalid shop ID');
    }

    if (!bankName || bankName.trim() === '') {
      throw new Error('Bank name is required');
    }

    if (initialBalance === undefined || initialBalance === null || isNaN(initialBalance)) {
      throw new Error('Valid initial balance is required');
    }

    const response = await axios.post(`${API_URL}/bank-accounts`, {
      shop_id: shopId,
      bank_name: bankName.trim(),
      initial_balance: initialBalance,
    });

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Failed to create bank account');
    }

    return response.data.data;
  } catch (error: any) {
    console.error('Error creating bank account:', {
      message: error?.message,
      response: error?.response?.data,
      shopId,
      bankName,
      initialBalance,
    });

    if (error?.response?.data?.message) {
      throw new Error(error.response.data.message);
    }

    throw new Error(error?.message || 'Unable to create bank account. Please try again.');
  }
};

/**
 * Update bank account
 */
export const updateBankAccount = async (
  bankAccountId: number,
  shopId: number,
  updateData: Partial<Omit<BankAccount, 'bank_account_id' | 'shop_id' | 'created_at' | 'updated_at'>>
): Promise<void> => {
  try {
    if (!bankAccountId || isNaN(bankAccountId)) {
      throw new Error('Invalid bank account ID');
    }

    if (!shopId || isNaN(shopId)) {
      throw new Error('Invalid shop ID');
    }

    if (!updateData || Object.keys(updateData).length === 0) {
      throw new Error('No update data provided');
    }

    const response = await axios.put(`${API_URL}/bank-accounts/${bankAccountId}?shop_id=${shopId}`, updateData);

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Failed to update bank account');
    }
  } catch (error: any) {
    console.error('Error updating bank account:', {
      message: error?.message,
      response: error?.response?.data,
      bankAccountId,
      shopId,
      updateData,
    });

    if (error?.response?.data?.message) {
      throw new Error(error.response.data.message);
    }

    throw new Error(error?.message || 'Unable to update bank account. Please try again.');
  }
};

/**
 * Delete bank account (soft delete)
 */
export const deleteBankAccount = async (
  bankAccountId: number,
  shopId: number
): Promise<void> => {
  try {
    if (!bankAccountId || isNaN(bankAccountId)) {
      throw new Error('Invalid bank account ID');
    }

    if (!shopId || isNaN(shopId)) {
      throw new Error('Invalid shop ID');
    }

    const response = await axios.delete(`${API_URL}/bank-accounts/${bankAccountId}?shop_id=${shopId}`);

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Failed to delete bank account');
    }
  } catch (error: any) {
    console.error('Error deleting bank account:', {
      message: error?.message,
      response: error?.response?.data,
      bankAccountId,
      shopId,
    });

    if (error?.response?.data?.message) {
      throw new Error(error.response.data.message);
    }

    throw new Error(error?.message || 'Unable to delete bank account. Please try again.');
  }
};
