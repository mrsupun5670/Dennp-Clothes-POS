/**
 * Category Controller
 * Handles requests related to product categories
 */

import { Request, Response } from 'express';
import CategoryModel from '../models/Category';
import { logger } from '../utils/logger';

class CategoryController {
  /**
   * GET /categories - Get all categories
   */
  async getAllCategories(_req: Request, res: Response): Promise<void> {
    try {
      const categories = await CategoryModel.getAllCategories();

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
   * GET /categories/:id - Get category by ID
   */
  async getCategoryById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const category = await CategoryModel.getCategoryById(Number(id));

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
   * POST /categories - Create new category
   */
  async createCategory(req: Request, res: Response): Promise<void> {
    try {
      const { category_name, size_type_id } = req.body;

      // Validation
      if (!category_name || !size_type_id) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: category_name, size_type_id',
        });
        return;
      }

      const categoryId = await CategoryModel.createCategory(category_name, size_type_id);

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
   * PUT /categories/:id - Update category
   */
  async updateCategory(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { category_name, size_type_id } = req.body;

      const success = await CategoryModel.updateCategory(Number(id), category_name, size_type_id);

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
   * DELETE /categories/:id - Delete category
   */
  async deleteCategory(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const success = await CategoryModel.deleteCategory(Number(id));

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
   * GET /categories/:id/with-size-type - Get category with size type
   */
  async getCategoryWithSizeType(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const category = await CategoryModel.getCategoryWithSizeType(Number(id));

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
   * GET /categories/:id/product-count - Get product count in category
   */
  async getProductCount(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const count = await CategoryModel.countProductsInCategory(Number(id));

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
