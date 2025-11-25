/**
 * Size Routes
 * API endpoints for size operations
 */

import { Router } from 'express';
import SizeController from '../controllers/SizeController';

const router = Router();

// GET routes
router.get('/', SizeController.getAllSizes.bind(SizeController));
router.get('/types', SizeController.getAllSizeTypes.bind(SizeController));
router.get('/with-type', SizeController.getSizesWithType.bind(SizeController));
router.get('/by-category/:categoryId', SizeController.getSizesByCategory.bind(SizeController));
router.get('/type/:sizeTypeId', SizeController.getSizesByType.bind(SizeController));
router.get('/:id', SizeController.getSizeById.bind(SizeController));

// POST route
router.post('/', SizeController.createSize.bind(SizeController));

// PUT route
router.put('/:id', SizeController.updateSize.bind(SizeController));

// DELETE route
router.delete('/:id', SizeController.deleteSize.bind(SizeController));

export default router;
