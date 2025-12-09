import { Router } from 'express';
import productRoutes from './productRoutes';
import orderRoutes from './orderRoutes';
import customerRoutes from './customerRoutes';
import categoryRoutes from './categoryRoutes';
import colorRoutes from './colorRoutes';
import sizeRoutes from './sizeRoutes';
import shopRoutes from './shopRoutes';
import inventoryRoutes from './inventoryRoutes';
import bankAccountRoutes from './bankAccountRoutes';
import paymentRoutes from './paymentRoutes';
import analyticsRoutes from './analyticsRoutes';
import bankCollectionRoutes from './bankCollectionRoutes';
import reportsRoutes from './reportsRoutes';
import noteRoutes from './noteRoutes';
import paymentNoteRoutes from './paymentNoteRoutes';

const router = Router();

router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/customers', customerRoutes);
router.use('/categories', categoryRoutes);
router.use('/colors', colorRoutes);
router.use('/sizes', sizeRoutes);
router.use('/shops', shopRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/bank-accounts', bankAccountRoutes);
router.use('/bank-collections', bankCollectionRoutes);
router.use('/payments', paymentRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/reports', reportsRoutes);
router.use('/notes', noteRoutes);
router.use('/payment-notes', paymentNoteRoutes);


// TODO: Add additional routes
// router.use('/payment-reconciliation', paymentReconciliationRoutes);

export default router;
