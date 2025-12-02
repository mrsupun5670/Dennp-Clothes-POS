-- Migration: Add payment tracking fields to orders table
-- Description: Adds fields to track payment status and amounts (advance, balance, total paid) for each order
-- Date: 2025-11-19
-- Status: Pending execution

-- Step 1: Add advance_paid column to track advance/partial payments
ALTER TABLE orders ADD COLUMN IF NOT EXISTS advance_paid DOUBLE DEFAULT 0 AFTER total_amount COMMENT 'Amount paid as advance or partial payment';

-- Step 2: Add balance_paid column to track final/remaining payments
ALTER TABLE orders ADD COLUMN IF NOT EXISTS balance_paid DOUBLE DEFAULT 0 AFTER advance_paid COMMENT 'Amount paid as balance payment';

-- Step 3: Add total_paid column for quick reference (advance_paid + balance_paid)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS total_paid DOUBLE DEFAULT 0 AFTER balance_paid COMMENT 'Total amount paid (advance + balance)';

-- Step 4: Add payment_status to track overall payment state
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status ENUM('unpaid', 'partial', 'fully_paid') DEFAULT 'unpaid' AFTER total_paid COMMENT 'Current payment status of order';

-- Step 5: Add remaining_amount column for quick calculation (total_amount - total_paid)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS remaining_amount DOUBLE DEFAULT 0 AFTER payment_status COMMENT 'Remaining amount to be paid';

-- Step 6: Add indexes for payment tracking queries (use DROP IF EXISTS + ADD pattern)
-- These will only be added if the columns exist
ALTER TABLE orders ADD INDEX idx_payment_status (payment_status);

-- Verification query - run after migration to confirm fields exist
-- SELECT order_id, order_number, total_amount, advance_paid, balance_paid, total_paid, payment_status, remaining_amount FROM orders LIMIT 1;
