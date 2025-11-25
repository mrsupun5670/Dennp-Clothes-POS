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
  account_number: string;
  account_holder_name: string;
  account_type: "checking" | "savings" | "business";
  ifsc_code?: string;
  initial_balance: number;
  current_balance: number;
  status: "active" | "inactive" | "closed";
  created_at: Date;
  updated_at: Date;
}

class BankAccountModel {
  /**
   * Get all bank accounts for a specific shop
   */
  async getShopBankAccounts(shopId: number): Promise<BankAccount[]> {
    try {
      const results = await query(
        "SELECT * FROM bank_accounts WHERE shop_id = ? ORDER BY created_at DESC",
        [shopId]
      );
      logger.info("Retrieved all bank accounts for shop", {
        shopId,
        count: (results as any[]).length,
      });
      return results as BankAccount[];
    } catch (error) {
      logger.error("Error fetching bank accounts:", error);
      throw error;
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
      const results = await query(
        "SELECT * FROM bank_accounts WHERE bank_account_id = ? AND shop_id = ?",
        [bankAccountId, shopId]
      );
      const account = (results as BankAccount[])[0] || null;
      logger.debug("Retrieved bank account by ID", { bankAccountId, shopId });
      return account;
    } catch (error) {
      logger.error("Error fetching bank account by ID:", error);
      throw error;
    }
  }

  /**
   * Get bank account by account number (per shop)
   */
  async getBankAccountByNumber(
    accountNumber: string,
    shopId: number
  ): Promise<BankAccount | null> {
    try {
      const results = await query(
        "SELECT * FROM bank_accounts WHERE account_number = ? AND shop_id = ?",
        [accountNumber, shopId]
      );
      const account = (results as BankAccount[])[0] || null;
      logger.debug("Retrieved bank account by number", { accountNumber, shopId });
      return account;
    } catch (error) {
      logger.error("Error fetching bank account by number:", error);
      throw error;
    }
  }

  /**
   * Create new bank account
   */
  async createBankAccount(
    shopId: number,
    bankName: string,
    branchName: string | null,
    accountNumber: string,
    accountHolderName: string,
    accountType: "checking" | "savings" | "business",
    ifscCode: string | null,
    initialBalance: number
  ): Promise<number> {
    try {
      const results = await query(
        `INSERT INTO bank_accounts (shop_id, bank_name, branch_name, account_number, account_holder_name, account_type, ifsc_code, initial_balance, current_balance, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
        [
          shopId,
          bankName,
          branchName || null,
          accountNumber,
          accountHolderName,
          accountType,
          ifscCode || null,
          initialBalance,
          initialBalance,
        ]
      );

      const accountId = (results as any).insertId;
      logger.info("Bank account created successfully", {
        accountId,
        shopId,
        bankName,
        accountNumber,
      });
      return accountId;
    } catch (error) {
      logger.error("Error creating bank account:", error);
      throw error;
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
        "branch_name",
        "account_number",
        "account_holder_name",
        "account_type",
        "ifsc_code",
        "current_balance",
        "status",
      ];

      for (const field of updateableFields) {
        if (field in updateData) {
          fields.push(`${field} = ?`);
          values.push(updateData[field]);
        }
      }

      if (fields.length === 0) return false;

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
      });
      return affectedRows > 0;
    } catch (error) {
      logger.error("Error updating bank account:", error);
      throw error;
    }
  }

  /**
   * Delete bank account (soft delete by changing status)
   */
  async deleteBankAccount(bankAccountId: number, shopId: number): Promise<boolean> {
    try {
      const results = await query(
        'UPDATE bank_accounts SET status = "closed", updated_at = NOW() WHERE bank_account_id = ? AND shop_id = ?',
        [bankAccountId, shopId]
      );
      const affectedRows = (results as any).affectedRows;

      logger.info("Bank account closed (soft delete)", {
        bankAccountId,
        shopId,
      });
      return affectedRows > 0;
    } catch (error) {
      logger.error("Error deleting bank account:", error);
      throw error;
    }
  }

  /**
   * Get active bank accounts only
   */
  async getActiveBankAccounts(shopId: number): Promise<BankAccount[]> {
    try {
      const results = await query(
        'SELECT * FROM bank_accounts WHERE shop_id = ? AND status = "active" ORDER BY created_at DESC',
        [shopId]
      );
      logger.debug("Retrieved active bank accounts", {
        shopId,
        count: (results as any[]).length,
      });
      return results as BankAccount[];
    } catch (error) {
      logger.error("Error fetching active bank accounts:", error);
      throw error;
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
      const results = await query(
        "UPDATE bank_accounts SET current_balance = ?, updated_at = NOW() WHERE bank_account_id = ?",
        [newBalance, bankAccountId]
      );
      const affectedRows = (results as any).affectedRows;

      logger.debug("Bank account balance updated", {
        bankAccountId,
        newBalance,
      });
      return affectedRows > 0;
    } catch (error) {
      logger.error("Error updating bank account balance:", error);
      throw error;
    }
  }
}

export default new BankAccountModel();
