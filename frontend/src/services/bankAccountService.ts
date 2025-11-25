import axios from 'axios';
import { API_URL } from '../config/api';

export interface BankAccount {
  bank_account_id: number;
  shop_id: number;
  bank_name: string;
  branch_name?: string;
  account_number: string;
  account_holder_name: string;
  account_type: 'checking' | 'savings' | 'business';
  ifsc_code?: string;
  initial_balance: number;
  current_balance: number;
  status: 'active' | 'inactive' | 'closed';
  created_at: string;
  updated_at: string;
}

/**
 * Get all bank accounts for a specific shop
 */
export const getShopBankAccounts = async (shopId: number): Promise<BankAccount[]> => {
  try {
    const response = await axios.get(`${API_URL}/bank-accounts/${shopId}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching bank accounts:', error);
    throw error;
  }
};

/**
 * Get only active bank accounts for a shop
 */
export const getActiveBankAccounts = async (shopId: number): Promise<BankAccount[]> => {
  try {
    const response = await axios.get(`${API_URL}/bank-accounts/active/${shopId}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching active bank accounts:', error);
    throw error;
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
    const response = await axios.get(
      `${API_URL}/bank-accounts/single/${bankAccountId}?shop_id=${shopId}`
    );
    return response.data.data;
  } catch (error) {
    console.error('Error fetching bank account:', error);
    throw error;
  }
};

/**
 * Create a new bank account
 */
export const createBankAccount = async (
  shopId: number,
  bankName: string,
  branchName: string | null,
  accountNumber: string,
  accountHolderName: string,
  accountType: 'checking' | 'savings' | 'business',
  ifscCode: string | null,
  initialBalance: number
): Promise<{ bank_account_id: number }> => {
  try {
    const response = await axios.post(`${API_URL}/bank-accounts`, {
      shop_id: shopId,
      bank_name: bankName,
      branch_name: branchName,
      account_number: accountNumber,
      account_holder_name: accountHolderName,
      account_type: accountType,
      ifsc_code: ifscCode,
      initial_balance: initialBalance,
    });
    return response.data.data;
  } catch (error) {
    console.error('Error creating bank account:', error);
    throw error;
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
    await axios.put(`${API_URL}/bank-accounts/${bankAccountId}?shop_id=${shopId}`, updateData);
  } catch (error) {
    console.error('Error updating bank account:', error);
    throw error;
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
    await axios.delete(`${API_URL}/bank-accounts/${bankAccountId}?shop_id=${shopId}`);
  } catch (error) {
    console.error('Error deleting bank account:', error);
    throw error;
  }
};
