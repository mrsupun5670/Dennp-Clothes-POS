# Database Schema Analysis - Dennup Clothes POS

## Overview
Your database contains a comprehensive e-commerce/POS system schema with 15 tables designed for multi-shop management with product inventory, customer orders, and user management.

---

## 📊 Database Structure Summary

### Total Tables: 15
- **Master Data:** 5 tables (Products, Categories, Sizes, Colors, Shops)
- **Inventory:** 3 tables (Shop Inventory, Shop Product Stock, Product Colors/Sizes)
- **Orders:** 2 tables (Orders, Order Items)
- **Customers:** 2 tables (Customers, Customer Addresses)
- **Location:** 3 tables (Provinces, Districts, Cities)
- **Users:** 1 table (Users)
- **Configuration:** Size Type

---

## 🗂️ Detailed Table Structure

### 1. **USERS** - User Authentication & Management
```
user_id (PK, Auto-increment)
username (UNIQUE, VARCHAR 100)
password_hash (VARCHAR 255)
first_name (VARCHAR 100)
last_name (VARCHAR 100)
phone (VARCHAR 20, Optional)
shop_id (FK → shops)
user_role (ENUM: admin, manager, cashier, staff)
joining_date (DATE)
user_status (ENUM: active, inactive, suspended)
created_at (TIMESTAMP)
```
**Purpose:** Staff authentication and role-based access control
**Indexes:** username, shop_id, user_role

---

### 2. **SHOPS** - Multi-Shop Management
```
shop_id (PK, Auto-increment)
shop_name (VARCHAR 100, UNIQUE)
address (VARCHAR 255)
contact_phone (VARCHAR 20)
manager_name (VARCHAR 100)
shop_status (ENUM: active, inactive, closed)
opening_date (DATE)
```
**Purpose:** Support multiple shop locations
**Indexes:** status

---

### 3. **PRODUCTS** - Product Master Data
```
product_id (PK, Auto-increment)
sku (VARCHAR 50, UNIQUE)
product_name (VARCHAR 150)
category_id (FK → categories)
description (TEXT)
retail_price (DOUBLE)
wholesale_price (DOUBLE, Optional)
product_status (ENUM: active, inactive, discontinued)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```
**Purpose:** Core product information with pricing
**Indexes:** sku, category_id, status, retail_price
**Important:** Missing cost_price and print_cost fields (from frontend model)

---

### 4. **CATEGORIES** - Product Categories
```
category_id (PK, Auto-increment)
category_name (VARCHAR 100, UNIQUE)
size_type_id (FK → size_type)
```
**Purpose:** Product categorization with size type mapping
**Indexes:** category_name

---

### 5. **SIZE_TYPE** - Size Classification
```
size_type_id (PK, Auto-increment)
Size_type_name (VARCHAR 10)
```
**Purpose:** Define size systems (XS/S/M/L, numeric, etc.)
**Examples:** "Clothing", "Numeric", "Numeric-Boots"

---

### 6. **SIZES** - Individual Size Values
```
size_id (PK, Auto-increment)
size_name (VARCHAR 10)
size_type_id (FK → size_type)
```
**Purpose:** Define specific sizes (S, M, L, etc.)
**Uniqueness:** Unique combination of size_name + size_type_id
**Examples:** S, M, L, XL (with size_type_id = clothing)

---

### 7. **COLORS** - Color Options
```
color_id (PK, Auto-increment)
color_name (VARCHAR 50, UNIQUE)
hex_code (VARCHAR 7, Optional)
```
**Purpose:** Available colors for products
**Examples:** Red (#FF0000), Blue (#0000FF)

---

### 8. **PRODUCT_COLORS** - Product-Color Mapping
```
product_color_id (PK, Auto-increment)
product_id (FK → products)
color_id (FK → colors)
```
**Purpose:** Define which colors available for each product
**Uniqueness:** Unique combination of product_id + color_id

---

### 9. **PRODUCT_SIZES** - Product-Size Mapping
```
product_size_id (PK, Auto-increment)
product_id (FK → products)
size_id (FK → sizes)
```
**Purpose:** Define which sizes available for each product
**Uniqueness:** Unique combination of product_id + size_id

---

### 10. **SHOP_PRODUCT_STOCK** - Detailed Stock Tracking
```
stock_id (PK, Auto-increment)
shop_id (FK → shops)
product_id (FK → products)
size_id (FK → sizes)
color_id (FK → colors)
stock_qty (INT)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```
**Purpose:** Track inventory for each product variant per shop
**Uniqueness:** Unique combination of (shop_id, product_id, size_id, color_id)
**Important:** Tracks quantity of specific size/color combinations in each shop

---

### 11. **SHOP_INVENTORY** - General Inventory Items
```
inventory_id (PK, Auto-increment)
shop_id (FK → shops)
item_name (VARCHAR 255)
quantity_in_stock (INT)
unit_cost (DOUBLE)
updated_at (TIMESTAMP)
```
**Purpose:** General non-product inventory (consumables, supplies)
**Uniqueness:** Unique combination of (shop_id, item_name)

---

### 12. **CUSTOMERS** - Customer Master Data
```
customer_id (PK, Auto-increment, starts at 1000)
first_name (VARCHAR 100)
last_name (VARCHAR 100)
mobile (VARCHAR 20, UNIQUE)
email (VARCHAR 100, UNIQUE, Optional)
orders_count (INT, default 0)
customer_status (ENUM: active, inactive, blocked)
total_spent (DOUBLE, default 0)
created_at (TIMESTAMP)
```
**Purpose:** Customer information and statistics
**Indexes:** mobile, email, status, created_at
**Notes:** Auto-increment starts at 1000

---

### 13. **CUSTOMER_ADDRESSES** - Customer Delivery Addresses
```
address_id (PK, Auto-increment)
line1 (VARCHAR 30)
line2 (VARCHAR 45)
postal_code (VARCHAR 15)
city_id (FK → cities)
customer_id (FK → customers)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```
**Purpose:** Store multiple addresses per customer
**Relationship:** One customer can have multiple addresses

---

### 14. **ORDERS** - Sales Orders
```
order_id (PK, Auto-increment)
order_number (VARCHAR 50, UNIQUE)
shop_id (FK → shops)
customer_id (FK → customers, Optional)
user_id (FK → users, Optional)
total_items (INT)
total_amount (DOUBLE)
payment_method (ENUM: cash, card, online, other)
order_status (ENUM: completed, cancelled, refunded)
notes (TEXT)
order_date (DATE)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
delivery_address (embedded fields):
  - line1 (VARCHAR 200)
  - line2 (VARCHAR 200)
  - postal_code (VARCHAR 45)
  - city_name (VARCHAR 45)
  - district_name (VARCHAR 45)
  - province_name (VARCHAR 45)
  - recipient_name (VARCHAR 100)
  - recipient_phone (VARCHAR 12)
```
**Purpose:** Order header with delivery information
**Indexes:** shop_id, customer_id, user_id, order_date, payment_method, status
**Design Note:** Delivery address embedded (denormalized) for historical tracking

---

### 15. **ORDER_ITEMS** - Order Line Items
```
item_id (PK, Auto-increment)
order_id (FK → orders)
product_id (FK → products)
color_id (FK → colors)
size_id (FK → sizes)
quantity (INT)
sold_price (DOUBLE)
total_price (DOUBLE)
created_at (TIMESTAMP)
```
**Purpose:** Individual items within an order
**Relationship:** One order can have multiple items
**Indexes:** order_id, product_id

---

### 16. **PROVINCES** - Location Hierarchy
```
provinces_id (PK, Auto-increment)
provinces_name (VARCHAR 45)
```
**Purpose:** Top-level geographic location

---

### 17. **DISTRICTS** - Subdivisions
```
district_id (PK, Auto-increment)
district_name (VARCHAR 45)
provinces_id (FK → provinces)
```
**Purpose:** Districts within provinces

---

### 18. **CITIES** - Cities/Towns
```
city_id (PK, Auto-increment)
city_name (VARCHAR 15)
district_id (FK → districts)
```
**Purpose:** Cities within districts

---

## 📈 Entity Relationships

### Hierarchy Flow:
```
SHOPS
  ├── USERS (staff at shop)
  ├── ORDERS (sales at shop)
  │    ├── ORDER_ITEMS (products in order)
  │    │    ├── PRODUCTS
  │    │    ├── COLORS
  │    │    └── SIZES
  │    └── CUSTOMERS (buyer)
  │         └── CUSTOMER_ADDRESSES
  │              └── CITIES → DISTRICTS → PROVINCES
  └── SHOP_PRODUCT_STOCK (inventory variants)
       ├── PRODUCTS
       ├── SIZES
       └── COLORS

PRODUCTS
  ├── CATEGORIES
  │    └── SIZE_TYPE → SIZES
  ├── PRODUCT_COLORS → COLORS
  └── PRODUCT_SIZES → SIZES
```

---

## 🔑 Key Features of This Schema

### 1. **Multi-Shop Support**
- Separate shops can operate independently
- Staff assigned to specific shops
- Inventory tracked per shop and product variant
- Orders tied to specific shop

### 2. **Product Variants**
- Products have multiple colors (via PRODUCT_COLORS)
- Products have multiple sizes (via PRODUCT_SIZES)
- Stock tracked per size/color combination per shop

### 3. **Order Management**
- Orders can be linked to customers or be anonymous
- Delivery address captured in order (denormalized)
- Payment method tracked (cash, card, online, other)
- Order status tracking (completed, cancelled, refunded)

### 4. **Customer Management**
- Multiple addresses per customer
- Customer statistics (orders_count, total_spent)
- Customer status management (active, inactive, blocked)

### 5. **User Management**
- Role-based access (admin, manager, cashier, staff)
- Users assigned to shops
- User status tracking

### 6. **Location Support**
- Full hierarchical location system (Province → District → City)
- Used for customer addresses

---

## ⚠️ Schema Issues & Gaps (Compared to Frontend)

### Missing Fields from Frontend Model:
1. **PRODUCTS table missing:**
   - `cost_price` (used in ProductsPage)
   - `print_cost` (newly added field)
   - No separate cost/print cost tracking

2. **ORDERS table missing:**
   - No payment tracking fields:
     - `advance_paid`
     - `balance_paid`
     - `total_paid`
     - `remaining_amount`
   - No payment status (like "partial", "fully_paid")
   - No bank/branch information for payments

3. **No separate PAYMENTS table** - Payment data needs to be added

---

## 📝 Database Notes

### Character Set:
- **Primary:** utf8mb4 (full UTF-8 support)
- **Some tables:** utf8mb4_0900_ai_ci (MySQL 8.0+)
- **Consistency:** Mix of collations - consider standardizing

### Auto-Increment Values:
- CUSTOMERS table starts at 1000 (customer IDs: 1000, 1001, etc.)
- Other tables start at 1

### Timezone:
- All timestamps use UTC (+00:00)
- Consider application-level timezone conversion if needed

---

## 🔍 Query Examples

### Get Order with Details:
```sql
SELECT
    o.order_id, o.order_number, o.total_amount,
    c.first_name, c.last_name,
    oi.quantity, p.product_name, s.size_name, co.color_name
FROM orders o
LEFT JOIN customers c ON o.customer_id = c.customer_id
LEFT JOIN order_items oi ON o.order_id = oi.order_id
LEFT JOIN products p ON oi.product_id = p.product_id
LEFT JOIN sizes s ON oi.size_id = s.size_id
LEFT JOIN colors co ON oi.color_id = co.color_id
WHERE o.order_id = ?;
```

### Get Product Stock by Shop:
```sql
SELECT
    p.product_name, s.size_name, c.color_name, sps.stock_qty
FROM shop_product_stock sps
JOIN products p ON sps.product_id = p.product_id
JOIN sizes s ON sps.size_id = s.size_id
JOIN colors c ON sps.color_id = c.color_id
WHERE sps.shop_id = ? AND p.category_id = ?;
```

---

## 🛠️ What Needs to be Added

### 1. Payment Tracking Table
```sql
CREATE TABLE payments (
  payment_id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  payment_type ENUM('advance', 'balance', 'full'),
  amount_paid DOUBLE NOT NULL,
  payment_method ENUM('cash', 'card', 'online'),
  bank_name VARCHAR(100),
  branch_name VARCHAR(100),
  is_online_transfer BOOLEAN,
  payment_date TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(order_id)
);
```

### 2. Cost Fields in PRODUCTS
```sql
ALTER TABLE products ADD COLUMN cost_price DOUBLE;
ALTER TABLE products ADD COLUMN print_cost DOUBLE;
```

### 3. Payment Summary Fields in ORDERS
```sql
ALTER TABLE orders ADD COLUMN advance_paid DOUBLE DEFAULT 0;
ALTER TABLE orders ADD COLUMN balance_paid DOUBLE DEFAULT 0;
ALTER TABLE orders ADD COLUMN payment_status ENUM('unpaid', 'partial', 'fully_paid');
```

---

## 📊 Current Data Status
- All tables are empty (no data loaded yet)
- Schema is ready for use
- Primary keys and indexes are in place

---

## Summary

Your database schema is **well-designed for a multi-shop POS system** with:
- ✅ Proper normalization for products and variants
- ✅ Multi-shop support
- ✅ Customer management with addresses
- ✅ Complete order management
- ✅ User role-based system
- ⚠️ **Gaps:** Payment tracking, cost fields (can be added)

The schema aligns 90% with your frontend model - just needs payment and cost tracking enhancements.

---

**Database Name:** u331468302_dennup_pos
**Created:** 2025-11-19
**Version:** 1.0
