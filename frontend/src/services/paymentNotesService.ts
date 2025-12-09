/**
 * Payment Notes Service
 * Handles API calls for payment notes
 */

import { API_URL } from "../config/api";

export interface PaymentNote {
  payment_note_id: number;
  shop_id: number;
  amount: number;
  payment_method: 'Cash' | 'Bank Transfer' | 'Bank Deposit';
  bank_name: string | null;
  bank_branch_name: string | null;
  payment_date: string;
  payment_time: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePaymentNoteData {
  shop_id: number;
  amount: number;
  payment_method: 'Cash' | 'Bank Transfer' | 'Bank Deposit';
  bank_name?: string;
  bank_branch_name?: string;
  payment_date: string;
  payment_time: string;
}

/**
 * Get all payment notes for a shop
 */
export const getPaymentNotes = async (shopId: number): Promise<PaymentNote[]> => {
  try {
    const response = await fetch(`${API_URL}/payment-notes?shop_id=${shopId}`);
    const result = await response.json();

    if (result.success) {
      return result.data || [];
    } else {
      throw new Error(result.error || "Failed to fetch payment notes");
    }
  } catch (error) {
    console.error("Error fetching payment notes:", error);
    throw error;
  }
};

/**
 * Create a new payment note
 */
export const createPaymentNote = async (data: CreatePaymentNoteData): Promise<number> => {
  try {
    const response = await fetch(`${API_URL}/payment-notes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (result.success) {
      return result.data.payment_note_id;
    } else {
      throw new Error(result.error || "Failed to create payment note");
    }
  } catch (error) {
    console.error("Error creating payment note:", error);
    throw error;
  }
};

/**
 * Delete a payment note
 */
export const deletePaymentNote = async (paymentNoteId: number, shopId: number): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/payment-notes/${paymentNoteId}?shop_id=${shopId}`, {
      method: "DELETE",
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || "Failed to delete payment note");
    }
  } catch (error) {
    console.error("Error deleting payment note:", error);
    throw error;
  }
};
