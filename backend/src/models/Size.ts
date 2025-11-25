/**
 * Size Model
 * Handles all database queries and operations for sizes table
 */

import { query } from '../config/database';
import { logger } from '../utils/logger';

export interface Size {
  size_id: number;
  shop_id: number;
  size_name: string;
  size_type_id: number;
}

export interface SizeType {
  size_type_id: number;
  size_type_name: string;
}

class SizeModel {
  /**
   * Get all sizes for a shop
   */
  async getAllSizes(shopId: number): Promise<Size[]> {
    try {
      const results = await query('SELECT * FROM sizes WHERE shop_id = ? ORDER BY size_name ASC', [shopId]);
      logger.info('Retrieved all sizes', { shopId, count: (results as any[]).length });
      return results as Size[];
    } catch (error) {
      logger.error('Error fetching all sizes:', error);
      throw error;
    }
  }

  /**
   * Get size by ID
   */
  async getSizeById(sizeId: number, shopId: number): Promise<Size | null> {
    try {
      const results = await query('SELECT * FROM sizes WHERE size_id = ? AND shop_id = ?', [sizeId, shopId]);
      const size = (results as Size[])[0] || null;
      logger.debug('Retrieved size by ID', { sizeId, shopId });
      return size;
    } catch (error) {
      logger.error('Error fetching size by ID:', error);
      throw error;
    }
  }

  /**
   * Get sizes by size type
   */
  async getSizesByType(sizeTypeId: number, shopId: number): Promise<Size[]> {
    try {
      const results = await query('SELECT * FROM sizes WHERE size_type_id = ? AND shop_id = ? ORDER BY size_name ASC', [sizeTypeId, shopId]);
      logger.debug('Retrieved sizes by type', { sizeTypeId, shopId, count: (results as any[]).length });
      return results as Size[];
    } catch (error) {
      logger.error('Error fetching sizes by type:', error);
      throw error;
    }
  }

  /**
   * Create new size
   */
  async createSize(shopId: number, sizeName: string, sizeTypeId: number): Promise<number> {
    try {
      const results = await query('INSERT INTO sizes (shop_id, size_name, size_type_id) VALUES (?, ?, ?)', [shopId, sizeName, sizeTypeId]);

      const sizeId = (results as any).insertId;
      logger.info('Size created successfully', { sizeId, shopId, sizeName });
      return sizeId;
    } catch (error) {
      logger.error('Error creating size:', error);
      throw error;
    }
  }

  /**
   * Update size
   */
  async updateSize(sizeId: number, shopId: number, sizeName?: string, sizeTypeId?: number): Promise<boolean> {
    try {
      // Verify ownership first
      const ownership = await query(
        'SELECT size_id FROM sizes WHERE size_id = ? AND shop_id = ?',
        [sizeId, shopId]
      );
      if ((ownership as any[]).length === 0) {
        logger.warn('Size not found or does not belong to shop', { sizeId, shopId });
        return false;
      }

      const fields: string[] = [];
      const values: any[] = [];

      if (sizeName) {
        fields.push('size_name = ?');
        values.push(sizeName);
      }

      if (sizeTypeId) {
        fields.push('size_type_id = ?');
        values.push(sizeTypeId);
      }

      if (fields.length === 0) return false;

      values.push(sizeId);
      values.push(shopId);

      const results = await query(`UPDATE sizes SET ${fields.join(', ')} WHERE size_id = ? AND shop_id = ?`, values);
      const affectedRows = (results as any).affectedRows;

      logger.info('Size updated successfully', { sizeId, shopId, affectedRows });
      return affectedRows > 0;
    } catch (error) {
      logger.error('Error updating size:', error);
      throw error;
    }
  }

  /**
   * Delete size
   */
  async deleteSize(sizeId: number, shopId: number): Promise<boolean> {
    try {
      const results = await query('DELETE FROM sizes WHERE size_id = ? AND shop_id = ?', [sizeId, shopId]);
      const affectedRows = (results as any).affectedRows;

      logger.info('Size deleted', { sizeId, shopId });
      return affectedRows > 0;
    } catch (error) {
      logger.error('Error deleting size:', error);
      throw error;
    }
  }

  /**
   * Get all size types
   */
  async getAllSizeTypes(): Promise<SizeType[]> {
    try {
      const results = await query('SELECT * FROM size_types ORDER BY size_type_name ASC');
      logger.info('Retrieved all size types', { count: (results as any[]).length });
      return results as SizeType[];
    } catch (error) {
      logger.error('Error fetching all size types:', error);
      throw error;
    }
  }

  /**
   * Get size type by ID
   */
  async getSizeTypeById(sizeTypeId: number): Promise<SizeType | null> {
    try {
      const results = await query('SELECT * FROM size_types WHERE size_type_id = ?', [sizeTypeId]);
      const sizeType = (results as SizeType[])[0] || null;
      logger.debug('Retrieved size type by ID', { sizeTypeId });
      return sizeType;
    } catch (error) {
      logger.error('Error fetching size type by ID:', error);
      throw error;
    }
  }

  /**
   * Get sizes with size type details
   */
  async getSizesWithType(shopId: number): Promise<any[]> {
    try {
      const results = await query(
        `SELECT s.size_id, s.shop_id, s.size_name, s.size_type_id, st.size_type_name
         FROM sizes s
         JOIN size_types st ON s.size_type_id = st.size_type_id
         WHERE s.shop_id = ?
         ORDER BY st.size_type_name ASC, s.size_name ASC`,
        [shopId]
      );

      logger.debug('Retrieved sizes with type', { shopId, count: (results as any[]).length });
      return results as any[];
    } catch (error) {
      logger.error('Error fetching sizes with type:', error);
      throw error;
    }
  }

  /**
   * Get sizes by category (using category's size_type_id)
   */
  async getSizesByCategory(categoryId: number, shopId: number): Promise<Size[]> {
    try {
      const results = await query(
        `SELECT s.* FROM sizes s
         JOIN categories c ON s.size_type_id = c.size_type_id
         WHERE c.category_id = ? AND c.shop_id = ? AND s.shop_id = ?
         ORDER BY s.size_name ASC`,
        [categoryId, shopId, shopId]
      );
      logger.debug('Retrieved sizes by category', { categoryId, shopId, count: (results as any[]).length });
      return results as Size[];
    } catch (error) {
      logger.error('Error fetching sizes by category:', error);
      throw error;
    }
  }
}

export default new SizeModel();
