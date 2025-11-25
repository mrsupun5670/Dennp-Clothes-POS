-- Load Bank Accounts for all shops
DELETE FROM bank_accounts WHERE shop_id IN (1, 2, 3, 4, 5);

INSERT INTO `bank_accounts`
(`bank_account_id`, `shop_id`, `bank_name`, `account_number`, `account_holder_name`, `account_type`, `branch_code`, `ifsc_code`, `initial_balance`, `current_balance`, `status`, `created_at`, `updated_at`)
VALUES
-- Shop 1: Colombo Flagship
(1, 1, 'Commercial Bank of Ceylon', 'ACC-1001-2024', 'Aisha Khan', 'business', 'COLOMBO-MAIN', 'CBCE0000001', 150000.00, 142500.00, 'active', '2025-11-24 04:26:21', '2025-11-24 04:28:18'),
(2, 1, 'Hatton National Bank', 'HNB-1002-2024', 'Aisha Khan', 'business', 'COLOMBO-FORT', 'HATF0000001', 100000.00, 98750.00, 'active', '2025-11-24 04:26:21', '2025-11-24 04:28:18'),

-- Shop 2: Kandy Boutique
(3, 2, 'Commercial Bank of Ceylon', 'ACC-2001-2024', 'Nimal Perera', 'business', 'KANDY-CENTRAL', 'CBCE0000002', 80000.00, 77350.00, 'active', '2025-11-24 04:26:21', '2025-11-24 04:28:18'),
(4, 2, 'DFCC Bank', 'DFCC-2002-2024', 'Nimal Perera', 'savings', 'KANDY-BRANCH', 'DFCC0000002', 50000.00, 49500.00, 'active', '2025-11-24 04:26:21', '2025-11-24 04:28:18'),

-- Shop 3: Galle Outpost
(5, 3, 'Peoples Bank', 'PB-3001-2024', 'Kamala Silva', 'business', 'GALLE-FORT', 'PBKK0000001', 60000.00, 59350.00, 'active', '2025-11-24 04:26:21', '2025-11-24 04:28:18'),

-- Shop 4: Jaffna Store
(6, 4, 'Commercial Bank of Ceylon', 'ACC-4001-2024', 'Ravi Shankar', 'business', 'JAFFNA-MAIN', 'CBCE0000003', 75000.00, 74000.00, 'active', '2025-11-24 04:26:21', '2025-11-24 04:28:18'),

-- Shop 5: Warehouse Outlet
(7, 5, 'Hatton National Bank', 'HNB-5001-2024', 'Sunil Fernando', 'business', 'BIYAGAMA', 'HATF0000002', 120000.00, 118500.00, 'active', '2025-11-24 04:26:21', '2025-11-24 04:28:18');
