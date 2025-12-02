-- Migration: Add recipient_phone column to orders table
-- Description: Adds the recipient_phone field to store customer mobile numbers for orders
-- Date: 2025-11-28
-- Status: Pending execution

-- Step 1: Add recipient_phone column to store customer mobile number
ALTER TABLE orders ADD COLUMN IF NOT EXISTS recipient_phone VARCHAR(20) NULL AFTER recipient_name COMMENT 'Customer mobile phone number for the order';

-- Step 2: Add index for searching orders by phone
ALTER TABLE orders ADD INDEX IF NOT EXISTS idx_recipient_phone (recipient_phone);

-- Verification query - run after migration to confirm column exists
-- SELECT order_id, order_number, recipient_name, recipient_phone FROM orders LIMIT 5;
