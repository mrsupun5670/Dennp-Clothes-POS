import { Router } from 'express';
import InventoryController from '../controllers/InventoryController';

const router = Router();

/**
 * POST /inventory - Add new inventory item
 */
router.post('/', InventoryController.addInventoryItem.bind(InventoryController));

/**
 * GET /inventory/item/:id - Get single inventory item by ID
 */
router.get('/item/:id', InventoryController.getInventoryItem.bind(InventoryController));

/**
 * GET /inventory/search/:shopId - Search inventory items
 */
router.get('/search/:shopId', InventoryController.searchInventory.bind(InventoryController));

/**
 * GET /inventory/:shopId - Get all inventory items for a shop
 */
router.get('/:shopId', InventoryController.getShopInventory.bind(InventoryController));

/**
 * PUT /inventory/:id - Update inventory item
 */
router.put('/:id', InventoryController.updateInventoryItem.bind(InventoryController));

/**
 * DELETE /inventory/:id - Delete inventory item
 */
router.delete('/:id', InventoryController.deleteInventoryItem.bind(InventoryController));

export default router;
