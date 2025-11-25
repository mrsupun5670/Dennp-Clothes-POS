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

      if (!shopIdNum) {
        res.status(400).json({
          success: false,
          message: "Invalid shop ID",
        });
        return;
      }

      const accounts = await BankAccountModel.getShopBankAccounts(shopIdNum);

      res.json({
        success: true,
        data: accounts,
        message: "Bank accounts retrieved successfully",
      });
    } catch (error) {
      logger.error("Error in getShopBankAccounts:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve bank accounts",
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

      if (!bankAccountId || !shopId) {
        res.status(400).json({
          success: false,
          message: "Invalid bank account ID or shop ID",
        });
        return;
      }

      const account = await BankAccountModel.getBankAccountById(
        bankAccountId,
        shopId
      );

      if (!account) {
        res.status(404).json({
          success: false,
          message: "Bank account not found",
        });
        return;
      }

      res.json({
        success: true,
        data: account,
        message: "Bank account retrieved successfully",
      });
    } catch (error) {
      logger.error("Error in getBankAccountById:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve bank account",
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
        branch_name,
        account_number,
        account_holder_name,
        account_type,
        ifsc_code,
        initial_balance,
      } = req.body;

      // Validation
      if (
        !shop_id ||
        !bank_name ||
        !account_number ||
        !account_holder_name ||
        !account_type ||
        initial_balance === undefined
      ) {
        res.status(400).json({
          success: false,
          message: "Missing required fields",
        });
        return;
      }

      // Check if account already exists
      const existingAccount = await BankAccountModel.getBankAccountByNumber(
        account_number,
        shop_id
      );
      if (existingAccount) {
        res.status(409).json({
          success: false,
          message: "Bank account with this number already exists for this shop",
        });
        return;
      }

      const accountId = await BankAccountModel.createBankAccount(
        shop_id,
        bank_name,
        branch_name || null,
        account_number,
        account_holder_name,
        account_type,
        ifsc_code || null,
        initial_balance
      );

      res.status(201).json({
        success: true,
        data: { bank_account_id: accountId },
        message: "Bank account created successfully",
      });
    } catch (error) {
      logger.error("Error in createBankAccount:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create bank account",
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

      if (!bankAccountId || !shopId) {
        res.status(400).json({
          success: false,
          message: "Invalid bank account ID or shop ID",
        });
        return;
      }

      const success = await BankAccountModel.updateBankAccount(
        bankAccountId,
        shopId,
        req.body
      );

      if (!success) {
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
    } catch (error) {
      logger.error("Error in updateBankAccount:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update bank account",
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

      if (!bankAccountId || !shopId) {
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
    } catch (error) {
      logger.error("Error in deleteBankAccount:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete bank account",
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

      if (!shopIdNum) {
        res.status(400).json({
          success: false,
          message: "Invalid shop ID",
        });
        return;
      }

      const accounts =
        await BankAccountModel.getActiveBankAccounts(shopIdNum);

      res.json({
        success: true,
        data: accounts,
        message: "Active bank accounts retrieved successfully",
      });
    } catch (error) {
      logger.error("Error in getActiveBankAccounts:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve active bank accounts",
      });
    }
  }
}

export default new BankAccountController();
