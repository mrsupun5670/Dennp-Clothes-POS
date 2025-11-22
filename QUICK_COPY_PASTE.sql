-- ============================================================================
-- QUICK COPY & PASTE - Order Items for Hostinger phpMyAdmin
-- ============================================================================
-- Just copy everything below and paste in Hostinger SQL tab, then click Go
-- This adds 11 order items across 3 orders (4, 3, 4 items respectively)
-- ============================================================================

INSERT INTO order_items (order_id, product_id, color_id, size_id, quantity, sold_price, total_price) VALUES
(1, 1, 1, 1, 2, 1500, 3000),
(1, 2, 1, 2, 1, 2500, 2500),
(1, 3, 2, 1, 3, 800, 2400),
(1, 4, 1, 2, 1, 3000, 3000),
(2, 2, 2, 1, 2, 2500, 5000),
(2, 3, 1, 2, 1, 800, 800),
(2, 5, 2, 1, 2, 1200, 2400),
(3, 1, 2, 2, 1, 1500, 1500),
(3, 4, 1, 1, 2, 3000, 6000),
(3, 3, 2, 2, 3, 800, 2400),
(3, 5, 1, 1, 1, 1200, 1200);
