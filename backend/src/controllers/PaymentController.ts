import { Request, Response } from 'express';
import PaymentModel from '../models/Payment';
import { logger } from '../utils/logger';
import { query } from '../config/database';

class PaymentController {
  async getShopPayments(req: Request, res: Response): Promise<void> {
    try {
      const { shopId } = req.params;
      const shopIdNum = Number(shopId);

      if (!shopIdNum) {
        res.status(400).json({ success: false, message: 'Invalid shop ID' });
        return;
      }

      const payments = await PaymentModel.getShopPayments(shopIdNum);
      res.json({ success: true, data: payments, message: 'Payments retrieved successfully' });
    } catch (error) {
      logger.error('Error in getShopPayments:', error);
      res.status(500).json({ success: false, message: 'Failed to retrieve payments' });
    }
  }

  async getPaymentById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { shop_id } = req.query;
      const paymentId = Number(id);
      const shopId = Number(shop_id);

      if (!paymentId || !shopId) {
        res.status(400).json({ success: false, message: 'Invalid IDs' });
        return;
      }

      const payment = await PaymentModel.getPaymentById(paymentId, shopId);
      if (!payment) {
        res.status(404).json({ success: false, message: 'Payment not found' });
        return;
      }

      res.json({ success: true, data: payment, message: 'Payment retrieved successfully' });
    } catch (error) {
      logger.error('Error in getPaymentById:', error);
      res.status(500).json({ success: false, message: 'Failed to retrieve payment' });
    }
  }

  async createPayment(req: Request, res: Response): Promise<void> {
    try {
      const { shop_id, customer_id, payment_amount, payment_method, bank_account_id, branch_name, order_id } = req.body;

      // Validate essential fields
      if (!shop_id) {
        res.status(400).json({ success: false, message: 'Shop ID is required' });
        return;
      }

      if (!customer_id) {
        res.status(400).json({ success: false, message: 'Customer ID is required' });
        return;
      }

      if (!payment_amount || parseFloat(payment_amount) <= 0) {
        res.status(400).json({ success: false, message: 'Payment amount must be greater than 0' });
        return;
      }

      if (!payment_method) {
        res.status(400).json({ success: false, message: 'Payment method is required' });
        return;
      }

      // For bank transfers, bank account is required
      if ((payment_method === 'online_transfer' || payment_method === 'bank_deposit') && !bank_account_id) {
        res.status(400).json({ success: false, message: 'Bank account is required for bank transfers' });
        return;
      }

      // Branch name is only required for bank_deposit, not online_transfer
      if (payment_method === 'bank_deposit' && !branch_name) {
        res.status(400).json({ success: false, message: 'Branch name is required for bank deposit' });
        return;
      }

      // CAP PAYMENT AT ORDER TOTAL - Don't allow overpayment recording
      let actualPaymentAmount = parseFloat(payment_amount);

      if (order_id) {
        // Get order details
        const orderResult = await query(
          `SELECT final_amount FROM orders WHERE order_id = ? AND shop_id = ?`,
          [order_id, shop_id]
        );

        if ((orderResult as any[]).length > 0) {
          const order = (orderResult as any[])[0];
          const orderTotal = parseFloat(order.final_amount);

          logger.info('Payment validation for order', {
            order_id,
            orderTotal,
            requestedPayment: actualPaymentAmount
          });

          // If payment exceeds order total, cap it at order total
          if (actualPaymentAmount > orderTotal) {
            logger.warn('Payment amount exceeds order total - capping at order total', {
              order_id,
              requestedPayment: actualPaymentAmount,
              orderTotal,
              cappedPayment: orderTotal
            });
            actualPaymentAmount = orderTotal;
          }
        }
      }

      // Create payment with the actual (possibly capped) amount
      const paymentData = {
        ...req.body,
        payment_amount: actualPaymentAmount
      };

      const paymentId = await PaymentModel.createPayment(shop_id, paymentData);

      logger.info('Payment created', {
        paymentId,
        order_id,
        requestedAmount: parseFloat(payment_amount),
        recordedAmount: actualPaymentAmount,
        capped: actualPaymentAmount < parseFloat(payment_amount)
      });

      res.status(201).json({
        success: true,
        data: {
          payment_id: paymentId,
          recorded_amount: actualPaymentAmount,
          change_given: parseFloat(payment_amount) - actualPaymentAmount
        },
        message: 'Payment created successfully'
      });
    } catch (error: any) {
      logger.error('Error in createPayment:', error);

      // Handle customer not found error
      if (error.code === 'ER_NO_REFERENCED_ROW_2' || error.message?.includes('foreign key')) {
        res.status(400).json({ success: false, message: 'Customer not found. Please select a valid customer' });
        return;
      }

      res.status(500).json({ success: false, message: 'Failed to create payment', details: error.message });
    }
  }

  async updatePayment(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { shop_id } = req.query;
      const paymentId = Number(id);
      const shopId = Number(shop_id);

      if (!paymentId || !shopId) {
        res.status(400).json({ success: false, message: 'Invalid IDs' });
        return;
      }

      const success = await PaymentModel.updatePayment(paymentId, shopId, req.body);
      if (!success) {
        res.status(404).json({ success: false, message: 'Payment not found' });
        return;
      }

      res.json({ success: true, message: 'Payment updated successfully' });
    } catch (error) {
      logger.error('Error in updatePayment:', error);
      res.status(500).json({ success: false, message: 'Failed to update payment' });
    }
  }

  async getOrderPayments(req: Request, res: Response): Promise<void> {
    try {
      const { orderId } = req.params;
      const orderIdNum = Number(orderId);

      if (!orderIdNum) {
        res.status(400).json({ success: false, message: 'Invalid order ID' });
        return;
      }

      const payments = await PaymentModel.getOrderPayments(orderIdNum);
      res.json({ success: true, data: payments, message: 'Order payments retrieved successfully' });
    } catch (error) {
      logger.error('Error in getOrderPayments:', error);
      res.status(500).json({ success: false, message: 'Failed to retrieve order payments' });
    }
  }

  async getPaymentsByDateRange(req: Request, res: Response): Promise<void> {
    try {
      const { shopId } = req.params;
      const { start_date, end_date } = req.query;
      const shopIdNum = Number(shopId);

      if (!shopIdNum || !start_date || !end_date) {
        res.status(400).json({ success: false, message: 'Missing required parameters' });
        return;
      }

      const payments = await PaymentModel.getPaymentsByDateRange(shopIdNum, String(start_date), String(end_date));
      res.json({ success: true, data: payments, message: 'Payments retrieved successfully' });
    } catch (error) {
      logger.error('Error in getPaymentsByDateRange:', error);
      res.status(500).json({ success: false, message: 'Failed to retrieve payments' });
    }
  }

  async getPaymentsByMethod(req: Request, res: Response): Promise<void> {
    try {
      const { shopId, method } = req.params;
      const shopIdNum = Number(shopId);

      if (!shopIdNum || !method) {
        res.status(400).json({ success: false, message: 'Invalid parameters' });
        return;
      }

      const payments = await PaymentModel.getPaymentsByMethod(shopIdNum, method);
      res.json({ success: true, data: payments, message: 'Payments retrieved successfully' });
    } catch (error) {
      logger.error('Error in getPaymentsByMethod:', error);
      res.status(500).json({ success: false, message: 'Failed to retrieve payments' });
    }
  }

  async getPaymentSummary(req: Request, res: Response): Promise<void> {
    try {
      const { shopId } = req.params;
      const shopIdNum = Number(shopId);

      if (!shopIdNum) {
        res.status(400).json({ success: false, message: 'Invalid shop ID' });
        return;
      }

      const summary = await PaymentModel.getPaymentSummary(shopIdNum);
      res.json({ success: true, data: summary, message: 'Payment summary retrieved successfully' });
    } catch (error) {
      logger.error('Error in getPaymentSummary:', error);
      res.status(500).json({ success: false, message: 'Failed to retrieve payment summary' });
    }
  }
}

export default new PaymentController();
