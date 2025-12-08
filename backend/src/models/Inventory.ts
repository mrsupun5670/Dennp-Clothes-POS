/**
 * Inventory Model
 * Handles all database queries and operations for shop_inventory table
 */

import { query } from '../config/database';
import { logger } from '../utils/logger';

export interface InventoryItem {
  inventory_id: number;
  shop_id: number;
  item_name: string;
  quantity_in_stock: number;
  updated_at: Date | string;
  unit_cost: number;
}

class InventoryModel {
  /**
   * Get all inventory items for a specific shop
   */
  async getShopInventory(shopId: number): Promise<InventoryItem[]> {
    try {
      const results = await query(
        'SELECT * FROM shop_inventory WHERE shop_id = ? ORDER BY item_name ASC',
        [shopId]
      );
      logger.info('Retrieved shop inventory', { shopId, count: (results as any[]).length });
      return results as InventoryItem[];
    } catch (error) {
      logger.error('Error fetching shop inventory:', error);
      throw error;
    }
  }

  /**
   * Get inventory item by ID
   */
  async getInventoryItemById(inventoryId: number): Promise<InventoryItem | null> {
    try {
      const results = await query(
        'SELECT * FROM shop_inventory WHERE inventory_id = ?',
        [inventoryId]
      );
      const item = (results as InventoryItem[])[0] || null;
      logger.debug('Retrieved inventory item by ID', { inventoryId });
      return item;
    } catch (error) {
      logger.error('Error fetching inventory item by ID:', error);
      throw error;
    }
  }

  /**
   * Add new inventory item
   */
  async addInventoryItem(
    shopId: number,
    itemName: string,
    quantityInStock: number,
    unitCost: number
  ): Promise<{ inventory_id: number }> {
    try {
      // Get the maximum inventory_id and add 1 to it
      const maxIdResult = await query(
        'SELECT COALESCE(MAX(inventory_id), 0) as max_id FROM shop_inventory'
      );
      const nextInventoryId = ((maxIdResult as any[])[0].max_id || 0) + 1;

      // Insert with the calculated inventory_id
      await query(
        'INSERT INTO shop_inventory (inventory_id, shop_id, item_name, quantity_in_stock, unit_cost, updated_at) VALUES (?, ?, ?, ?, ?, NOW())',
        [nextInventoryId, shopId, itemName, quantityInStock, unitCost]
      );
      logger.info('Added new inventory item', { shopId, itemName, inventoryId: nextInventoryId });
      return { inventory_id: nextInventoryId };
    } catch (error) {
      logger.error('Error adding inventory item:', error);
      throw error;
    }
  }

  /**
   * Add new inventory item with specific inventory_id
   */
  async addInventoryItemWithId(
    inventoryId: number,
    shopId: number,
    itemName: string,
    quantityInStock: number,
    unitCost: number
  ): Promise<{ inventory_id: number }> {
    try {
      await query(
        'INSERT INTO shop_inventory (inventory_id, shop_id, item_name, quantity_in_stock, unit_cost, updated_at) VALUES (?, ?, ?, ?, ?, NOW())',
        [inventoryId, shopId, itemName, quantityInStock, unitCost]
      );
      logger.info('Added new inventory item with specific ID', { inventoryId, shopId, itemName });
      return { inventory_id: inventoryId };
    } catch (error) {
      logger.error('Error adding inventory item with ID:', error);
      throw error;
    }
  }

  /**
   * Update inventory item
   */
  async updateInventoryItem(
    inventoryId: number,
    itemName: string,
    quantityInStock: number,
    unitCost: number
  ): Promise<boolean> {
    try {
      await query(
        'UPDATE shop_inventory SET item_name = ?, quantity_in_stock = ?, unit_cost = ?, updated_at = NOW() WHERE inventory_id = ?',
        [itemName, quantityInStock, unitCost, inventoryId]
      );
      logger.info('Updated inventory item', { inventoryId });
      return true;
    } catch (error) {
      logger.error('Error updating inventory item:', error);
      throw error;
    }
  }

  /**
   * Delete inventory item
   */
  async deleteInventoryItem(inventoryId: number): Promise<boolean> {
    try {
      await query('DELETE FROM shop_inventory WHERE inventory_id = ?', [inventoryId]);
      logger.info('Deleted inventory item', { inventoryId });
      return true;
    } catch (error) {
      logger.error('Error deleting inventory item:', error);
      throw error;
    }
  }

  /**
   * Search inventory items by name within a shop
   */
  async searchInventoryItems(shopId: number, searchTerm: string): Promise<InventoryItem[]> {
    try {
      const results = await query(
        'SELECT * FROM shop_inventory WHERE shop_id = ? AND item_name LIKE ? ORDER BY item_name ASC',
        [shopId, `%${searchTerm}%`]
      );
      logger.info('Searched inventory items', { shopId, searchTerm });
      return results as InventoryItem[];
    } catch (error) {
      logger.error('Error searching inventory items:', error);
      throw error;
    }
  }
}

export default new InventoryModel();
