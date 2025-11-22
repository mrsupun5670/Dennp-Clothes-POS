-- Migration: Fix order_status enum values to match frontend expectations
-- Description: Changes order_status enum from 'completed','cancelled','refunded' to
--              'pending','processing','shipped','delivered' to align with frontend implementation
-- Date: 2025-11-22
-- Status: Pending execution

-- Step 1: Modify the order_status enum to include new values
ALTER TABLE orders MODIFY COLUMN order_status
ENUM('pending','processing','shipped','delivered','completed','cancelled','refunded')
COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending';

-- Step 2: Migrate existing data to new status values
-- Mapping: completed -> delivered, cancelled -> cancelled, refunded -> delivered
UPDATE orders SET order_status = 'delivered' WHERE order_status = 'completed';
UPDATE orders SET order_status = 'delivered' WHERE order_status = 'refunded';

-- Step 3: Remove old enum values from the column definition
ALTER TABLE orders MODIFY COLUMN order_status
ENUM('pending','processing','shipped','delivered')
COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending';

-- Verification query - run after migration to confirm values exist
-- SELECT DISTINCT order_status FROM orders;
-- SELECT COUNT(*) as pending,
--        SUM(CASE WHEN order_status = 'pending' THEN 1 ELSE 0 END) as pending_count,
--        SUM(CASE WHEN order_status = 'processing' THEN 1 ELSE 0 END) as processing_count,
--        SUM(CASE WHEN order_status = 'shipped' THEN 1 ELSE 0 END) as shipped_count,
--        SUM(CASE WHEN order_status = 'delivered' THEN 1 ELSE 0 END) as delivered_count
-- FROM orders;
