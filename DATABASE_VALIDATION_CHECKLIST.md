# Database Migration Validation Checklist

## Pre-Migration Phase

### Preparation
- [ ] Current database backed up to: ___________________
- [ ] Backup file size verified (should be 1-5 MB)
- [ ] Backup stored in secure location (cloud/local)
- [ ] Optimized schema reviewed by team
- [ ] Migration window scheduled
- [ ] Team notified of maintenance window
- [ ] All dependent services identified and documented
- [ ] Rollback plan communicated to stakeholders

### Environment Setup
- [ ] Development database setup complete
- [ ] Test database created and accessible
- [ ] Production backup created before migration
- [ ] Database user credentials verified and stored securely
- [ ] SSH/hosting access verified and working
- [ ] phpMyAdmin access confirmed
- [ ] Database backup tools tested
- [ ] DNS/application pointing confirmed

---

## Import Phase

### Schema Creation
- [ ] New database created: `u331468302_dennup_pos_new`
- [ ] Character set verified: `utf8mb4`
- [ ] Collation verified: `utf8mb4_unicode_ci`
- [ ] dennep_pos_optimized.sql file size verified
- [ ] SQL file uploaded to server successfully
- [ ] Import command executed without errors
- [ ] Import completion time: _____ minutes

### Table Verification
- [ ] Total table count = 22 (verify with query)
```sql
SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA = 'u331468302_dennup_pos_new';
```
**Expected:** 22

- [ ] All required tables created:
  - [ ] shops
  - [ ] users
  - [ ] size_types
  - [ ] sizes
  - [ ] colors
  - [ ] categories
  - [ ] products
  - [ ] product_sizes
  - [ ] product_colors
  - [ ] shop_product_stock
  - [ ] shop_inventory
  - [ ] customers
  - [ ] provinces
  - [ ] districts
  - [ ] cities
  - [ ] orders
  - [ ] order_items
  - [ ] bank_accounts
  - [ ] payments
  - [ ] payment_reconciliation
  - [ ] audit_log
  - [ ] activity_log

### Index Verification
- [ ] Primary keys verified for all tables
- [ ] Foreign key constraints verified
- [ ] Unique constraints verified:
  - [ ] shops.shop_name
  - [ ] users.username
  - [ ] products.sku (per shop)
  - [ ] payments.transaction_id
  - [ ] More: ___________________

### Sample Data Verification
- [ ] shops table has 5 sample shops
- [ ] users table has 5 sample users
- [ ] size_types table has 3 entries (Alphabetic, Numeric, Kids)
- [ ] sizes table has entries
- [ ] colors table has sample colors
- [ ] categories table has sample categories
- [ ] products table has sample products
- [ ] customers table has sample customers
- [ ] provinces table populated (for reference)

---

## Data Migration Phase

### Pre-Migration Data Counts
Run in CURRENT database and record:

```sql
SELECT
  (SELECT COUNT(*) FROM shops) as shops,
  (SELECT COUNT(*) FROM users) as users,
  (SELECT COUNT(*) FROM products) as products,
  (SELECT COUNT(*) FROM customers) as customers,
  (SELECT COUNT(*) FROM orders) as orders,
  (SELECT COUNT(*) FROM payments) as payments;
```

| Table | Old Count | New Count | Match |
|-------|-----------|-----------|-------|
| shops | ___ | ___ | ☐ |
| users | ___ | ___ | ☐ |
| products | ___ | ___ | ☐ |
| customers | ___ | ___ | ☐ |
| orders | ___ | ___ | ☐ |
| payments | ___ | ___ | ☐ |

### Data Copy Execution
- [ ] Shops copied successfully
- [ ] Users copied successfully
- [ ] Products copied successfully
- [ ] Customers copied successfully
- [ ] Orders copied successfully
- [ ] Order items copied successfully
- [ ] Bank accounts copied successfully
- [ ] Payments copied successfully
- [ ] All INSERT operations completed without errors

### Data Transformation
- [ ] Payment methods migrated correctly:
  - [ ] 'cash' → 'cash'
  - [ ] 'card' → 'bank_deposit'
  - [ ] 'online' → 'online_transfer'
  - [ ] 'bank_transfer' → 'online_transfer'
  - [ ] 'check' → 'bank_deposit'
- [ ] Order status values valid (pending, processing, completed, cancelled)
- [ ] Delivery address data preserved
- [ ] All timestamps preserved
- [ ] All amounts preserved with correct decimal precision

### Data Count Verification

**Run in NEW database:**

```sql
SELECT
  (SELECT COUNT(*) FROM shops) as shops,
  (SELECT COUNT(*) FROM users) as users,
  (SELECT COUNT(*) FROM products) as products,
  (SELECT COUNT(*) FROM customers) as customers,
  (SELECT COUNT(*) FROM orders) as orders,
  (SELECT COUNT(*) FROM payments) as payments;
```

- [ ] All counts match old database (from pre-migration)
- [ ] No data loss detected
- [ ] Discrepancies explained: ___________________

---

## Data Integrity Phase

### Foreign Key Violations

**Run all checks in NEW database:**

#### Orders → Customers
```sql
SELECT COUNT(*) as orphaned_orders
FROM orders o
WHERE NOT EXISTS (SELECT 1 FROM customers c WHERE c.customer_id = o.customer_id AND c.shop_id = o.shop_id);
```
- [ ] Result = 0 ✓

#### Orders → Shops
```sql
SELECT COUNT(*) as invalid_orders
FROM orders o
WHERE NOT EXISTS (SELECT 1 FROM shops s WHERE s.shop_id = o.shop_id);
```
- [ ] Result = 0 ✓

#### Order Items → Orders
```sql
SELECT COUNT(*) as orphaned_items
FROM order_items oi
WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.order_id = oi.order_id);
```
- [ ] Result = 0 ✓

#### Payments → Orders (if not null)
```sql
SELECT COUNT(*) as orphaned_payments
FROM payments p
WHERE p.order_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM orders o WHERE o.order_id = p.order_id);
```
- [ ] Result = 0 ✓

#### Payments → Customers (if not null)
```sql
SELECT COUNT(*) as orphaned_payments
FROM payments p
WHERE p.customer_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM customers c WHERE c.customer_id = p.customer_id);
```
- [ ] Result = 0 ✓

#### Bank Accounts → Shops
```sql
SELECT COUNT(*) as invalid_accounts
FROM bank_accounts ba
WHERE NOT EXISTS (SELECT 1 FROM shops s WHERE s.shop_id = ba.shop_id);
```
- [ ] Result = 0 ✓

### Data Quality Checks

#### Decimal Precision
```sql
-- Verify amounts have correct decimal places
SELECT COUNT(*) as bad_amounts
FROM payments
WHERE payment_amount LIKE '%.%' AND LENGTH(SUBSTRING_INDEX(payment_amount, '.', -1)) > 2;
```
- [ ] Result = 0 ✓

#### Date Formats
```sql
-- Verify dates are valid
SELECT COUNT(*) as invalid_dates
FROM orders
WHERE order_date > NOW();
```
- [ ] Result = 0 ✓

#### Enum Values
```sql
-- Verify payment methods are valid
SELECT DISTINCT payment_method FROM payments
WHERE payment_method NOT IN ('cash', 'online_transfer', 'bank_deposit');
```
- [ ] Result is empty (no invalid values) ✓

```sql
-- Verify order status values
SELECT DISTINCT order_status FROM orders
WHERE order_status NOT IN ('pending', 'processing', 'completed', 'cancelled');
```
- [ ] Result is empty (no invalid values) ✓

### Data Consistency Checks

#### Shop Data Isolation
```sql
-- Verify shops are properly isolated
SELECT COUNT(DISTINCT shop_id) as unique_shops
FROM (
  SELECT DISTINCT shop_id FROM products
  UNION
  SELECT DISTINCT shop_id FROM orders
  UNION
  SELECT DISTINCT shop_id FROM users
) as all_refs;
```
- [ ] Result matches number of shops
- [ ] Number of unique shops: _____

#### User-Shop Alignment
```sql
-- Verify users belong to valid shops
SELECT COUNT(*) as invalid_users
FROM users u
WHERE NOT EXISTS (SELECT 1 FROM shops s WHERE s.shop_id = u.shop_id);
```
- [ ] Result = 0 ✓

---

## Backend Configuration Phase

### Connection Setup
- [ ] Database host confirmed: ___________________
- [ ] Database username confirmed: ___________________
- [ ] Database password confirmed (not shown for security)
- [ ] Database name updated to: `u331468302_dennup_pos_new`
- [ ] Database port confirmed: 3306

### Environment Files
- [ ] .env file updated with new database name
- [ ] Environment variables verified
- [ ] Test connection successful (no "connection refused" errors)
- [ ] Credentials stored securely (not in version control)

### Backend Startup
- [ ] Backend server started without errors
- [ ] No TypeScript compilation errors:
  ```bash
  npx tsc --noEmit
  ```
  - [ ] Result: 0 errors ✓

- [ ] No database connection errors in logs
- [ ] Server listening on correct port: 3000 (or ___)
- [ ] No "ECONNREFUSED" or "ENOTFOUND" errors
- [ ] Startup time: _____ seconds

---

## API Testing Phase

### Basic Connectivity
```bash
curl http://localhost:3000/api/shops
```
- [ ] Response status: 200 ✓
- [ ] Response contains array of shops
- [ ] No connection errors

### Shop Endpoints
- [ ] `GET /api/shops` - Returns 200 with shop list
- [ ] `GET /api/shops/1` - Returns 200 with shop details
- [ ] `GET /api/shops/1/products` - Returns 200 with products

### Product Endpoints
- [ ] `GET /api/products` - Returns 200
- [ ] `GET /api/products/1` - Returns 200
- [ ] `GET /api/products/1/stock` - Returns 200 (if endpoint exists)

### Order Endpoints
- [ ] `GET /api/orders` - Returns 200
- [ ] `GET /api/orders/1` - Returns 200
- [ ] `GET /api/orders/1/items` - Returns 200 (if endpoint exists)

### Customer Endpoints
- [ ] `GET /api/customers` - Returns 200
- [ ] `GET /api/customers/1` - Returns 200
- [ ] `GET /api/customers/1/orders` - Returns 200 (if endpoint exists)

### Payment Endpoints
- [ ] `GET /api/payments` - Returns 200
- [ ] `GET /api/payments/1` - Returns 200
- [ ] `POST /api/payments` - Creates payment successfully
- [ ] Response includes new fields (bank_name, branch_name)

### Bank Account Endpoints
- [ ] `GET /api/bank-accounts` - Returns 200
- [ ] `GET /api/bank-accounts/1` - Returns 200
- [ ] `POST /api/bank-accounts` - Creates account successfully

### Error Handling
- [ ] Invalid shop ID returns 404:
  ```bash
  curl http://localhost:3000/api/shops/99999
  ```
- [ ] Missing required fields return 400
- [ ] Unauthorized requests return 401 (if auth enabled)
- [ ] Server errors return 500 with proper message

---

## Frontend Testing Phase

### Application Startup
- [ ] Frontend builds without errors:
  ```bash
  npm run build
  ```
- [ ] Development server starts:
  ```bash
  npm start
  ```
- [ ] No console errors on load
- [ ] No CORS errors

### Page Load Tests

#### BankAccountsPage
- [ ] Page loads without errors
- [ ] Bank accounts list displays correctly
- [ ] No "Cannot read property" errors
- [ ] Data from API loads correctly
- [ ] Summary cards calculate properly
- [ ] Search/filter functionality works

#### PaymentsPage
- [ ] Page loads without errors
- [ ] Payments table displays
- [ ] Summary cards show (Total Transactions, Total Amount, Completion %)
- [ ] New columns visible (bank_name, branch_name)
- [ ] No "Cannot read property 'toFixed'" errors
- [ ] Payment creation modal opens
- [ ] Can create payment with bank_name/branch_name

#### SalesPage
- [ ] Page loads and shows orders
- [ ] Order list displays correctly
- [ ] Payment status shown correctly
- [ ] No payment-related errors
- [ ] Can view order details

#### ProductsPage
- [ ] Page loads with products
- [ ] Product search works
- [ ] Category filter works
- [ ] Product creation works

#### InventoryPage
- [ ] Page loads with inventory
- [ ] Stock levels display correctly
- [ ] Low stock warnings show if enabled
- [ ] Supplies inventory displays

#### CustomersPage
- [ ] Page loads with customer list
- [ ] Customer search works
- [ ] Can create new customer
- [ ] Loyalty points display (if applicable)

### Component Integration
- [ ] All pages load without global errors
- [ ] Navigation between pages works smoothly
- [ ] Data persists when navigating back
- [ ] No memory leaks detected (check DevTools)

---

## Data Accuracy Phase

### Sample Data Verification

#### Verify Migrated Data
```sql
-- Check a specific order with items
SELECT o.*, COUNT(oi.order_item_id) as item_count
FROM orders o
LEFT JOIN order_items oi ON o.order_id = oi.order_id
WHERE o.shop_id = 1
GROUP BY o.order_id
LIMIT 5;
```
- [ ] Orders show correct item counts
- [ ] Order amounts match sum of items
- [ ] Dates are correct

#### Verify Payment Data
```sql
-- Check payment method distribution
SELECT payment_method, COUNT(*) as count
FROM payments
GROUP BY payment_method;
```
- [ ] Only valid methods present (cash, online_transfer, bank_deposit)
- [ ] Method distribution reasonable
- [ ] No NULL or invalid values

#### Verify Customer Orders Link
```sql
-- Spot check customer orders
SELECT c.customer_id, c.customer_name, COUNT(o.order_id) as order_count
FROM customers c
LEFT JOIN orders o ON c.customer_id = o.customer_id AND c.shop_id = o.shop_id
WHERE c.shop_id = 1
GROUP BY c.customer_id
LIMIT 10;
```
- [ ] Order counts look reasonable
- [ ] No data mismatches

---

## Performance Phase

### Query Performance
```sql
-- Test common queries for performance
-- Orders by shop (should be <100ms)
SELECT * FROM orders WHERE shop_id = 1 LIMIT 10;
-- Expected: <100ms

-- Payments by date (should be <100ms)
SELECT * FROM payments WHERE shop_id = 1 AND payment_date = CURDATE();
-- Expected: <100ms

-- Products with inventory (might be slow with joins)
SELECT p.*, s.quantity FROM products p
LEFT JOIN shop_product_stock s ON p.product_id = s.product_id
WHERE p.shop_id = 1
LIMIT 10;
-- Expected: <200ms
```

### Database Size
```sql
SELECT
  SUM(data_length + index_length) / 1024 / 1024 as 'Size_MB'
FROM information_schema.tables
WHERE table_schema = 'u331468302_dennup_pos_new';
```
- [ ] Database size reasonable: _____ MB
- [ ] Size matches or is slightly larger than old DB

### Connection Pool
- [ ] Database connections from app: _____ active
- [ ] No "too many connections" errors
- [ ] Connection timeout settings verified

---

## Cutover Phase

### Final Verification Before Switch
- [ ] All tests passing
- [ ] No outstanding errors in logs
- [ ] Data integrity confirmed
- [ ] API responses verified
- [ ] Frontend pages loading
- [ ] Performance acceptable

### Database Switch
- [ ] Old database: `u331468302_dennup_pos` backed up with suffix `_archive_YYYYMMDD`
- [ ] .env updated to point to new database
- [ ] Application restarted after .env change
- [ ] No connection errors after restart
- [ ] First request processed successfully

### Post-Switch Verification
- [ ] Application loads data from new database
- [ ] All pages display correctly
- [ ] No "table not found" errors
- [ ] No schema mismatch errors
- [ ] Payment creation works with new fields
- [ ] Orders display correctly
- [ ] Time from switch to stability: _____ minutes

---

## Monitoring Phase (First 24 Hours)

### Hourly Checks (First 4 Hours)
- [ ] Hour 1: No errors in logs
- [ ] Hour 2: All API endpoints working
- [ ] Hour 3: Database performance normal
- [ ] Hour 4: No user-reported issues

### Daily Checks (First 7 Days)
- [ ] Error logs reviewed daily
- [ ] Database queries performing normally
- [ ] No deadlocks or lock timeouts
- [ ] Payment processing working smoothly
- [ ] Report any issues: ___________________

### Weekly Review
- [ ] Database performance stable
- [ ] No data integrity issues found
- [ ] Backup/restore tested successfully
- [ ] Team trained on new structure
- [ ] Documentation updated

---

## Rollback Verification (If Needed)

**Only if critical issues found:**

### Rollback Steps
- [ ] Stop application
- [ ] Switch .env back to old database name
- [ ] Restart application
- [ ] Verify old data loads correctly
- [ ] Document what failed for analysis
- [ ] Contact support with findings

### Root Cause Analysis
- [ ] Issue identified: ___________________
- [ ] Error message: ___________________
- [ ] Logs attached: ___________________
- [ ] Planned fix: ___________________

---

## Post-Migration (After 7 Days)

### Archive Old Database
- [ ] Old database verified as not needed
- [ ] Backup/export of old database saved
- [ ] Old database renamed to: `u331468302_dennup_pos_archive_YYYYMMDD`
- [ ] Keep archived for 30 days minimum

### Cleanup
- [ ] Temporary migration tables removed
- [ ] Old migration scripts archived
- [ ] Documentation finalized
- [ ] Team trained on new schema
- [ ] Handoff completed

### Final Documentation
- [ ] Migration summary created
- [ ] Performance baseline established
- [ ] Operational runbook updated
- [ ] Disaster recovery plan updated
- [ ] Schema documentation finalized

---

## Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Database Admin | _____ | _____ | _____ |
| Backend Lead | _____ | _____ | _____ |
| DevOps/Hosting | _____ | _____ | _____ |
| Project Manager | _____ | _____ | _____ |

---

## Notes & Issues

### During Migration
**Timestamp:** _____
**Issue:** ___________________
**Resolution:** ___________________

**Timestamp:** _____
**Issue:** ___________________
**Resolution:** ___________________

### Post-Migration
**Timestamp:** _____
**Issue:** ___________________
**Resolution:** ___________________

---

## Success Criteria Met

- ✅ All 22 tables created
- ✅ Data migrated without loss
- ✅ Data integrity verified
- ✅ Foreign keys enforced
- ✅ API endpoints working
- ✅ Frontend pages loading
- ✅ No critical errors
- ✅ Performance acceptable
- ✅ Team trained
- ✅ Documentation complete

**Migration Status:** ☐ SUCCESSFUL ☐ PARTIAL ☐ ROLLED BACK

**Sign-off Date:** ___________________
