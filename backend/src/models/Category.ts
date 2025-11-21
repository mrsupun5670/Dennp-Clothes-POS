/**
 * Category Model
 * Handles all database queries and operations for categories table
 */

import { query } from '../config/database';
import { logger } from '../utils/logger';

export interface Category {
  category_id: number;
  shop_id: number;
  category_name: string;
  size_type_id: number;
}

class CategoryModel {
  /**
   * Get all categories for a shop
   */
  async getAllCategories(shopId: number): Promise<Category[]> {
    try {
      const results = await query('SELECT * FROM categories WHERE shop_id = ? ORDER BY category_name ASC', [shopId]);
      logger.info('Retrieved all categories', { shopId, count: (results as any[]).length });
      return results as Category[];
    } catch (error) {
      logger.error('Error fetching all categories:', error);
      throw error;
    }
  }

  /**
   * Get category by ID
   */
  async getCategoryById(categoryId: number, shopId: number): Promise<Category | null> {
    try {
      const results = await query('SELECT * FROM categories WHERE category_id = ? AND shop_id = ?', [categoryId, shopId]);
      const category = (results as Category[])[0] || null;
      logger.debug('Retrieved category by ID', { categoryId, shopId });
      return category;
    } catch (error) {
      logger.error('Error fetching category by ID:', error);
      throw error;
    }
  }

  /**
   * Get category by name
   */
  async getCategoryByName(categoryName: string, shopId: number): Promise<Category | null> {
    try {
      const results = await query('SELECT * FROM categories WHERE category_name = ? AND shop_id = ?', [categoryName, shopId]);
      const category = (results as Category[])[0] || null;
      logger.debug('Retrieved category by name', { categoryName, shopId });
      return category;
    } catch (error) {
      logger.error('Error fetching category by name:', error);
      throw error;
    }
  }

  /**
   * Create new category
   */
  async createCategory(shopId: number, categoryName: string, sizeTypeId: number): Promise<number> {
    try {
      const results = await query('INSERT INTO categories (shop_id, category_name, size_type_id) VALUES (?, ?, ?)', [shopId, categoryName, sizeTypeId]);

      const categoryId = (results as any).insertId;
      logger.info('Category created successfully', { categoryId, shopId, categoryName });
      return categoryId;
    } catch (error) {
      logger.error('Error creating category:', error);
      throw error;
    }
  }

  /**
   * Update category
   */
  async updateCategory(categoryId: number, shopId: number, categoryName?: string, sizeTypeId?: number): Promise<boolean> {
    try {
      // Verify ownership first
      const ownership = await query(
        'SELECT category_id FROM categories WHERE category_id = ? AND shop_id = ?',
        [categoryId, shopId]
      );
      if ((ownership as any[]).length === 0) {
        logger.warn('Category not found or does not belong to shop', { categoryId, shopId });
        return false;
      }

      const fields: string[] = [];
      const values: any[] = [];

      if (categoryName) {
        fields.push('category_name = ?');
        values.push(categoryName);
      }

      if (sizeTypeId) {
        fields.push('size_type_id = ?');
        values.push(sizeTypeId);
      }

      if (fields.length === 0) return false;

      values.push(categoryId);
      values.push(shopId);

      const results = await query(`UPDATE categories SET ${fields.join(', ')} WHERE category_id = ? AND shop_id = ?`, values);
      const affectedRows = (results as any).affectedRows;

      logger.info('Category updated successfully', { categoryId, shopId, affectedRows });
      return affectedRows > 0;
    } catch (error) {
      logger.error('Error updating category:', error);
      throw error;
    }
  }

  /**
   * Delete category
   */
  async deleteCategory(categoryId: number, shopId: number): Promise<boolean> {
    try {
      const results = await query('DELETE FROM categories WHERE category_id = ? AND shop_id = ?', [categoryId, shopId]);
      const affectedRows = (results as any).affectedRows;

      logger.info('Category deleted', { categoryId, shopId });
      return affectedRows > 0;
    } catch (error) {
      logger.error('Error deleting category:', error);
      throw error;
    }
  }

  /**
   * Get category with size type details
   */
  async getCategoryWithSizeType(categoryId: number, shopId: number): Promise<any> {
    try {
      const results = await query(
        `SELECT
         c.category_id,
         c.shop_id,
         c.category_name,
         c.size_type_id,
         st.Size_type_name
         FROM categories c
         LEFT JOIN size_type st ON c.size_type_id = st.size_type_id
         WHERE c.category_id = ? AND c.shop_id = ?`,
        [categoryId, shopId]
      );

      const category = (results as any[])[0] || null;
      logger.debug('Retrieved category with size type', { categoryId, shopId });
      return category;
    } catch (error) {
      logger.error('Error fetching category with size type:', error);
      throw error;
    }
  }

  /**
   * Count products in a category
   */
  async countProductsInCategory(categoryId: number, shopId: number): Promise<number> {
    try {
      const results = await query('SELECT COUNT(*) as count FROM products WHERE category_id = ? AND shop_id = ? AND product_status = "active"', [categoryId, shopId]);
      const count = (results as any[])[0]?.count || 0;
      logger.debug('Counted products in category', { categoryId, shopId, count });
      return count;
    } catch (error) {
      logger.error('Error counting products in category:', error);
      throw error;
    }
  }
}

export default new CategoryModel();
