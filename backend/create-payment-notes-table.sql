-- Create payment_notes table for temporary payment records
CREATE TABLE `payment_notes` (
  `payment_note_id` int(11) NOT NULL AUTO_INCREMENT,
  `shop_id` int(11) NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `payment_method` ENUM('Cash', 'Bank Transfer', 'Bank Deposit') NOT NULL DEFAULT 'Cash',
  `bank_name` varchar(100) DEFAULT NULL,
  `bank_branch_name` varchar(100) DEFAULT NULL,
  `payment_date` date NOT NULL,
  `payment_time` time NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`payment_note_id`),
  KEY `idx_shop_id` (`shop_id`),
  KEY `idx_payment_date` (`payment_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
