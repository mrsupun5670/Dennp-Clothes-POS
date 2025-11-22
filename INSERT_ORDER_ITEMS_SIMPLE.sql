-- ============================================================================
-- SIMPLE Order Items Insertion Script - Copy & Paste Ready
-- ============================================================================
-- For Hostinger phpMyAdmin SQL tab
-- Adds 3-4 items to each of your first 3 orders
--
-- IMPORTANT: Make sure you have:
-- ✓ At least 5 products (product_id 1-5)
-- ✓ At least 2 colors (color_id 1-2)
-- ✓ At least 2 sizes (size_id 1-2)
-- ✓ At least 3 orders (order_id 1-3)
--
-- ============================================================================

-- ORDER 1: Insert 4 items
INSERT INTO order_items (order_id, product_id, color_id, size_id, quantity, sold_price, total_price) VALUES
(1, 1, 1, 1, 2, 1500, 3000),
(1, 2, 1, 2, 1, 2500, 2500),
(1, 3, 2, 1, 3, 800, 2400),
(1, 4, 1, 2, 1, 3000, 3000);

-- ORDER 2: Insert 3 items
INSERT INTO order_items (order_id, product_id, color_id, size_id, quantity, sold_price, total_price) VALUES
(2, 2, 2, 1, 2, 2500, 5000),
(2, 3, 1, 2, 1, 800, 800),
(2, 5, 2, 1, 2, 1200, 2400);

-- ORDER 3: Insert 4 items
INSERT INTO order_items (order_id, product_id, color_id, size_id, quantity, sold_price, total_price) VALUES
(3, 1, 2, 2, 1, 1500, 1500),
(3, 4, 1, 1, 2, 3000, 6000),
(3, 3, 2, 2, 3, 800, 2400),
(3, 5, 1, 1, 1, 1200, 1200);

-- ============================================================================
-- VERIFY - Run these queries to see your inserted items
-- ============================================================================

-- View all inserted items with product details
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

-- Summary: Items per order
SELECT
  o.order_id,
  o.order_number,
  COUNT(oi.item_id) as item_count,
  SUM(oi.total_price) as order_total
FROM orders o
LEFT JOIN order_items oi ON o.order_id = oi.order_id
WHERE oi.item_id IS NOT NULL
GROUP BY o.order_id, o.order_number
ORDER BY o.order_id;
