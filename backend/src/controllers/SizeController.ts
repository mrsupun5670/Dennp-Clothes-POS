/**
 * Size Controller
 * Handles requests related to product sizes
 */

import { Request, Response } from 'express';
import SizeModel from '../models/Size';
import { logger } from '../utils/logger';

class SizeController {
  /**
   * GET /sizes - Get all sizes
   */
  async getAllSizes(_req: Request, res: Response): Promise<void> {
    try {
      const sizes = await SizeModel.getAllSizes();

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
   * GET /sizes/:id - Get size by ID
   */
  async getSizeById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const size = await SizeModel.getSizeById(Number(id));

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
   * GET /sizes/type/:sizeTypeId - Get sizes by type
   */
  async getSizesByType(req: Request, res: Response): Promise<void> {
    try {
      const { sizeTypeId } = req.params;
      const sizes = await SizeModel.getSizesByType(Number(sizeTypeId));

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
   * POST /sizes - Create new size
   */
  async createSize(req: Request, res: Response): Promise<void> {
    try {
      const { size_name, size_type_id } = req.body;

      // Validation
      if (!size_name || !size_type_id) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: size_name, size_type_id',
        });
        return;
      }

      const sizeId = await SizeModel.createSize(size_name, size_type_id);

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
   * PUT /sizes/:id - Update size
   */
  async updateSize(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { size_name, size_type_id } = req.body;

      const success = await SizeModel.updateSize(Number(id), size_name, size_type_id);

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
   * DELETE /sizes/:id - Delete size
   */
  async deleteSize(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const success = await SizeModel.deleteSize(Number(id));

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
   * GET /sizes/with-type - Get sizes with type details
   */
  async getSizesWithType(_req: Request, res: Response): Promise<void> {
    try {
      const sizes = await SizeModel.getSizesWithType();

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
