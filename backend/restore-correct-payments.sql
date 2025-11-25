-- Delete ALL payments first to start fresh
DELETE FROM payments WHERE shop_id = 1;

-- Restore the correct original payments (1-14)
INSERT INTO `payments`
(`payment_id`, `shop_id`, `order_id`, `customer_id`, `payment_amount`, `payment_date`, `payment_time`, `payment_method`, `bank_account_id`, `transaction_id`, `payment_status`, `notes`, `created_by`, `created_at`, `updated_at`)
VALUES
(1, 1, 16, 1000, 3000.00, '2025-11-15', '10:30:00', 'cash', NULL, NULL, 'completed', 'Advance payment received', 103, '2025-11-15 10:30:00', '2025-11-15 10:30:00'),
(2, 1, 16, 1000, 4250.00, '2025-11-24', '14:15:00', 'online_transfer', NULL, 'TXN-20251124-001', 'completed', 'Final payment via online transfer', 103, '2025-11-24 14:15:00', '2025-11-24 14:15:00'),
(3, 1, 17, 1004, 1000.00, '2025-11-18', '11:00:00', 'cash', NULL, NULL, 'completed', 'Advance payment at order', 103, '2025-11-18 11:00:00', '2025-11-18 11:00:00'),
(4, 1, 17, 1004, 3100.00, '2025-11-22', '15:45:00', 'bank_deposit', NULL, 'DEP-20251122-001', 'completed', 'Balance paid via cheque deposit', 103, '2025-11-22 15:45:00', '2025-11-22 15:45:00'),
(5, 1, 18, 1001, 5000.00, '2025-11-21', '09:00:00', 'online_transfer', NULL, 'TXN-20251121-001', 'completed', 'Partial payment received', 102, '2025-11-21 09:00:00', '2025-11-21 09:00:00'),
(6, 1, 19, 1002, 3350.00, '2025-11-24', '16:20:00', 'cash', NULL, NULL, 'pending', 'Awaiting delivery', 103, '2025-11-24 16:20:00', '2025-11-24 16:20:00'),
(7, 1, 20, 1003, 8700.00, '2025-11-19', '13:30:00', 'cash', NULL, NULL, 'completed', 'Bulk order advance', 101, '2025-11-19 13:30:00', '2025-11-19 13:30:00'),
(8, 1, 20, 1003, 350.00, '2025-11-24', '10:00:00', 'cash', NULL, NULL, 'completed', 'Remaining balance', 101, '2025-11-24 10:00:00', '2025-11-24 10:00:00'),
(9, 1, 21, 1000, 1800.00, '2025-11-22', '14:00:00', 'cash', NULL, NULL, 'completed', 'Advance for gift order', 103, '2025-11-22 14:00:00', '2025-11-22 14:00:00'),
(10, 1, 21, 1000, 300.00, '2025-11-24', '11:30:00', 'cash', NULL, NULL, 'completed', 'Balance payment', 103, '2025-11-24 11:30:00', '2025-11-24 11:30:00'),
(11, 1, 22, 1001, 500.00, '2025-11-17', '10:15:00', 'cash', NULL, NULL, 'completed', 'Advance for accessories', 102, '2025-11-17 10:15:00', '2025-11-24 06:40:54'),
(12, 1, 22, 1001, 1000.00, '2025-11-24', '12:00:00', 'online_transfer', NULL, 'TXN-20251124-002', 'completed', 'Final payment', 102, '2025-11-24 12:00:00', '2025-11-24 06:41:02'),
(13, 1, NULL, 1000, 5000.00, '2025-11-20', '09:30:00', 'cash', NULL, NULL, 'completed', 'General deposit from Sunethra Dias', 101, '2025-11-20 09:30:00', '2025-11-20 09:30:00'),
(14, 1, NULL, 1003, 2000.00, '2025-11-23', '14:45:00', 'bank_deposit', NULL, 'DEP-20251123-001', 'completed', 'Deposit from walk-in customer', 104, '2025-11-23 14:45:00', '2025-11-24 06:41:11');
