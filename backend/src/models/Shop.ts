/**
 * Shop Model
 * Handles all database queries and operations for shops table
 */

import { query } from '../config/database';
import { logger } from '../utils/logger';

export interface Shop {
  shop_id: number;
  shop_name: string;
  address: string;
  contact_phone: string;
  manager_name: string;
  shop_status: 'active' | 'inactive' | 'closed';
  opening_date?: Date | string;
}

class ShopModel {
  /**
   * Get all shops
   */
  async getAllShops(): Promise<Shop[]> {
    try {
      const results = await query('SELECT * FROM shops ORDER BY shop_name ASC');
      logger.info('Retrieved all shops', { count: (results as any[]).length });
      return results as Shop[];
    } catch (error) {
      logger.error('Error fetching all shops:', error);
      throw error;
    }
  }

  /**
   * Get shop by ID
   */
  async getShopById(shopId: number): Promise<Shop | null> {
    try {
      const results = await query('SELECT * FROM shops WHERE shop_id = ?', [shopId]);
      const shop = (results as Shop[])[0] || null;
      logger.debug('Retrieved shop by ID', { shopId });
      return shop;
    } catch (error) {
      logger.error('Error fetching shop by ID:', error);
      throw error;
    }
  }

  /**
   * Get active shops only
   */
  async getActiveShops(): Promise<Shop[]> {
    try {
      const results = await query("SELECT * FROM shops WHERE shop_status = 'active' ORDER BY shop_name ASC");
      logger.info('Retrieved active shops', { count: (results as any[]).length });
      return results as Shop[];
    } catch (error) {
      logger.error('Error fetching active shops:', error);
      throw error;
    }
  }
}

export default new ShopModel();
