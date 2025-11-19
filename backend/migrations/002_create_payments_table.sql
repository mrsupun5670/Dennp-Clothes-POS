-- Migration: Create payments table for order payment tracking
-- Description: Creates a comprehensive payment tracking table to support advance payments, balance payments, and partial payments
-- Date: 2025-11-19
-- Status: Pending execution

-- Create PAYMENTS table
CREATE TABLE IF NOT EXISTS payments (
  payment_id INT PRIMARY KEY AUTO_INCREMENT COMMENT 'Unique payment identifier',
  order_id INT NOT NULL COMMENT 'References the order being paid for',
  payment_type ENUM('advance', 'balance', 'full') NOT NULL DEFAULT 'full' COMMENT 'Type of payment: advance (partial), balance (remaining), full (complete)',
  amount_paid DOUBLE NOT NULL COMMENT 'Amount paid in this transaction',
  payment_method ENUM('cash', 'card', 'online', 'check', 'other') NOT NULL DEFAULT 'cash' COMMENT 'Payment method used',
  bank_name VARCHAR(100) COMMENT 'Bank name for card/online payments (e.g., BOC, Commercial Bank)',
  branch_name VARCHAR(100) COMMENT 'Branch name where payment was made',
  is_online_transfer BOOLEAN DEFAULT FALSE COMMENT 'Whether payment was online bank transfer',
  payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'When the payment was recorded',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation timestamp',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',

  -- Foreign Keys
  FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE RESTRICT ON UPDATE CASCADE,

  -- Indexes for common queries
  INDEX idx_order_id (order_id),
  INDEX idx_payment_date (payment_date),
  INDEX idx_payment_method (payment_method),
  INDEX idx_payment_type (payment_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Payment transaction tracking for orders';

-- Verification query - run after migration to confirm table exists
-- DESCRIBE payments;
-- SELECT * FROM payments LIMIT 1;
