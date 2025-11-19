/**
 * Customer Controller
 * Handles requests related to customers and sends responses to the frontend
 */

import { Request, Response } from 'express';
import CustomerModel from '../models/Customer';
import { logger } from '../utils/logger';

class CustomerController {
  /**
   * GET /customers - Get all customers
   */
  async getAllCustomers(req: Request, res: Response): Promise<void> {
    try {
      const customers = await CustomerModel.getAllCustomers();

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
   * GET /customers/:id - Get customer by ID
   */
  async getCustomerById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const customer = await CustomerModel.getCustomerById(Number(id));

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
   * GET /customers/mobile/:mobile - Get customer by mobile
   */
  async getCustomerByMobile(req: Request, res: Response): Promise<void> {
    try {
      const { mobile } = req.params;
      const customer = await CustomerModel.getCustomerByMobile(mobile);

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
   * POST /customers - Create new customer
   */
  async createCustomer(req: Request, res: Response): Promise<void> {
    try {
      const { first_name, last_name, mobile, email, customer_status } = req.body;

      // Validation
      if (!first_name || !last_name || !mobile) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: first_name, last_name, mobile',
        });
        return;
      }

      const customerId = await CustomerModel.createCustomer({
        first_name,
        last_name,
        mobile,
        email,
        customer_status: customer_status || 'active',
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
   * PUT /customers/:id - Update customer
   */
  async updateCustomer(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const success = await CustomerModel.updateCustomer(Number(id), updateData);

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
   * GET /customers/search - Search customers
   */
  async searchCustomers(req: Request, res: Response): Promise<void> {
    try {
      const { q } = req.query;

      if (!q || typeof q !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Search term (q) is required',
        });
        return;
      }

      const customers = await CustomerModel.searchCustomers(q);

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
   * GET /customers/active - Get active customers with pagination
   */
  async getActiveCustomers(req: Request, res: Response): Promise<void> {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;

      const { customers, total } = await CustomerModel.getActiveCustomers(page, limit);

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
   * GET /customers/top - Get top customers by spending
   */
  async getTopCustomers(req: Request, res: Response): Promise<void> {
    try {
      const limit = Number(req.query.limit) || 10;
      const customers = await CustomerModel.getTopCustomers(limit);

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
   * POST /customers/:id/block - Block customer
   */
  async blockCustomer(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const success = await CustomerModel.blockCustomer(Number(id));

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
