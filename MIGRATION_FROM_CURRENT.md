# MIGRATION GUIDE - Current Database to Optimized Schema

## Overview

This guide provides step-by-step instructions to safely migrate from your current database (`dennep_pos.sql`) to the optimized multi-shop schema (`dennep_pos_optimized.sql`).

**Duration:** ~30-45 minutes
**Downtime:** 5-10 minutes (during actual migration)
**Risk Level:** Low (with proper backups)

---

## Pre-Migration Checklist

- [ ] Current database fully backed up
- [ ] Optimized schema reviewed (`DATABASE_SCHEMA_GUIDE.md`)
- [ ] Backend code updated (if needed)
- [ ] Team notified of migration window
- [ ] Test environment ready
- [ ] Database credentials verified

---

## Step 1: Backup Current Database

### Option A: phpMyAdmin (Recommended for Hostinger)

1. **Log in to Hostinger Control Panel**
   - Navigate to: Account → Databases → phpMyAdmin
   - Select database: `u331468302_dennup_pos`

2. **Export Database**
   - Click "Export" tab
   - Select "SQL" format
   - Choose "Custom" export options
   - Include: Structure + Data
   - Save as: `dennep_pos_backup_[DATE].sql`
   - Example: `dennep_pos_backup_2024-11-24.sql`

3. **Verify Backup**
   - File should be 1-5 MB
   - Contains CREATE TABLE and INSERT statements
   - Keep safe location (cloud storage, local backup)

### Option B: Command Line (if SSH access available)

```bash
# SSH into Hostinger server
ssh username@your-host.com

# Backup database
mysqldump -u database_user -p database_name > backup_$(date +%Y%m%d).sql

# Download backup to local
scp username@your-host.com:~/backup_20241124.sql ./
```

### Option C: PHP Script (if neither above works)

```php
<?php
// Create backup_db.php
$host = 'localhost';
$user = 'db_user';
$pass = 'db_password';
$db = 'u331468302_dennup_pos';

$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) die("Connection failed: " . $conn->connect_error);

$result = $conn->query("SELECT * FROM information_schema.TABLES WHERE TABLE_SCHEMA = '$db'");

$backup = "-- Database Backup\n";
while ($row = $result->fetch_assoc()) {
    $table = $row['TABLE_NAME'];
    $create = $conn->query("SHOW CREATE TABLE $table")->fetch_array();
    $backup .= $create[1] . ";\n\n";
}

file_put_contents("backup_" . date('Y-m-d-H-i-s') . ".sql", $backup);
echo "Backup created successfully!";
?>
```

---

## Step 2: Analyze Current Database Structure

Before migration, understand what data you currently have:

```sql
-- Run these queries in current database to assess data
SELECT COUNT(*) as total_shops FROM shops;
SELECT COUNT(*) as total_users FROM users;
SELECT COUNT(*) as total_products FROM products;
SELECT COUNT(*) as total_orders FROM orders;
SELECT COUNT(*) as total_customers FROM customers;
SELECT COUNT(*) as total_payments FROM payments;
```

**Expected Current Structure (from dennep_pos.sql):**
- shops table (5-10 shops)
- users table (10-20 staff)
- products table (50-200 products)
- orders table (100-1000 orders)
- customers table (50-500 customers)
- payments table (existing payments)

---

## Step 3: Data Mapping & Transformation

### Tables That Are Compatible (No Changes Needed)

| Current Table | Optimized Table | Status |
|---------------|-----------------|--------|
| shops | shops | ✅ Compatible |
| users | users | ✅ Compatible |
| customers | customers | ✅ Compatible |
| products | products | ✅ Compatible |
| orders | orders | ✅ With modifications* |
| order_items | order_items | ✅ Compatible |
| bank_accounts | bank_accounts | ✅ Compatible |
| payments | payments | ⚠️ Enhanced* |

### Table Changes Required

#### 1. **orders Table**
**Change:** `delivery_address` field handling

```sql
-- Current structure (might have delivery_address as text)
-- Optimized structure: delivery_address VARCHAR(500) in orders table

-- No action needed if already embedded in orders
-- If in separate customer_addresses table, migrate to orders:

UPDATE orders o
SET delivery_address = (
    SELECT CONCAT(street, ', ', city, ', ', postal_code)
    FROM customer_addresses ca
    WHERE ca.customer_id = o.customer_id
    LIMIT 1
)
WHERE delivery_address IS NULL;
```

#### 2. **payments Table**
**Change:** New columns `bank_name` and `branch_name` as VARCHAR

```sql
-- These columns are new in optimized schema
-- Add them to current database before migration

-- If bank_account_id references existing bank account:
ALTER TABLE payments ADD COLUMN bank_name VARCHAR(100);
ALTER TABLE payments ADD COLUMN branch_name VARCHAR(100);

-- Populate from bank_accounts if data exists:
UPDATE payments p
SET bank_name = ba.bank_name,
    branch_name = ba.branch_name
WHERE p.bank_account_id = ba.bank_account_id;
```

### Tables to Create (New in Optimized Schema)

These tables should be created during migration:
- **size_types** - Predefined (3 types: Alphabetic, Numeric, Kids)
- **sizes** - Per-shop sizes
- **colors** - Per-shop colors
- **categories** - Per-shop product categories
- **product_sizes** - Product-Size mappings
- **product_colors** - Product-Color mappings
- **shop_product_stock** - Inventory tracking
- **shop_inventory** - Supplies tracking
- **provinces, districts, cities** - Geographic reference
- **payment_reconciliation** - Bank reconciliation
- **audit_log** - Complete audit trail
- **activity_log** - Business event logging

### Tables to Remove (No Longer Needed)

- ❌ **customer_addresses** - Data migrated to `orders.delivery_address`
- Any obsolete payment method tables
- Any branch reference tables (replaced by varchar fields)

---

## Step 4: Choose Migration Method

### Method 1: Full Replacement (Recommended for Clean Start)

**Best for:** New or test environments

**Steps:**
1. Create new database or use same database name
2. Drop all tables in current database
3. Import `dennep_pos_optimized.sql`
4. Manually copy over production data (orders, customers, products) from backup

**Time:** 15-20 minutes
**Downtime:** 10 minutes
**Risk:** Medium (requires careful data copying)

### Method 2: Side-by-Side Migration (Recommended for Production)

**Best for:** Production environments (safest)

**Steps:**
1. Create temporary database: `u331468302_dennup_pos_new`
2. Import `dennep_pos_optimized.sql` into new database
3. Set up data sync process
4. Point application to new database
5. Verify all features work
6. Delete old database

**Time:** 30-45 minutes
**Downtime:** 5 minutes (cutover only)
**Risk:** Low (original DB intact until verified)

### Method 3: Gradual Table Replacement (For Complex Scenarios)

**Best for:** Large databases with lots of data

**Steps:**
1. Create new tables in current database with `_new` suffix
2. Migrate data table by table
3. Verify counts match original
4. Rename tables (drop old, rename `_new` to current)
5. Update foreign keys and constraints

**Time:** 45-60 minutes
**Downtime:** 2-3 minutes per table
**Risk:** Low (can rollback individual tables)

---

## Step 5: Execute Migration

### Using Method 2 (Recommended)

#### 5.1 Create New Database

**In phpMyAdmin:**
1. Click "Databases" tab
2. Create new database: `u331468302_dennup_pos_new`
3. Charset: utf8mb4
4. Collation: utf8mb4_unicode_ci

**Via Command Line:**
```bash
mysql -u admin -p -e "CREATE DATABASE u331468302_dennup_pos_new CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

#### 5.2 Import Optimized Schema

**In phpMyAdmin:**
1. Select new database: `u331468302_dennup_pos_new`
2. Go to "Import" tab
3. Select file: `dennep_pos_optimized.sql`
4. Execute

**Via Command Line:**
```bash
mysql -u admin -p u331468302_dennup_pos_new < dennep_pos_optimized.sql
```

**Via SSH (Hostinger):**
```bash
# Upload file to server
scp dennep_pos_optimized.sql username@host.com:~/

# SSH in and import
ssh username@host.com
mysql -u db_user -p database_name < ~/dennep_pos_optimized.sql
```

#### 5.3 Verify Schema Import

```sql
-- Run in new database to verify all tables created
SELECT COUNT(*) as table_count
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'u331468302_dennup_pos_new';

-- Should show: 22 tables
```

#### 5.4 Copy Production Data

```sql
-- Switch to new database and copy production data

-- 1. Copy shops
INSERT INTO u331468302_dennup_pos_new.shops
SELECT * FROM u331468302_dennup_pos.shops;

-- 2. Copy users
INSERT INTO u331468302_dennup_pos_new.users
SELECT * FROM u331468302_dennup_pos.users;

-- 3. Copy products
INSERT INTO u331468302_dennup_pos_new.products
SELECT * FROM u331468302_dennup_pos.products;

-- 4. Copy customers
INSERT INTO u331468302_dennup_pos_new.customers
SELECT * FROM u331468302_dennup_pos.customers;

-- 5. Copy orders (verify delivery_address is present)
INSERT INTO u331468302_dennup_pos_new.orders
SELECT * FROM u331468302_dennup_pos.orders;

-- 6. Copy order items
INSERT INTO u331468302_dennup_pos_new.order_items
SELECT * FROM u331468302_dennup_pos.order_items;

-- 7. Copy bank accounts
INSERT INTO u331468302_dennup_pos_new.bank_accounts
SELECT * FROM u331468302_dennup_pos.bank_accounts;

-- 8. Copy payments (with new bank_name/branch_name fields)
INSERT INTO u331468302_dennup_pos_new.payments
SELECT * FROM u331468302_dennup_pos.payments;

-- Verify counts match
SELECT 'shops' as table_name, COUNT(*) as count FROM u331468302_dennup_pos.shops
UNION ALL
SELECT 'users', COUNT(*) FROM u331468302_dennup_pos.users
UNION ALL
SELECT 'products', COUNT(*) FROM u331468302_dennup_pos.products
UNION ALL
SELECT 'orders', COUNT(*) FROM u331468302_dennup_pos.orders
UNION ALL
SELECT 'customers', COUNT(*) FROM u331468302_dennup_pos.customers;
```

#### 5.5 Verify Data Integrity

```sql
-- Check for foreign key violations
-- Run in new database

-- 1. Orders with missing customers
SELECT COUNT(*) FROM u331468302_dennup_pos_new.orders o
WHERE NOT EXISTS (SELECT 1 FROM customers c WHERE c.customer_id = o.customer_id);

-- 2. Order items with missing orders
SELECT COUNT(*) FROM u331468302_dennup_pos_new.order_items oi
WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.order_id = oi.order_id);

-- 3. Products with missing categories
SELECT COUNT(*) FROM u331468302_dennup_pos_new.products p
WHERE NOT EXISTS (SELECT 1 FROM categories c WHERE c.category_id = p.category_id);

-- All counts should be 0 (no orphaned records)
```

#### 5.6 Enable Foreign Keys

```sql
-- Verify all constraints are enabled
SET FOREIGN_KEY_CHECKS=1;

-- Test one constraint
ALTER TABLE u331468302_dennup_pos_new.orders
ADD CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id)
REFERENCES customers(customer_id);
```

---

## Step 6: Update Backend Configuration

### Update Database Connection

**File:** `backend/.env` or `backend/src/config/database.ts`

```bash
# .env
DB_HOST=localhost
DB_USER=db_user
DB_PASSWORD=db_password
DB_NAME=u331468302_dennup_pos_new  # Update to new database name
DB_PORT=3306
```

**Or in code:**
```typescript
// src/config/database.ts
const connection = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: 'u331468302_dennup_pos_new',  // Update here
  port: 3306
};
```

### Restart Backend Server

```bash
# Stop existing server
npm stop

# Start new server (will connect to new database)
npm start

# Verify no connection errors
```

---

## Step 7: Testing (Critical!)

### 7.1 API Testing

```bash
# Test each API endpoint with new database

# 1. Get shops
curl -X GET http://localhost:3000/api/shops

# 2. Get shop products
curl -X GET http://localhost:3000/api/shops/1/products

# 3. Get customers
curl -X GET http://localhost:3000/api/customers/1

# 4. Get orders
curl -X GET http://localhost:3000/api/orders/1

# 5. Get payments
curl -X GET http://localhost:3000/api/payments/1

# All should return 200 with data
```

### 7.2 Frontend Testing

- [ ] Open BankAccountsPage - should load accounts
- [ ] Open PaymentsPage - should load payments with new columns
- [ ] Open SalesPage - should load orders and customers
- [ ] Open ProductsPage - should load products with categories
- [ ] Open InventoryPage - should load stock levels
- [ ] Create new order - should save successfully
- [ ] Create new payment - should accept bank_name/branch_name

### 7.3 Database Integrity Checks

```sql
-- Run in new database
-- Check for data consistency

-- 1. No orphaned orders
SELECT o.order_id, o.customer_id FROM orders o
LEFT JOIN customers c ON o.customer_id = c.customer_id
WHERE c.customer_id IS NULL;

-- 2. No orphaned order items
SELECT oi.order_item_id FROM order_items oi
LEFT JOIN orders o ON oi.order_id = o.order_id
WHERE o.order_id IS NULL;

-- 3. All payments linked to valid shop/customer
SELECT p.payment_id FROM payments p
WHERE shop_id NOT IN (SELECT shop_id FROM shops);

-- 4. Verify counts match
SELECT 'Old DB' as db,
  (SELECT COUNT(*) FROM u331468302_dennup_pos.orders) as orders,
  (SELECT COUNT(*) FROM u331468302_dennup_pos.customers) as customers
UNION ALL
SELECT 'New DB',
  COUNT(*) FROM u331468302_dennup_pos_new.orders,
  COUNT(*) FROM u331468302_dennup_pos_new.customers;
```

---

## Step 8: Cutover to New Database

### When All Tests Pass:

1. **Verify no errors in logs**
   ```bash
   tail -f backend/logs/error.log
   ```

2. **Alert users (if production)**
   - Announce 5-minute maintenance window
   - Stop accepting new orders/payments

3. **Final backup of old database**
   ```bash
   # Just to be safe
   mysqldump -u admin -p u331468302_dennup_pos > final_backup_old_db.sql
   ```

4. **Update DNS/Application to use new database**
   - Update `.env` to point to new database
   - Restart application
   - Monitor for errors

5. **Re-enable user access**
   - Test with real users
   - Monitor for issues

---

## Step 9: Archive Old Database (After 7 Days)

Once new database has been running smoothly for 7 days:

```sql
-- Rename old database for archival
ALTER DATABASE u331468302_dennup_pos RENAME TO u331468302_dennup_pos_archive_20241124;

-- Or delete if confident
-- DROP DATABASE u331468302_dennup_pos;

-- Rename new database to production name
ALTER DATABASE u331468302_dennup_pos_new RENAME TO u331468302_dennup_pos;
```

**Note:** Keep archive for at least 30 days before deleting.

---

## Rollback Plan (If Issues Found)

If something goes wrong during migration:

### Option 1: Revert to Old Database (Recommended)

```sql
-- Quick switch back to old database
-- Update .env to point to old database name
-- Restart application

-- The new database remains intact for debugging
```

### Option 2: Restore from Backup

```bash
# If old database was deleted, restore from backup
mysql -u admin -p u331468302_dennup_pos < dennep_pos_backup_20241124.sql

# Restart application
```

### Option 3: Database Copy

```sql
-- If you need to copy old data to new database again:
-- Follow Step 5.4 again
```

---

## Common Issues & Solutions

### Issue 1: "Foreign key constraint fails during import"

**Solution:**
```sql
-- Disable checks during import
SET FOREIGN_KEY_CHECKS=0;

-- Import the SQL file
-- Then re-enable
SET FOREIGN_KEY_CHECKS=1;
```

### Issue 2: "Duplicate entry" errors

**Solution:**
```sql
-- Clear conflicting data in new database
TRUNCATE TABLE payments;
TRUNCATE TABLE orders;
TRUNCATE TABLE customers;

-- Then re-import specific tables
```

### Issue 3: "Column not found" errors in application

**Solution:**
- Verify backend is connecting to NEW database
- Check application logs for SQL errors
- Ensure new columns (bank_name, branch_name) are handled in code

### Issue 4: "Connection refused" after import

**Solution:**
```bash
# Check MySQL is running
service mysql status

# Check database exists
mysql -u admin -p -e "SHOW DATABASES LIKE 'u331468302_dennup_pos%';"

# Test connection
mysql -u admin -p u331468302_dennup_pos_new -e "SELECT 1;"
```

### Issue 5: "Payments page crashes after migration"

**Solution:**
- Verify `bank_account_id`, `bank_name`, `branch_name` columns exist in payments table
- Check that bank_accounts data is properly copied
- Add error handling in frontend for missing data

---

## Post-Migration Verification

### Daily (First 3 Days)

- [ ] Check application error logs
- [ ] Monitor database performance
- [ ] Verify all user activities (orders, payments)
- [ ] Check backup status

### Weekly

- [ ] Run database integrity checks
- [ ] Review audit_log for suspicious activity
- [ ] Verify payment reconciliation matches
- [ ] Test backup/restore process

### Monthly

- [ ] Run full database analysis
- [ ] Optimize slow queries
- [ ] Review storage usage
- [ ] Archive old activity logs if needed

---

## Migration Success Criteria

All of the following must be true:

✅ All 22 tables created successfully
✅ Data copied without errors
✅ Foreign key constraints enforced
✅ All API endpoints working
✅ Frontend pages loading correctly
✅ Orders can be created
✅ Payments can be recorded
✅ Bank accounts accessible
✅ No "null" or undefined errors
✅ Audit logs capturing changes
✅ Application performing normally

---

## Timeline Reference

| Phase | Duration | Activities |
|-------|----------|------------|
| Preparation | 1-2 hours | Backup, review schema, prepare team |
| Import | 5 minutes | Create DB, import SQL |
| Data Copy | 5 minutes | Copy production data |
| Verification | 10 minutes | Run integrity checks |
| Testing | 20-30 minutes | API, frontend, database tests |
| Cutover | 5 minutes | Switch database, restart app |
| Monitoring | 24+ hours | Watch for errors |
| Archival | 7+ days | Keep old DB for reference |

---

## Support & Questions

If you encounter issues:

1. **Check error logs** - Backend and browser console
2. **Verify database connection** - Check .env file
3. **Review this guide** - Section 11: Common Issues
4. **Run integrity checks** - See Step 7.3
5. **Contact Hostinger support** - If database access issues

---

## Success! 🎉

Once you've completed all steps, your system is running on the optimized database with:

- ✅ Multi-shop support
- ✅ Enhanced payment tracking
- ✅ Complete audit trail
- ✅ Flexible bank account management
- ✅ Improved inventory management
- ✅ Better data organization

**Next Steps:**
1. Configure any shop-specific settings
2. Train staff on new features
3. Set up regular database backups
4. Monitor performance and optimize as needed
