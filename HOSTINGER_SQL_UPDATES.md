# Hostinger Database Updates - SQL Snippets Only

**Apply these SQL commands in Hostinger phpMyAdmin**

---

## 🔧 SQL Updates Required

### 1️⃣ Add shop_id to PRODUCTS table

```sql
ALTER TABLE products
ADD COLUMN shop_id INT NOT NULL DEFAULT 1 AFTER product_id,
ADD CONSTRAINT fk_products_shops FOREIGN KEY (shop_id) REFERENCES shops(shop_id) ON DELETE RESTRICT,
ADD INDEX idx_shop_id (shop_id),
ADD UNIQUE KEY unique_sku_per_shop (shop_id, sku);
```

---

### 2️⃣ Add shop_id to CATEGORIES table

```sql
ALTER TABLE categories
ADD COLUMN shop_id INT NOT NULL DEFAULT 1 AFTER category_id,
ADD CONSTRAINT fk_categories_shops FOREIGN KEY (shop_id) REFERENCES shops(shop_id) ON DELETE RESTRICT,
ADD INDEX idx_shop_id (shop_id),
ADD UNIQUE KEY unique_category_per_shop (shop_id, category_name);
```

---

### 3️⃣ Add shop_id to COLORS table

```sql
ALTER TABLE colors
ADD COLUMN shop_id INT NOT NULL DEFAULT 1 AFTER color_id,
ADD CONSTRAINT fk_colors_shops FOREIGN KEY (shop_id) REFERENCES shops(shop_id) ON DELETE RESTRICT,
ADD INDEX idx_shop_id (shop_id),
ADD UNIQUE KEY unique_color_per_shop (shop_id, color_name);
```

---

### 4️⃣ Add shop_id to SIZES table

```sql
ALTER TABLE sizes
ADD COLUMN shop_id INT NOT NULL DEFAULT 1 AFTER size_id,
ADD CONSTRAINT fk_sizes_shops FOREIGN KEY (shop_id) REFERENCES shops(shop_id) ON DELETE RESTRICT,
ADD INDEX idx_shop_id (shop_id),
ADD UNIQUE KEY unique_size_per_shop (shop_id, size_name, size_type_id);
```

---

### 5️⃣ Add shop_id to CUSTOMERS table

```sql
ALTER TABLE customers
ADD COLUMN shop_id INT NOT NULL DEFAULT 1 AFTER customer_id,
ADD CONSTRAINT fk_customers_shops FOREIGN KEY (shop_id) REFERENCES shops(shop_id) ON DELETE RESTRICT,
ADD INDEX idx_shop_id (shop_id),
ADD UNIQUE KEY unique_mobile_per_shop (shop_id, mobile);
```

---

### 6️⃣ Add shop_id to CATEGORIES (if not already)

```sql
ALTER TABLE categories
ADD COLUMN shop_id INT NOT NULL DEFAULT 1 AFTER category_id;
```

---

### 7️⃣ Update PRODUCT_COLORS table (keep as-is, inherits shop_id through product)

No change needed - queries will filter through products.shop_id

---

### 8️⃣ Update PRODUCT_SIZES table (keep as-is, inherits shop_id through product)

No change needed - queries will filter through products.shop_id

---

## ✅ Verification Queries

After running all updates, verify with:

```sql
-- Check products
DESC products;
-- Should show: shop_id column

-- Check categories
DESC categories;
-- Should show: shop_id column

-- Check colors
DESC colors;
-- Should show: shop_id column

-- Check sizes
DESC sizes;
-- Should show: shop_id column

-- Check customers
DESC customers;
-- Should show: shop_id column

-- Show all columns with shop_id
SELECT TABLE_NAME, COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
WHERE COLUMN_NAME = 'shop_id' AND TABLE_SCHEMA = 'dennep_clothes_pos';
```

---

## 📝 Notes

- All updates use `DEFAULT 1` to assign current data to Shop 1
- All have `ON DELETE RESTRICT` to prevent accidental shop deletion
- All have unique constraints to prevent duplicates within same shop
- All have indexes for fast querying

That's it! No more database changes needed. ✅

