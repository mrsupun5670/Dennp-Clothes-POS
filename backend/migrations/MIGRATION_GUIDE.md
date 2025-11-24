# Database Migration Guide

This directory contains SQL migrations to enhance the Dennup Clothes POS database schema to fully support the frontend application.

## Overview

Multiple migrations are provided to align the database with the frontend model:

1. **001_add_cost_fields_to_products.sql** - Adds cost tracking fields
2. **002_create_payments_table.sql** - Creates payment transaction tracking
3. **003_add_payment_fields_to_orders.sql** - Adds order-level payment status
4. **004_fix_order_status_enum.sql** - Fixes order status enum
5. **005_add_cancelled_status.sql** - Adds cancelled status
6. **006_update_order_status_enum.sql** - Updates order status enum
7. **007_create_bank_accounts_table.sql** - Creates bank_accounts and updates payments table

## Pre-Migration Checklist

- ✅ Back up your database
- ✅ Test migrations on development database first
- ✅ Have database credentials ready
- ✅ Close any active connections to the database
- ✅ Ensure you have admin/root MySQL access

## Migration Execution

### Option 1: Using MySQL CLI

```bash
# Navigate to migrations directory
cd backend/migrations

# Execute migrations in order
mysql -h 193.203.184.9 -u u331468302_dennup_pos -p u331468302_dennup_pos < 001_add_cost_fields_to_products.sql
mysql -h 193.203.184.9 -u u331468302_dennup_pos -p u331468302_dennup_pos < 002_create_payments_table.sql
mysql -h 193.203.184.9 -u u331468302_dennup_pos -p u331468302_dennup_pos < 003_add_payment_fields_to_orders.sql
mysql -h 193.203.184.9 -u u331468302_dennup_pos -p u331468302_dennup_pos < 004_fix_order_status_enum.sql
mysql -h 193.203.184.9 -u u331468302_dennup_pos -p u331468302_dennup_pos < 005_add_cancelled_status.sql
mysql -h 193.203.184.9 -u u331468302_dennup_pos -p u331468302_dennup_pos < 006_update_order_status_enum.sql
mysql -h 193.203.184.9 -u u331468302_dennup_pos -p u331468302_dennup_pos < 007_create_bank_accounts_table.sql
```

When prompted, enter your database password: `gM7LfqqUK;|`

### Option 2: Using MySQL Workbench

1. Open MySQL Workbench
2. Connect to your database (193.203.184.9)
3. File → Open SQL Script
4. Select and run each migration file in order
5. Execute each script separately (⚡ Lightning bolt button)

### Option 3: Using phpMyAdmin (Hostinger cPanel)

1. Log in to your Hostinger cPanel
2. Navigate to phpMyAdmin
3. Select database `u331468302_dennup_pos`
4. Click "Import" tab
5. Upload and execute each migration file in order

### Option 4: Using Node.js Script (Recommended)

We'll create a migration runner script in the next phase that handles this automatically.

## Post-Migration Verification

### Verify Cost Fields Added

```sql
DESCRIBE products;
-- Should show: product_cost, print_cost columns

SELECT product_id, product_name, product_cost, print_cost, retail_price
FROM products LIMIT 3;
```

### Verify Payments Table Created

```sql
DESCRIBE payments;
-- Should show all payment columns

SELECT * FROM payments LIMIT 1;
```

### Verify Order Payment Fields Added

```sql
SELECT
  order_id,
  order_number,
  total_amount,
  advance_paid,
  balance_paid,
  total_paid,
  payment_status,
  remaining_amount
FROM orders LIMIT 3;
```

## Migration Details

### Migration 1: Cost Fields

**Tables affected:** `products`

**Changes:**

- `product_cost DOUBLE DEFAULT 0` - Track product acquisition cost
- `print_cost DOUBLE DEFAULT 0` - Track printing/manufacturing cost
- Indexes on both columns for query performance

**Purpose:** Support cost tracking in ProductsPage for margin calculations

### Migration 2: Payments Table

**Tables created:** `payments`

**Columns:**

- `payment_id` - Primary key
- `order_id` - Foreign key to orders table
- `payment_type` - advance/balance/full payment
- `amount_paid` - Amount in this transaction
- `payment_method` - cash/card/online/check/other
- `bank_name` - Bank name (BOC, Commercial Bank, etc.)
- `branch_name` - Branch location
- `is_online_transfer` - Flag for online bank transfers
- `payment_date` - When payment was made

**Purpose:** Detailed transaction logging for payment history and reconciliation

### Migration 3: Order Payment Summary

**Tables affected:** `orders`

**Changes:**

- `advance_paid DOUBLE DEFAULT 0` - Advance/partial payment amount
- `balance_paid DOUBLE DEFAULT 0` - Final payment amount
- `total_paid DOUBLE DEFAULT 0` - Sum of advance + balance
- `payment_status ENUM` - unpaid/partial/fully_paid
- `remaining_amount DOUBLE DEFAULT 0` - Amount still due

**Purpose:** Quick access to payment status without joining to payments table

### Migration 7: Bank Accounts & Updated Payments Table

**Tables created:** `bank_accounts`
**Tables modified:** `payments` (updated to include bank_account_id foreign key)

**Columns (bank_accounts):**

- `bank_account_id` - Primary key
- `shop_id` - Foreign key to shops (multi-tenant support)
- `bank_name` - Bank name (e.g., "Bank of Ceylon", "Commercial Bank")
- `account_number` - Account number (unique per bank)
- `account_holder_name` - Name on the account
- `account_type` - ENUM: checking/savings/business
- `branch_code` - Optional branch code
- `ifsc_code` - Optional IFSC code for Indian banks
- `initial_balance` - Starting balance
- `current_balance` - Current account balance
- `status` - ENUM: active/inactive/closed
- `created_at` - Timestamp
- `updated_at` - Timestamp with auto-update

**Columns (payments update):**

- `bank_account_id` - New foreign key for bank transfers
- Proper foreign key constraints to bank_accounts table

**Purpose:** Support Bank Accounts management page and payment method tracking for bank transfers

## Rollback Instructions

If you need to rollback (not recommended in production):

```sql
-- Rollback Migration 3
ALTER TABLE orders DROP COLUMN remaining_amount;
ALTER TABLE orders DROP COLUMN payment_status;
ALTER TABLE orders DROP COLUMN total_paid;
ALTER TABLE orders DROP COLUMN balance_paid;
ALTER TABLE orders DROP COLUMN advance_paid;

-- Rollback Migration 2
DROP TABLE IF EXISTS payments;

-- Rollback Migration 1
ALTER TABLE products DROP COLUMN print_cost;
ALTER TABLE products DROP COLUMN product_cost;

-- Rollback Migration 7
ALTER TABLE payments DROP FOREIGN KEY payments_ibfk_4;
ALTER TABLE payments DROP COLUMN bank_account_id;
DROP TABLE IF EXISTS bank_accounts;
```

## Scheduling

**Recommended timing:**

1. Run migrations immediately on your Hostinger database
2. Backend API development can proceed in parallel
3. Frontend will automatically work with new fields once APIs are in place

## FAQ

**Q: Can I run all migrations at once?**
A: Yes, they are independent. However, running in order is recommended for clear logging.

**Q: What if migration fails?**
A: Check error message, fix the issue, and re-run. Most are idempotent (safe to re-run).

**Q: Can I modify migrations before running?**
A: Not recommended. If changes needed, create a new migration instead.

**Q: Will existing data be affected?**
A: No. All new columns default to 0 or NULL, so existing records remain unchanged.

**Q: Do I need to update my application code?**
A: Not for these migrations. Your frontend code already expects these fields. Backend APIs will use them once created.

## Next Steps

After running migrations:

1. ✅ Execute all three migrations
2. ⏳ Create TypeScript models matching new schema
3. ⏳ Build database service layer
4. ⏳ Create REST API endpoints
5. ⏳ Connect frontend to backend APIs

## Support

If migrations fail:

1. Check your database connection
2. Verify user has ALTER TABLE privileges
3. Review MySQL error messages in detail
4. Contact Hostinger support if permissions issue
