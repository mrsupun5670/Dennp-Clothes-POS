/**
 * Product Controller
 * Handles requests related to products and sends responses to the frontend
 */

import { Request, Response } from 'express';
import ProductModel from '../models/Product';
import { logger } from '../utils/logger';

class ProductController {
  /**
   * GET /products - Get all products
   */
  async getAllProducts(req: Request, res: Response): Promise<void> {
    try {
      const products = await ProductModel.getAllProducts();
      res.json({
        success: true,
        data: products,
        message: `Retrieved ${products.length} products`,
      });
    } catch (error: any) {
      logger.error('Error in getAllProducts:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch products',
        details: error.message,
      });
    }
  }

  /**
   * GET /products/:id - Get product by ID
   */
  async getProductById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const product = await ProductModel.getProductById(Number(id));

      if (!product) {
        res.status(404).json({
          success: false,
          error: 'Product not found',
        });
        return;
      }

      res.json({
        success: true,
        data: product,
      });
    } catch (error: any) {
      logger.error('Error in getProductById:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch product',
        details: error.message,
      });
    }
  }

  /**
   * GET /products/sku/:sku - Get product by SKU
   */
  async getProductBySku(req: Request, res: Response): Promise<void> {
    try {
      const { sku } = req.params;
      const product = await ProductModel.getProductBySku(sku);

      if (!product) {
        res.status(404).json({
          success: false,
          error: 'Product not found',
        });
        return;
      }

      res.json({
        success: true,
        data: product,
      });
    } catch (error: any) {
      logger.error('Error in getProductBySku:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch product',
        details: error.message,
      });
    }
  }

  /**
   * GET /products/category/:categoryId - Get products by category
   */
  async getProductsByCategory(req: Request, res: Response): Promise<void> {
    try {
      const { categoryId } = req.params;
      const products = await ProductModel.getProductsByCategory(Number(categoryId));

      res.json({
        success: true,
        data: products,
        message: `Retrieved ${products.length} products in category`,
      });
    } catch (error: any) {
      logger.error('Error in getProductsByCategory:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch products',
        details: error.message,
      });
    }
  }

  /**
   * POST /products - Create new product
   */
  async createProduct(req: Request, res: Response): Promise<void> {
    try {
      const { sku, product_name, category_id, description, cost_price, print_cost, retail_price, wholesale_price, product_status } = req.body;

      // Validation
      if (!sku || !product_name || !category_id || !retail_price) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: sku, product_name, category_id, retail_price',
        });
        return;
      }

      const productId = await ProductModel.createProduct({
        sku,
        product_name,
        category_id,
        description,
        cost_price: cost_price || 0,
        print_cost: print_cost || 0,
        retail_price,
        wholesale_price,
        product_status: product_status || 'active',
      });

      res.status(201).json({
        success: true,
        data: { product_id: productId },
        message: 'Product created successfully',
      });
    } catch (error: any) {
      logger.error('Error in createProduct:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create product',
        details: error.message,
      });
    }
  }

  /**
   * PUT /products/:id - Update product
   */
  async updateProduct(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const success = await ProductModel.updateProduct(Number(id), updateData);

      if (!success) {
        res.status(404).json({
          success: false,
          error: 'Product not found or no changes made',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Product updated successfully',
      });
    } catch (error: any) {
      logger.error('Error in updateProduct:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update product',
        details: error.message,
      });
    }
  }

  /**
   * DELETE /products/:id - Delete product (soft delete)
   */
  async deleteProduct(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const success = await ProductModel.deleteProduct(Number(id));

      if (!success) {
        res.status(404).json({
          success: false,
          error: 'Product not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Product deleted successfully',
      });
    } catch (error: any) {
      logger.error('Error in deleteProduct:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete product',
        details: error.message,
      });
    }
  }

  /**
   * GET /products/active - Get active products with pagination
   */
  async getActiveProducts(req: Request, res: Response): Promise<void> {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;

      const { products, total } = await ProductModel.getActiveProducts(page, limit);

      res.json({
        success: true,
        data: products,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error: any) {
      logger.error('Error in getActiveProducts:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch products',
        details: error.message,
      });
    }
  }

  /**
   * GET /products/search - Search products
   */
  async searchProducts(req: Request, res: Response): Promise<void> {
    try {
      const { q } = req.query;

      if (!q || typeof q !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Search term (q) is required',
        });
        return;
      }

      const products = await ProductModel.searchProducts(q);

      res.json({
        success: true,
        data: products,
        message: `Found ${products.length} products`,
      });
    } catch (error: any) {
      logger.error('Error in searchProducts:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to search products',
        details: error.message,
      });
    }
  }

  /**
   * GET /products/:id/prices - Get product prices
   */
  async getProductPrices(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const prices = await ProductModel.getProductPrices(Number(id));

      if (!prices) {
        res.status(404).json({
          success: false,
          error: 'Product not found',
        });
        return;
      }

      res.json({
        success: true,
        data: prices,
      });
    } catch (error: any) {
      logger.error('Error in getProductPrices:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch prices',
        details: error.message,
      });
    }
  }

  /**
   * GET /products/:id/details - Get product with all details (colors, sizes)
   */
  async getProductWithDetails(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const product = await ProductModel.getProductWithDetails(Number(id));

      if (!product) {
        res.status(404).json({
          success: false,
          error: 'Product not found',
        });
        return;
      }

      res.json({
        success: true,
        data: product,
      });
    } catch (error: any) {
      logger.error('Error in getProductWithDetails:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch product details',
        details: error.message,
      });
    }
  }

  /**
   * GET /products/:id/colors - Get all colors for a product
   */
  async getProductColors(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const colors = await ProductModel.getProductColors(Number(id));

      res.json({
        success: true,
        data: colors,
        message: `Retrieved ${colors.length} colors`,
      });
    } catch (error: any) {
      logger.error('Error in getProductColors:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch colors',
        details: error.message,
      });
    }
  }

  /**
   * POST /products/:id/colors - Add color to product
   */
  async addProductColor(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { color_id } = req.body;

      if (!color_id) {
        res.status(400).json({
          success: false,
          error: 'Missing required field: color_id',
        });
        return;
      }

      const productColorId = await ProductModel.addProductColor(Number(id), color_id);

      res.status(201).json({
        success: true,
        data: { product_color_id: productColorId },
        message: 'Color added to product',
      });
    } catch (error: any) {
      logger.error('Error in addProductColor:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to add color',
        details: error.message,
      });
    }
  }

  /**
   * DELETE /products/:id/colors/:colorId - Remove color from product
   */
  async removeProductColor(req: Request, res: Response): Promise<void> {
    try {
      const { id, colorId } = req.params;

      const success = await ProductModel.removeProductColor(Number(id), Number(colorId));

      if (!success) {
        res.status(404).json({
          success: false,
          error: 'Product color not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Color removed from product',
      });
    } catch (error: any) {
      logger.error('Error in removeProductColor:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to remove color',
        details: error.message,
      });
    }
  }

  /**
   * GET /products/:id/sizes - Get all sizes for a product
   */
  async getProductSizes(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const sizes = await ProductModel.getProductSizes(Number(id));

      res.json({
        success: true,
        data: sizes,
        message: `Retrieved ${sizes.length} sizes`,
      });
    } catch (error: any) {
      logger.error('Error in getProductSizes:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch sizes',
        details: error.message,
      });
    }
  }

  /**
   * POST /products/:id/sizes - Add size to product
   */
  async addProductSize(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { size_id } = req.body;

      if (!size_id) {
        res.status(400).json({
          success: false,
          error: 'Missing required field: size_id',
        });
        return;
      }

      const productSizeId = await ProductModel.addProductSize(Number(id), size_id);

      res.status(201).json({
        success: true,
        data: { product_size_id: productSizeId },
        message: 'Size added to product',
      });
    } catch (error: any) {
      logger.error('Error in addProductSize:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to add size',
        details: error.message,
      });
    }
  }

  /**
   * DELETE /products/:id/sizes/:sizeId - Remove size from product
   */
  async removeProductSize(req: Request, res: Response): Promise<void> {
    try {
      const { id, sizeId } = req.params;

      const success = await ProductModel.removeProductSize(Number(id), Number(sizeId));

      if (!success) {
        res.status(404).json({
          success: false,
          error: 'Product size not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Size removed from product',
      });
    } catch (error: any) {
      logger.error('Error in removeProductSize:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to remove size',
        details: error.message,
      });
    }
  }
}

export default new ProductController();
