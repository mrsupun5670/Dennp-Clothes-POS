/**
 * Customer Routes
 * API endpoints for customer operations
 */

import { Router } from 'express';
import CustomerController from '../controllers/CustomerController';

const router = Router();

// GET routes
router.get('/', CustomerController.getAllCustomers.bind(CustomerController));
router.get('/active', CustomerController.getActiveCustomers.bind(CustomerController));
router.get('/top', CustomerController.getTopCustomers.bind(CustomerController));
router.get('/search', CustomerController.searchCustomers.bind(CustomerController));
router.get('/mobile/:mobile', CustomerController.getCustomerByMobile.bind(CustomerController));
router.get('/:id', CustomerController.getCustomerById.bind(CustomerController));

// POST route
router.post('/', CustomerController.createCustomer.bind(CustomerController));

// PUT route
router.put('/:id', CustomerController.updateCustomer.bind(CustomerController));

// POST route to block customer
router.post('/:id/block', CustomerController.blockCustomer.bind(CustomerController));

export default router;
