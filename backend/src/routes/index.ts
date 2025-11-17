import { Router } from 'express';
import authRoutes from './authRoutes';

const router = Router();

router.use('/auth', authRoutes);
// TODO: Add other routes
// router.use('/products', productRoutes);
// router.use('/sales', saleRoutes);
// router.use('/inventory', inventoryRoutes);
// router.use('/shops', shopRoutes);
// router.use('/sync', syncRoutes);

export default router;
