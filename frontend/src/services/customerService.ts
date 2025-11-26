import axios from 'axios';
import { API_URL } from '../config/api';

export interface Customer {
  customer_id: number;
  shop_id: number;
  mobile: string;
  email?: string;
  customer_name?: string;
  orders_count: number;
  total_spent: number;
  created_at: string;
  updated_at: string;
}

/**
 * Get all customers for a shop
 */
export const getShopCustomers = async (shopId: number): Promise<Customer[]> => {
  try {
    const response = await axios.get(`${API_URL}/customers?shop_id=${shopId}`);
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching shop customers:', error);
    throw error;
  }
};

/**
 * Get a single customer by ID
 */
export const getCustomerById = async (customerId: number, shopId: number): Promise<Customer> => {
  try {
    const response = await axios.get(`${API_URL}/customers/${customerId}?shop_id=${shopId}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching customer:', error);
    throw error;
  }
};

/**
 * Search customers by name or mobile
 */
export const searchCustomers = async (shopId: number, searchTerm: string): Promise<Customer[]> => {
  try {
    const response = await axios.get(`${API_URL}/customers/search?shop_id=${shopId}&q=${encodeURIComponent(searchTerm)}`);
    return response.data.data || [];
  } catch (error) {
    console.error('Error searching customers:', error);
    throw error;
  }
};

/**
 * Create a new customer
 */
export const createCustomer = async (shopId: number, customerData: any): Promise<number> => {
  try {
    const response = await axios.post(`${API_URL}/customers`, {
      shop_id: shopId,
      ...customerData,
    });
    return response.data.data.customer_id;
  } catch (error) {
    console.error('Error creating customer:', error);
    throw error;
  }
};

/**
 * Update a customer
 */
export const updateCustomer = async (customerId: number, shopId: number, updateData: any): Promise<void> => {
  try {
    await axios.put(`${API_URL}/customers/${customerId}`, {
      shop_id: shopId,
      ...updateData,
    });
  } catch (error) {
    console.error('Error updating customer:', error);
    throw error;
  }
};
