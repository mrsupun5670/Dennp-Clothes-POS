-- Add payment_method column to orders table if it doesn't exist
ALTER TABLE orders ADD COLUMN payment_method enum('cash','card','online','check','bank','other') DEFAULT 'cash' AFTER payment_status;
