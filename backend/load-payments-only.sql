-- ============================================================================
-- PAYMENTS - Add more payment records
-- ============================================================================
INSERT INTO `payments`
(`payment_id`, `shop_id`, `order_id`, `customer_id`, `payment_amount`, `payment_date`, `payment_time`, `payment_method`, `bank_account_id`, `transaction_id`, `payment_status`, `notes`, `created_by`, `created_at`, `updated_at`)
VALUES
-- Additional payments for Shop 1
(11, 1, NULL, 1000, 2500.00, '2025-11-23', '09:15:00', 'cash', NULL, NULL, 'completed', 'Direct payment', 101, '2025-11-23 09:15:00', '2025-11-23 09:15:00'),
(12, 1, NULL, 1004, 4000.00, '2025-11-23', '14:20:00', 'cash', NULL, 'TXN-20251123-001', 'completed', 'Cash payment received', 103, '2025-11-23 14:20:00', '2025-11-23 14:20:00'),
(13, 1, 19, 1002, 1500.00, '2025-11-24', '10:45:00', 'cash', NULL, NULL, 'completed', 'Partial payment for order 19', 103, '2025-11-24 10:45:00', '2025-11-24 10:45:00'),
(14, 1, 19, 1002, 1850.00, '2025-11-24', '15:30:00', 'cash', NULL, 'TXN-20251124-002', 'completed', 'Final payment for order 19', 103, '2025-11-24 15:30:00', '2025-11-24 15:30:00'),

-- Shop 2 additional payments
(15, 2, NULL, 1001, 5000.00, '2025-11-24', '11:00:00', 'cash', NULL, NULL, 'completed', 'Cash received', 102, '2025-11-24 11:00:00', '2025-11-24 11:00:00'),
(16, 2, 18, 1001, 4350.00, '2025-11-24', '12:30:00', 'cash', NULL, NULL, 'completed', 'Final balance for order 18', 102, '2025-11-24 12:30:00', '2025-11-24 12:30:00'),

-- Shop 1 more payments
(17, 1, 16, 1000, 2800.00, '2025-11-24', '13:15:00', 'cash', NULL, 'TXN-20251124-003', 'completed', 'Additional payment for order 16', 103, '2025-11-24 13:15:00', '2025-11-24 13:15:00'),
(18, 1, 20, 1003, 6500.00, '2025-11-24', '16:00:00', 'cash', NULL, NULL, 'completed', 'Bulk order payment', 101, '2025-11-24 16:00:00', '2025-11-24 16:00:00'),
(19, 1, 21, 1000, 2100.00, '2025-11-24', '17:00:00', 'cash', NULL, NULL, 'completed', 'Full payment for order 21', 103, '2025-11-24 17:00:00', '2025-11-24 17:00:00'),

-- Shop 2 more payments
(20, 2, 22, 1001, 1500.00, '2025-11-24', '14:00:00', 'cash', NULL, NULL, 'completed', 'Full payment for order 22', 102, '2025-11-24 14:00:00', '2025-11-24 14:00:00');
