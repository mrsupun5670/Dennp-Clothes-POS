/**
 * Payment Note Model
 * Handles database operations for payment notes
 */

import { query } from "../config/database";
import { logger } from "../utils/logger";

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

class PaymentNoteModel {
  /**
   * Get all payment notes for a shop
   */
  async getAllPaymentNotes(shopId: number): Promise<PaymentNote[]> {
    try {
      const sql = `
        SELECT 
          payment_note_id,
          shop_id,
          amount,
          payment_method,
          bank_name,
          bank_branch_name,
          payment_date,
          payment_time,
          created_at,
          updated_at
        FROM payment_notes
        WHERE shop_id = ?
        ORDER BY created_at DESC
      `;

      const results = await query(sql, [shopId]);
      return results as PaymentNote[];
    } catch (error) {
      logger.error("Error fetching payment notes:", error);
      throw error;
    }
  }

  /**
   * Create a new payment note
   */
  async createPaymentNote(data: CreatePaymentNoteData): Promise<number> {
    try {
      const sql = `
        INSERT INTO payment_notes (
          shop_id,
          amount,
          payment_method,
          bank_name,
          bank_branch_name,
          payment_date,
          payment_time
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      const result = await query(sql, [
        data.shop_id,
        data.amount,
        data.payment_method,
        data.bank_name || null,
        data.bank_branch_name || null,
        data.payment_date,
        data.payment_time,
      ]);

      const insertId = (result as any).insertId;
      logger.info("Payment note created successfully", {
        paymentNoteId: insertId,
        shopId: data.shop_id,
      });

      return insertId;
    } catch (error) {
      logger.error("Error creating payment note:", error);
      throw error;
    }
  }

  /**
   * Delete a payment note
   */
  async deletePaymentNote(paymentNoteId: number, shopId: number): Promise<boolean> {
    try {
      const sql = `
        DELETE FROM payment_notes
        WHERE payment_note_id = ? AND shop_id = ?
      `;

      const result = await query(sql, [paymentNoteId, shopId]);
      const affectedRows = (result as any).affectedRows;

      return affectedRows > 0;
    } catch (error) {
      logger.error("Error deleting payment note:", error);
      throw error;
    }
  }
}

export default new PaymentNoteModel();
