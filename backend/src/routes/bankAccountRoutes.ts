import { Router } from "express";
import BankAccountController from "../controllers/BankAccountController";

const router = Router();

/**
 * POST /bank-accounts - Create new bank account
 */
router.post(
  "/",
  BankAccountController.createBankAccount.bind(BankAccountController)
);

/**
 * GET /bank-accounts/single/:id - Get single bank account by ID
 */
router.get(
  "/single/:id",
  BankAccountController.getBankAccountById.bind(BankAccountController)
);

/**
 * GET /bank-accounts/active/:shopId - Get active bank accounts
 */
router.get(
  "/active/:shopId",
  BankAccountController.getActiveBankAccounts.bind(BankAccountController)
);

/**
 * GET /bank-accounts/:shopId - Get all bank accounts for a shop
 */
router.get(
  "/:shopId",
  BankAccountController.getShopBankAccounts.bind(BankAccountController)
);

/**
 * PUT /bank-accounts/:id - Update bank account
 */
router.put(
  "/:id",
  BankAccountController.updateBankAccount.bind(BankAccountController)
);

/**
 * DELETE /bank-accounts/:id - Delete bank account
 */
router.delete(
  "/:id",
  BankAccountController.deleteBankAccount.bind(BankAccountController)
);

export default router;
