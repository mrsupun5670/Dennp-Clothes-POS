/**
 * Color Controller
 * Handles requests related to product colors
 */

import { Request, Response } from 'express';
import ColorModel from '../models/Color';
import { logger } from '../utils/logger';

class ColorController {
  /**
   * GET /colors?shop_id=1 - Get all colors
   */
  async getAllColors(req: Request, res: Response): Promise<void> {
    try {
      const shopId = Number(req.query.shop_id);
      if (!shopId) {
        res.status(400).json({
          success: false,
          error: 'shop_id is required',
        });
        return;
      }

      const colors = await ColorModel.getAllColors(shopId);

      res.json({
        success: true,
        data: colors,
        message: `Retrieved ${colors.length} colors`,
      });
    } catch (error: any) {
      logger.error('Error in getAllColors:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch colors',
        details: error.message,
      });
    }
  }

  /**
   * GET /colors/:id?shop_id=1 - Get color by ID
   */
  async getColorById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const shopId = Number(req.query.shop_id);
      if (!shopId) {
        res.status(400).json({
          success: false,
          error: 'shop_id is required',
        });
        return;
      }

      const color = await ColorModel.getColorById(Number(id), shopId);

      if (!color) {
        res.status(404).json({
          success: false,
          error: 'Color not found',
        });
        return;
      }

      res.json({
        success: true,
        data: color,
      });
    } catch (error: any) {
      logger.error('Error in getColorById:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch color',
        details: error.message,
      });
    }
  }

  /**
   * POST /colors (body: { shop_id, color_name, hex_code }) - Create new color
   */
  async createColor(req: Request, res: Response): Promise<void> {
    try {
      const { shop_id, color_name, hex_code } = req.body;

      // Validation
      if (!shop_id) {
        res.status(400).json({
          success: false,
          error: 'Missing required field: shop_id',
        });
        return;
      }

      if (!color_name) {
        res.status(400).json({
          success: false,
          error: 'Missing required field: color_name',
        });
        return;
      }

      const colorId = await ColorModel.createColor(shop_id, color_name, hex_code);

      res.status(201).json({
        success: true,
        data: { color_id: colorId },
        message: 'Color created successfully',
      });
    } catch (error: any) {
      logger.error('Error in createColor:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create color',
        details: error.message,
      });
    }
  }

  /**
   * PUT /colors/:id (body: { shop_id, color_name, hex_code }) - Update color
   */
  async updateColor(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { shop_id, color_name, hex_code } = req.body;

      if (!shop_id) {
        res.status(400).json({
          success: false,
          error: 'Missing required field: shop_id',
        });
        return;
      }

      const success = await ColorModel.updateColor(Number(id), shop_id, color_name, hex_code);

      if (!success) {
        res.status(404).json({
          success: false,
          error: 'Color not found or no changes made',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Color updated successfully',
      });
    } catch (error: any) {
      logger.error('Error in updateColor:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update color',
        details: error.message,
      });
    }
  }

  /**
   * DELETE /colors/:id?shop_id=1 - Delete color
   */
  async deleteColor(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const shopId = Number(req.query.shop_id);

      if (!shopId) {
        res.status(400).json({
          success: false,
          error: 'shop_id is required',
        });
        return;
      }

      const success = await ColorModel.deleteColor(Number(id), shopId);

      if (!success) {
        res.status(404).json({
          success: false,
          error: 'Color not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Color deleted successfully',
      });
    } catch (error: any) {
      logger.error('Error in deleteColor:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete color',
        details: error.message,
      });
    }
  }

  /**
   * GET /colors/search?shop_id=1&q=term - Search colors
   */
  async searchColors(req: Request, res: Response): Promise<void> {
    try {
      const shopId = Number(req.query.shop_id);
      const { q } = req.query;

      if (!shopId) {
        res.status(400).json({
          success: false,
          error: 'shop_id is required',
        });
        return;
      }

      if (!q || typeof q !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Search term (q) is required',
        });
        return;
      }

      const colors = await ColorModel.searchColors(shopId, q);

      res.json({
        success: true,
        data: colors,
        message: `Found ${colors.length} colors`,
      });
    } catch (error: any) {
      logger.error('Error in searchColors:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to search colors',
        details: error.message,
      });
    }
  }
}

export default new ColorController();
