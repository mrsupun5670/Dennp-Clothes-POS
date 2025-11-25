import { Request, Response } from 'express';
import InventoryModel from '../models/Inventory';
import { logger } from '../utils/logger';

class InventoryController {
  /**
   * GET /inventory/:shopId - Get all inventory items for a shop
   */
  async getShopInventory(req: Request, res: Response): Promise<void> {
    try {
      const { shopId } = req.params;
      const shopIdNum = Number(shopId);

      if (!shopIdNum) {
        res.status(400).json({
          success: false,
          message: 'Invalid shop ID',
        });
        return;
      }

      const items = await InventoryModel.getShopInventory(shopIdNum);

      res.json({
        success: true,
        data: items,
        message: 'Inventory items retrieved successfully',
      });
    } catch (error) {
      logger.error('Error in getShopInventory:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve inventory items',
      });
    }
  }

  /**
   * GET /inventory/item/:id - Get single inventory item
   */
  async getInventoryItem(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const inventoryId = Number(id);

      if (!inventoryId) {
        res.status(400).json({
          success: false,
          message: 'Invalid inventory ID',
        });
        return;
      }

      const item = await InventoryModel.getInventoryItemById(inventoryId);

      if (!item) {
        res.status(404).json({
          success: false,
          message: 'Inventory item not found',
        });
        return;
      }

      res.json({
        success: true,
        data: item,
        message: 'Inventory item retrieved successfully',
      });
    } catch (error) {
      logger.error('Error in getInventoryItem:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve inventory item',
      });
    }
  }

  /**
   * POST /inventory - Add new inventory item with specific inventory_id
   */
  async addInventoryItem(req: Request, res: Response): Promise<void> {
    try {
      const { inventory_id, shop_id, item_name, quantity_in_stock, unit_cost } = req.body;

      if (!inventory_id || !shop_id || !item_name || quantity_in_stock === undefined || unit_cost === undefined) {
        res.status(400).json({
          success: false,
          message: 'Missing required fields: inventory_id, shop_id, item_name, quantity_in_stock, unit_cost',
        });
        return;
      }

      const result = await InventoryModel.addInventoryItemWithId(
        inventory_id,
        shop_id,
        item_name,
        Number(quantity_in_stock),
        Number(unit_cost)
      );

      res.status(201).json({
        success: true,
        data: result,
        message: 'Inventory item added successfully',
      });
    } catch (error) {
      logger.error('Error in addInventoryItem:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add inventory item',
      });
    }
  }

  /**
   * PUT /inventory/:id - Update inventory item
   */
  async updateInventoryItem(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { itemName, quantityInStock, unitCost } = req.body;
      const inventoryId = Number(id);

      if (!inventoryId) {
        res.status(400).json({
          success: false,
          message: 'Invalid inventory ID',
        });
        return;
      }

      if (!itemName || quantityInStock === undefined || unitCost === undefined) {
        res.status(400).json({
          success: false,
          message: 'Missing required fields: itemName, quantityInStock, unitCost',
        });
        return;
      }

      await InventoryModel.updateInventoryItem(
        inventoryId,
        itemName,
        Number(quantityInStock),
        Number(unitCost)
      );

      res.json({
        success: true,
        message: 'Inventory item updated successfully',
      });
    } catch (error) {
      logger.error('Error in updateInventoryItem:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update inventory item',
      });
    }
  }

  /**
   * DELETE /inventory/:id - Delete inventory item
   */
  async deleteInventoryItem(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const inventoryId = Number(id);

      if (!inventoryId) {
        res.status(400).json({
          success: false,
          message: 'Invalid inventory ID',
        });
        return;
      }

      await InventoryModel.deleteInventoryItem(inventoryId);

      res.json({
        success: true,
        message: 'Inventory item deleted successfully',
      });
    } catch (error) {
      logger.error('Error in deleteInventoryItem:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete inventory item',
      });
    }
  }

  /**
   * GET /inventory/search/:shopId - Search inventory items
   */
  async searchInventory(req: Request, res: Response): Promise<void> {
    try {
      const { shopId } = req.params;
      const { q } = req.query;
      const shopIdNum = Number(shopId);
      const searchTerm = String(q || '');

      if (!shopIdNum) {
        res.status(400).json({
          success: false,
          message: 'Invalid shop ID',
        });
        return;
      }

      if (!searchTerm) {
        res.status(400).json({
          success: false,
          message: 'Search term required',
        });
        return;
      }

      const items = await InventoryModel.searchInventoryItems(shopIdNum, searchTerm);

      res.json({
        success: true,
        data: items,
        message: 'Search completed successfully',
      });
    } catch (error) {
      logger.error('Error in searchInventory:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to search inventory',
      });
    }
  }
}

export default new InventoryController();
