import { Router } from 'express';
import PaymentController from '../controllers/PaymentController';

const router = Router();

router.post('/', PaymentController.createPayment.bind(PaymentController));
router.get('/single/:id', PaymentController.getPaymentById.bind(PaymentController));
router.get('/order/:orderId', PaymentController.getOrderPayments.bind(PaymentController));
router.get('/summary/:shopId', PaymentController.getPaymentSummary.bind(PaymentController));
router.get('/method/:shopId/:method', PaymentController.getPaymentsByMethod.bind(PaymentController));
router.get('/range/:shopId', PaymentController.getPaymentsByDateRange.bind(PaymentController));
router.get('/:shopId', PaymentController.getShopPayments.bind(PaymentController));
router.put('/:id', PaymentController.updatePayment.bind(PaymentController));

export default router;
