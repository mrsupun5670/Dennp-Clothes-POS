/**
 * Customer Controller
 * Handles requests related to customers and sends responses to the frontend
 */

import { Request, Response } from 'express';
import CustomerModel from '../models/Customer';
import { logger } from '../utils/logger';

class CustomerController {
  /**
   * GET /customers?shop_id=1 - Get all customers
   */
  async getAllCustomers(req: Request, res: Response): Promise<void> {
    try {
      const shopId = Number(req.query.shop_id);
      if (!shopId) {
        res.status(400).json({
          success: false,
          error: 'shop_id is required',
        });
        return;
      }

      const customers = await CustomerModel.getAllCustomers(shopId);

      res.json({
        success: true,
        data: customers,
        message: `Retrieved ${customers.length} customers`,
      });
    } catch (error: any) {
      logger.error('Error in getAllCustomers:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch customers',
        details: error.message,
      });
    }
  }

  /**
   * GET /customers/:id?shop_id=1 - Get customer by ID
   */
  async getCustomerById(req: Request, res: Response): Promise<void> {
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

      const customer = await CustomerModel.getCustomerById(Number(id), shopId);

      if (!customer) {
        res.status(404).json({
          success: false,
          error: 'Customer not found',
        });
        return;
      }

      res.json({
        success: true,
        data: customer,
      });
    } catch (error: any) {
      logger.error('Error in getCustomerById:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch customer',
        details: error.message,
      });
    }
  }

  /**
   * GET /customers/mobile/:mobile?shop_id=1 - Get customer by mobile
   */
  async getCustomerByMobile(req: Request, res: Response): Promise<void> {
    try {
      const { mobile } = req.params;
      const shopId = Number(req.query.shop_id);
      if (!shopId) {
        res.status(400).json({
          success: false,
          error: 'shop_id is required',
        });
        return;
      }

      const customer = await CustomerModel.getCustomerByMobile(mobile, shopId);

      if (!customer) {
        res.status(404).json({
          success: false,
          error: 'Customer not found',
        });
        return;
      }

      res.json({
        success: true,
        data: customer,
      });
    } catch (error: any) {
      logger.error('Error in getCustomerByMobile:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch customer',
        details: error.message,
      });
    }
  }

  /**
   * POST /customers (body: { customer_id, shop_id, mobile, email }) - Create new customer
   */
  async createCustomer(req: Request, res: Response): Promise<void> {
    try {
      const { customer_id, shop_id, mobile, email } = req.body;

      // Validation
      if (!customer_id) {
        res.status(400).json({
          success: false,
          error: 'Missing required field: customer_id',
        });
        return;
      }

      if (!shop_id) {
        res.status(400).json({
          success: false,
          error: 'Missing required field: shop_id',
        });
        return;
      }

      if (!mobile) {
        res.status(400).json({
          success: false,
          error: 'Missing required field: mobile',
        });
        return;
      }

      const customerId = await CustomerModel.createCustomerWithId(shop_id, customer_id, {
        first_name: '',
        last_name: '',
        mobile,
        email,
        customer_status: 'active',
      });

      res.status(201).json({
        success: true,
        data: { customer_id: customerId },
        message: 'Customer created successfully',
      });
    } catch (error: any) {
      logger.error('Error in createCustomer:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create customer',
        details: error.message,
      });
    }
  }

  /**
   * PUT /customers/:id (body: { shop_id, ...updateData }) - Update customer
   */
  async updateCustomer(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { shop_id, ...updateData } = req.body;

      if (!shop_id) {
        res.status(400).json({
          success: false,
          error: 'Missing required field: shop_id',
        });
        return;
      }

      const success = await CustomerModel.updateCustomer(Number(id), shop_id, updateData);

      if (!success) {
        res.status(404).json({
          success: false,
          error: 'Customer not found or no changes made',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Customer updated successfully',
      });
    } catch (error: any) {
      logger.error('Error in updateCustomer:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update customer',
        details: error.message,
      });
    }
  }

  /**
   * GET /customers/search?shop_id=1&q=term - Search customers
   */
  async searchCustomers(req: Request, res: Response): Promise<void> {
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

      const customers = await CustomerModel.searchCustomers(shopId, q);

      res.json({
        success: true,
        data: customers,
        message: `Found ${customers.length} customers`,
      });
    } catch (error: any) {
      logger.error('Error in searchCustomers:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to search customers',
        details: error.message,
      });
    }
  }

  /**
   * GET /customers/active?shop_id=1&page=1&limit=10 - Get active customers with pagination
   */
  async getActiveCustomers(req: Request, res: Response): Promise<void> {
    try {
      const shopId = Number(req.query.shop_id);
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;

      if (!shopId) {
        res.status(400).json({
          success: false,
          error: 'shop_id is required',
        });
        return;
      }

      const { customers, total } = await CustomerModel.getActiveCustomers(shopId, page, limit);

      res.json({
        success: true,
        data: customers,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error: any) {
      logger.error('Error in getActiveCustomers:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch customers',
        details: error.message,
      });
    }
  }

  /**
   * GET /customers/top?shop_id=1&limit=10 - Get top customers by spending
   */
  async getTopCustomers(req: Request, res: Response): Promise<void> {
    try {
      const shopId = Number(req.query.shop_id);
      const limit = Number(req.query.limit) || 10;

      if (!shopId) {
        res.status(400).json({
          success: false,
          error: 'shop_id is required',
        });
        return;
      }

      const customers = await CustomerModel.getTopCustomers(shopId, limit);

      res.json({
        success: true,
        data: customers,
        message: `Retrieved top ${customers.length} customers`,
      });
    } catch (error: any) {
      logger.error('Error in getTopCustomers:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch top customers',
        details: error.message,
      });
    }
  }

  /**
   * POST /customers/:id/block?shop_id=1 - Block customer
   */
  async blockCustomer(req: Request, res: Response): Promise<void> {
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

      const success = await CustomerModel.blockCustomer(Number(id), shopId);

      if (!success) {
        res.status(404).json({
          success: false,
          error: 'Customer not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Customer blocked successfully',
      });
    } catch (error: any) {
      logger.error('Error in blockCustomer:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to block customer',
        details: error.message,
      });
    }
  }
}

export default new CustomerController();
