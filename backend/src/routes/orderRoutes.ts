/**
 * Order Routes
 * API endpoints for order operations
 */

import { Router } from 'express';
import OrderController from '../controllers/OrderController';

const router = Router();

// GET routes
router.get('/', OrderController.getAllOrders.bind(OrderController));
router.get('/pending', OrderController.getPendingOrders.bind(OrderController));
router.get('/summary', OrderController.getOrderSummary.bind(OrderController));
router.get('/customer/:customerId', OrderController.getOrdersByCustomer.bind(OrderController));
router.get('/:id/payments', OrderController.getOrderPayments.bind(OrderController));
router.get('/:id/receipt', OrderController.getOrderReceipt.bind(OrderController));
router.get('/:id', OrderController.getOrderById.bind(OrderController));

// POST routes
router.post('/', OrderController.createOrder.bind(OrderController));
router.post('/:id/payment', OrderController.recordPayment.bind(OrderController));

// PUT route
router.put('/:id', OrderController.updateOrder.bind(OrderController));

export default router;
