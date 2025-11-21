/**
 * Category Controller
 * Handles requests related to product categories
 */

import { Request, Response } from 'express';
import CategoryModel from '../models/Category';
import { logger } from '../utils/logger';

class CategoryController {
  /**
   * GET /categories?shop_id=1 - Get all categories
   */
  async getAllCategories(req: Request, res: Response): Promise<void> {
    try {
      const shopId = Number(req.query.shop_id);
      if (!shopId) {
        res.status(400).json({
          success: false,
          error: 'shop_id is required',
        });
        return;
      }

      const categories = await CategoryModel.getAllCategories(shopId);

      res.json({
        success: true,
        data: categories,
        message: `Retrieved ${categories.length} categories`,
      });
    } catch (error: any) {
      logger.error('Error in getAllCategories:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch categories',
        details: error.message,
      });
    }
  }

  /**
   * GET /categories/:id?shop_id=1 - Get category by ID
   */
  async getCategoryById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const shopId = Number(req.query.shop_id);
      if (!shopId) {
        res.status(400).json({
          success: false,
          error: 'shop_id is required',
        });
        return;
      }

      const category = await CategoryModel.getCategoryById(Number(id), shopId);

      if (!category) {
        res.status(404).json({
          success: false,
          error: 'Category not found',
        });
        return;
      }

      res.json({
        success: true,
        data: category,
      });
    } catch (error: any) {
      logger.error('Error in getCategoryById:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch category',
        details: error.message,
      });
    }
  }

  /**
   * POST /categories (body: { shop_id, category_name, size_type_id }) - Create new category
   */
  async createCategory(req: Request, res: Response): Promise<void> {
    try {
      const { shop_id, category_name, size_type_id } = req.body;

      // Validation
      if (!shop_id) {
        res.status(400).json({
          success: false,
          error: 'Missing required field: shop_id',
        });
        return;
      }

      if (!category_name || !size_type_id) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: category_name, size_type_id',
        });
        return;
      }

      const categoryId = await CategoryModel.createCategory(shop_id, category_name, size_type_id);

      res.status(201).json({
        success: true,
        data: { category_id: categoryId },
        message: 'Category created successfully',
      });
    } catch (error: any) {
      logger.error('Error in createCategory:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create category',
        details: error.message,
      });
    }
  }

  /**
   * PUT /categories/:id (body: { shop_id, category_name, size_type_id }) - Update category
   */
  async updateCategory(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { shop_id, category_name, size_type_id } = req.body;

      if (!shop_id) {
        res.status(400).json({
          success: false,
          error: 'Missing required field: shop_id',
        });
        return;
      }

      const success = await CategoryModel.updateCategory(Number(id), shop_id, category_name, size_type_id);

      if (!success) {
        res.status(404).json({
          success: false,
          error: 'Category not found or no changes made',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Category updated successfully',
      });
    } catch (error: any) {
      logger.error('Error in updateCategory:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update category',
        details: error.message,
      });
    }
  }

  /**
   * DELETE /categories/:id?shop_id=1 - Delete category
   */
  async deleteCategory(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const shopId = Number(req.query.shop_id);

      if (!shopId) {
        res.status(400).json({
          success: false,
          error: 'shop_id is required',
        });
        return;
      }

      const success = await CategoryModel.deleteCategory(Number(id), shopId);

      if (!success) {
        res.status(404).json({
          success: false,
          error: 'Category not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Category deleted successfully',
      });
    } catch (error: any) {
      logger.error('Error in deleteCategory:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete category',
        details: error.message,
      });
    }
  }

  /**
   * GET /categories/:id/with-size-type?shop_id=1 - Get category with size type
   */
  async getCategoryWithSizeType(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const shopId = Number(req.query.shop_id);

      if (!shopId) {
        res.status(400).json({
          success: false,
          error: 'shop_id is required',
        });
        return;
      }

      const category = await CategoryModel.getCategoryWithSizeType(Number(id), shopId);

      if (!category) {
        res.status(404).json({
          success: false,
          error: 'Category not found',
        });
        return;
      }

      res.json({
        success: true,
        data: category,
      });
    } catch (error: any) {
      logger.error('Error in getCategoryWithSizeType:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch category',
        details: error.message,
      });
    }
  }

  /**
   * GET /categories/:id/product-count?shop_id=1 - Get product count in category
   */
  async getProductCount(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const shopId = Number(req.query.shop_id);

      if (!shopId) {
        res.status(400).json({
          success: false,
          error: 'shop_id is required',
        });
        return;
      }

      const count = await CategoryModel.countProductsInCategory(Number(id), shopId);

      res.json({
        success: true,
        data: { count },
      });
    } catch (error: any) {
      logger.error('Error in getProductCount:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch product count',
        details: error.message,
      });
    }
  }
}

export default new CategoryController();
