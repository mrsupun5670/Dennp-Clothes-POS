import { Router } from 'express';
import productRoutes from './productRoutes';
import orderRoutes from './orderRoutes';
import customerRoutes from './customerRoutes';
import categoryRoutes from './categoryRoutes';
import colorRoutes from './colorRoutes';
import sizeRoutes from './sizeRoutes';

const router = Router();

router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/customers', customerRoutes);
router.use('/categories', categoryRoutes);
router.use('/colors', colorRoutes);
router.use('/sizes', sizeRoutes);

// TODO: Add additional routes
// router.use('/sales', saleRoutes);
// router.use('/inventory', inventoryRoutes);
// router.use('/payments', paymentRoutes);
// router.use('/shops', shopRoutes);

export default router;
