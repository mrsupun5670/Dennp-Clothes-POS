/**
 * Color Model
 * Handles all database queries and operations for colors table
 */

import { query } from '../config/database';
import { logger } from '../utils/logger';

export interface Color {
  color_id: number;
  color_name: string;
  hex_code?: string;
}

class ColorModel {
  /**
   * Get all colors
   */
  async getAllColors(): Promise<Color[]> {
    try {
      const results = await query('SELECT * FROM colors ORDER BY color_name ASC');
      logger.info('Retrieved all colors', { count: (results as any[]).length });
      return results as Color[];
    } catch (error) {
      logger.error('Error fetching all colors:', error);
      throw error;
    }
  }

  /**
   * Get color by ID
   */
  async getColorById(colorId: number): Promise<Color | null> {
    try {
      const results = await query('SELECT * FROM colors WHERE color_id = ?', [colorId]);
      const color = (results as Color[])[0] || null;
      logger.debug('Retrieved color by ID', { colorId });
      return color;
    } catch (error) {
      logger.error('Error fetching color by ID:', error);
      throw error;
    }
  }

  /**
   * Get color by name
   */
  async getColorByName(colorName: string): Promise<Color | null> {
    try {
      const results = await query('SELECT * FROM colors WHERE color_name = ?', [colorName]);
      const color = (results as Color[])[0] || null;
      logger.debug('Retrieved color by name', { colorName });
      return color;
    } catch (error) {
      logger.error('Error fetching color by name:', error);
      throw error;
    }
  }

  /**
   * Create new color
   */
  async createColor(colorName: string, hexCode?: string): Promise<number> {
    try {
      const results = await query('INSERT INTO colors (color_name, hex_code) VALUES (?, ?)', [colorName, hexCode || null]);

      const colorId = (results as any).insertId;
      logger.info('Color created successfully', { colorId, colorName });
      return colorId;
    } catch (error) {
      logger.error('Error creating color:', error);
      throw error;
    }
  }

  /**
   * Update color
   */
  async updateColor(colorId: number, colorName?: string, hexCode?: string): Promise<boolean> {
    try {
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

      const results = await query(`UPDATE colors SET ${fields.join(', ')} WHERE color_id = ?`, values);
      const affectedRows = (results as any).affectedRows;

      logger.info('Color updated successfully', { colorId, affectedRows });
      return affectedRows > 0;
    } catch (error) {
      logger.error('Error updating color:', error);
      throw error;
    }
  }

  /**
   * Delete color
   */
  async deleteColor(colorId: number): Promise<boolean> {
    try {
      const results = await query('DELETE FROM colors WHERE color_id = ?', [colorId]);
      const affectedRows = (results as any).affectedRows;

      logger.info('Color deleted', { colorId });
      return affectedRows > 0;
    } catch (error) {
      logger.error('Error deleting color:', error);
      throw error;
    }
  }

  /**
   * Search colors by name
   */
  async searchColors(searchTerm: string): Promise<Color[]> {
    try {
      const searchPattern = `%${searchTerm}%`;
      const results = await query('SELECT * FROM colors WHERE color_name LIKE ? ORDER BY color_name ASC', [searchPattern]);

      logger.debug('Searched colors', { searchTerm, count: (results as any[]).length });
      return results as Color[];
    } catch (error) {
      logger.error('Error searching colors:', error);
      throw error;
    }
  }
}

export default new ColorModel();
