-- Add payment_method and bank_branch_name columns to payment_notes table

ALTER TABLE `payment_notes`
ADD COLUMN `payment_method` ENUM('Cash', 'Bank Transfer', 'Bank Deposit') NOT NULL DEFAULT 'Cash' AFTER `amount`,
ADD COLUMN `bank_branch_name` VARCHAR(100) DEFAULT NULL AFTER `bank_name`;
