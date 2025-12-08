import axios from 'axios';
import { API_URL } from '../config/api';

export interface Payment {
  payment_id: number;
  shop_id: number;
  order_id?: number;
  order_number?: string;
  customer_id?: number;
  payment_amount: number;
  payment_method: 'cash' | 'online_transfer' | 'bank_deposit';
  bank_name?: string;
  branch_name?: string;
  bank_account_id?: number;
  transaction_id?: string;
  payment_status: 'completed' | 'pending' | 'failed' | 'refunded';
  notes?: string;
  created_by?: number;
  created_at: string;
  updated_at: string;
}

export interface PaymentSummary {
  total_count: number;
  total_amount: number;
  completed_count: number;
}

/**
 * Get all payments for a specific shop
 */
export const getShopPayments = async (shopId: number): Promise<Payment[]> => {
  try {
    const response = await axios.get(`${API_URL}/payments/${shopId}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching shop payments:', error);
    throw error;
  }
};

/**
 * Get a single payment by ID
 */
export const getPaymentById = async (
  paymentId: number,
  shopId: number
): Promise<Payment> => {
  try {
    const response = await axios.get(
      `${API_URL}/payments/single/${paymentId}?shop_id=${shopId}`
    );
    return response.data.data;
  } catch (error) {
    console.error('Error fetching payment:', error);
    throw error;
  }
};

/**
 * Create a new payment
 */
export const createPayment = async (
  shopId: number,
  paymentData: Omit<Payment, 'payment_id' | 'shop_id' | 'created_at' | 'updated_at'>
): Promise<{ payment_id: number }> => {
  try {
    const response = await axios.post(`${API_URL}/payments`, {
      shop_id: shopId,
      ...paymentData,
    });
    return response.data.data;
  } catch (error) {
    console.error('Error creating payment:', error);
    throw error;
  }
};

/**
 * Update payment
 */
export const updatePayment = async (
  paymentId: number,
  shopId: number,
  updateData: Partial<Omit<Payment, 'payment_id' | 'shop_id' | 'created_at' | 'updated_at'>>
): Promise<void> => {
  try {
    await axios.put(
      `${API_URL}/payments/${paymentId}?shop_id=${shopId}`,
      updateData
    );
  } catch (error) {
    console.error('Error updating payment:', error);
    throw error;
  }
};

/**
 * Get all payments for a specific order
 */
export const getOrderPayments = async (orderId: number): Promise<Payment[]> => {
  try {
    const response = await axios.get(`${API_URL}/payments/order/${orderId}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching order payments:', error);
    throw error;
  }
};

/**
 * Get payments by date range
 */
export const getPaymentsByDateRange = async (
  shopId: number,
  startDate: string,
  endDate: string
): Promise<Payment[]> => {
  try {
    const response = await axios.get(
      `${API_URL}/payments/range/${shopId}?start_date=${startDate}&end_date=${endDate}`
    );
    return response.data.data;
  } catch (error) {
    console.error('Error fetching payments by date range:', error);
    throw error;
  }
};

/**
 * Get payments by method
 */
export const getPaymentsByMethod = async (
  shopId: number,
  method: string
): Promise<Payment[]> => {
  try {
    const response = await axios.get(
      `${API_URL}/payments/method/${shopId}/${method}`
    );
    return response.data.data;
  } catch (error) {
    console.error('Error fetching payments by method:', error);
    throw error;
  }
};

/**
 * Get payment summary for a shop
 */
export const getPaymentSummary = async (
  shopId: number
): Promise<PaymentSummary> => {
  try {
    const response = await axios.get(`${API_URL}/payments/summary/${shopId}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching payment summary:', error);
    throw error;
  }
};
