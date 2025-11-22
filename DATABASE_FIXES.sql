-- ============================================
-- DATABASE FIXES FOR ORDER MANAGEMENT
-- ============================================
-- Run these in Hostinger phpMyAdmin SQL tab

-- 1. Update order_status enum to include 'cancelled'
-- (You already have tracking_number column, so no need to add it)
ALTER TABLE orders MODIFY COLUMN order_status 
ENUM('pending','processing','shipped','delivered','cancelled') NOT NULL;

-- 2. Verify tracking_number column type (should already exist from your dump)
-- SELECT COLUMN_NAME, COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS 
-- WHERE TABLE_NAME = 'orders' AND COLUMN_NAME = 'tracking_number';

-- 3. Test tracking_number update (sample query to test manually)
-- UPDATE orders SET tracking_number = 'TEST123' WHERE order_id = 16 AND shop_id = 1;
-- SELECT order_id, order_number, tracking_number FROM orders WHERE order_id = 16;
