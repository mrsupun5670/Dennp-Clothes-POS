# Multi-Shop System - Visual Setup Guide

**Quick Reference for Data Structure & Setup Process**

---

## 🎯 Your System Overview

```
HOSTINGER DATABASE (Central - All shops connect here)
┌─────────────────────────────────────────────────────────┐
│                                                           │
│  GLOBAL TABLES (Shared by all shops):                   │
│  ├─ products          (All shops sell these)            │
│  ├─ categories        (All shops use these)             │
│  ├─ colors            (Red, Blue, Green... everywhere)  │
│  └─ sizes             (S, M, L... everywhere)           │
│                                                           │
│  SHOP-SPECIFIC TABLES (Isolated):                       │
│  ├─ customers (WITH shop_id) ⭐ TO BE ADDED             │
│  ├─ orders (ALREADY has shop_id) ✅                    │
│  ├─ shop_inventory (ALREADY has shop_id) ✅            │
│  ├─ shop_product_stock (ALREADY has shop_id) ✅        │
│  └─ users (ALREADY has shop_id) ✅                     │
│                                                           │
└─────────────────────────────────────────────────────────┘

SHOP 1 (Colombo)          SHOP 2 (Kandy)         SHOP 3 (Galle)
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│                  │    │                  │    │                  │
│  POS Machine 1   │    │  POS Machine 2   │    │  POS Machine 3   │
│  shop-config:    │    │  shop-config:    │    │  shop-config:    │
│  shop_id = 1     │    │  shop_id = 2     │    │  shop_id = 3     │
│                  │    │                  │    │                  │
│  All queries:    │    │  All queries:    │    │  All queries:    │
│  shop_id = 1 ✅  │    │  shop_id = 2 ✅  │    │  shop_id = 3 ✅  │
│                  │    │                  │    │                  │
└──────────────────┘    └──────────────────┘    └──────────────────┘
       ↓                        ↓                        ↓
       └────────────────────────┴────────────────────────┘
                              ↓
                    Hostinger MySQL Database
                    (All data stored here)
```

---

## 📋 Table Comparison

### BEFORE (Current - Broken for Multi-Shop)
```
customers table:
┌─────────────────────────────────────────────────┐
│ customer_id │ first_name │ mobile │ email       │
├─────────────────────────────────────────────────┤
│ 1001        │ Ahmed      │ 0771234567 │ ...    │ ← Which shop?
│ 1002        │ Fatima     │ 0772345678 │ ...    │ ← Which shop?
│ 1003        │ Kamal      │ 0773456789 │ ...    │ ← Which shop?
└─────────────────────────────────────────────────┘
❌ PROBLEM: All shops see all customers mixed together!
❌ Can't tell which customer belongs to which shop
❌ Same mobile number can be used multiple times
```

### AFTER (Proposed - Fixed)
```
customers table:
┌──────────────────────────────────────────────────────────┐
│ customer_id │ shop_id │ first_name │ mobile │ email    │
├──────────────────────────────────────────────────────────┤
│ 1001        │ 1       │ Ahmed      │ 0771234567 │ ... │ ← Shop 1
│ 1002        │ 1       │ Fatima     │ 0772345678 │ ... │ ← Shop 1
│ 2001        │ 2       │ Kamal      │ 0771234567 │ ... │ ← Shop 2 (same mobile OK!)
│ 2002        │ 2       │ Priya      │ 0773456789 │ ... │ ← Shop 2
│ 3001        │ 3       │ Rajesh     │ 0774567890 │ ... │ ← Shop 3
└──────────────────────────────────────────────────────────┘
✅ FIXED: Each shop has its own customers!
✅ Mobile number can repeat in different shops
✅ Customer isolation guaranteed!
```

---

## 🔄 Data Flow Examples

### Example 1: Add New Customer in Shop 1
```
Cashier in Colombo (Shop 1) enters:
  Name: "Wasim Ali"
  Mobile: "0771234567"

System processing:
  shop_id = 1 (from config)

INSERT INTO customers (shop_id, first_name, last_name, mobile, ...)
VALUES (1, "Wasim", "Ali", "0771234567", ...)
↓
Result: customer_id = 1010, shop_id = 1 ✅

Later in Kandy (Shop 2), cashier can use:
  Same mobile "0771234567" for different customer ✅
  INSERT (shop_id=2, ..., "0771234567", ...)
  Result: customer_id = 2050, shop_id = 2 ✅

Both exist, no conflict!
```

### Example 2: Create Order
```
Shop 1 Cashier creates order:

SELECT products ... (global list)
SELECT customers WHERE shop_id = 1 (only Shop 1 customers)
→ Creates order with:
   shop_id = 1 (automatic from context)
   customer_id = 1001 (Shop 1 customer)
   products = any global product

INSERT INTO orders (shop_id, customer_id, ...)
↓
Order saved with shop_id = 1 ✅

Shop 2 never sees this order because:
  Query in Shop 2: WHERE shop_id = 2
  This order has shop_id = 1
  → Invisible to Shop 2 ✅
```

### Example 3: View Inventory
```
Shop 1 (Colombo):
SELECT stock FROM shop_product_stock WHERE shop_id = 1
→ Shop 1 has: TSHIRT (red, 15 units), JEANS (black, 8 units)

Shop 2 (Kandy):
SELECT stock FROM shop_product_stock WHERE shop_id = 2
→ Shop 2 has: TSHIRT (red, 20 units), JEANS (black, 5 units)

Same product ID, different stock per shop! ✅
No confusion!
```

---

## 🎯 Developer Setup Process

### Step-by-Step: How to Add Shop 3 (Galle)

#### Step 1: Database Setup (One-time)
```
Login to Hostinger > Database > phpMyAdmin

SQL Query:
INSERT INTO shops
  (shop_name, address, contact_phone, manager_name, shop_status, opening_date)
VALUES
  ('Dennep Clothes - Galle',
   '456 Beach Rd, Galle',
   '0912345678',
   'Ms. Lakshmi',
   'active',
   '2025-12-01');

→ Returns: shop_id = 3 ✅
```

#### Step 2: Generate Config File
```json
// File: shop-config.json (for Galle machine)
{
  "shop_id": 3,
  "shop_name": "Dennep Clothes - Galle",
  "shop_location": "Galle",
  "manager_name": "Ms. Lakshmi",
  "contact_phone": "0912345678",
  "backend_url": "https://your-hostinger-domain.com/api/v1",
  "database": {
    "host": "your-hostinger-db.com",
    "user": "dennep_user",
    "password": "***",
    "database": "dennep_clothes_pos"
  },
  "version": "1.0.0",
  "last_updated": "2025-11-21"
}
```

#### Step 3: Package Application
```
├── Dennep-POS-Galle.exe (or .dmg for Mac)
│
├── assets/
│   └── images/
│
├── config/
│   └── shop-config.json ⭐ (GALLE-SPECIFIC)
│
└── [other app files]
```

#### Step 4: Deploy to Machine
```
Machine at Galle location:
1. Install Dennep-POS-Galle.exe
2. App starts, reads: config/shop-config.json
3. App initializes with shop_id = 3
4. Ready to use! ✅

No login needed (shop context automatic!)
```

---

## 🔐 Data Isolation Guarantee

### What Shop 1 Can See
```
Products: ✅ ALL (global)
Customers: ✅ ONLY shop_id=1
Orders: ✅ ONLY shop_id=1
Inventory: ✅ ONLY shop_id=1
Users: ✅ Users with shop_id=1 (or global admins)
```

### What Shop 1 CANNOT See
```
Customers from Shop 2: ❌
Orders from Shop 2: ❌
Inventory from Shop 2: ❌
Users from other shops: ❌
```

### Database Guarantee (Query Level)
```
When Shop 1 loads customers:
SELECT * FROM customers
WHERE shop_id = 1  ← ALWAYS applied

Physical data exists for Shop 2:
├─ customer_id: 2001, shop_id: 2
└─ (Hidden from Shop 1 query)

Even if someone tries:
SELECT * FROM customers  (without WHERE)
→ Backend code: ALWAYS adds "WHERE shop_id = ?"
→ Enforced at model/controller level
→ Can't accidentally expose other shops' data ✅
```

---

## 📊 Database Schema Changes Visualization

### The ONE Change Needed

```
BEFORE:
customers
├─ customer_id (INT, PK)
├─ first_name (VARCHAR)
├─ last_name (VARCHAR)
├─ mobile (VARCHAR, UNIQUE)
├─ email (VARCHAR)
├─ orders_count (INT)
├─ customer_status (ENUM)
├─ total_spent (DOUBLE)
└─ created_at (TIMESTAMP)

AFTER: ⭐ ADD SHOP_ID
customers
├─ customer_id (INT, PK)
├─ shop_id (INT, FK) ⭐ NEW
├─ first_name (VARCHAR)
├─ last_name (VARCHAR)
├─ mobile (VARCHAR)
├─ email (VARCHAR)
├─ orders_count (INT)
├─ customer_status (ENUM)
├─ total_spent (DOUBLE)
├─ created_at (TIMESTAMP)
└─ Constraints:
   ├─ FK: shop_id → shops.shop_id ✅
   ├─ UNIQUE: (shop_id, mobile) ✅
   └─ INDEX: (shop_id) ✅
```

---

## 🗂️ File Organization on Each Machine

### Shop 1 Machine Directory
```
C:\ProgramFiles\DennepPOS\
├── dennep-pos.exe
├── assets/
│   ├── images/
│   └── dennep.png
├── config/
│   └── shop-config.json
│       ├── shop_id: 1
│       ├── shop_name: "Colombo"
│       └── backend_url: "https://..."
├── database/
│   └── [local cache if offline mode]
└── logs/
    └── app.log

When app starts:
1. Reads: config/shop-config.json
2. Extracts: shop_id = 1
3. All operations: WHERE shop_id = 1 ✅
```

### Shop 2 Machine Directory
```
C:\ProgramFiles\DennepPOS\
├── dennep-pos.exe
├── assets/
├── config/
│   └── shop-config.json
│       ├── shop_id: 2 ← Different!
│       ├── shop_name: "Kandy"
│       └── backend_url: "https://..."
└── [rest same]

When app starts:
1. Reads: config/shop-config.json
2. Extracts: shop_id = 2
3. All operations: WHERE shop_id = 2 ✅
```

---

## 🎓 Real-World Example

### Scenario: Dennep Clothes Opens 5 Shops

```
DATABASE SETUP (One-time):

INSERT INTO shops VALUES (1, "Colombo", ..., "active");
INSERT INTO shops VALUES (2, "Kandy", ..., "active");
INSERT INTO shops VALUES (3, "Galle", ..., "active");
INSERT INTO shops VALUES (4, "Jaffna", ..., "active");
INSERT INTO shops VALUES (5, "Matara", ..., "active");

Products table:
  → Has 100 products (e.g., TSHIRT, JEANS, DRESS, etc.)
  → ALL shops can sell these same products ✅

Customers table:
  → Shop 1: 500 customers (IDs 1001-1500, shop_id=1)
  → Shop 2: 350 customers (IDs 2001-2350, shop_id=2)
  → Shop 3: 400 customers (IDs 3001-3400, shop_id=3)
  → Shop 4: 200 customers (IDs 4001-4200, shop_id=4)
  → Shop 5: 300 customers (IDs 5001-5300, shop_id=5)
  → Total: 1,750 customers, all isolated ✅

Orders table:
  → Shop 1: 2,000 orders (all with shop_id=1)
  → Shop 2: 1,500 orders (all with shop_id=2)
  → ... etc
  → Each machine only sees its own shop's orders ✅

Results:
  ✅ Clean data separation
  ✅ Easy to scale to more shops
  ✅ No data leakage between shops
  ✅ Each shop independent but using same system
```

---

## 🚀 Summary Table

| Item | Current | After Changes | Benefit |
|------|---------|----------------|---------|
| **Products** | Global (all shops) | Global (all shops) | ✅ Same products everywhere |
| **Customers** | ❌ Mixed (no shop column) | ✅ Per-shop (with shop_id) | ✅ Isolated customers |
| **Orders** | ✅ Per-shop | ✅ Per-shop | ✅ Isolated orders |
| **Inventory** | ✅ Per-shop | ✅ Per-shop | ✅ Isolated stock |
| **Data Isolation** | ❌ Poor | ✅ Excellent | ✅ No cross-shop leakage |
| **Scalability** | Limited | Excellent | ✅ Easy to add shops |
| **Setup Time** | N/A | ~1 day | ⏱️ Quick to implement |

---

## ✅ Implementation Checklist

- [ ] Review this guide
- [ ] Understand APPROACH B (Hybrid)
- [ ] Confirm you want only customers table modified
- [ ] Approve keeping products global
- [ ] Ready for database migration
- [ ] Ready for backend code updates
- [ ] Ready for frontend context setup

---

**This is your data structure. Does it make sense? Any questions before I start implementation?**

