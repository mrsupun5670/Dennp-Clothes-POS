-- Migration: Update order_status enum to include 'cancelled'
-- Description: Adds 'cancelled' status to the order_status enum in the database
-- Date: 2025-11-22

-- Step 1: Modify the order_status enum to include 'cancelled'
ALTER TABLE orders MODIFY COLUMN order_status
ENUM('pending','processing','shipped','delivered','cancelled') NOT NULL;

-- Step 2: Verify the change
-- SELECT DISTINCT order_status FROM orders;
