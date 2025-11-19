/**
 * Size Model
 * Handles all database queries and operations for sizes table
 */

import { query } from '../config/database';
import { logger } from '../utils/logger';

export interface Size {
  size_id: number;
  size_name: string;
  size_type_id: number;
}

export interface SizeType {
  size_type_id: number;
  Size_type_name: string;
}

class SizeModel {
  /**
   * Get all sizes
   */
  async getAllSizes(): Promise<Size[]> {
    try {
      const results = await query('SELECT * FROM sizes ORDER BY size_name ASC');
      logger.info('Retrieved all sizes', { count: (results as any[]).length });
      return results as Size[];
    } catch (error) {
      logger.error('Error fetching all sizes:', error);
      throw error;
    }
  }

  /**
   * Get size by ID
   */
  async getSizeById(sizeId: number): Promise<Size | null> {
    try {
      const results = await query('SELECT * FROM sizes WHERE size_id = ?', [sizeId]);
      const size = (results as Size[])[0] || null;
      logger.debug('Retrieved size by ID', { sizeId });
      return size;
    } catch (error) {
      logger.error('Error fetching size by ID:', error);
      throw error;
    }
  }

  /**
   * Get sizes by size type
   */
  async getSizesByType(sizeTypeId: number): Promise<Size[]> {
    try {
      const results = await query('SELECT * FROM sizes WHERE size_type_id = ? ORDER BY size_name ASC', [sizeTypeId]);
      logger.debug('Retrieved sizes by type', { sizeTypeId, count: (results as any[]).length });
      return results as Size[];
    } catch (error) {
      logger.error('Error fetching sizes by type:', error);
      throw error;
    }
  }

  /**
   * Create new size
   */
  async createSize(sizeName: string, sizeTypeId: number): Promise<number> {
    try {
      const results = await query('INSERT INTO sizes (size_name, size_type_id) VALUES (?, ?)', [sizeName, sizeTypeId]);

      const sizeId = (results as any).insertId;
      logger.info('Size created successfully', { sizeId, sizeName });
      return sizeId;
    } catch (error) {
      logger.error('Error creating size:', error);
      throw error;
    }
  }

  /**
   * Update size
   */
  async updateSize(sizeId: number, sizeName?: string, sizeTypeId?: number): Promise<boolean> {
    try {
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

      const results = await query(`UPDATE sizes SET ${fields.join(', ')} WHERE size_id = ?`, values);
      const affectedRows = (results as any).affectedRows;

      logger.info('Size updated successfully', { sizeId, affectedRows });
      return affectedRows > 0;
    } catch (error) {
      logger.error('Error updating size:', error);
      throw error;
    }
  }

  /**
   * Delete size
   */
  async deleteSize(sizeId: number): Promise<boolean> {
    try {
      const results = await query('DELETE FROM sizes WHERE size_id = ?', [sizeId]);
      const affectedRows = (results as any).affectedRows;

      logger.info('Size deleted', { sizeId });
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
      const results = await query('SELECT * FROM size_type ORDER BY Size_type_name ASC');
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
      const results = await query('SELECT * FROM size_type WHERE size_type_id = ?', [sizeTypeId]);
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
  async getSizesWithType(): Promise<any[]> {
    try {
      const results = await query(
        `SELECT s.size_id, s.size_name, s.size_type_id, st.Size_type_name
         FROM sizes s
         JOIN size_type st ON s.size_type_id = st.size_type_id
         ORDER BY st.Size_type_name ASC, s.size_name ASC`
      );

      logger.debug('Retrieved sizes with type', { count: (results as any[]).length });
      return results as any[];
    } catch (error) {
      logger.error('Error fetching sizes with type:', error);
      throw error;
    }
  }
}

export default new SizeModel();
