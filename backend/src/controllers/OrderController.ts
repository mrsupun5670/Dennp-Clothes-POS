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
   * GET /orders - Get all orders with optional status filtering
   */
  async getAllOrders(req: Request, res: Response): Promise<void> {
    try {
      const shopId = req.query.shop_id ? Number(req.query.shop_id) : undefined;
      const status = req.query.status ? String(req.query.status) : undefined;

      let orders = await OrderModel.getAllOrders(shopId);

      // Filter by status if provided
      if (status && status !== 'all') {
        const validStatuses = ['pending', 'processing', 'shipped', 'delivered'];
        const lowerStatus = status.toLowerCase();
        if (validStatuses.includes(lowerStatus)) {
          orders = orders.filter(order => order.order_status === lowerStatus);
        }
      }

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
   * GET /orders/:id?shop_id=1 - Get order by ID
   */
  async getOrderById(req: Request, res: Response): Promise<void> {
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

      const order = await OrderModel.getOrderById(Number(id), shopId);

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
   * GET /orders/customer/:customerId?shop_id=1 - Get orders by customer
   */
  async getOrdersByCustomer(req: Request, res: Response): Promise<void> {
    try {
      const { customerId } = req.params;
      const shopId = Number(req.query.shop_id);

      if (!shopId) {
        res.status(400).json({
          success: false,
          error: 'shop_id is required',
        });
        return;
      }

      const orders = await OrderModel.getOrdersByCustomer(Number(customerId), shopId);

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
        order_status: 'pending',
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
   * PUT /orders/:id (body: { shop_id, ...updateData }) - Update order
   */
  async updateOrder(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { shop_id, order_status, ...updateData } = req.body;

      logger.info('Update order request', { id, shop_id, order_status, updateData });

      if (!shop_id) {
        res.status(400).json({
          success: false,
          error: 'Missing required field: shop_id',
        });
        return;
      }

      // If trying to change status to shipped, check if payment is complete
      if (order_status === 'shipped') {
        const order = await OrderModel.getOrderById(Number(id), shop_id);

        if (!order) {
          res.status(404).json({
            success: false,
            error: 'Order not found',
          });
          return;
        }

        // Check if payment is fully settled (total_paid >= total_amount)
        if (order.total_paid < order.total_amount) {
          res.status(400).json({
            success: false,
            error: `Payment not complete. Amount due: Rs. ${(order.total_amount - order.total_paid).toFixed(2)}. Please settle payment before marking as shipped.`,
            details: {
              total_amount: order.total_amount,
              total_paid: order.total_paid,
              remaining: order.total_amount - order.total_paid,
            },
          });
          return;
        }
      }

      const success = await OrderModel.updateOrder(Number(id), shop_id, { order_status, ...updateData });

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
   * POST /orders/:id/payment (body: { shop_id, amount_paid, payment_type, ... }) - Record payment for order
   */
  async recordPayment(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { shop_id, amount_paid, payment_type, payment_method, bank_name, branch_name, is_online_transfer } = req.body;

      // Validation
      if (!shop_id) {
        res.status(400).json({
          success: false,
          error: 'Missing required field: shop_id',
        });
        return;
      }

      if (!amount_paid || !payment_type) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: amount_paid, payment_type',
        });
        return;
      }

      // Record payment in orders table
      const paymentSuccess = await OrderModel.recordPayment(Number(id), shop_id, amount_paid, payment_type);

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
        payment_date: new Date(),
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
   * GET /orders/pending?shop_id=1 - Get pending orders
   */
  async getPendingOrders(req: Request, res: Response): Promise<void> {
    try {
      const shopId = Number(req.query.shop_id);

      if (!shopId) {
        res.status(400).json({
          success: false,
          error: 'shop_id is required',
        });
        return;
      }

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

  /**
   * GET /orders/:id/receipt - Generate receipt HTML for printing/export
   */
  async getOrderReceipt(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const shopId = req.query.shop_id ? Number(req.query.shop_id) : undefined;

      if (!shopId) {
        res.status(400).json({
          success: false,
          error: 'Shop ID is required',
        });
        return;
      }

      const order = await OrderModel.getOrderById(Number(id), shopId);

      if (!order) {
        res.status(404).json({
          success: false,
          error: 'Order not found',
        });
        return;
      }

      // Get order items with details
      const items = await OrderItemModel.getOrderItemsWithDetails(Number(id));

      const receiptHtml = this.generateReceiptHTML({ ...order, items });

      res.json({
        success: true,
        data: { html: receiptHtml },
      });
    } catch (error: any) {
      logger.error('Error in getOrderReceipt:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate receipt',
        details: error.message,
      });
    }
  }

  /**
   * Helper method to generate receipt HTML
   */
  private generateReceiptHTML(order: any): string {
    const currentDate = new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });

    const itemsHTML = (order.items || [])
      .map((item: any) => `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.product_name || 'N/A'}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">Rs. ${(item.sold_price || 0).toFixed(2)}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">Rs. ${(item.total_price || 0).toFixed(2)}</td>
        </tr>
      `)
      .join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Receipt - ${order.order_number}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Arial', sans-serif;
            background: #f5f5f5;
            padding: 20px;
          }
          .receipt-container {
            width: 210mm;
            height: 297mm;
            background: white;
            padding: 15mm;
            margin: 0 auto;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            font-size: 10pt;
            color: #333;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #ef4444;
            padding-bottom: 10px;
            margin-bottom: 15px;
          }
          .header h1 {
            color: #ef4444;
            font-size: 18pt;
            margin-bottom: 5px;
          }
          .header p {
            color: #666;
            font-size: 9pt;
            margin: 3px 0;
          }
          .order-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 15px;
            font-size: 9pt;
          }
          .info-box {
            background: #f9f9f9;
            padding: 10px;
            border-left: 3px solid #ef4444;
          }
          .info-box label {
            font-weight: bold;
            color: #ef4444;
            display: block;
            margin-bottom: 2px;
          }
          .info-box value {
            color: #333;
            display: block;
          }
          .section-title {
            color: #ef4444;
            font-weight: bold;
            font-size: 11pt;
            border-bottom: 1px solid #ddd;
            padding-bottom: 5px;
            margin-top: 12px;
            margin-bottom: 8px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
          }
          table thead {
            background: #f0f0f0;
            border-bottom: 2px solid #ef4444;
          }
          table th {
            padding: 8px;
            text-align: left;
            font-weight: bold;
            font-size: 9pt;
            color: #333;
          }
          table td {
            padding: 8px;
            border-bottom: 1px solid #ddd;
            font-size: 9pt;
          }
          .total-section {
            background: #f9f9f9;
            padding: 10px;
            border: 1px solid #ddd;
            margin-top: 10px;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            padding: 5px 0;
            font-size: 9pt;
            border-bottom: 1px solid #eee;
          }
          .total-row.final {
            border: none;
            font-weight: bold;
            font-size: 11pt;
            color: #ef4444;
            padding: 8px 0;
          }
          .address-section {
            background: #f9f9f9;
            padding: 10px;
            margin-top: 10px;
            font-size: 9pt;
          }
          .address-title {
            font-weight: bold;
            color: #ef4444;
            margin-bottom: 5px;
          }
          .footer {
            text-align: center;
            margin-top: 15px;
            padding-top: 10px;
            border-top: 1px solid #ddd;
            font-size: 8pt;
            color: #999;
          }
          .payment-status {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 3px;
            font-weight: bold;
            font-size: 8pt;
            margin-top: 5px;
          }
          .status-unpaid {
            background: #fff3cd;
            color: #856404;
          }
          .status-partial {
            background: #cfe2ff;
            color: #084298;
          }
          .status-fully_paid {
            background: #d1e7dd;
            color: #0f5132;
          }
          @media print {
            body {
              padding: 0;
              background: white;
            }
            .receipt-container {
              width: 100%;
              height: auto;
              box-shadow: none;
              padding: 0;
              margin: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          <div class="header">
            <h1>DENNUP CLOTHES</h1>
            <p>Order Receipt</p>
            <p style="font-weight: bold; margin-top: 8px;">#${order.order_number}</p>
          </div>

          <div class="order-info">
            <div class="info-box">
              <label>Order ID</label>
              <value>${order.order_id}</value>
            </div>
            <div class="info-box">
              <label>Order Date</label>
              <value>${new Date(order.order_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' })}</value>
            </div>
            <div class="info-box">
              <label>Status</label>
              <value>${order.order_status}</value>
            </div>
            <div class="info-box">
              <label>Payment Method</label>
              <value>${(order.payment_method || 'cash').toUpperCase()}</value>
            </div>
          </div>

          <div class="section-title">Recipient Information</div>
          <div class="address-section">
            <div class="address-title">${order.recipient_name || 'N/A'}</div>
            <div>${order.recipient_phone || 'N/A'}</div>
            <div style="margin-top: 8px; line-height: 1.5;">
              ${order.line1 || 'N/A'}<br>
              ${order.line2 || 'N/A'}<br>
              ${order.city_name || 'N/A'}, ${order.district_name || 'N/A'} ${order.postal_code || 'N/A'}<br>
              ${order.province_name || 'N/A'}
            </div>
          </div>

          <div class="section-title">Order Items</div>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Unit Price</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
            </tbody>
          </table>

          <div class="total-section">
            <div class="total-row">
              <span>Subtotal:</span>
              <span>Rs. ${(order.total_amount || 0).toFixed(2)}</span>
            </div>
            <div class="total-row">
              <span>Amount Paid:</span>
              <span>Rs. ${(order.total_paid || 0).toFixed(2)}</span>
            </div>
            <div class="total-row">
              <span>Remaining Balance:</span>
              <span>Rs. ${(order.remaining_amount || 0).toFixed(2)}</span>
            </div>
            <div class="total-row final">
              <span>Total Amount:</span>
              <span>Rs. ${(order.total_amount || 0).toFixed(2)}</span>
            </div>
            <div style="text-align: center; margin-top: 8px;">
              <span class="payment-status status-${order.payment_status || 'unpaid'}">${(order.payment_status || 'unpaid').toUpperCase().replace('_', ' ')}</span>
            </div>
          </div>

          <div class="footer">
            <p>Generated on ${currentDate}</p>
            <p>Thank you for your order!</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

export default new OrderController();
