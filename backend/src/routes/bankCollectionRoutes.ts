/**
 * Bank Collection Routes
 * Simplified routes - no shop dependency (collections are global)
 */

import express from 'express';
import BankCollectionController from '../controllers/BankCollectionController';

const router = express.Router();

// Get all collections
router.get('/', BankCollectionController.getAllCollections);

// Get collection summary
router.get('/summary', BankCollectionController.getCollectionSummary);

// Get collections by date range
router.get('/date-range', BankCollectionController.getCollectionsByDateRange);

// Get collections for specific bank account
router.get('/bank/:bankAccountId', BankCollectionController.getBankAccountCollections);

// Create new collection
router.post('/', BankCollectionController.createCollection);

export default router;
