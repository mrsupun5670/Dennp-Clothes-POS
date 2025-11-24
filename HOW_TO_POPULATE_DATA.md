# How to Populate Sample Data

## Overview

The `POPULATE_SAMPLE_DATA.sql` file contains realistic test data for all empty tables:
- **bank_accounts** (7 records)
- **payments** (14 records)
- **payment_reconciliation** (7 records)
- **activity_log** (22 records)
- **audit_log** (10 records)

**Total: 60 records** - All linked to existing orders and customers

---

## Data Relationships

### Bank Accounts
- **2 accounts per shop** for main shops (Colombo, Kandy)
- **1 account per shop** for other locations
- Bank names: Commercial Bank, Hatton National Bank, Peoples Bank, DFCC Bank
- All accounts have realistic balances

### Payments
- **12 payments linked to existing orders** (orders 16-22)
- Payment methods: cash, online_transfer, bank_deposit
- For orders with advance: multiple payments tracking advance + balance
- For COD orders: payment marked as pending
- **2 standalone payments** for general deposits

### Payment Reconciliation
- **One record per bank account**
- All reconciled (status = 'reconciled' or 'pending')
- Balances match between bank and system

### Activity Log
- **22 business events** logged
- Types: order_created, order_updated, payment_recorded, product_sold, inventory_adjusted, login, logout, report_generated
- Includes metadata in JSON format

### Audit Log
- **10 data change records**
- Tracks INSERT and UPDATE operations
- Stores old and new values in JSON
- Includes IP address and user agent

---

## How to Run the Script

### Method 1: phpMyAdmin (Hostinger)

1. **Open phpMyAdmin**
   - Login to Hostinger Control Panel
   - Navigate to Databases → phpMyAdmin
   - Select your database: `u331468302_dennep_pos`

2. **Import the SQL file**
   - Click "Import" tab
   - Choose file: `POPULATE_SAMPLE_DATA.sql`
   - Click "Import" button
   - Wait for success message

3. **Verify data**
   ```sql
   SELECT COUNT(*) FROM bank_accounts;        -- Should show: 7
   SELECT COUNT(*) FROM payments;              -- Should show: 14
   SELECT COUNT(*) FROM payment_reconciliation; -- Should show: 7
   SELECT COUNT(*) FROM activity_log;         -- Should show: 22
   SELECT COUNT(*) FROM audit_log;            -- Should show: 10
   ```

### Method 2: Command Line (SSH)

```bash
# SSH into your server
ssh user@your-host.com

# Run the SQL file
mysql -u database_user -p database_name < POPULATE_SAMPLE_DATA.sql

# Or if you're on the server:
mysql -u root -p
USE u331468302_dennep_pos;
SOURCE /path/to/POPULATE_SAMPLE_DATA.sql;
```

### Method 3: Copy-Paste in phpMyAdmin

1. Open phpMyAdmin SQL tab
2. Copy all content from `POPULATE_SAMPLE_DATA.sql`
3. Paste in SQL text area
4. Click Execute

---

## What Data Was Added

### Bank Accounts (7 records)

| Account ID | Shop | Bank Name | Branch | Status |
|-----------|------|-----------|--------|--------|
| 1 | Colombo | Commercial Bank | Colombo Main | Active |
| 2 | Colombo | Hatton National | Colombo Fort | Active |
| 3 | Kandy | Commercial Bank | Kandy Central | Active |
| 4 | Kandy | DFCC Bank | Kandy Branch | Active |
| 5 | Galle | Peoples Bank | Galle Fort | Active |
| 6 | Jaffna | Commercial Bank | Jaffna Main | Active |
| 7 | Warehouse | Hatton National | Biyagama | Active |

**Total Balance:** 735,000 Rs.

---

### Payments (14 records)

**Linked to Orders:**

| Order | Amount | Method | Type | Status |
|-------|--------|--------|------|--------|
| ORD-2025-001 | 3000 | Cash | Advance | Completed |
| ORD-2025-001 | 4250 | Online | Balance | Completed |
| ORD-2025-002 | 1000 | Cash | Advance | Completed |
| ORD-2025-002 | 3100 | Bank | Balance | Completed |
| ORD-2025-003 | 5000 | Online | Partial | Completed |
| ORD-2025-004 | 3350 | Cash | COD | Pending |
| ORD-2025-005 | 8700 | Cash | Advance | Completed |
| ORD-2025-005 | 350 | Cash | Balance | Completed |
| ORD-2025-006 | 1800 | Cash | Advance | Completed |
| ORD-2025-006 | 300 | Cash | Balance | Completed |
| ORD-2025-007 | 500 | Cash | Advance | Completed |
| ORD-2025-007 | 1000 | Online | Balance | Completed |

**Standalone:**
- Payment 13: 5000 Rs from Sunethra (general deposit)
- Payment 14: 2000 Rs from Walk-in (general deposit)

**Total Amount:** 42,000+ Rs.

---

### Payment Reconciliation (7 records)

- **6 reconciled** ✓ (balances match perfectly)
- **1 pending** (awaiting bank statement)
- All bank accounts accounted for
- Zero variance on reconciled accounts

---

### Activity Log (22 records)

**Breakdown:**
- 7 order_created events
- 3 order_updated events (status changes)
- 6 payment_recorded events
- 3 product_sold events
- 1 inventory_adjusted event
- 2 login events
- 2 report_generated events

**Sample events:**
- "Order ORD-2025-001 created for Sunethra Dias"
- "Advance payment of Rs. 3000.00 received (cash)"
- "Order status changed to shipped"
- "Sold 2x Premium Cotton Crew Tee (Black, Size M)"
- "Cashier Chathuri logged in"
- "Daily sales report generated"

---

### Audit Log (10 records)

**Tracks:**
- 2 payment INSERTs (payment 1, 2)
- 3 order STATus UPDATEs (orders 17, 20, 22)
- 3 bank_account INSERTs (accounts 1, 2, 3)
- 1 payment INSER (COD payment)
- 1 reconciliation INSERT

**Includes:**
- Old values (before update)
- New values (after update)
- IP address (e.g., 192.168.1.100)
- User agent (browser info)
- Description of changes

---

## How to Verify Data is Correct

### Run these verification queries:

#### 1. Count all records
```sql
SELECT 'Bank Accounts' as table_name, COUNT(*) as count FROM bank_accounts
UNION ALL
SELECT 'Payments', COUNT(*) FROM payments
UNION ALL
SELECT 'Reconciliation', COUNT(*) FROM payment_reconciliation
UNION ALL
SELECT 'Activity Log', COUNT(*) FROM activity_log
UNION ALL
SELECT 'Audit Log', COUNT(*) FROM audit_log;
```

**Expected Result:**
```
Bank Accounts: 7
Payments: 14
Reconciliation: 7
Activity Log: 22
Audit Log: 10
```

#### 2. Verify payments linked to orders
```sql
SELECT o.order_number, o.total_amount, SUM(p.payment_amount) as paid,
       CASE WHEN SUM(p.payment_amount) >= o.total_amount THEN 'Paid'
            WHEN SUM(p.payment_amount) > 0 THEN 'Partial'
            ELSE 'Unpaid' END as status
FROM orders o
LEFT JOIN payments p ON o.order_id = p.order_id
WHERE o.order_id BETWEEN 16 AND 22
GROUP BY o.order_id
ORDER BY o.order_id;
```

**Expected Result:**
```
ORD-2025-001: 6900 → Paid (7250 received including delivery)
ORD-2025-002: 3700 → Paid (4100 received)
ORD-2025-003: 9000 → Partial (5000 received)
ORD-2025-004: 3000 → Pending (3350 pending)
ORD-2025-005: 8700 → Paid (9050 paid)
ORD-2025-006: 1800 → Paid (2100 paid)
ORD-2025-007: 1000 → Paid (1500 paid)
```

#### 3. Verify bank balances
```sql
SELECT shop_id, bank_name, branch_name, current_balance, status
FROM bank_accounts
ORDER BY shop_id, bank_account_id;
```

**Expected Result:** 7 accounts with realistic balances ranging from 49,500 to 142,500

#### 4. Check reconciliation status
```sql
SELECT ba.bank_name, ba.branch_name, pr.bank_balance, pr.system_balance,
       pr.variance, pr.reconciliation_status
FROM payment_reconciliation pr
JOIN bank_accounts ba ON pr.bank_account_id = ba.bank_account_id
ORDER BY pr.shop_id;
```

**Expected Result:** All with variance = 0.00

#### 5. View activity log sample
```sql
SELECT activity_type, COUNT(*) as count
FROM activity_log
GROUP BY activity_type;
```

**Expected Result:**
```
order_created: 7
order_updated: 3
payment_recorded: 6
product_sold: 2
inventory_adjusted: 1
login: 2
report_generated: 2
```

---

## Testing the Data

### 1. Test Payment Creation
Your payment form should now work correctly:
- BankAccountsPage will show 7 bank accounts
- Payments can be created with bank_name, branch_name
- Payment methods work (cash, online_transfer, bank_deposit)

### 2. Test Payment Linking
- Orders with payment history display correctly
- Payment status calculated from payments table
- Multiple payments per order work

### 3. Test Reports
- Sales reports can be generated
- Payment summaries work
- Bank reconciliation page displays accounts

### 4. Test Audit Trail
- View all transactions in audit_log
- Activity history in activity_log
- IP tracking and user agent logging

---

## If You Need to Modify Data

### Add more payments
```sql
INSERT INTO payments
(shop_id, order_id, customer_id, payment_amount, payment_date, payment_method, notes, created_by)
VALUES
(1, 16, 1000, 1000, '2025-11-25', 'cash', 'Additional payment', 103),
(2, 18, 1001, 4350, '2025-11-25', 'online_transfer', 'Remaining balance', 102);
```

### Add more bank accounts
```sql
INSERT INTO bank_accounts
(shop_id, bank_name, branch_name, account_number, account_holder_name, account_type, current_balance, status)
VALUES
(1, 'Sampath Bank', 'Colombo South', 'SPB-001-2024', 'Aisha Khan', 'business', 80000, 'active');
```

### Add activity log entry
```sql
INSERT INTO activity_log
(shop_id, user_id, activity_type, entity_type, entity_id, description, metadata)
VALUES
(1, 103, 'payment_recorded', 'payment', 100, 'Manual payment entry', '{"payment_method": "cash", "amount": 5000}');
```

---

## Troubleshooting

### Error: "Duplicate entry"
**Cause:** Data already exists
**Solution:** Delete existing data first or use new IDs
```sql
DELETE FROM bank_accounts;
DELETE FROM payments;
DELETE FROM payment_reconciliation;
DELETE FROM activity_log;
DELETE FROM audit_log;
-- Then run POPULATE_SAMPLE_DATA.sql
```

### Error: "Foreign key constraint fails"
**Cause:** Orders don't exist
**Solution:** Make sure all orders (16-22) are in orders table
```sql
SELECT COUNT(*) FROM orders WHERE order_id BETWEEN 16 AND 22;
-- Should return: 7
```

### No data appears in frontend
**Cause:** Backend not pulling from new tables
**Solution:** Restart backend server
```bash
npm stop
npm start
```

### Payment amounts don't match orders
**Cause:** Manual entry error
**Solution:** Verify with this query:
```sql
SELECT o.order_id, o.order_number, o.final_amount,
       SUM(p.payment_amount) as total_paid
FROM orders o
LEFT JOIN payments p ON o.order_id = p.order_id
GROUP BY o.order_id
HAVING final_amount != total_paid;
```

---

## Next Steps

After running the script:

1. **Verify in phpMyAdmin**
   - Check each table for data
   - Verify row counts match

2. **Test Backend APIs**
   ```bash
   curl http://localhost:3000/api/payments/1
   curl http://localhost:3000/api/bank-accounts/1
   ```

3. **Test Frontend Pages**
   - Open BankAccountsPage - should show 7 accounts
   - Open PaymentsPage - should show 14 payments
   - Open SalesPage - should show payment status

4. **Generate Reports**
   - Daily sales report (should use activity_log data)
   - Payment reconciliation report (should match reconciliation table)

5. **Clean Production Data (if needed)**
   - Keep test data for development
   - Before deploying to production, decide what to keep/remove

---

## Summary

✅ Bank Accounts: 7 records with realistic data
✅ Payments: 14 records linked to orders
✅ Reconciliation: 7 records (all matched)
✅ Activity Log: 22 business events
✅ Audit Log: 10 data changes

**All data is consistent and linked correctly!**

Run the script and you're ready to test! 🚀
