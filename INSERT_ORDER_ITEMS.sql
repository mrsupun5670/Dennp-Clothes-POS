-- ============================================================================
-- Order Items Insertion Script for Hostinger phpMyAdmin
-- ============================================================================
-- This script adds sample order items to orders in your database
-- Each order will have 3-4 items with different products, colors, and sizes
--
-- PREREQUISITES:
-- 1. You must have at least 1 order in the orders table
-- 2. You must have at least 4 products in the products table
-- 3. You must have at least 2 colors in the colors table
-- 4. You must have at least 2 sizes in the sizes table
--
-- INSTRUCTIONS FOR HOSTINGER:
-- 1. Open phpMyAdmin
-- 2. Go to your database (e.g., dennep_clothes_pos)
-- 3. Click on "SQL" tab
-- 4. Copy and paste the SQL script below
-- 5. Click "Go" to execute
--
-- ============================================================================

-- First, let's verify we have the required data
-- Uncomment these queries to check before running inserts:
/*
SELECT COUNT(*) as order_count FROM orders;
SELECT COUNT(*) as product_count FROM products;
SELECT COUNT(*) as color_count FROM colors;
SELECT COUNT(*) as size_count FROM sizes;
*/

-- ============================================================================
-- METHOD 1: Insert items for the FIRST ORDER (if you have at least 1 order)
-- ============================================================================
-- This inserts 4 items into order_id = 1

INSERT INTO `order_items`
(`order_id`, `product_id`, `color_id`, `size_id`, `quantity`, `sold_price`, `total_price`)
SELECT
  1 as order_id,
  p.product_id,
  c.color_id,
  s.size_id,
  qi.quantity,
  qi.sold_price,
  (qi.quantity * qi.sold_price) as total_price
FROM (
  SELECT 1 as product_id, 2 as quantity, 1500 as sold_price
  UNION ALL
  SELECT 2 as product_id, 1 as quantity, 2500 as sold_price
  UNION ALL
  SELECT 3 as product_id, 3 as quantity, 800 as sold_price
  UNION ALL
  SELECT 4 as product_id, 1 as quantity, 3000 as sold_price
) qi
JOIN products p ON p.product_id = qi.product_id
JOIN colors c ON c.color_id = 1
JOIN sizes s ON s.size_id = 1
WHERE EXISTS (SELECT 1 FROM orders WHERE order_id = 1)
LIMIT 4;

-- ============================================================================
-- METHOD 2: Insert items for SECOND ORDER (if you have at least 2 orders)
-- ============================================================================
-- This inserts 3 items into order_id = 2

INSERT INTO `order_items`
(`order_id`, `product_id`, `color_id`, `size_id`, `quantity`, `sold_price`, `total_price`)
SELECT
  2 as order_id,
  p.product_id,
  c.color_id,
  s.size_id,
  qi.quantity,
  qi.sold_price,
  (qi.quantity * qi.sold_price) as total_price
FROM (
  SELECT 2 as product_id, 2 as quantity, 2500 as sold_price
  UNION ALL
  SELECT 3 as product_id, 1 as quantity, 800 as sold_price
  UNION ALL
  SELECT 4 as product_id, 2 as quantity, 3000 as sold_price
) qi
JOIN products p ON p.product_id = qi.product_id
JOIN colors c ON c.color_id = 1
JOIN sizes s ON s.size_id = 2
WHERE EXISTS (SELECT 1 FROM orders WHERE order_id = 2)
LIMIT 3;

-- ============================================================================
-- METHOD 3: Insert items for THIRD ORDER (if you have at least 3 orders)
-- ============================================================================
-- This inserts 4 items into order_id = 3

INSERT INTO `order_items`
(`order_id`, `product_id`, `color_id`, `size_id`, `quantity`, `sold_price`, `total_price`)
SELECT
  3 as order_id,
  p.product_id,
  c.color_id,
  s.size_id,
  qi.quantity,
  qi.sold_price,
  (qi.quantity * qi.sold_price) as total_price
FROM (
  SELECT 1 as product_id, 1 as quantity, 1500 as sold_price
  UNION ALL
  SELECT 3 as product_id, 2 as quantity, 800 as sold_price
  UNION ALL
  SELECT 4 as product_id, 1 as quantity, 3000 as sold_price
  UNION ALL
  SELECT 5 as product_id, 3 as quantity, 1200 as sold_price
) qi
JOIN products p ON p.product_id = qi.product_id
JOIN colors c ON c.color_id = 2
JOIN sizes s ON s.size_id = 1
WHERE EXISTS (SELECT 1 FROM orders WHERE order_id = 3)
LIMIT 4;

-- ============================================================================
-- VERIFICATION QUERIES
-- Run these after inserting to verify the data
-- ============================================================================

-- Check total items inserted
SELECT COUNT(*) as total_items_inserted FROM order_items;

-- Check items per order
SELECT
  o.order_id,
  o.order_number,
  COUNT(oi.item_id) as item_count,
  SUM(oi.total_price) as order_total
FROM orders o
LEFT JOIN order_items oi ON o.order_id = oi.order_id
GROUP BY o.order_id, o.order_number
ORDER BY o.order_id;

-- Check detailed order items
SELECT
  o.order_id,
  o.order_number,
  p.product_name,
  c.color_name,
  s.size_name,
  oi.quantity,
  oi.sold_price,
  oi.total_price
FROM order_items oi
JOIN orders o ON oi.order_id = o.order_id
JOIN products p ON oi.product_id = p.product_id
JOIN colors c ON oi.color_id = c.color_id
JOIN sizes s ON oi.size_id = s.size_id
ORDER BY o.order_id, oi.item_id;

-- ============================================================================
-- ✅ COMPLETE! Your orders now have items associated with them.
-- ============================================================================
