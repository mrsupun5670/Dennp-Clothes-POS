-- ============================================================================
-- SAMPLE DATA POPULATION SCRIPT
-- ============================================================================
-- This script populates empty tables with realistic test data
-- Data is matched to existing orders, customers, and products
-- ============================================================================

-- ============================================================================
-- 1. BANK ACCOUNTS - Add realistic bank details for each shop
-- ================================================================= ===========
INSERT INTO `bank_accounts`
(`bank_account_id`, `shop_id`, `bank_name`, `branch_name`, `account_number`, `account_holder_name`, `account_type`, `ifsc_code`, `initial_balance`, `current_balance`, `status`, `created_at`, `updated_at`)
VALUES
-- Shop 1: Colombo Flagship
(1, 1, 'Commercial Bank of Ceylon', 'Colombo Main', 'ACC-1001-2024', 'Aisha Khan', 'business', 'CBCE0000001', 150000.00, 142500.00, 'active', '2025-11-24 04:26:21', '2025-11-24 04:28:18'),
(2, 1, 'Hatton National Bank', 'Colombo Fort', 'HNB-1002-2024', 'Aisha Khan', 'business', 'HATF0000001', 100000.00, 98750.00, 'active', '2025-11-24 04:26:21', '2025-11-24 04:28:18'),

-- Shop 2: Kandy Boutique
(3, 2, 'Commercial Bank of Ceylon', 'Kandy Central', 'ACC-2001-2024', 'Nimal Perera', 'business', 'CBCE0000002', 80000.00, 77350.00, 'active', '2025-11-24 04:26:21', '2025-11-24 04:28:18'),
(4, 2, 'DFCC Bank', 'Kandy Branch', 'DFCC-2002-2024', 'Nimal Perera', 'savings', 'DFCC0000002', 50000.00, 49500.00, 'active', '2025-11-24 04:26:21', '2025-11-24 04:28:18'),

-- Shop 3: Galle Outpost
(5, 3, 'Peoples Bank', 'Galle Fort', 'PB-3001-2024', 'Kamala Silva', 'business', 'PBKK0000001', 60000.00, 59350.00, 'active', '2025-11-24 04:26:21', '2025-11-24 04:28:18'),

-- Shop 4: Jaffna Store
(6, 4, 'Commercial Bank of Ceylon', 'Jaffna Main', 'ACC-4001-2024', 'Ravi Shankar', 'business', 'CBCE0000003', 75000.00, 74000.00, 'active', '2025-11-24 04:26:21', '2025-11-24 04:28:18'),

-- Shop 5: Warehouse Outlet
(7, 5, 'Hatton National Bank', 'Biyagama', 'HNB-5001-2024', 'Sunil Fernando', 'business', 'HATF0000002', 120000.00, 118500.00, 'active', '2025-11-24 04:26:21', '2025-11-24 04:28:18');

-- ============================================================================
-- 2. PAYMENTS - Add payments related to existing orders
-- ============================================================================
INSERT INTO `payments`
(`payment_id`, `shop_id`, `order_id`, `customer_id`, `payment_amount`, `payment_date`, `payment_time`, `payment_method`, `bank_name`, `branch_name`, `bank_account_id`, `transaction_id`, `payment_status`, `notes`, `created_by`, `created_at`, `updated_at`)
VALUES
-- Order 16 (ORD-2025-001): 7250 total, 3000 advance already paid
(1, 1, 16, 1000, 3000.00, '2025-11-15', '10:30:00', 'cash', NULL, NULL, NULL, NULL, 'completed', 'Advance payment received', 103, '2025-11-15 10:30:00', '2025-11-15 10:30:00'),
(2, 1, 16, 1000, 4250.00, '2025-11-24', '14:15:00', 'online_transfer', 'Commercial Bank of Ceylon', 'Colombo Main', 1, 'TXN-20251124-001', 'completed', 'Final payment via online transfer', 103, '2025-11-24 14:15:00', '2025-11-24 14:15:00'),

-- Order 17 (ORD-2025-002): 4100 total, 1000 advance already paid
(3, 1, 17, 1004, 1000.00, '2025-11-18', '11:00:00', 'cash', NULL, NULL, NULL, NULL, 'completed', 'Advance payment at order', 103, '2025-11-18 11:00:00', '2025-11-18 11:00:00'),
(4, 1, 17, 1004, 3100.00, '2025-11-22', '15:45:00', 'bank_deposit', 'Hatton National Bank', 'Colombo Fort', 2, 'DEP-20251122-001', 'completed', 'Balance paid via cheque deposit', 103, '2025-11-22 15:45:00', '2025-11-22 15:45:00'),

-- Order 18 (ORD-2025-003): 9350 total, unpaid
(5, 2, 18, 1001, 5000.00, '2025-11-21', '09:00:00', 'online_transfer', 'Commercial Bank of Ceylon', 'Kandy Central', 3, 'TXN-20251121-001', 'completed', 'Partial payment received', 102, '2025-11-21 09:00:00', '2025-11-21 09:00:00'),

-- Order 19 (ORD-2025-004): 3350 total, unpaid - COD
(6, 1, 19, 1002, 3350.00, '2025-11-24', '16:20:00', 'cash', NULL, NULL, NULL, NULL, 'pending', 'Awaiting delivery', 103, '2025-11-24 16:20:00', '2025-11-24 16:20:00'),

-- Order 20 (ORD-2025-005): 9050 total, 8700 advance paid
(7, 1, 20, 1003, 8700.00, '2025-11-19', '13:30:00', 'cash', NULL, NULL, NULL, NULL, 'completed', 'Bulk order advance', 101, '2025-11-19 13:30:00', '2025-11-19 13:30:00'),
(8, 1, 20, 1003, 350.00, '2025-11-24', '10:00:00', 'cash', NULL, NULL, NULL, NULL, 'completed', 'Remaining balance', 101, '2025-11-24 10:00:00', '2025-11-24 10:00:00'),

-- Order 21 (ORD-2025-006): 2100 total, 1800 advance paid
(9, 1, 21, 1000, 1800.00, '2025-11-22', '14:00:00', 'cash', NULL, NULL, NULL, NULL, 'completed', 'Advance for gift order', 103, '2025-11-22 14:00:00', '2025-11-22 14:00:00'),
(10, 1, 21, 1000, 300.00, '2025-11-24', '11:30:00', 'cash', NULL, NULL, NULL, NULL, 'completed', 'Balance payment', 103, '2025-11-24 11:30:00', '2025-11-24 11:30:00'),

-- Order 22 (ORD-2025-007): 1500 total, 500 advance paid
(11, 2, 22, 1001, 500.00, '2025-11-17', '10:15:00', 'cash', NULL, NULL, NULL, NULL, 'completed', 'Advance for accessories', 102, '2025-11-17 10:15:00', '2025-11-17 10:15:00'),
(12, 2, 22, 1001, 1000.00, '2025-11-24', '12:00:00', 'online_transfer', 'DFCC Bank', 'Kandy Branch', 4, 'TXN-20251124-002', 'completed', 'Final payment', 102, '2025-11-24 12:00:00', '2025-11-24 12:00:00'),

-- Additional payments (standalone, not linked to specific orders)
(13, 1, NULL, 1000, 5000.00, '2025-11-20', '09:30:00', 'cash', NULL, NULL, NULL, NULL, 'completed', 'General deposit from Sunethra Dias', 101, '2025-11-20 09:30:00', '2025-11-20 09:30:00'),
(14, 3, NULL, 1003, 2000.00, '2025-11-23', '14:45:00', 'bank_deposit', 'Peoples Bank', 'Galle Fort', 5, 'DEP-20251123-001', 'completed', 'Deposit from walk-in customer', 104, '2025-11-23 14:45:00', '2025-11-23 14:45:00');

-- ============================================================================
-- 3. PAYMENT RECONCILIATION - Add bank reconciliation records
-- ============================================================================
INSERT INTO `payment_reconciliation`
(`reconciliation_id`, `shop_id`, `bank_account_id`, `bank_statement_date`, `bank_balance`, `system_balance`, `variance`, `reconciliation_status`, `notes`, `reconciled_by`, `reconciled_at`, `created_at`, `updated_at`)
VALUES
-- Shop 1: Colombo Flagship - Account 1
(1, 1, 1, '2025-11-24', 142500.00, 142500.00, 0.00, 'reconciled', 'All transactions matched perfectly', 103, '2025-11-24 17:00:00', '2025-11-24 04:26:21', '2025-11-24 17:00:00'),

-- Shop 1: Colombo Flagship - Account 2
(2, 1, 2, '2025-11-24', 98750.00, 98750.00, 0.00, 'reconciled', 'Bank balance verified', 103, '2025-11-24 17:00:00', '2025-11-24 04:26:21', '2025-11-24 17:00:00'),

-- Shop 2: Kandy Boutique - Account 3
(3, 2, 3, '2025-11-24', 77350.00, 77350.00, 0.00, 'reconciled', 'Kandy branch reconciliation complete', 102, '2025-11-24 16:30:00', '2025-11-24 04:26:21', '2025-11-24 16:30:00'),

-- Shop 2: Kandy Boutique - Account 4
(4, 2, 4, '2025-11-24', 49500.00, 49500.00, 0.00, 'reconciled', 'Savings account verified', 102, '2025-11-24 16:30:00', '2025-11-24 04:26:21', '2025-11-24 16:30:00'),

-- Shop 3: Galle Outpost - Account 5
(5, 3, 5, '2025-11-24', 59350.00, 59350.00, 0.00, 'reconciled', 'Galle branch reconciliation done', 104, '2025-11-24 16:00:00', '2025-11-24 04:26:21', '2025-11-24 16:00:00'),

-- Shop 4: Jaffna Store - Account 6
(6, 4, 6, '2025-11-24', 74000.00, 74000.00, 0.00, 'pending', 'Awaiting bank statement', 104, NULL, '2025-11-24 04:26:21', '2025-11-24 04:26:21'),

-- Shop 5: Warehouse Outlet - Account 7
(7, 5, 7, '2025-11-24', 118500.00, 118500.00, 0.00, 'reconciled', 'Warehouse outlet reconciliation complete', 105, '2025-11-24 15:30:00', '2025-11-24 04:26:21', '2025-11-24 15:30:00');

-- ============================================================================
-- 4. ACTIVITY LOG - Add business events
-- ============================================================================
INSERT INTO `activity_log`
(`activity_id`, `shop_id`, `user_id`, `activity_type`, `entity_type`, `entity_id`, `description`, `metadata`, `created_at`)
VALUES
-- Order activities
(1, 1, 103, 'order_created', 'order', 16, 'Order ORD-2025-001 created for Sunethra Dias', '{"customer_id": 1000, "total_amount": 6900.00, "delivery_charge": 350.00}', '2025-11-15 10:00:00'),
(2, 1, 103, 'payment_recorded', 'payment', 1, 'Advance payment of Rs. 3000.00 received (cash)', '{"payment_method": "cash", "order_id": 16}', '2025-11-15 10:30:00'),
(3, 1, 103, 'payment_recorded', 'payment', 2, 'Final payment of Rs. 4250.00 received (online transfer)', '{"payment_method": "online_transfer", "bank_name": "Commercial Bank of Ceylon"}', '2025-11-24 14:15:00'),

(4, 1, 103, 'order_created', 'order', 17, 'Order ORD-2025-002 created for John Silva', '{"customer_id": 1004, "total_amount": 3700.00, "delivery_charge": 400.00}', '2025-11-18 10:30:00'),
(5, 1, 103, 'payment_recorded', 'payment', 3, 'Advance payment of Rs. 1000.00 received (cash)', '{"payment_method": "cash", "order_id": 17}', '2025-11-18 11:00:00'),
(6, 1, 103, 'order_updated', 'order', 17, 'Order status changed to shipped', '{"status": "shipped", "tracking_number": "fdvbwgr32"}', '2025-11-20 09:00:00'),

(7, 2, 102, 'order_created', 'order', 18, 'Order ORD-2025-003 created for Mahesh Gamage', '{"customer_id": 1001, "total_amount": 9000.00, "delivery_charge": 350.00}', '2025-11-20 11:00:00'),
(8, 2, 102, 'payment_recorded', 'payment', 5, 'Partial payment of Rs. 5000.00 received (online transfer)', '{"payment_method": "online_transfer", "bank_name": "Commercial Bank of Ceylon"}', '2025-11-21 09:00:00'),

(9, 1, 103, 'order_created', 'order', 19, 'Order ORD-2025-004 created for Priya Seneviratne (COD)', '{"customer_id": 1002, "total_amount": 3000.00, "delivery_charge": 350.00}', '2025-11-21 14:00:00'),
(10, 1, 101, 'order_created', 'order', 20, 'Order ORD-2025-005 created for Walk-in Customer (bulk)', '{"customer_id": 1003, "total_amount": 8700.00, "delivery_charge": 350.00}', '2025-11-19 13:00:00'),
(11, 1, 101, 'order_updated', 'order', 20, 'Order status changed to delivered', '{"status": "delivered", "tracking_number": "besrg"}', '2025-11-22 10:00:00'),

(12, 1, 103, 'order_created', 'order', 21, 'Order ORD-2025-006 created for Sunethra Dias (gift order)', '{"customer_id": 1000, "total_amount": 1800.00, "delivery_charge": 300.00}', '2025-11-22 13:30:00'),
(13, 2, 102, 'order_created', 'order', 22, 'Order ORD-2025-007 created for Mahesh Gamage (accessories)', '{"customer_id": 1001, "total_amount": 1000.00, "delivery_charge": 500.00}', '2025-11-17 10:00:00'),
(14, 2, 102, 'order_updated', 'order', 22, 'Order status changed to delivered', '{"status": "delivered", "tracking_number": "rwegrgh34"}', '2025-11-22 14:00:00'),

-- Product and inventory activities
(15, 1, 101, 'product_sold', 'order_item', 31, 'Sold 2x Premium Cotton Crew Tee (Black, Size M) for ORD-2025-001', '{"product_id": 1001, "quantity": 2, "price": 2500.00}', '2025-11-15 10:00:00'),
(16, 1, 101, 'product_sold', 'order_item', 32, 'Sold 1x Kids Elastic Trousers (Red, Size 3T) for ORD-2025-001', '{"product_id": 1003, "quantity": 1, "price": 1800.00}', '2025-11-15 10:00:00'),
(17, 1, 103, 'inventory_adjusted', 'product', 1001, 'Stock adjusted for order ORD-2025-001', '{"product_id": 1001, "quantity_before": 50, "quantity_after": 48}', '2025-11-15 10:00:00'),

(18, 2, 102, 'inventory_adjusted', 'product', 1004, 'Stock adjusted for order ORD-2025-003', '{"product_id": 1004, "quantity_before": 15, "quantity_after": 14}', '2025-11-20 11:00:00'),

-- Login/Logout activities
(19, 1, 103, 'login', 'user', 103, 'Cashier Chathuri logged in', '{"ip": "192.168.1.100", "user_agent": "Mozilla/5.0..."}', '2025-11-24 08:00:00'),
(20, 1, 101, 'login', 'user', 101, 'Admin Khan logged in', '{"ip": "192.168.1.101", "user_agent": "Mozilla/5.0..."}', '2025-11-24 08:15:00'),

-- Report generation
(21, 1, 101, 'report_generated', 'report', 1, 'Daily sales report generated', '{"date": "2025-11-24", "total_orders": 5, "total_sales": 22150.00}', '2025-11-24 17:30:00'),
(22, 2, 102, 'report_generated', 'report', 2, 'Daily sales report generated', '{"date": "2025-11-24", "total_orders": 2, "total_sales": 10350.00}', '2025-11-24 17:30:00');

-- ============================================================================
-- 5. AUDIT LOG - Add data change tracking
-- ============================================================================
INSERT INTO `audit_log`
(`audit_id`, `shop_id`, `user_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `ip_address`, `user_agent`, `changes_description`, `created_at`)
VALUES
-- Payment inserts
(1, 1, 103, 'payments', 1, 'INSERT', NULL, '{"payment_id": 1, "order_id": 16, "payment_amount": 3000.00, "payment_method": "cash"}', '192.168.1.100', 'Mozilla/5.0', 'Payment record created', '2025-11-15 10:30:00'),
(2, 1, 103, 'payments', 2, 'INSERT', NULL, '{"payment_id": 2, "order_id": 16, "payment_amount": 4250.00, "payment_method": "online_transfer"}', '192.168.1.100', 'Mozilla/5.0', 'Payment record created', '2025-11-24 14:15:00'),

-- Order status updates
(3, 1, 103, 'orders', 17, 'UPDATE', '{"order_status": "pending"}', '{"order_status": "shipped", "tracking_number": "fdvbwgr32"}', '192.168.1.100', 'Mozilla/5.0', 'Order marked as shipped', '2025-11-20 09:00:00'),
(4, 1, 101, 'orders', 20, 'UPDATE', '{"order_status": "pending"}', '{"order_status": "delivered"}', '192.168.1.101', 'Mozilla/5.0', 'Order marked as delivered', '2025-11-22 10:00:00'),
(5, 2, 102, 'orders', 22, 'UPDATE', '{"order_status": "pending"}', '{"order_status": "delivered"}', '192.168.1.102', 'Mozilla/5.0', 'Order marked as delivered', '2025-11-22 14:00:00'),

-- Bank account creation
(6, 1, 103, 'bank_accounts', 1, 'INSERT', NULL, '{"bank_account_id": 1, "bank_name": "Commercial Bank", "account_number": "ACC-1001-2024"}', '192.168.1.100', 'Mozilla/5.0', 'Bank account added', '2025-11-24 04:26:21'),
(7, 1, 103, 'bank_accounts', 2, 'INSERT', NULL, '{"bank_account_id": 2, "bank_name": "Hatton National Bank", "account_number": "HNB-1002-2024"}', '192.168.1.100', 'Mozilla/5.0', 'Bank account added', '2025-11-24 04:26:21'),
(8, 2, 102, 'bank_accounts', 3, 'INSERT', NULL, '{"bank_account_id": 3, "bank_name": "Commercial Bank", "account_number": "ACC-2001-2024"}', '192.168.1.102', 'Mozilla/5.0', 'Bank account added', '2025-11-24 04:26:21'),

-- Payment status updates
(9, 1, 103, 'payments', 6, 'INSERT', NULL, '{"payment_id": 6, "order_id": 19, "payment_status": "pending"}', '192.168.1.100', 'Mozilla/5.0', 'COD payment created (pending)', '2025-11-24 16:20:00'),

-- Reconciliation records
(10, 1, 103, 'payment_reconciliation', 1, 'INSERT', NULL, '{"reconciliation_id": 1, "bank_account_id": 1, "reconciliation_status": "reconciled"}', '192.168.1.100', 'Mozilla/5.0', 'Bank reconciliation completed', '2025-11-24 17:00:00');

-- ============================================================================
-- SUMMARY OF INSERTED DATA
-- ============================================================================
-- Bank Accounts: 7 records (2 per shop for main shops, 1 for others)
-- Payments: 14 records (12 order-related, 2 standalone)
-- Payment Reconciliation: 7 records (one per bank account)
-- Activity Log: 22 records (order events, payments, login/logout, reports)
-- Audit Log: 10 records (data changes tracking)
--
-- Total: 60 records added to empty tables
-- All data is linked and consistent with existing orders and customers
-- ============================================================================
