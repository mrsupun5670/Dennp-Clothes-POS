/**
 * Category Routes
 * API endpoints for category operations
 */

import { Router } from 'express';
import CategoryController from '../controllers/CategoryController';

const router = Router();

// GET routes
router.get('/', CategoryController.getAllCategories.bind(CategoryController));
router.get('/:id/with-size-type', CategoryController.getCategoryWithSizeType.bind(CategoryController));
router.get('/:id/product-count', CategoryController.getProductCount.bind(CategoryController));
router.get('/:id', CategoryController.getCategoryById.bind(CategoryController));

// POST route
router.post('/', CategoryController.createCategory.bind(CategoryController));

// PUT route
router.put('/:id', CategoryController.updateCategory.bind(CategoryController));

// DELETE route
router.delete('/:id', CategoryController.deleteCategory.bind(CategoryController));

export default router;
