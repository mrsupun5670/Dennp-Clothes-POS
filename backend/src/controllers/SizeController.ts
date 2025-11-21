/**
 * Size Controller
 * Handles requests related to product sizes
 */

import { Request, Response } from 'express';
import SizeModel from '../models/Size';
import { logger } from '../utils/logger';

class SizeController {
  /**
   * GET /sizes?shop_id=1 - Get all sizes
   */
  async getAllSizes(req: Request, res: Response): Promise<void> {
    try {
      const shopId = Number(req.query.shop_id);
      if (!shopId) {
        res.status(400).json({
          success: false,
          error: 'shop_id is required',
        });
        return;
      }

      const sizes = await SizeModel.getAllSizes(shopId);

      res.json({
        success: true,
        data: sizes,
        message: `Retrieved ${sizes.length} sizes`,
      });
    } catch (error: any) {
      logger.error('Error in getAllSizes:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch sizes',
        details: error.message,
      });
    }
  }

  /**
   * GET /sizes/:id?shop_id=1 - Get size by ID
   */
  async getSizeById(req: Request, res: Response): Promise<void> {
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

      const size = await SizeModel.getSizeById(Number(id), shopId);

      if (!size) {
        res.status(404).json({
          success: false,
          error: 'Size not found',
        });
        return;
      }

      res.json({
        success: true,
        data: size,
      });
    } catch (error: any) {
      logger.error('Error in getSizeById:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch size',
        details: error.message,
      });
    }
  }

  /**
   * GET /sizes/type/:sizeTypeId?shop_id=1 - Get sizes by type
   */
  async getSizesByType(req: Request, res: Response): Promise<void> {
    try {
      const { sizeTypeId } = req.params;
      const shopId = Number(req.query.shop_id);
      if (!shopId) {
        res.status(400).json({
          success: false,
          error: 'shop_id is required',
        });
        return;
      }

      const sizes = await SizeModel.getSizesByType(Number(sizeTypeId), shopId);

      res.json({
        success: true,
        data: sizes,
        message: `Retrieved ${sizes.length} sizes`,
      });
    } catch (error: any) {
      logger.error('Error in getSizesByType:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch sizes',
        details: error.message,
      });
    }
  }

  /**
   * POST /sizes (body: { shop_id, size_name, size_type_id }) - Create new size
   */
  async createSize(req: Request, res: Response): Promise<void> {
    try {
      const { shop_id, size_name, size_type_id } = req.body;

      // Validation
      if (!shop_id) {
        res.status(400).json({
          success: false,
          error: 'Missing required field: shop_id',
        });
        return;
      }

      if (!size_name || !size_type_id) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: size_name, size_type_id',
        });
        return;
      }

      const sizeId = await SizeModel.createSize(shop_id, size_name, size_type_id);

      res.status(201).json({
        success: true,
        data: { size_id: sizeId },
        message: 'Size created successfully',
      });
    } catch (error: any) {
      logger.error('Error in createSize:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create size',
        details: error.message,
      });
    }
  }

  /**
   * PUT /sizes/:id (body: { shop_id, size_name, size_type_id }) - Update size
   */
  async updateSize(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { shop_id, size_name, size_type_id } = req.body;

      if (!shop_id) {
        res.status(400).json({
          success: false,
          error: 'Missing required field: shop_id',
        });
        return;
      }

      const success = await SizeModel.updateSize(Number(id), shop_id, size_name, size_type_id);

      if (!success) {
        res.status(404).json({
          success: false,
          error: 'Size not found or no changes made',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Size updated successfully',
      });
    } catch (error: any) {
      logger.error('Error in updateSize:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update size',
        details: error.message,
      });
    }
  }

  /**
   * DELETE /sizes/:id?shop_id=1 - Delete size
   */
  async deleteSize(req: Request, res: Response): Promise<void> {
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

      const success = await SizeModel.deleteSize(Number(id), shopId);

      if (!success) {
        res.status(404).json({
          success: false,
          error: 'Size not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Size deleted successfully',
      });
    } catch (error: any) {
      logger.error('Error in deleteSize:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete size',
        details: error.message,
      });
    }
  }

  /**
   * GET /sizes/types - Get all size types
   */
  async getAllSizeTypes(_req: Request, res: Response): Promise<void> {
    try {
      const sizeTypes = await SizeModel.getAllSizeTypes();

      res.json({
        success: true,
        data: sizeTypes,
        message: `Retrieved ${sizeTypes.length} size types`,
      });
    } catch (error: any) {
      logger.error('Error in getAllSizeTypes:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch size types',
        details: error.message,
      });
    }
  }

  /**
   * GET /sizes/with-type?shop_id=1 - Get sizes with type details
   */
  async getSizesWithType(req: Request, res: Response): Promise<void> {
    try {
      const shopId = Number(req.query.shop_id);
      if (!shopId) {
        res.status(400).json({
          success: false,
          error: 'shop_id is required',
        });
        return;
      }

      const sizes = await SizeModel.getSizesWithType(shopId);

      res.json({
        success: true,
        data: sizes,
        message: `Retrieved ${sizes.length} sizes`,
      });
    } catch (error: any) {
      logger.error('Error in getSizesWithType:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch sizes',
        details: error.message,
      });
    }
  }
}

export default new SizeController();
