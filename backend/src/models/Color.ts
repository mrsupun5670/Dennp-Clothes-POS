/**
 * Color Model
 * Handles all database queries and operations for colors table
 */

import { query } from '../config/database';
import { logger } from '../utils/logger';

export interface Color {
  color_id: number;
  shop_id: number;
  color_name: string;
  hex_code?: string;
}

class ColorModel {
  /**
   * Get all colors for a shop
   */
  async getAllColors(shopId: number): Promise<Color[]> {
    try {
      const results = await query('SELECT * FROM colors WHERE shop_id = ? ORDER BY color_name ASC', [shopId]);
      logger.info('Retrieved all colors', { shopId, count: (results as any[]).length });
      return results as Color[];
    } catch (error) {
      logger.error('Error fetching all colors:', error);
      throw error;
    }
  }

  /**
   * Get color by ID
   */
  async getColorById(colorId: number, shopId: number): Promise<Color | null> {
    try {
      const results = await query('SELECT * FROM colors WHERE color_id = ? AND shop_id = ?', [colorId, shopId]);
      const color = (results as Color[])[0] || null;
      logger.debug('Retrieved color by ID', { colorId, shopId });
      return color;
    } catch (error) {
      logger.error('Error fetching color by ID:', error);
      throw error;
    }
  }

  /**
   * Get color by name
   */
  async getColorByName(colorName: string, shopId: number): Promise<Color | null> {
    try {
      const results = await query('SELECT * FROM colors WHERE color_name = ? AND shop_id = ?', [colorName, shopId]);
      const color = (results as Color[])[0] || null;
      logger.debug('Retrieved color by name', { colorName, shopId });
      return color;
    } catch (error) {
      logger.error('Error fetching color by name:', error);
      throw error;
    }
  }

  /**
   * Create new color
   */
  async createColor(shopId: number, colorName: string, hexCode?: string): Promise<number> {
    try {
      const results = await query('INSERT INTO colors (shop_id, color_name, hex_code) VALUES (?, ?, ?)', [shopId, colorName, hexCode || null]);

      const colorId = (results as any).insertId;
      logger.info('Color created successfully', { colorId, shopId, colorName });
      return colorId;
    } catch (error) {
      logger.error('Error creating color:', error);
      throw error;
    }
  }

  /**
   * Update color
   */
  async updateColor(colorId: number, shopId: number, colorName?: string, hexCode?: string): Promise<boolean> {
    try {
      // Verify ownership first
      const ownership = await query(
        'SELECT color_id FROM colors WHERE color_id = ? AND shop_id = ?',
        [colorId, shopId]
      );
      if ((ownership as any[]).length === 0) {
        logger.warn('Color not found or does not belong to shop', { colorId, shopId });
        return false;
      }

      const fields: string[] = [];
      const values: any[] = [];

      if (colorName) {
        fields.push('color_name = ?');
        values.push(colorName);
      }

      if (hexCode) {
        fields.push('hex_code = ?');
        values.push(hexCode);
      }

      if (fields.length === 0) return false;

      values.push(colorId);
      values.push(shopId);

      const results = await query(`UPDATE colors SET ${fields.join(', ')} WHERE color_id = ? AND shop_id = ?`, values);
      const affectedRows = (results as any).affectedRows;

      logger.info('Color updated successfully', { colorId, shopId, affectedRows });
      return affectedRows > 0;
    } catch (error) {
      logger.error('Error updating color:', error);
      throw error;
    }
  }

  /**
   * Delete color
   */
  async deleteColor(colorId: number, shopId: number): Promise<boolean> {
    try {
      const results = await query('DELETE FROM colors WHERE color_id = ? AND shop_id = ?', [colorId, shopId]);
      const affectedRows = (results as any).affectedRows;

      logger.info('Color deleted', { colorId, shopId });
      return affectedRows > 0;
    } catch (error) {
      logger.error('Error deleting color:', error);
      throw error;
    }
  }

  /**
   * Search colors by name
   */
  async searchColors(shopId: number, searchTerm: string): Promise<Color[]> {
    try {
      const searchPattern = `%${searchTerm}%`;
      const results = await query('SELECT * FROM colors WHERE shop_id = ? AND color_name LIKE ? ORDER BY color_name ASC', [shopId, searchPattern]);

      logger.debug('Searched colors', { shopId, searchTerm, count: (results as any[]).length });
      return results as Color[];
    } catch (error) {
      logger.error('Error searching colors:', error);
      throw error;
    }
  }
}

export default new ColorModel();
