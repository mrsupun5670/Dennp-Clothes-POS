/**
 * Payment Note Routes
 */

import { Router } from "express";
import PaymentNoteController from "../controllers/PaymentNoteController";

const router = Router();

// GET /api/payment-notes?shop_id=1 - Get all payment notes for a shop
router.get("/", PaymentNoteController.getAllPaymentNotes);

// POST /api/payment-notes - Create new payment note
router.post("/", PaymentNoteController.createPaymentNote);

// DELETE /api/payment-notes/:id?shop_id=1 - Delete payment note
router.delete("/:id", PaymentNoteController.deletePaymentNote);

export default router;
