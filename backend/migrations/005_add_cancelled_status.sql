-- Migration: Add 'cancelled' status to order_status enum
-- Description: Allows orders to be marked as cancelled
-- Date: 2025-11-22

-- Step 1: Modify the order_status enum to include 'cancelled'
ALTER TABLE orders MODIFY COLUMN order_status
ENUM('pending','processing','shipped','delivered','cancelled');

-- Step 2: Verify the change
-- SELECT DISTINCT order_status FROM orders;
