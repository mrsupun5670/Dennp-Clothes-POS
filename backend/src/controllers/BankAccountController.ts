import { Request, Response } from "express";
import BankAccountModel from "../models/BankAccount";
import { logger } from "../utils/logger";

class BankAccountController {
  /**
   * GET /bank-accounts/:shopId - Get all bank accounts for a shop
   */
  async getShopBankAccounts(req: Request, res: Response): Promise<void> {
    try {
      const { shopId } = req.params;
      const shopIdNum = Number(shopId);

      if (!shopIdNum || isNaN(shopIdNum)) {
        logger.warn("Invalid shop ID provided", { shopId });
        res.status(400).json({
          success: false,
          message: "Invalid shop ID provided",
          data: [],
        });
        return;
      }

      const accounts = await BankAccountModel.getShopBankAccounts(shopIdNum);

      res.json({
        success: true,
        data: accounts || [],
        message: accounts && accounts.length > 0
          ? "Bank accounts retrieved successfully"
          : "No bank accounts found",
      });
    } catch (error: any) {
      logger.error("Error in getShopBankAccounts:", {
        error: error?.message || error,
        shopId: req.params.shopId,
        stack: error?.stack,
      });
      res.status(500).json({
        success: false,
        message: "Unable to retrieve bank accounts. Please try again later.",
        data: [],
        error: process.env.NODE_ENV === "development" ? error?.message : undefined,
      });
    }
  }

  /**
   * GET /bank-accounts/single/:id - Get single bank account by ID
   */
  async getBankAccountById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { shop_id } = req.query;
      const bankAccountId = Number(id);
      const shopId = Number(shop_id);

      if (!bankAccountId || isNaN(bankAccountId) || !shopId || isNaN(shopId)) {
        logger.warn("Invalid parameters for getBankAccountById", { id, shop_id });
        res.status(400).json({
          success: false,
          message: "Invalid bank account ID or shop ID",
          data: null,
        });
        return;
      }

      const account = await BankAccountModel.getBankAccountById(
        bankAccountId,
        shopId
      );

      if (!account) {
        logger.info("Bank account not found", { bankAccountId, shopId });
        res.status(404).json({
          success: false,
          message: "Bank account not found",
          data: null,
        });
        return;
      }

      res.json({
        success: true,
        data: account,
        message: "Bank account retrieved successfully",
      });
    } catch (error: any) {
      logger.error("Error in getBankAccountById:", {
        error: error?.message || error,
        id: req.params.id,
        shop_id: req.query.shop_id,
        stack: error?.stack,
      });
      res.status(500).json({
        success: false,
        message: "Unable to retrieve bank account. Please try again later.",
        data: null,
        error: process.env.NODE_ENV === "development" ? error?.message : undefined,
      });
    }
  }

  /**
   * POST /bank-accounts - Create new bank account
   */
  async createBankAccount(req: Request, res: Response): Promise<void> {
    try {
      const {
        shop_id,
        bank_name,
        initial_balance,
      } = req.body;

      // Validation
      if (!shop_id || isNaN(Number(shop_id))) {
        logger.warn("Invalid shop_id in createBankAccount", { shop_id });
        res.status(400).json({
          success: false,
          message: "Invalid shop ID",
        });
        return;
      }

      if (!bank_name || typeof bank_name !== 'string' || bank_name.trim() === '') {
        logger.warn("Invalid bank_name in createBankAccount", { bank_name });
        res.status(400).json({
          success: false,
          message: "Bank name is required",
        });
        return;
      }

      if (initial_balance === undefined || initial_balance === null || isNaN(Number(initial_balance))) {
        logger.warn("Invalid initial_balance in createBankAccount", { initial_balance });
        res.status(400).json({
          success: false,
          message: "Valid initial balance is required",
        });
        return;
      }

      const accountId = await BankAccountModel.createBankAccount(
        Number(shop_id),
        bank_name.trim(),
        Number(initial_balance)
      );

      res.status(201).json({
        success: true,
        data: { bank_account_id: accountId },
        message: "Bank account created successfully",
      });
    } catch (error: any) {
      logger.error("Error in createBankAccount:", {
        error: error?.message || error,
        body: req.body,
        stack: error?.stack,
      });
      res.status(500).json({
        success: false,
        message: "Unable to create bank account. Please try again later.",
        error: process.env.NODE_ENV === "development" ? error?.message : undefined,
      });
    }
  }

  /**
   * PUT /bank-accounts/:id - Update bank account
   */
  async updateBankAccount(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { shop_id } = req.query;
      const bankAccountId = Number(id);
      const shopId = Number(shop_id);

      if (!bankAccountId || isNaN(bankAccountId) || !shopId || isNaN(shopId)) {
        logger.warn("Invalid parameters in updateBankAccount", { id, shop_id });
        res.status(400).json({
          success: false,
          message: "Invalid bank account ID or shop ID",
        });
        return;
      }

      if (!req.body || Object.keys(req.body).length === 0) {
        logger.warn("No update data provided", { bankAccountId, shopId });
        res.status(400).json({
          success: false,
          message: "No update data provided",
        });
        return;
      }

      const success = await BankAccountModel.updateBankAccount(
        bankAccountId,
        shopId,
        req.body
      );

      if (!success) {
        logger.info("Bank account not found or update failed", { bankAccountId, shopId });
        res.status(404).json({
          success: false,
          message: "Bank account not found or update failed",
        });
        return;
      }

      res.json({
        success: true,
        message: "Bank account updated successfully",
      });
    } catch (error: any) {
      logger.error("Error in updateBankAccount:", {
        error: error?.message || error,
        id: req.params.id,
        shop_id: req.query.shop_id,
        stack: error?.stack,
      });
      res.status(500).json({
        success: false,
        message: "Unable to update bank account. Please try again later.",
        error: process.env.NODE_ENV === "development" ? error?.message : undefined,
      });
    }
  }

  /**
   * DELETE /bank-accounts/:id - Delete bank account (soft delete)
   */
  async deleteBankAccount(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { shop_id } = req.query;
      const bankAccountId = Number(id);
      const shopId = Number(shop_id);

      if (!bankAccountId || isNaN(bankAccountId) || !shopId || isNaN(shopId)) {
        logger.warn("Invalid parameters in deleteBankAccount", { id, shop_id });
        res.status(400).json({
          success: false,
          message: "Invalid bank account ID or shop ID",
        });
        return;
      }

      const success = await BankAccountModel.deleteBankAccount(
        bankAccountId,
        shopId
      );

      if (!success) {
        logger.info("Bank account not found for deletion", { bankAccountId, shopId });
        res.status(404).json({
          success: false,
          message: "Bank account not found",
        });
        return;
      }

      res.json({
        success: true,
        message: "Bank account deleted successfully",
      });
    } catch (error: any) {
      logger.error("Error in deleteBankAccount:", {
        error: error?.message || error,
        id: req.params.id,
        shop_id: req.query.shop_id,
        stack: error?.stack,
      });
      res.status(500).json({
        success: false,
        message: "Unable to delete bank account. Please try again later.",
        error: process.env.NODE_ENV === "development" ? error?.message : undefined,
      });
    }
  }

  /**
   * GET /bank-accounts/active/:shopId - Get only active bank accounts
   */
  async getActiveBankAccounts(req: Request, res: Response): Promise<void> {
    try {
      const { shopId } = req.params;
      const shopIdNum = Number(shopId);

      if (!shopIdNum || isNaN(shopIdNum)) {
        logger.warn("Invalid shop ID in getActiveBankAccounts", { shopId });
        res.status(400).json({
          success: false,
          message: "Invalid shop ID",
          data: [],
        });
        return;
      }

      const accounts =
        await BankAccountModel.getShopBankAccounts(shopIdNum);

      res.json({
        success: true,
        data: accounts || [],
        message: accounts && accounts.length > 0
          ? "Active bank accounts retrieved successfully"
          : "No active bank accounts found",
      });
    } catch (error: any) {
      logger.error("Error in getActiveBankAccounts:", {
        error: error?.message || error,
        shopId: req.params.shopId,
        stack: error?.stack,
      });
      res.status(500).json({
        success: false,
        message: "Unable to retrieve active bank accounts. Please try again later.",
        data: [],
        error: process.env.NODE_ENV === "development" ? error?.message : undefined,
      });
    }
  }
}

export default new BankAccountController();
