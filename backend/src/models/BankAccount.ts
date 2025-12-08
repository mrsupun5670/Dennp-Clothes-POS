/**
 * Bank Account Model
 * Handles all database queries and operations for bank_accounts table
 */

import { query } from "../config/database";
import { logger } from "../utils/logger";

export interface BankAccount {
  bank_account_id: number;
  shop_id: number;
  bank_name: string;
  branch_name?: string;
  initial_balance: number;
  current_balance: number;
  created_at: Date;
  updated_at: Date;
}

class BankAccountModel {
  /**
   * Get all bank accounts for a specific shop
   */
  async getShopBankAccounts(shopId: number): Promise<BankAccount[]> {
    try {
      if (!shopId || isNaN(shopId)) {
        logger.error("Invalid shopId provided to getShopBankAccounts", { shopId });
        throw new Error("Invalid shop ID provided");
      }

      const results = await query(
        "SELECT * FROM bank_accounts WHERE shop_id = ? ORDER BY created_at DESC",
        [shopId]
      );

      const accounts = results as BankAccount[];
      logger.info("Retrieved all bank accounts for shop", {
        shopId,
        count: accounts.length,
      });

      return accounts || [];
    } catch (error: any) {
      logger.error("Error fetching bank accounts:", {
        error: error?.message || error,
        shopId,
        stack: error?.stack,
      });
      throw new Error(`Failed to fetch bank accounts: ${error?.message || 'Unknown error'}`);
    }
  }

  /**
   * Get a single bank account by ID
   */
  async getBankAccountById(
    bankAccountId: number,
    shopId: number
  ): Promise<BankAccount | null> {
    try {
      if (!bankAccountId || isNaN(bankAccountId)) {
        logger.error("Invalid bankAccountId provided", { bankAccountId });
        throw new Error("Invalid bank account ID provided");
      }

      if (!shopId || isNaN(shopId)) {
        logger.error("Invalid shopId provided", { shopId });
        throw new Error("Invalid shop ID provided");
      }

      const results = await query(
        "SELECT * FROM bank_accounts WHERE bank_account_id = ? AND shop_id = ?",
        [bankAccountId, shopId]
      );

      const account = (results as BankAccount[])[0] || null;
      logger.debug("Retrieved bank account by ID", { bankAccountId, shopId, found: !!account });
      return account;
    } catch (error: any) {
      logger.error("Error fetching bank account by ID:", {
        error: error?.message || error,
        bankAccountId,
        shopId,
        stack: error?.stack,
      });
      throw new Error(`Failed to fetch bank account: ${error?.message || 'Unknown error'}`);
    }
  }

  /**
   * Create new bank account
   */
  async createBankAccount(
    shopId: number,
    bankName: string,
    initialBalance: number
  ): Promise<number> {
    try {
      if (!shopId || isNaN(shopId)) {
        logger.error("Invalid shopId provided", { shopId });
        throw new Error("Invalid shop ID provided");
      }

      if (!bankName || typeof bankName !== 'string' || bankName.trim() === '') {
        logger.error("Invalid bankName provided", { bankName });
        throw new Error("Bank name is required");
      }

      if (initialBalance === undefined || initialBalance === null || isNaN(initialBalance)) {
        logger.error("Invalid initialBalance provided", { initialBalance });
        throw new Error("Valid initial balance is required");
      }

      const results = await query(
        `INSERT INTO bank_accounts (shop_id, bank_name, initial_balance, current_balance)
         VALUES (?, ?, ?, ?)`,
        [
          shopId,
          bankName.trim(),
          initialBalance,
          initialBalance,
        ]
      );

      const accountId = (results as any).insertId;

      if (!accountId) {
        logger.error("Failed to get insertId after creating bank account");
        throw new Error("Failed to create bank account - no ID returned");
      }

      logger.info("Bank account created successfully", {
        accountId,
        shopId,
        bankName: bankName.trim(),
        initialBalance,
      });

      return accountId;
    } catch (error: any) {
      logger.error("Error creating bank account:", {
        error: error?.message || error,
        shopId,
        bankName,
        initialBalance,
        stack: error?.stack,
      });
      throw new Error(`Failed to create bank account: ${error?.message || 'Unknown error'}`);
    }
  }

  /**
   * Update bank account
   */
  async updateBankAccount(
    bankAccountId: number,
    shopId: number,
    updateData: Partial<Omit<BankAccount, "bank_account_id" | "shop_id" | "created_at" | "updated_at">>
  ): Promise<boolean> {
    try {
      if (!bankAccountId || isNaN(bankAccountId)) {
        logger.error("Invalid bankAccountId provided", { bankAccountId });
        throw new Error("Invalid bank account ID provided");
      }

      if (!shopId || isNaN(shopId)) {
        logger.error("Invalid shopId provided", { shopId });
        throw new Error("Invalid shop ID provided");
      }

      if (!updateData || Object.keys(updateData).length === 0) {
        logger.warn("No update data provided", { bankAccountId, shopId });
        return false;
      }

      // Verify ownership first
      const ownership = await query(
        "SELECT bank_account_id FROM bank_accounts WHERE bank_account_id = ? AND shop_id = ?",
        [bankAccountId, shopId]
      );

      if ((ownership as any[]).length === 0) {
        logger.warn("Bank account not found or does not belong to shop", {
          bankAccountId,
          shopId,
        });
        return false;
      }

      const fields: string[] = [];
      const values: any[] = [];

      const updateableFields: (keyof Omit<
        BankAccount,
        "bank_account_id" | "shop_id" | "created_at" | "updated_at"
      >)[] = [
        "bank_name",
        "current_balance",
        "initial_balance",
      ];

      for (const field of updateableFields) {
        if (field in updateData) {
          fields.push(`${field} = ?`);
          values.push(updateData[field]);
        }
      }

      if (fields.length === 0) {
        logger.warn("No valid updateable fields provided", { updateData });
        return false;
      }

      fields.push("updated_at = NOW()");
      values.push(bankAccountId);
      values.push(shopId);

      const results = await query(
        `UPDATE bank_accounts SET ${fields.join(", ")} WHERE bank_account_id = ? AND shop_id = ?`,
        values
      );

      const affectedRows = (results as any).affectedRows;

      logger.info("Bank account updated successfully", {
        bankAccountId,
        shopId,
        affectedRows,
        updatedFields: fields.filter(f => !f.includes('updated_at')),
      });

      return affectedRows > 0;
    } catch (error: any) {
      logger.error("Error updating bank account:", {
        error: error?.message || error,
        bankAccountId,
        shopId,
        updateData,
        stack: error?.stack,
      });
      throw new Error(`Failed to update bank account: ${error?.message || 'Unknown error'}`);
    }
  }

  /**
   * Delete bank account (hard delete)
   */
  async deleteBankAccount(bankAccountId: number, shopId: number): Promise<boolean> {
    try {
      if (!bankAccountId || isNaN(bankAccountId)) {
        logger.error("Invalid bankAccountId provided", { bankAccountId });
        throw new Error("Invalid bank account ID provided");
      }

      if (!shopId || isNaN(shopId)) {
        logger.error("Invalid shopId provided", { shopId });
        throw new Error("Invalid shop ID provided");
      }

      const results = await query(
        'DELETE FROM bank_accounts WHERE bank_account_id = ? AND shop_id = ?',
        [bankAccountId, shopId]
      );

      const affectedRows = (results as any).affectedRows;

      logger.info("Bank account deleted", {
        bankAccountId,
        shopId,
        affectedRows,
      });

      return affectedRows > 0;
    } catch (error: any) {
      logger.error("Error deleting bank account:", {
        error: error?.message || error,
        bankAccountId,
        shopId,
        stack: error?.stack,
      });
      throw new Error(`Failed to delete bank account: ${error?.message || 'Unknown error'}`);
    }
  }

  /**
   * Update bank account balance
   */
  async updateBankAccountBalance(
    bankAccountId: number,
    newBalance: number
  ): Promise<boolean> {
    try {
      if (!bankAccountId || isNaN(bankAccountId)) {
        logger.error("Invalid bankAccountId provided", { bankAccountId });
        throw new Error("Invalid bank account ID provided");
      }

      if (newBalance === undefined || newBalance === null || isNaN(newBalance)) {
        logger.error("Invalid newBalance provided", { newBalance });
        throw new Error("Valid balance is required");
      }

      const results = await query(
        "UPDATE bank_accounts SET current_balance = ?, updated_at = NOW() WHERE bank_account_id = ?",
        [newBalance, bankAccountId]
      );

      const affectedRows = (results as any).affectedRows;

      if (affectedRows === 0) {
        logger.warn("No bank account found to update balance", { bankAccountId });
      }

      logger.debug("Bank account balance updated", {
        bankAccountId,
        newBalance,
        affectedRows,
      });

      return affectedRows > 0;
    } catch (error: any) {
      logger.error("Error updating bank account balance:", {
        error: error?.message || error,
        bankAccountId,
        newBalance,
        stack: error?.stack,
      });
      throw new Error(`Failed to update bank account balance: ${error?.message || 'Unknown error'}`);
    }
  }
}

export default new BankAccountModel();
