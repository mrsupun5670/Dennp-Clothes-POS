/**
 * Payment Note Controller
 * Handles requests related to payment notes
 */

import { Request, Response } from "express";
import PaymentNoteModel from "../models/PaymentNote";
import { logger } from "../utils/logger";

class PaymentNoteController {
  /**
   * GET /payment-notes?shop_id=1 - Get all payment notes for a shop
   */
  async getAllPaymentNotes(req: Request, res: Response): Promise<void> {
    try {
      const shopId = req.query.shop_id ? Number(req.query.shop_id) : undefined;

      if (!shopId) {
        res.status(400).json({
          success: false,
          error: "shop_id is required",
        });
        return;
      }

      const paymentNotes = await PaymentNoteModel.getAllPaymentNotes(shopId);

      res.json({
        success: true,
        data: paymentNotes,
        message: `Retrieved ${paymentNotes.length} payment notes`,
      });
    } catch (error: any) {
      logger.error("Error in getAllPaymentNotes:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch payment notes",
        details: error.message,
      });
    }
  }

  /**
   * POST /payment-notes - Create new payment note
   */
  async createPaymentNote(req: Request, res: Response): Promise<void> {
    try {
      const { shop_id, amount, payment_method, bank_name, bank_branch_name, payment_date, payment_time } = req.body;

      // Validation
      if (!shop_id || !amount || !payment_method || !payment_date || !payment_time) {
        res.status(400).json({
          success: false,
          error: "Missing required fields: shop_id, amount, payment_method, payment_date, payment_time",
        });
        return;
      }

      // Validate payment method specific fields
      if (payment_method === 'Bank Transfer' && !bank_name) {
        res.status(400).json({
          success: false,
          error: "Bank name is required for Bank Transfer",
        });
        return;
      }

      if (payment_method === 'Bank Deposit' && (!bank_name || !bank_branch_name)) {
        res.status(400).json({
          success: false,
          error: "Bank name and branch name are required for Bank Deposit",
        });
        return;
      }

      const paymentNoteId = await PaymentNoteModel.createPaymentNote({
        shop_id,
        amount: Number(amount),
        payment_method,
        bank_name: bank_name || undefined,
        bank_branch_name: bank_branch_name || undefined,
        payment_date,
        payment_time,
      });

      res.status(201).json({
        success: true,
        data: { payment_note_id: paymentNoteId },
        message: "Payment note created successfully",
      });
    } catch (error: any) {
      logger.error("Error in createPaymentNote:", error);
      res.status(500).json({
        success: false,
        error: "Failed to create payment note",
        details: error.message,
      });
    }
  }

  /**
   * DELETE /payment-notes/:id?shop_id=1 - Delete payment note
   */
  async deletePaymentNote(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const shopId = Number(req.query.shop_id);

      if (!shopId) {
        res.status(400).json({
          success: false,
          error: "shop_id is required",
        });
        return;
      }

      const success = await PaymentNoteModel.deletePaymentNote(Number(id), shopId);

      if (!success) {
        res.status(404).json({
          success: false,
          error: "Payment note not found",
        });
        return;
      }

      res.json({
        success: true,
        message: "Payment note deleted successfully",
      });
    } catch (error: any) {
      logger.error("Error in deletePaymentNote:", error);
      res.status(500).json({
        success: false,
        error: "Failed to delete payment note",
        details: error.message,
      });
    }
  }
}

export default new PaymentNoteController();
