import { Router } from 'express';
import ShopController from '../controllers/ShopController';

const router = Router();

/**
 * GET /shops - Get all shops
 */
router.get('/', ShopController.getAllShops.bind(ShopController));

/**
 * GET /shops/active/list - Get only active shops
 */
router.get('/active/list', ShopController.getActiveShops.bind(ShopController));

/**
 * GET /shops/:id - Get shop by ID
 */
router.get('/:id', ShopController.getShopById.bind(ShopController));

export default router;
