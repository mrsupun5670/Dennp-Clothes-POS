-- Migration: Add cost price and print cost fields to products table
-- Description: Adds missing product_cost and print_cost fields that are required by the frontend ProductsPage
-- Date: 2025-11-19
-- Status: Pending execution

-- Step 1: Add product_cost column to products table
ALTER TABLE products ADD COLUMN product_cost DOUBLE DEFAULT 0 AFTER retail_price;

-- Step 2: Add print_cost column to products table
ALTER TABLE products ADD COLUMN print_cost DOUBLE DEFAULT 0 AFTER product_cost;

-- Step 3: Add indexes for faster queries on cost fields
ALTER TABLE products ADD INDEX idx_product_cost (product_cost);
ALTER TABLE products ADD INDEX idx_print_cost (print_cost);

-- Verification query - run after migration to confirm fields exist
-- SELECT product_id, product_name, product_cost, print_cost, retail_price, wholesale_price FROM products LIMIT 1;
