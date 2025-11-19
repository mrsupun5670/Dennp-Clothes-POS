/**
 * Product Routes
 * API endpoints for product operations
 */

import { Router } from 'express';
import ProductController from '../controllers/ProductController';

const router = Router();

// GET routes - General
router.get('/', ProductController.getAllProducts.bind(ProductController));
router.get('/active', ProductController.getActiveProducts.bind(ProductController));
router.get('/search', ProductController.searchProducts.bind(ProductController));
router.get('/sku/:sku', ProductController.getProductBySku.bind(ProductController));
router.get('/category/:categoryId', ProductController.getProductsByCategory.bind(ProductController));

// GET routes - Product details (must be before /:id)
router.get('/:id/details', ProductController.getProductWithDetails.bind(ProductController));
router.get('/:id/prices', ProductController.getProductPrices.bind(ProductController));
router.get('/:id/colors', ProductController.getProductColors.bind(ProductController));
router.get('/:id/sizes', ProductController.getProductSizes.bind(ProductController));

// GET routes - Single product (must be last)
router.get('/:id', ProductController.getProductById.bind(ProductController));

// POST routes
router.post('/', ProductController.createProduct.bind(ProductController));
router.post('/stock', ProductController.updateProductStock.bind(ProductController));
router.post('/:id/colors', ProductController.addProductColor.bind(ProductController));
router.post('/:id/sizes', ProductController.addProductSize.bind(ProductController));

// PUT route
router.put('/:id', ProductController.updateProduct.bind(ProductController));

// DELETE routes
router.delete('/:id', ProductController.deleteProduct.bind(ProductController));
router.delete('/:id/colors/:colorId', ProductController.removeProductColor.bind(ProductController));
router.delete('/:id/sizes/:sizeId', ProductController.removeProductSize.bind(ProductController));
router.delete('/:id/stock', ProductController.clearProductStock.bind(ProductController));

export default router;
