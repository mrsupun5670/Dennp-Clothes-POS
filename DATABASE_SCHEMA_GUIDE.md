# DATABASE SCHEMA GUIDE - Optimized Multi-Shop POS System

## Overview

The optimized database schema (`dennep_pos_optimized.sql`) contains **22 tables** designed for a complete multi-shop Point of Sale system. This schema supports:

- ✅ Multiple shops with isolated data
- ✅ Product inventory management with size/color variants
- ✅ Supplies/materials tracking
- ✅ Customer management and order processing
- ✅ Payment processing with bank account integration
- ✅ Comprehensive audit and activity logging
- ✅ Payment reconciliation tracking

---

## Table Structure

### Core Management Tables

#### 1. **shops** - Shop Locations
Multi-shop support with complete isolation per shop.

| Column | Type | Notes |
|--------|------|-------|
| shop_id | INT (PK) | Auto-increment |
| shop_name | VARCHAR(100) | UNIQUE |
| shop_phone | VARCHAR(20) | Contact number |
| shop_address | VARCHAR(255) | Physical location |
| manager_name | VARCHAR(100) | Shop manager |
| shop_status | ENUM('active','inactive','closed') | Default: active |
| opening_date | DATE | Shop opening date |
| created_at | TIMESTAMP | Auto-set |
| updated_at | TIMESTAMP | Auto-update |

**Keys:** `UNIQUE(shop_name)`, `INDEX(shop_status)`

**Sample Data:** 5 shops (Colombo Flagship, Kandy Boutique, Galle Outpost, Jaffna Store, Warehouse Outlet)

---

#### 2. **users** - Staff Management
User accounts with role-based access control.

| Column | Type | Notes |
|--------|------|-------|
| user_id | INT (PK) | Auto-increment |
| username | VARCHAR(100) | UNIQUE |
| password_hash | VARCHAR(255) | Bcrypt hash |
| first_name | VARCHAR(100) | First name |
| last_name | VARCHAR(100) | Last name |
| phone | VARCHAR(20) | Contact |
| shop_id | INT (FK) | → shops.shop_id |
| user_role | ENUM('admin','manager','cashier','staff') | Default: staff |
| joining_date | DATE | Employment date |
| user_status | ENUM('active','inactive','suspended') | Default: active |
| created_at | TIMESTAMP | Auto-set |
| updated_at | TIMESTAMP | Auto-update |

**Keys:** `UNIQUE(username)`, `INDEX(shop_id)`, `INDEX(user_role)`, `INDEX(user_status)`, `FK→shops`

**Sample Data:** 5 users across different shops and roles

---

### Product & Inventory Tables

#### 3. **size_types** - Clothing Size Categories
Global reference for size classification types.

| Column | Type | Notes |
|--------|------|-------|
| size_type_id | INT (PK) | Auto-increment |
| size_type_name | VARCHAR(50) | UNIQUE |
| created_at | TIMESTAMP | Auto-set |

**Values:** Alphabetic, Numeric, Kids

---

#### 4. **sizes** - Available Sizes per Shop
Shop-specific size options.

| Column | Type | Notes |
|--------|------|-------|
| size_id | INT (PK) | Auto-increment |
| shop_id | INT (FK) | → shops.shop_id |
| size_name | VARCHAR(20) | e.g., S, M, L, 30, 32 |
| size_type_id | INT (FK) | → size_types.size_type_id |
| created_at | TIMESTAMP | Auto-set |
| updated_at | TIMESTAMP | Auto-update |

**Keys:** `UNIQUE(shop_id, size_name, size_type_id)`, `FK→shops`, `FK→size_types`

**Multi-Shop:** Each shop maintains its own size list

---

#### 5. **colors** - Available Colors per Shop
Shop-specific color palette with hex codes.

| Column | Type | Notes |
|--------|------|-------|
| color_id | INT (PK) | Auto-increment |
| shop_id | INT (FK) | → shops.shop_id |
| color_name | VARCHAR(50) | e.g., Black, White |
| hex_code | VARCHAR(7) | e.g., #000000 |
| created_at | TIMESTAMP | Auto-set |
| updated_at | TIMESTAMP | Auto-update |

**Keys:** `UNIQUE(shop_id, color_name)`, `FK→shops`

**Sample Colors:** Black, White, Navy Blue, Red, Grey, N/A

---

#### 6. **categories** - Product Categories
Shop-specific product categories linked to size types.

| Column | Type | Notes |
|--------|------|-------|
| category_id | INT (PK) | Auto-increment |
| shop_id | INT (FK) | → shops.shop_id |
| category_name | VARCHAR(100) | e.g., Men_T-Shirts |
| size_type_id | INT (FK) | → size_types.size_type_id |
| created_at | TIMESTAMP | Auto-set |
| updated_at | TIMESTAMP | Auto-update |

**Keys:** `UNIQUE(shop_id, category_name)`, `FK→shops`, `FK→size_types`

**Example:** Men_T-Shirts (Alphabetic), Women_Jeans (Numeric), Kids_Trousers (Kids)

---

#### 7. **products** - Product Master Data
Core product information, shop-specific.

| Column | Type | Notes |
|--------|------|-------|
| product_id | INT (PK) | Auto-increment |
| shop_id | INT (FK) | → shops.shop_id |
| sku | VARCHAR(50) | Stock keeping unit |
| product_name | VARCHAR(150) | Display name |
| category_id | INT (FK) | → categories.category_id |
| description | TEXT | Product details |
| retail_price | DECIMAL(12,2) | Selling price |
| wholesale_price | DECIMAL(12,2) | Bulk price |
| product_cost | DECIMAL(12,2) | Purchase cost (default: 0) |
| print_cost | DECIMAL(12,2) | Printing cost (default: 0) |
| product_status | ENUM('active','inactive','discontinued') | Default: active |
| created_at | TIMESTAMP | Auto-set |
| updated_at | TIMESTAMP | Auto-update |

**Keys:** `UNIQUE(shop_id, sku)`, `INDEX(shop_id)`, `INDEX(category_id)`, `INDEX(sku)`, `INDEX(product_status)`, `FK→shops`, `FK→categories`

---

#### 8. **product_sizes** - Product-Size Mapping
Associates products with available sizes.

| Column | Type | Notes |
|--------|------|-------|
| product_size_id | INT (PK) | Auto-increment |
| product_id | INT (FK) | → products.product_id |
| size_id | INT (FK) | → sizes.size_id |
| created_at | TIMESTAMP | Auto-set |

**Keys:** `UNIQUE(product_id, size_id)`, `FK→products`, `FK→sizes`

---

#### 9. **product_colors** - Product-Color Mapping
Associates products with available colors.

| Column | Type | Notes |
|--------|------|-------|
| product_color_id | INT (PK) | Auto-increment |
| product_id | INT (FK) | → products.product_id |
| color_id | INT (FK) | → colors.color_id |
| created_at | TIMESTAMP | Auto-set |

**Keys:** `UNIQUE(product_id, color_id)`, `FK→products`, `FK→colors`

---

#### 10. **shop_product_stock** - Product Inventory per Shop
Tracks product quantities by size and color per shop.

| Column | Type | Notes |
|--------|------|-------|
| stock_id | INT (PK) | Auto-increment |
| shop_id | INT (FK) | → shops.shop_id |
| product_id | INT (FK) | → products.product_id |
| size_id | INT (FK) | → sizes.size_id |
| color_id | INT (FK) | → colors.color_id |
| quantity | INT | Current stock level |
| min_threshold | INT | Reorder level |
| created_at | TIMESTAMP | Auto-set |
| updated_at | TIMESTAMP | Auto-update |

**Keys:** `UNIQUE(shop_id, product_id, size_id, color_id)`, `FK→shops`, `FK→products`, `FK→sizes`, `FK→colors`

**Purpose:** Tracks clothing inventory by individual variants (e.g., Black Shirt Size M)

---

#### 11. **shop_inventory** - Supplies/Materials Inventory per Shop
Tracks consumable supplies and materials.

| Column | Type | Notes |
|--------|------|-------|
| inventory_id | INT (PK) | Auto-increment |
| shop_id | INT (FK) | → shops.shop_id |
| item_name | VARCHAR(150) | e.g., Paper Bags |
| item_description | TEXT | Details |
| quantity | INT | Current stock |
| unit | VARCHAR(20) | e.g., pieces, kg, boxes |
| unit_cost | DECIMAL(12,2) | Cost per unit |
| min_threshold | INT | Reorder level |
| supplier_contact | VARCHAR(255) | Supplier info |
| created_at | TIMESTAMP | Auto-set |
| updated_at | TIMESTAMP | Auto-update |

**Keys:** `INDEX(shop_id)`, `FK→shops`

**Purpose:** Tracks consumables (paper bags, tags, tape, cleaning supplies) separate from product stock

---

### Customer & Order Tables

#### 12. **customers** - Customer Master Data

| Column | Type | Notes |
|--------|------|-------|
| customer_id | INT (PK) | Auto-increment |
| shop_id | INT (FK) | → shops.shop_id |
| customer_name | VARCHAR(150) | Full name |
| phone | VARCHAR(20) | Contact number |
| email | VARCHAR(100) | Email address |
| loyalty_points | INT | Reward points |
| total_spent | DECIMAL(12,2) | Lifetime purchases |
| customer_status | ENUM('active','inactive','blacklist') | Default: active |
| created_at | TIMESTAMP | Auto-set |
| updated_at | TIMESTAMP | Auto-update |

**Keys:** `INDEX(shop_id)`, `INDEX(phone)`, `INDEX(customer_status)`, `FK→shops`

---

#### 13. **provinces** - Geographic Provinces
Reference table for locations (for future use).

| Column | Type | Notes |
|--------|------|-------|
| province_id | INT (PK) | Auto-increment |
| province_name | VARCHAR(100) | e.g., Western, Central |
| created_at | TIMESTAMP | Auto-set |

**Sample Data:** Western, Central, Southern, Uva, Sabaragamuwa, North Central, Northern, Eastern

---

#### 14. **districts** - Geographic Districts
Reference table for locations (for future use).

| Column | Type | Notes |
|--------|------|-------|
| district_id | INT (PK) | Auto-increment |
| province_id | INT (FK) | → provinces.province_id |
| district_name | VARCHAR(100) | e.g., Colombo, Kandy |
| created_at | TIMESTAMP | Auto-set |

**Keys:** `FK→provinces`

---

#### 15. **cities** - City Locations
Reference table for locations (for future use).

| Column | Type | Notes |
|--------|------|-------|
| city_id | INT (PK) | Auto-increment |
| district_id | INT (FK) | → districts.district_id |
| city_name | VARCHAR(100) | e.g., Colombo 03, Kandy City |
| created_at | TIMESTAMP | Auto-set |

**Keys:** `FK→districts`

---

#### 16. **orders** - Customer Orders
Order records with embedded delivery address.

| Column | Type | Notes |
|--------|------|-------|
| order_id | INT (PK) | Auto-increment |
| shop_id | INT (FK) | → shops.shop_id |
| customer_id | INT (FK) | → customers.customer_id |
| order_date | DATE | Order date |
| total_amount | DECIMAL(12,2) | Total value |
| order_status | ENUM('pending','processing','completed','cancelled') | Default: pending |
| delivery_address | VARCHAR(500) | Embedded address |
| delivery_date | DATE | Expected delivery |
| notes | TEXT | Special instructions |
| created_by | INT (FK) | → users.user_id (cashier) |
| created_at | TIMESTAMP | Auto-set |
| updated_at | TIMESTAMP | Auto-update |

**Keys:** `INDEX(shop_id)`, `INDEX(customer_id)`, `INDEX(order_status)`, `INDEX(order_date)`, `FK→shops`, `FK→customers`, `FK→users`

**Design Note:** Delivery address embedded (no separate customer_addresses table) - simpler & sufficient for POS

---

#### 17. **order_items** - Order Line Items
Individual items in each order.

| Column | Type | Notes |
|--------|------|-------|
| order_item_id | INT (PK) | Auto-increment |
| order_id | INT (FK) | → orders.order_id |
| product_id | INT (FK) | → products.product_id |
| size_id | INT (FK) | → sizes.size_id |
| color_id | INT (FK) | → colors.color_id |
| quantity | INT | Quantity ordered |
| unit_price | DECIMAL(12,2) | Price at order time |
| discount_percentage | DECIMAL(5,2) | Discount applied |
| subtotal | DECIMAL(12,2) | qty × unit_price - discount |
| created_at | TIMESTAMP | Auto-set |

**Keys:** `INDEX(order_id)`, `INDEX(product_id)`, `FK→orders`, `FK→products`, `FK→sizes`, `FK→colors`

---

### Payment Tables

#### 18. **bank_accounts** - Bank Account Details
Bank information for payments and deposits.

| Column | Type | Notes |
|--------|------|-------|
| bank_account_id | INT (PK) | Auto-increment |
| shop_id | INT (FK) | → shops.shop_id |
| account_holder | VARCHAR(150) | Account owner |
| bank_name | VARCHAR(100) | Bank name |
| account_number | VARCHAR(50) | Account number |
| account_type | VARCHAR(50) | Savings, Checking, etc |
| branch_name | VARCHAR(100) | Branch location |
| swift_code | VARCHAR(20) | SWIFT/BIC code |
| account_status | ENUM('active','inactive','closed') | Default: active |
| balance | DECIMAL(12,2) | Current balance |
| last_reconciled | DATE | Last reconciliation date |
| created_at | TIMESTAMP | Auto-set |
| updated_at | TIMESTAMP | Auto-update |

**Keys:** `INDEX(shop_id)`, `INDEX(account_status)`, `FK→shops`

---

#### 19. **payments** - OPTIMIZED Payment Transactions
Core payment tracking with bank details as VARCHAR (user-input).

| Column | Type | Notes |
|--------|------|-------|
| payment_id | INT (PK) | Auto-increment |
| shop_id | INT (FK) | → shops.shop_id |
| order_id | INT (FK) | → orders.order_id (nullable) |
| customer_id | INT (FK) | → customers.customer_id (nullable) |
| payment_amount | DECIMAL(12,2) | Amount paid |
| payment_date | DATE | Payment date |
| payment_time | TIME | Payment time |
| payment_method | ENUM('cash','online_transfer','bank_deposit') | Method used |
| bank_name | VARCHAR(100) | Bank name (TEXT INPUT) |
| branch_name | VARCHAR(100) | Branch name (TEXT INPUT) |
| bank_account_id | INT (FK) | → bank_accounts.bank_account_id (optional) |
| transaction_id | VARCHAR(100) | UNIQUE transaction reference |
| payment_status | ENUM('completed','pending','failed','refunded') | Default: completed |
| notes | TEXT | Payment notes |
| created_by | INT (FK) | → users.user_id |
| created_at | TIMESTAMP | Auto-set |
| updated_at | TIMESTAMP | Auto-update |

**Keys:** `INDEX(shop_id)`, `INDEX(order_id)`, `INDEX(customer_id)`, `INDEX(payment_method)`, `INDEX(payment_date)`, `UNIQUE(transaction_id)`, `FK→shops`, `FK→orders`, `FK→customers`, `FK→bank_accounts`, `FK→users`

**Design Note:** `bank_name` and `branch_name` are VARCHAR columns allowing users to input any bank/branch without separate tables. This provides flexibility for manual entries and one-time payments.

---

#### 20. **payment_reconciliation** - Bank Reconciliation Tracking
Reconciliation history between payment records and bank statements.

| Column | Type | Notes |
|--------|------|-------|
| reconciliation_id | INT (PK) | Auto-increment |
| bank_account_id | INT (FK) | → bank_accounts.bank_account_id |
| reconciled_date | DATE | Reconciliation date |
| statement_start_date | DATE | Bank statement start |
| statement_end_date | DATE | Bank statement end |
| statement_balance | DECIMAL(12,2) | Bank statement balance |
| reconciled_balance | DECIMAL(12,2) | Our reconciled total |
| variance | DECIMAL(12,2) | Difference |
| reconciliation_status | ENUM('pending','completed','unresolved') | Default: pending |
| notes | TEXT | Reconciliation notes |
| reconciled_by | INT (FK) | → users.user_id |
| created_at | TIMESTAMP | Auto-set |
| updated_at | TIMESTAMP | Auto-update |

**Keys:** `INDEX(bank_account_id)`, `INDEX(reconciliation_status)`, `FK→bank_accounts`, `FK→users`

---

### Audit & Logging Tables

#### 21. **audit_log** - Complete Audit Trail
Comprehensive logging of all data modifications.

| Column | Type | Notes |
|--------|------|-------|
| audit_id | BIGINT (PK) | Auto-increment |
| table_name | VARCHAR(100) | Affected table |
| record_id | INT | Record primary key |
| action | ENUM('INSERT','UPDATE','DELETE','LOGIN','LOGOUT') | Action type |
| old_values | JSON | Previous data (for UPDATE/DELETE) |
| new_values | JSON | New data (for INSERT/UPDATE) |
| user_id | INT (FK) | → users.user_id |
| user_ip | VARCHAR(45) | User IP address (IPv6 compatible) |
| user_agent | TEXT | Browser/client info |
| timestamp | TIMESTAMP | Action timestamp |

**Keys:** `INDEX(table_name, record_id)`, `INDEX(action)`, `INDEX(timestamp)`, `FK→users`

**Purpose:** Complete traceability of all changes for compliance and auditing

---

#### 22. **activity_log** - Business Activity Tracking
High-level business event logging.

| Column | Type | Notes |
|--------|------|-------|
| activity_id | BIGINT (PK) | Auto-increment |
| shop_id | INT (FK) | → shops.shop_id |
| activity_type | VARCHAR(100) | Event type (e.g., order_created) |
| entity_type | VARCHAR(100) | Entity (e.g., order, payment) |
| entity_id | INT | Entity primary key |
| user_id | INT (FK) | → users.user_id (nullable) |
| description | TEXT | Human-readable description |
| metadata | JSON | Additional context |
| severity | ENUM('info','warning','error') | Event severity |
| timestamp | TIMESTAMP | Event timestamp |

**Keys:** `INDEX(shop_id)`, `INDEX(activity_type)`, `INDEX(timestamp)`, `FK→shops`, `FK→users`

**Example Events:** order_created, payment_recorded, product_sold, inventory_adjusted, stock_warning

---

## Key Optimization Changes from Original Database

### ✅ Changes Made

1. **Payment Table Optimization**
   - Added `bank_name` and `branch_name` as VARCHAR columns directly in payments table
   - Users can input bank/branch details as text without separate branch lookup table
   - Still have optional `bank_account_id` FK for existing accounts

2. **Removed Unnecessary Tables**
   - ❌ `customer_addresses` table removed
   - ✅ `delivery_address` embedded as VARCHAR(500) in orders table
   - Simplified schema without sacrificing functionality

3. **Separated Inventory Types**
   - ✅ `shop_product_stock` - Product inventory by size/color/shop
   - ✅ `shop_inventory` - Supplies/materials by shop
   - Different tracking criteria for different item types

4. **Simplified Payment Methods**
   - Limited to 3 methods: `cash`, `online_transfer`, `bank_deposit`
   - Removed unnecessary payment method variants

5. **Order Cancellation**
   - ✅ No soft delete, just update `order_status` to `'cancelled'`
   - Cleaner data management

6. **Complete Multi-Shop Support**
   - ✅ `shop_id` in all operational tables (users, products, orders, payments, etc.)
   - Each shop has isolated: users, products, stock, customers, orders, payments
   - Enables multiple POS machines per shop with different data

7. **Comprehensive Audit Trail**
   - ✅ `audit_log` - All INSERT, UPDATE, DELETE operations with JSON old/new values
   - ✅ `activity_log` - Business events with metadata
   - Track who did what, when, and why

---

## Multi-Shop Architecture

Every shop operates independently:

```
Shops
├── Shop 1 (Colombo Flagship)
│   ├── Users (staff assigned to this shop)
│   ├── Products (shop-specific SKUs and pricing)
│   ├── Inventory (sizes, colors, stock levels per product variant)
│   ├── Customers (shop-specific customer list)
│   ├── Orders (shop transactions)
│   └── Payments (shop payment records)
│
├── Shop 2 (Kandy Boutique)
│   ├── Users
│   ├── Products
│   ├── Inventory
│   └── ... (isolated data)
│
└── Shop N
    └── ... (completely isolated)
```

**Key Design:** All operational tables have `shop_id` foreign key, ensuring complete data isolation between shops.

---

## Indexes for Performance

### High-Priority Queries (Indexed)

- Customer orders: `orders(shop_id, order_date)`, `orders(shop_id, order_status)`
- Product search: `products(shop_id, product_status)`, `products(sku)`
- Payment lookup: `payments(shop_id, payment_date)`, `payments(transaction_id)`
- Inventory: `shop_product_stock(shop_id, product_id)`
- User login: `users(username)`, `users(shop_id)`
- Audit trail: `audit_log(table_name, record_id)`, `audit_log(timestamp)`

---

## Data Integrity Features

1. **Foreign Key Constraints**
   - All relationships enforced at database level
   - CASCADE DELETE where appropriate (shop deletion removes all shop data)
   - RESTRICT where needed to prevent orphaned records

2. **Unique Constraints**
   - SKU unique per shop (allows same SKU across shops)
   - Username globally unique
   - Transaction ID globally unique

3. **Timestamps**
   - All tables have `created_at` and `updated_at`
   - Enables audit trail and data history

4. **Enum Data Types**
   - Predefined values for statuses and types
   - Prevents invalid data entry

---

## Sample Data Included

The schema includes realistic sample data for:
- **5 Shops** with different managers and locations
- **5 Users** with different roles (admin, manager, cashier, staff)
- **Size Types** (Alphabetic, Numeric, Kids)
- **6 Colors** with hex codes
- **5 Categories** linked to appropriate size types
- **Products** with pricing and costs
- **Size/Color mappings** for products
- **Stock levels** with thresholds
- **Customers** with loyalty points
- **Geographic references** (provinces, districts, cities)

---

## Database Connection Info

- **Database Name:** `u331468302_dennup_pos`
- **Charset:** UTF-8 MB4 (full Unicode support)
- **Collation:** utf8mb4_unicode_ci
- **Engine:** InnoDB (with transactions and foreign keys)

---

## Next Steps

1. **Backup Current Database**
   ```bash
   # Export current database from phpMyAdmin
   # Save as dennep_pos_backup.sql
   ```

2. **Deploy Optimized Schema**
   - Use `dennep_pos_optimized.sql` to create new schema
   - Or import tables individually if migrating

3. **Test with Backend**
   - Verify all model queries work with new schema
   - Test multi-shop isolation
   - Validate payment workflows

4. **Verify Frontend**
   - Bank Accounts page queries
   - Payments page queries
   - Order/Product page queries

---

## Questions & Support

For clarifications on specific tables or relationships, refer to:
- **TABLE DEFINITIONS:** See table comments in SQL file
- **RELATIONSHIPS:** See foreign key constraints
- **BUSINESS LOGIC:** Check audit_log and activity_log implementations
