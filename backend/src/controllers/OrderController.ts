/**
 * Order Controller
 * Handles requests related to orders and sends responses to the frontend
 */

import { Request, Response } from 'express';
import OrderModel from '../models/Order';
import OrderItemModel from '../models/OrderItem';
import PaymentModel from '../models/Payment';
import { logger } from '../utils/logger';

class OrderController {
  /**
   * GET /orders - Get all orders
   */
  async getAllOrders(req: Request, res: Response): Promise<void> {
    try {
      const shopId = req.query.shop_id ? Number(req.query.shop_id) : undefined;
      const orders = await OrderModel.getAllOrders(shopId);

      res.json({
        success: true,
        data: orders,
        message: `Retrieved ${orders.length} orders`,
      });
    } catch (error: any) {
      logger.error('Error in getAllOrders:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch orders',
        details: error.message,
      });
    }
  }

  /**
   * GET /orders/:id - Get order by ID
   */
  async getOrderById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const order = await OrderModel.getOrderById(Number(id));

      if (!order) {
        res.status(404).json({
          success: false,
          error: 'Order not found',
        });
        return;
      }

      // Get order items with details
      const items = await OrderItemModel.getOrderItemsWithDetails(Number(id));

      res.json({
        success: true,
        data: { ...order, items },
      });
    } catch (error: any) {
      logger.error('Error in getOrderById:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch order',
        details: error.message,
      });
    }
  }

  /**
   * GET /orders/customer/:customerId - Get orders by customer
   */
  async getOrdersByCustomer(req: Request, res: Response): Promise<void> {
    try {
      const { customerId } = req.params;
      const orders = await OrderModel.getOrdersByCustomer(Number(customerId));

      res.json({
        success: true,
        data: orders,
        message: `Retrieved ${orders.length} orders for customer`,
      });
    } catch (error: any) {
      logger.error('Error in getOrdersByCustomer:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch orders',
        details: error.message,
      });
    }
  }

  /**
   * POST /orders - Create new order
   */
  async createOrder(req: Request, res: Response): Promise<void> {
    try {
      const {
        order_number,
        shop_id,
        customer_id,
        user_id,
        total_items,
        total_amount,
        payment_method,
        notes,
        order_date,
        delivery_address,
        items,
      } = req.body;

      // Validation
      if (!order_number || !shop_id || !total_items || !total_amount) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: order_number, shop_id, total_items, total_amount',
        });
        return;
      }

      if (!delivery_address) {
        res.status(400).json({
          success: false,
          error: 'Missing delivery_address',
        });
        return;
      }

      const orderId = await OrderModel.createOrder({
        order_number,
        shop_id,
        customer_id,
        user_id,
        total_items,
        total_amount,
        advance_paid: 0,
        balance_paid: 0,
        total_paid: 0,
        payment_status: 'unpaid',
        remaining_amount: total_amount,
        payment_method: payment_method || 'cash',
        order_status: 'completed',
        notes,
        order_date: new Date(order_date),
        delivery_address,
      });

      // Add order items if provided
      if (items && Array.isArray(items)) {
        const itemsWithOrderId = items.map((item: any) => ({
          ...item,
          order_id: orderId,
        }));
        await OrderItemModel.createOrderItems(itemsWithOrderId);
      }

      res.status(201).json({
        success: true,
        data: { order_id: orderId },
        message: 'Order created successfully',
      });
    } catch (error: any) {
      logger.error('Error in createOrder:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create order',
        details: error.message,
      });
    }
  }

  /**
   * PUT /orders/:id - Update order
   */
  async updateOrder(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const success = await OrderModel.updateOrder(Number(id), updateData);

      if (!success) {
        res.status(404).json({
          success: false,
          error: 'Order not found or no changes made',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Order updated successfully',
      });
    } catch (error: any) {
      logger.error('Error in updateOrder:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update order',
        details: error.message,
      });
    }
  }

  /**
   * POST /orders/:id/payment - Record payment for order
   */
  async recordPayment(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { amount_paid, payment_type, payment_method, bank_name, branch_name, is_online_transfer } = req.body;

      // Validation
      if (!amount_paid || !payment_type) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: amount_paid, payment_type',
        });
        return;
      }

      // Record payment in orders table
      const paymentSuccess = await OrderModel.recordPayment(Number(id), amount_paid, payment_type);

      if (!paymentSuccess) {
        res.status(404).json({
          success: false,
          error: 'Order not found',
        });
        return;
      }

      // Create payment record in payments table
      const paymentId = await PaymentModel.createPayment({
        order_id: Number(id),
        payment_type,
        amount_paid,
        payment_method: payment_method || 'cash',
        bank_name,
        branch_name,
        is_online_transfer: is_online_transfer || false,
      });

      res.json({
        success: true,
        data: { payment_id: paymentId },
        message: 'Payment recorded successfully',
      });
    } catch (error: any) {
      logger.error('Error in recordPayment:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to record payment',
        details: error.message,
      });
    }
  }

  /**
   * GET /orders/pending - Get pending orders
   */
  async getPendingOrders(req: Request, res: Response): Promise<void> {
    try {
      const shopId = req.query.shop_id ? Number(req.query.shop_id) : undefined;
      const orders = await OrderModel.getPendingOrders(shopId);

      res.json({
        success: true,
        data: orders,
        message: `Retrieved ${orders.length} pending orders`,
      });
    } catch (error: any) {
      logger.error('Error in getPendingOrders:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch pending orders',
        details: error.message,
      });
    }
  }

  /**
   * GET /orders/summary - Get order summary for date range
   */
  async getOrderSummary(req: Request, res: Response): Promise<void> {
    try {
      const { shop_id, start_date, end_date } = req.query;

      if (!shop_id || !start_date || !end_date) {
        res.status(400).json({
          success: false,
          error: 'Missing required parameters: shop_id, start_date, end_date',
        });
        return;
      }

      const summary = await OrderModel.getOrderSummary(
        Number(shop_id),
        new Date(start_date as string),
        new Date(end_date as string)
      );

      res.json({
        success: true,
        data: summary,
      });
    } catch (error: any) {
      logger.error('Error in getOrderSummary:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch order summary',
        details: error.message,
      });
    }
  }

  /**
   * GET /orders/:id/payments - Get payments for an order
   */
  async getOrderPayments(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const payments = await PaymentModel.getPaymentsByOrder(Number(id));

      res.json({
        success: true,
        data: payments,
        message: `Retrieved ${payments.length} payments`,
      });
    } catch (error: any) {
      logger.error('Error in getOrderPayments:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch payments',
        details: error.message,
      });
    }
  }
}

export default new OrderController();
