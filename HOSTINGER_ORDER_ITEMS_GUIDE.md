# Hostinger - Insert Order Items SQL Guide

## Quick Summary

Two SQL scripts have been created to add order items to your orders:

1. **INSERT_ORDER_ITEMS_SIMPLE.sql** ← **USE THIS ONE** (Easy, straightforward)
2. **INSERT_ORDER_ITEMS.sql** (Safe, checks for data existence)

---

## 📋 Table Structure Reference

```
order_items table columns:
├── item_id (INT) - Auto increment
├── order_id (INT) - Links to orders table
├── product_id (INT) - Links to products table
├── color_id (INT) - Links to colors table
├── size_id (INT) - Links to sizes table
├── quantity (INT) - How many units
├── sold_price (DOUBLE) - Price per unit
├── total_price (DOUBLE) - quantity × sold_price
└── created_at (TIMESTAMP) - Auto timestamp
```

---

## ✅ STEP-BY-STEP: How to Insert Order Items

### Step 1: Check Your Current Data

First, verify you have the required base data:

```sql
-- Check how many orders you have
SELECT COUNT(*) FROM orders;

-- Check how many products
SELECT COUNT(*) FROM products;

-- Check how many colors
SELECT COUNT(*) FROM colors;

-- Check how many sizes
SELECT COUNT(*) FROM sizes;
```

**You need at least:**
- ✓ 3+ orders (order_id 1, 2, 3)
- ✓ 5+ products (product_id 1-5)
- ✓ 2+ colors (color_id 1-2)
- ✓ 2+ sizes (size_id 1-2)

---

### Step 2: Go to Hostinger phpMyAdmin

1. Login to Hostinger
2. Go to **Databases** section
3. Click on your database name (e.g., `dennep_clothes_pos`)
4. Click on the **SQL** tab

---

### Step 3: Copy & Paste the Simple Script

**Use the SIMPLE version** - it's easier:

```sql
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
```

---

### Step 4: Execute the Query

1. Paste the SQL script into the text area
2. Click the **Go** button (or Execute)
3. Wait for success message

---

## 📊 What Gets Inserted

### Order 1 (order_id = 1)
| Product | Color | Size | Qty | Unit Price | Total |
|---------|-------|------|-----|------------|-------|
| Product 1 | Color 1 | Size 1 | 2 | Rs. 1500 | Rs. 3000 |
| Product 2 | Color 1 | Size 2 | 1 | Rs. 2500 | Rs. 2500 |
| Product 3 | Color 2 | Size 1 | 3 | Rs. 800 | Rs. 2400 |
| Product 4 | Color 1 | Size 2 | 1 | Rs. 3000 | Rs. 3000 |
| **Order Total** | | | | | **Rs. 10,900** |

### Order 2 (order_id = 2)
| Product | Color | Size | Qty | Unit Price | Total |
|---------|-------|------|-----|------------|-------|
| Product 2 | Color 2 | Size 1 | 2 | Rs. 2500 | Rs. 5000 |
| Product 3 | Color 1 | Size 2 | 1 | Rs. 800 | Rs. 800 |
| Product 5 | Color 2 | Size 1 | 2 | Rs. 1200 | Rs. 2400 |
| **Order Total** | | | | | **Rs. 8,200** |

### Order 3 (order_id = 3)
| Product | Color | Size | Qty | Unit Price | Total |
|---------|-------|------|-----|------------|-------|
| Product 1 | Color 2 | Size 2 | 1 | Rs. 1500 | Rs. 1500 |
| Product 4 | Color 1 | Size 1 | 2 | Rs. 3000 | Rs. 6000 |
| Product 3 | Color 2 | Size 2 | 3 | Rs. 800 | Rs. 2400 |
| Product 5 | Color 1 | Size 1 | 1 | Rs. 1200 | Rs. 1200 |
| **Order Total** | | | | | **Rs. 11,100** |

---

## 🔍 How to Verify the Insertion

After running the insert script, verify with these queries:

### Query 1: See all order items
```sql
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
```

Expected output: 11 rows (4 items + 3 items + 4 items)

### Query 2: Summary by order
```sql
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
```

Expected output:
```
order_id | order_number | item_count | order_total
1        | ORD-001      | 4          | 10900
2        | ORD-002      | 3          | 8200
3        | ORD-003      | 4          | 11100
```

---

## 🛠️ Custom Values - How to Modify

If you want to use different product IDs or prices, here's how:

### Format:
```sql
(order_id, product_id, color_id, size_id, quantity, sold_price, total_price)
```

### Example:
```sql
-- Original
(1, 1, 1, 1, 2, 1500, 3000),

-- Change quantity to 5:
(1, 1, 1, 1, 5, 1500, 7500),  -- Note: also update total_price!

-- Use different product (product_id 10):
(1, 10, 1, 1, 2, 1500, 3000),

-- Use different color (color_id 5):
(1, 1, 5, 1, 2, 1500, 3000),

-- Change price to Rs. 2000:
(1, 1, 1, 1, 2, 2000, 4000),
```

---

## ⚠️ Important Rules

1. **order_id** must exist in the `orders` table
2. **product_id** must exist in the `products` table
3. **color_id** must exist in the `colors` table
4. **size_id** must exist in the `sizes` table
5. **total_price** = quantity × sold_price
6. Don't add **item_id** (it auto-increments)
7. Don't add **created_at** (it auto-timestamps)

---

## ❌ If You Get an Error

### Error: "Foreign key constraint fails"
**Cause:** The product_id, color_id, size_id, or order_id don't exist

**Solution:** Check what IDs exist:
```sql
SELECT product_id FROM products LIMIT 10;
SELECT color_id FROM colors LIMIT 10;
SELECT size_id FROM sizes LIMIT 10;
SELECT order_id FROM orders LIMIT 10;
```

Then use valid IDs in the insert.

### Error: "Column count doesn't match"
**Cause:** Wrong number of columns in VALUES

**Solution:** Make sure you have exactly 8 values:
```
order_id, product_id, color_id, size_id, quantity, sold_price, total_price
```

---

## 📁 Files Created for You

1. **INSERT_ORDER_ITEMS_SIMPLE.sql** - Easy version, use this!
2. **INSERT_ORDER_ITEMS.sql** - Safe version with checks
3. **HOSTINGER_ORDER_ITEMS_GUIDE.md** - This guide

---

## ✨ Next Steps

After inserting items:
1. Go to your Orders page in the application
2. Click on any order
3. You should now see the items listed under "Order Items" section
4. The order totals should match the sum of item prices
5. Try filtering orders by status to confirm the fix works!

---

## 💡 Tips

- You can modify quantities and prices as needed
- You can add items to more orders by copying the INSERT pattern
- You can use any valid combination of product/color/size IDs
- The `sold_price` can be different from the product's retail price

---

**That's it! You're ready to insert order items. 🚀**
