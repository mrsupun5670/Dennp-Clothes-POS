# Multi-Shop Database & System Design Strategy

**Document Version**: 1.0
**Date**: November 21, 2025
**Status**: STRATEGIC PROPOSAL (No Implementation Yet)

---

## 📊 Current Database Analysis

### What You Already Have ✅

**Good News**: Your database is **60% ready** for multi-shop:

1. **Shops Table** ✅
   - `shop_id` (PK)
   - `shop_name`, `address`, `contact_phone`, `manager_name`, `shop_status`
   - Ready for setup and management

2. **Orders Already Shop-Filtered** ✅
   - `orders.shop_id` (FK to shops)
   - Index exists: `idx_shop_id`
   - Foreign key constraint set up correctly

3. **Inventory Already Shop-Filtered** ✅
   - `shop_inventory.shop_id` (FK to shops)
   - `shop_product_stock.shop_id` (FK to shops)
   - Both ready for multi-shop use

4. **Users Linked to Shops** ✅
   - `users.shop_id` (optional FK)
   - Already supports multi-shop staff

### What's Missing ❌

**Problem Areas**:

1. **Products Table - NOT SHOP-SPECIFIC**
   ```sql
   CREATE TABLE products (
     product_id, sku, product_name, category_id, ...
     -- ❌ NO shop_id
     -- ❌ All products shared across all shops
   )
   ```
   Currently: All shops see ALL products globally
   Needed: Option to filter products per shop (or keep global)

2. **Customers Table - NOT SHOP-SPECIFIC**
   ```sql
   CREATE TABLE customers (
     customer_id, first_name, last_name, mobile, ...
     -- ❌ NO shop_id
     -- ❌ All customers shared across all shops
   )
   ```
   Currently: All shops see ALL customers globally
   Needed: Option to filter customers per shop (or keep global)

3. **Categories - NOT SHOP-SPECIFIC**
   ```sql
   CREATE TABLE categories (
     category_id, category_name, ...
     -- ❌ NO shop_id
   )
   ```

4. **Colors, Sizes - NOT SHOP-SPECIFIC**
   - Same problem: Global, not per-shop

---

## 🎯 Strategic Decision: Which Tables Need shop_id?

### Three Possible Approaches

#### **APPROACH A: Fully Isolated Shops (Complete Separation)**
```
Each shop has its own:
- Products ✅
- Customers ✅
- Categories ✅
- Colors ✅
- Sizes ✅
- Orders ✅
- Inventory ✅

Shared:
- Nothing (each shop completely independent)
```

**Pros**:
- Complete data isolation
- No data leakage between shops
- Can run independently

**Cons**:
- Heavy database size
- Duplicate data (same product in multiple shops)
- Complex master data management
- Most tables need shop_id column

---

#### **APPROACH B: Hybrid (Recommended for You) 🎯**
```
Per-Shop (isolated by shop_id):
- Customers ✅ (add shop_id to customers)
- Orders ✅ (already has shop_id)
- Inventory ✅ (already has shop_id)

Shared (global, no shop_id):
- Products (all shops can sell same products)
- Categories (all shops use same categories)
- Colors (all shops use same colors)
- Sizes (all shops use same sizes)
- Users (managed per shop via users.shop_id)

Why This Works:
- All shops sell same Dennep Clothes
- All shops use same colors/sizes/categories
- Each shop has its own customer base
- Each shop has its own orders & inventory
```

**Pros** ✅:
- Minimal database size
- Simple to manage
- Realistic for your use case (same products everywhere)
- Less complex relationships
- Easier to maintain master products

**Cons**:
- Customers not completely isolated (but that's OK)

---

#### **APPROACH C: Fully Global (Current State - Doesn't Work)**
```
Everything shared:
- Products (shared) ✅
- Customers (shared) ✅
- Orders (filtered by shop) ⚠️ Partial
- Inventory (filtered by shop) ⚠️ Partial

Problem: Confusing! Customers mixed between shops, products mixed, but orders somehow specific
```

---

## 💡 **MY STRONG RECOMMENDATION: APPROACH B (Hybrid)**

### Why Perfect for Your Business

**Your Business Reality**:
- ✅ Same products sold in all shops (Dennep Clothes inventory)
- ✅ Same colors, sizes, categories everywhere
- ✅ Different customers per location (Shop 1 has own customers)
- ✅ Different orders per location (Shop 1 has own orders)

**Perfect Example**:
```
Product Database (Global):
├─ Product 1: T-Shirt (Red, Blue, Green)
├─ Product 2: Jeans (Black, Blue)
└─ Product 3: Dress (Pink, Yellow)

All shops can sell these same products!

But:

Shop 1 Customers (Colombo):
├─ Customer ID: 1001 (only in Shop 1)
├─ Customer ID: 1002 (only in Shop 1)
└─ ...

Shop 2 Customers (Kandy):
├─ Customer ID: 2001 (only in Shop 2)
├─ Customer ID: 2002 (only in Shop 2)
└─ ...

(Can have different customers with different IDs!)
```

---

## 🛠️ **DATABASE MODIFICATIONS NEEDED (Approach B)**

### Only Add shop_id to These 2 Tables:

#### **1. Add shop_id to CUSTOMERS Table**

```sql
-- Add shop_id column to customers table
ALTER TABLE customers
ADD COLUMN shop_id INT NOT NULL DEFAULT 1
AFTER customer_id,
ADD CONSTRAINT fk_customers_shops
  FOREIGN KEY (shop_id) REFERENCES shops(shop_id) ON DELETE RESTRICT,
ADD INDEX idx_shop_id (shop_id),
ADD UNIQUE KEY unique_mobile_per_shop (shop_id, mobile);
```

**Changes**:
- ✅ Each customer belongs to one shop
- ✅ Different shops can have customers with same mobile number (isolated by shop)
- ✅ Index for fast lookups by shop
- ✅ Unique constraint: same mobile not duplicated within same shop (but can exist in different shops)

#### **2. Categories - Optional (can add shop_id for per-shop customization)**

```sql
-- OPTIONAL: If shops want different categories
ALTER TABLE categories
ADD COLUMN shop_id INT NULL
AFTER category_id,
ADD CONSTRAINT fk_categories_shops
  FOREIGN KEY (shop_id) REFERENCES shops(shop_id) ON DELETE CASCADE,
ADD INDEX idx_shop_id (shop_id),
ADD UNIQUE KEY unique_category_per_shop (shop_id, category_name);
```

**Logic**:
- If `shop_id = NULL` → Global category (all shops use it)
- If `shop_id = 1` → Shop 1 specific category
- Query: `WHERE shop_id IS NULL OR shop_id = ?`

**Same for Colors & Sizes** (optional)

---

## 📝 **Data Organization Strategy**

### Product SKU Naming (DON'T ADD PREFIX)

**You suggested**: `SH1_62637` (Shop 1, Product ID 62637)

**My Recommendation**: **DON'T DO THIS** ❌

**Why**:
- Products are global (not shop-specific)
- SKU should be unique globally
- Adding shop prefix is redundant
- Confusing for inventory

**Better Approach**: Keep SKU as-is
```
Product SKU: DENNEP-TSHIRT-RED-M
         (shop-independent, unique globally)

Database:
products.product_id = 62637
products.sku = "DENNEP-TSHIRT-RED-M"
products.product_name = "T-Shirt Red Medium"

All shops can sell this same product
Each shop tracks its own stock in shop_product_stock table
```

### What DOES Get Shop Prefix

Only internal tracking purposes:

```
Customer ID: 1001 (unique globally, no prefix needed)
  - linked to shop via customers.shop_id = 1

Order ID: 5001 (unique globally, no prefix needed)
  - linked to shop via orders.shop_id = 1

But for DISPLAY/REPORTING (optional):
- "Shop 1 - Order #ORD-2025-001" (for UI only)
- Not stored as prefix in database
```

---

## 🏗️ **Complete Table Structure After Changes**

### Before (Current State)
```
customers (ALL shops mixed)
├─ customer_id | first_name | last_name | mobile | ...
├─ 1001 | Ahmed | Khan | 0771234567
├─ 1002 | Fatima | Ali | 0772345678
└─ ❌ No way to know which shop they belong to!

orders (Shop-specific) ✅
├─ order_id | shop_id | customer_id | ...
├─ 5001 | 1 | 1001 | ...
└─ 5002 | 2 | 1002 | ...
```

### After (Proposed Changes)
```
customers (Shop-specific)
├─ customer_id | shop_id | first_name | last_name | mobile | ...
├─ 1001 | 1 | Ahmed | Khan | 0771234567
├─ 1002 | 1 | Fatima | Ali | 0772345678
├─ 2001 | 2 | Kamal | Singh | 0771234567 ✅ Same mobile OK (different shop!)
└─ 2002 | 2 | Priya | Kumar | 0772345678

products (Global - shared)
├─ product_id | sku | product_name | category_id | ...
├─ 62637 | DENNEP-TS-RED | T-Shirt Red | 5
└─ 62638 | DENNEP-JS-BLK | Jeans Black | 8

orders (Shop-specific) ✅
├─ order_id | shop_id | customer_id | ...
├─ 5001 | 1 | 1001 | ...
├─ 5002 | 1 | 1002 | ...
├─ 6001 | 2 | 2001 | ...
└─ 6002 | 2 | 2002 | ...

shop_product_stock (Inventory per shop) ✅
├─ stock_id | shop_id | product_id | size_id | color_id | stock_qty | ...
├─ 1 | 1 | 62637 | 1 | 1 | 15 | (Shop 1 has 15 units)
├─ 2 | 2 | 62637 | 1 | 1 | 8 | (Shop 2 has 8 units)
└─ ...
```

---

## 🔑 **Key Decisions Summary**

### Table Changes Required

| Table | Current | Action | Notes |
|-------|---------|--------|-------|
| **products** | No shop_id | KEEP AS-IS ✅ | Global, all shops use |
| **categories** | No shop_id | OPTIONAL | Can add for flexibility |
| **colors** | No shop_id | KEEP AS-IS ✅ | Global, all shops use |
| **sizes** | No shop_id | KEEP AS-IS ✅ | Global, all shops use |
| **customers** | No shop_id | **ADD shop_id** ⭐ | REQUIRED |
| **orders** | ✅ Has shop_id | NO CHANGE | Already perfect |
| **shop_inventory** | ✅ Has shop_id | NO CHANGE | Already perfect |
| **shop_product_stock** | ✅ Has shop_id | NO CHANGE | Already perfect |
| **users** | ✅ Has shop_id | NO CHANGE | Already perfect |

---

## 🎯 **Admin/Developer Setup System**

### How Developer Adds New Shop

**Step 1: Database Setup (One-time per shop)**
```sql
-- Login to Hostinger phpMyAdmin as admin

-- 1. Add shop to shops table
INSERT INTO shops (shop_name, address, contact_phone, manager_name, shop_status)
VALUES ('Dennep Clothes - Kandy', '123 Main St, Kandy', '0812345678', 'Mr. Kamal', 'active');
-- Returns: shop_id = 2

-- 2. (Optional) Add sample data if needed
-- Products are global - already exist!
-- Just add inventory for new shop
INSERT INTO shop_product_stock (shop_id, product_id, size_id, color_id, stock_qty, created_at)
VALUES (2, 62637, 1, 1, 10, NOW());
```

**Step 2: Generate Machine Config File**
```json
// shop-config.json (for Shop 2 machine)
{
  "shop_id": 2,
  "shop_name": "Dennep Clothes - Kandy",
  "shop_location": "Kandy",
  "backend_url": "https://your-server.com/api/v1",
  "version": "1.0.0"
}
```

**Step 3: Package & Deploy**
- Copy app to Shop 2 machine
- Include shop-config.json file
- Machine startup: reads config → knows it's Shop 2
- All operations automatically use shop_id = 2

### User Flow at Each Shop
```
Machine starts
  ↓
Reads: shop-config.json → shop_id = 2
  ↓
App initializes with Shop 2 context
  ↓
User (cashier/manager) doesn't need to login for shop context
  ↓
All operations filter by shop_id = 2:
  - Load products (global) ✅
  - Load customers (Shop 2 only) ✅
  - Load orders (Shop 2 only) ✅
  - Load inventory (Shop 2 only) ✅
  - Create order → automatically sets shop_id = 2 ✅
```

---

## 🚀 **Implementation Phases**

### Phase 1: Database Changes (Hostinger)
1. Add `shop_id` to customers table
2. Update customer queries to filter by shop_id
3. Verify no data issues

### Phase 2: Backend Code Updates
1. Update Customer model to include shop_id parameter
2. Update all customer queries to include WHERE shop_id = ?
3. Update create customer to require shop_id
4. Ensure order creation includes shop_id from context

### Phase 3: Frontend Context Setup
1. Create ShopContext with shop_id from config
2. Create useShop() hook
3. Update all pages to use shop_id

### Phase 4: Page-by-Page Updates
1. CustomersPage: Filter by shop_id
2. OrdersPage: Already has shop_id ✅
3. ProductsPage: Keep global (no shop filter)
4. InventoryPage: Already has shop_id ✅
5. SalesPage: Ensure orders created with shop_id

### Phase 5: Shop Management
1. Create admin panel to manage shops
2. Create developer setup guide
3. Create shop config generator

### Phase 6: Testing & Documentation
1. Test with multiple shops
2. Test customer isolation
3. Test order isolation
4. Write deployment guide

---

## 📋 **Specific SQL Migrations Needed**

### Migration: Add shop_id to customers

```sql
-- File: backend/migrations/004_add_shop_id_to_customers.sql

-- Step 1: Add column with default value
ALTER TABLE customers
ADD COLUMN shop_id INT NOT NULL DEFAULT 1;

-- Step 2: Add foreign key
ALTER TABLE customers
ADD CONSTRAINT fk_customers_shops
  FOREIGN KEY (shop_id) REFERENCES shops(shop_id) ON DELETE RESTRICT;

-- Step 3: Add indexes
ALTER TABLE customers
ADD INDEX idx_shop_id (shop_id),
ADD INDEX idx_shop_mobile (shop_id, mobile);

-- Step 4: Update unique constraint
-- Remove old unique constraint on mobile
ALTER TABLE customers
DROP INDEX mobile;

-- Add new unique constraint (mobile unique per shop)
ALTER TABLE customers
ADD UNIQUE KEY unique_mobile_per_shop (shop_id, mobile);

-- Verification
SELECT * FROM customers LIMIT 5;
-- Should show new shop_id column with value 1 for all existing records
```

---

## ✨ **Why This Approach is Perfect for You**

### Your Use Case
- ✅ Clothes retailer (same products everywhere)
- ✅ Multiple locations (different shops)
- ✅ Different customers per location
- ✅ Different inventory per location
- ✅ Developer/Admin manages shop setup
- ✅ No login needed for shop context

### What Fits Best (APPROACH B - Hybrid)
- ✅ Minimal changes to existing database
- ✅ Products remain global (all shops use them)
- ✅ Customers isolated per shop
- ✅ Orders isolated per shop
- ✅ Inventory isolated per shop
- ✅ Clean data organization
- ✅ Easy to expand

---

## 🎓 **Example Workflows**

### Workflow 1: Add New Shop
```
1. Developer logs into Hostinger phpMyAdmin
2. INSERT INTO shops → shop_id = 3 (Galle)
3. Generate shop-config.json with shop_id = 3
4. Package app with config file
5. Deploy to Galle machine
6. Done! Machine knows it's Shop 3

Data automatically isolated!
```

### Workflow 2: Create Order in Shop 2
```
Cashier in Kandy (Shop 2):
1. Uses POS system
2. App knows: "I'm Shop 2" (from config)
3. Cashier searches customer: "Ahmed Khan"
   → Query: SELECT * FROM customers WHERE shop_id = 2 AND name LIKE "%Ahmed%"
   → Returns only Shop 2 customers
4. Selects customer ID: 2005
5. Adds products (global products list)
6. Clicks "Create Order"
   → INSERT INTO orders (shop_id=2, customer_id=2005, ...)
7. Order created with shop_id = 2
8. Shop 1 never sees this order ✅
```

### Workflow 3: View Customers in Shop 1
```
Cashier in Colombo (Shop 1):
1. Opens Customers page
2. App knows: "I'm Shop 1" (from config)
3. Page loads customers
   → Query: SELECT * FROM customers WHERE shop_id = 1
   → Returns ONLY Shop 1 customers (IDs 1001-1999)
4. Can't see Kandy customers (Shop 2)
5. All isolated! ✅
```

---

## 🎯 **Final Summary**

### What To Do

1. **Database Changes** (1 migration):
   - Add `shop_id` to customers table only
   - Make it unique per shop (shop_id, mobile)

2. **Backend Updates**:
   - Customer model: add shop_id parameter
   - All customer queries: filter by shop_id

3. **Frontend Updates**:
   - Create ShopContext
   - Update CustomersPage to use shop_id
   - All other pages already support it

4. **Admin Setup**:
   - Simple script to add new shops
   - Generate shop-config.json per machine
   - Deploy & done!

### What NOT To Do

❌ Add prefixes to SKUs
❌ Separate all products per shop
❌ Create duplicate categories
❌ Add shop_id to colors/sizes tables
❌ Make system overly complex

### Time Estimate

- Database changes: 30 minutes
- Backend updates: 2-3 hours
- Frontend updates: 2-3 hours
- Testing: 2 hours
- **Total: ~1 day of work**

---

**Ready to proceed? Let me know and I'll start implementation!**

