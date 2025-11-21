import { Request, Response } from 'express';
import ShopModel from '../models/Shop';
import { logger } from '../utils/logger';

class ShopController {
  /**
   * GET /shops - Get all shops
   */
  async getAllShops(_req: Request, res: Response): Promise<void> {
    try {
      const shops = await ShopModel.getAllShops();

      res.json({
        success: true,
        data: shops,
        message: 'Shops retrieved successfully',
      });
    } catch (error) {
      logger.error('Error in getAllShops:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve shops',
      });
    }
  }

  /**
   * GET /shops/:id - Get shop by ID
   */
  async getShopById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const shopId = Number(id);

      if (!shopId) {
        res.status(400).json({
          success: false,
          error: 'Invalid shop ID',
        });
        return;
      }

      const shop = await ShopModel.getShopById(shopId);

      if (!shop) {
        res.status(404).json({
          success: false,
          error: 'Shop not found',
        });
        return;
      }

      res.json({
        success: true,
        data: shop,
        message: 'Shop retrieved successfully',
      });
    } catch (error) {
      logger.error('Error in getShopById:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve shop',
      });
    }
  }

  /**
   * GET /shops/active/list - Get only active shops
   */
  async getActiveShops(_req: Request, res: Response): Promise<void> {
    try {
      const shops = await ShopModel.getActiveShops();

      res.json({
        success: true,
        data: shops,
        message: 'Active shops retrieved successfully',
      });
    } catch (error) {
      logger.error('Error in getActiveShops:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve active shops',
      });
    }
  }
}

export default new ShopController();
