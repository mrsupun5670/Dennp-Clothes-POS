-- ============================================================================
-- OPTIMIZED MULTI-SHOP POS DATABASE SCHEMA
-- ============================================================================
-- Database: u331468302_dennup_pos
-- Purpose: Complete Point of Sale system with multi-shop support
-- Features: Bank payments, Order tracking, Inventory management, Audit logs
-- ============================================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- ============================================================================
-- 1. SHOPS TABLE - Multi-shop support
-- ============================================================================
CREATE TABLE IF NOT EXISTS `shops` (
  `shop_id` int(11) NOT NULL AUTO_INCREMENT,
  `shop_name` varchar(100) NOT NULL,
  `shop_phone` varchar(20) NOT NULL,
  `shop_address` varchar(255),
  `manager_name` varchar(100),
  `shop_status` enum('active','inactive','closed') NOT NULL DEFAULT 'active',
  `opening_date` date,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`shop_id`),
  UNIQUE KEY `shop_name` (`shop_name`),
  KEY `idx_status` (`shop_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `shops` (`shop_id`, `shop_name`, `shop_phone`, `shop_address`, `manager_name`, `shop_status`, `opening_date`) VALUES
(1, 'Colombo Flagship', '0112345678', '123 Galle Rd, Colombo 03', 'Aisha Khan', 'active', '2023-01-15'),
(2, 'Kandy Boutique', '0819876543', '45 Temple St, Kandy', 'Nimal Perera', 'active', '2023-05-20'),
(3, 'Galle Outpost', '0915551234', '78 Lighthouse St, Galle', 'Kamala Silva', 'inactive', '2023-11-01'),
(4, 'Jaffna Store', '0217778899', '20 Main Rd, Jaffna', 'Ravi Shankar', 'active', '2024-03-10'),
(5, 'Warehouse Outlet', '0334445566', '99 Industrial Zone, Biyagama', 'Sunil Fernando', 'active', '2024-06-01');

-- ============================================================================
-- 2. USERS TABLE - Staff management
-- ============================================================================
CREATE TABLE IF NOT EXISTS `users` (
  `user_id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(100) NOT NULL UNIQUE,
  `password_hash` varchar(255) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `phone` varchar(20),
  `shop_id` int(11) NOT NULL,
  `user_role` enum('admin','manager','cashier','staff') NOT NULL DEFAULT 'staff',
  `joining_date` date,
  `user_status` enum('active','inactive','suspended') NOT NULL DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `username` (`username`),
  KEY `idx_shop_id` (`shop_id`),
  KEY `idx_user_role` (`user_role`),
  KEY `idx_user_status` (`user_status`),
  FOREIGN KEY (`shop_id`) REFERENCES `shops` (`shop_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `users` (`user_id`, `username`, `password_hash`, `first_name`, `last_name`, `phone`, `shop_id`, `user_role`, `joining_date`, `user_status`) VALUES
(101, 'admin_ak', '$2y$10$hash1', 'Admin', 'Khan', '0771112223', 1, 'admin', '2023-01-10', 'active'),
(102, 'nimal_mngr', '$2y$10$hash2', 'Nimal', 'Perera', '0763334445', 2, 'manager', '2023-05-15', 'active'),
(103, 'cashier_c', '$2y$10$hash3', 'Chathuri', 'Jay', '0715556667', 1, 'cashier', '2024-01-20', 'active'),
(104, 'staff_r', '$2y$10$hash4', 'Ramesh', 'Wick', '0778889990', 4, 'staff', '2024-04-01', 'active'),
(105, 'sri_mngr', '$2y$10$hash5', 'Sriyan', 'Abe', '0750001112', 5, 'manager', '2024-06-01', 'active');

-- ============================================================================
-- 3. SIZE TYPES TABLE - Clothing size types
-- ============================================================================
CREATE TABLE IF NOT EXISTS `size_types` (
  `size_type_id` int(11) NOT NULL AUTO_INCREMENT,
  `size_type_name` varchar(50) NOT NULL UNIQUE,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`size_type_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `size_types` (`size_type_id`, `size_type_name`) VALUES
(1, 'Alphabetic'),
(2, 'Numeric'),
(3, 'Kids');

-- ============================================================================
-- 4. SIZES TABLE - Available sizes per shop
-- ============================================================================
CREATE TABLE IF NOT EXISTS `sizes` (
  `size_id` int(11) NOT NULL AUTO_INCREMENT,
  `shop_id` int(11) NOT NULL,
  `size_name` varchar(20) NOT NULL,
  `size_type_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`size_id`),
  UNIQUE KEY `unique_size_per_shop` (`shop_id`, `size_name`, `size_type_id`),
  KEY `idx_shop_id` (`shop_id`),
  KEY `idx_size_type_id` (`size_type_id`),
  FOREIGN KEY (`shop_id`) REFERENCES `shops` (`shop_id`) ON DELETE CASCADE,
  FOREIGN KEY (`size_type_id`) REFERENCES `size_types` (`size_type_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `sizes` (`size_id`, `shop_id`, `size_name`, `size_type_id`) VALUES
(1, 1, 'S', 1),
(2, 1, 'M', 1),
(3, 1, 'L', 1),
(4, 1, '30', 2),
(5, 1, '32', 2),
(6, 1, '3T', 3),
(7, 1, '8', 2),
(8, 1, 'N/A', 1);

-- ============================================================================
-- 5. COLORS TABLE - Available colors per shop
-- ============================================================================
CREATE TABLE IF NOT EXISTS `colors` (
  `color_id` int(11) NOT NULL AUTO_INCREMENT,
  `shop_id` int(11) NOT NULL,
  `color_name` varchar(50) NOT NULL,
  `hex_code` varchar(7),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`color_id`),
  UNIQUE KEY `unique_color_per_shop` (`shop_id`, `color_name`),
  KEY `idx_shop_id` (`shop_id`),
  FOREIGN KEY (`shop_id`) REFERENCES `shops` (`shop_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `colors` (`color_id`, `shop_id`, `color_name`, `hex_code`) VALUES
(1, 1, 'Black', '#000000'),
(2, 1, 'White', '#FFFFFF'),
(3, 1, 'Navy Blue', '#000080'),
(4, 1, 'Red', '#FF0000'),
(5, 1, 'Grey', '#808080'),
(6, 1, 'N/A', NULL);

-- ============================================================================
-- 6. CATEGORIES TABLE - Product categories per shop
-- ============================================================================
CREATE TABLE IF NOT EXISTS `categories` (
  `category_id` int(11) NOT NULL AUTO_INCREMENT,
  `shop_id` int(11) NOT NULL,
  `category_name` varchar(100) NOT NULL,
  `size_type_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`category_id`),
  UNIQUE KEY `unique_category_per_shop` (`shop_id`, `category_name`),
  KEY `idx_shop_id` (`shop_id`),
  KEY `idx_size_type_id` (`size_type_id`),
  FOREIGN KEY (`shop_id`) REFERENCES `shops` (`shop_id`) ON DELETE CASCADE,
  FOREIGN KEY (`size_type_id`) REFERENCES `size_types` (`size_type_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `categories` (`category_id`, `shop_id`, `category_name`, `size_type_id`) VALUES
(1, 1, 'Men_T-Shirts', 1),
(2, 1, 'Women_Jeans', 2),
(3, 1, 'Kids_Trousers', 3),
(4, 1, 'Footwear', 2),
(5, 1, 'Accessories', 1);

-- ============================================================================
-- 7. PRODUCTS TABLE - Product master data
-- ============================================================================
CREATE TABLE IF NOT EXISTS `products` (
  `product_id` int(11) NOT NULL AUTO_INCREMENT,
  `shop_id` int(11) NOT NULL,
  `sku` varchar(50) NOT NULL,
  `product_name` varchar(150) NOT NULL,
  `category_id` int(11) NOT NULL,
  `description` text,
  `retail_price` decimal(12, 2) NOT NULL,
  `wholesale_price` decimal(12, 2),
  `product_cost` decimal(12, 2) NOT NULL DEFAULT 0,
  `print_cost` decimal(12, 2) NOT NULL DEFAULT 0,
  `product_status` enum('active','inactive','discontinued') NOT NULL DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`product_id`),
  UNIQUE KEY `unique_sku_per_shop` (`shop_id`, `sku`),
  KEY `idx_shop_id` (`shop_id`),
  KEY `idx_category_id` (`category_id`),
  KEY `idx_sku` (`sku`),
  KEY `idx_product_status` (`product_status`),
  FOREIGN KEY (`shop_id`) REFERENCES `shops` (`shop_id`) ON DELETE CASCADE,
  FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `products` (`product_id`, `shop_id`, `sku`, `product_name`, `category_id`, `description`, `retail_price`, `wholesale_price`, `product_cost`, `print_cost`, `product_status`) VALUES
(1001, 1, 'TSHIRT001', 'Premium Cotton Crew Tee', 1, '', 2500.00, 1500.00, 0.00, 30.00, 'active'),
(1002, 3, 'WJNS002', 'High-Waist Skinny Jean', 1, '', 6500.00, 4000.00, 500.00, 20.00, 'active'),
(1003, 1, 'KTR001', 'Kids Elastic Trousers', 1, '', 1800.00, 1000.00, 0.00, 33.00, 'active'),
(1004, 2, 'SHOE001', 'Leather Formal Shoes', 4, 'Classic lace-up shoes.', 9000.00, 5500.00, 0.00, 0.00, 'active'),
(1005, 1, 'ACC001', 'Sports Cap', 5, 'Adjustable sports cap.', 1200.00, 700.00, 0.00, 0.00, 'active'),
(1006, 1, 'Test-001', 'Test tshirt', 1, '', 1200.00, 1000.00, 0.00, 30.00, 'active'),
(1007, 2, 'Test-002', 'dgfss', 1, '', 500.00, 200.00, 0.00, 10.00, 'active');

-- ============================================================================
-- 8. PRODUCT_SIZES TABLE - Product-Size mapping
-- ============================================================================
CREATE TABLE IF NOT EXISTS `product_sizes` (
  `product_size_id` int(11) NOT NULL AUTO_INCREMENT,
  `product_id` int(11) NOT NULL,
  `size_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`product_size_id`),
  UNIQUE KEY `unique_product_size` (`product_id`, `size_id`),
  KEY `idx_product_id` (`product_id`),
  KEY `idx_size_id` (`size_id`),
  FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE,
  FOREIGN KEY (`size_id`) REFERENCES `sizes` (`size_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `product_sizes` (`product_size_id`, `product_id`, `size_id`) VALUES
(1, 1001, 1),
(2, 1001, 2),
(3, 1001, 3),
(4, 1002, 4),
(5, 1002, 5),
(6, 1003, 6),
(7, 1004, 7),
(8, 1005, 1),
(9, 1006, 1),
(10, 1006, 2),
(11, 1006, 8),
(12, 1007, 4),
(13, 1007, 5);

-- ============================================================================
-- 9. PRODUCT_COLORS TABLE - Product-Color mapping
-- ============================================================================
CREATE TABLE IF NOT EXISTS `product_colors` (
  `product_color_id` int(11) NOT NULL AUTO_INCREMENT,
  `product_id` int(11) NOT NULL,
  `color_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`product_color_id`),
  UNIQUE KEY `unique_product_color` (`product_id`, `color_id`),
  KEY `idx_product_id` (`product_id`),
  KEY `idx_color_id` (`color_id`),
  FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE,
  FOREIGN KEY (`color_id`) REFERENCES `colors` (`color_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `product_colors` (`product_color_id`, `product_id`, `color_id`) VALUES
(1, 1001, 1),
(2, 1001, 2),
(3, 1001, 3),
(4, 1002, 3),
(5, 1002, 5),
(6, 1003, 1),
(7, 1003, 4),
(8, 1004, 1),
(9, 1005, 3),
(10, 1006, 1),
(11, 1006, 4),
(12, 1006, 6),
(13, 1007, 1),
(14, 1007, 5);

-- ============================================================================
-- 10. SHOP_PRODUCT_STOCK TABLE - Product inventory by size/color per shop
-- ============================================================================
CREATE TABLE IF NOT EXISTS `shop_product_stock` (
  `stock_id` int(11) NOT NULL AUTO_INCREMENT,
  `shop_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `size_id` int(11) NOT NULL,
  `color_id` int(11) NOT NULL,
  `stock_qty` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`stock_id`),
  UNIQUE KEY `unique_shop_product_stock` (`shop_id`, `product_id`, `size_id`, `color_id`),
  KEY `idx_shop_id` (`shop_id`),
  KEY `idx_product_id` (`product_id`),
  KEY `idx_size_id` (`size_id`),
  KEY `idx_color_id` (`color_id`),
  FOREIGN KEY (`shop_id`) REFERENCES `shops` (`shop_id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE,
  FOREIGN KEY (`size_id`) REFERENCES `sizes` (`size_id`) ON DELETE CASCADE,
  FOREIGN KEY (`color_id`) REFERENCES `colors` (`color_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `shop_product_stock` (`stock_id`, `shop_id`, `product_id`, `size_id`, `color_id`, `stock_qty`) VALUES
(1, 1, 1001, 1, 1, 50),
(2, 1, 1001, 2, 2, 45),
(3, 1, 1002, 4, 3, 30),
(4, 1, 1003, 6, 4, 20),
(5, 1, 1004, 7, 1, 15),
(6, 2, 1001, 3, 3, 40),
(7, 2, 1002, 5, 5, 25),
(8, 1, 1001, 3, 1, 15),
(9, 1, 1007, 5, 5, 40),
(10, 1, 1007, 4, 1, 10),
(11, 1, 1007, 5, 1, 10),
(12, 1, 1007, 4, 5, 10),
(13, 1, 1006, 2, 1, 1),
(14, 1, 1003, 6, 1, 10),
(15, 1, 1002, 4, 5, 14),
(16, 1, 1002, 5, 5, 14);

-- ============================================================================
-- 11. SHOP_INVENTORY TABLE - General supplies/materials per shop
-- ============================================================================
CREATE TABLE IF NOT EXISTS `shop_inventory` (
  `inventory_id` int(11) NOT NULL AUTO_INCREMENT,
  `shop_id` int(11) NOT NULL,
  `item_name` varchar(255) NOT NULL,
  `quantity_in_stock` int(11) NOT NULL DEFAULT 0,
  `unit_cost` decimal(12, 2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`inventory_id`),
  UNIQUE KEY `unique_shop_item` (`shop_id`, `item_name`),
  KEY `idx_shop_id` (`shop_id`),
  KEY `idx_item_name` (`item_name`),
  FOREIGN KEY (`shop_id`) REFERENCES `shops` (`shop_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `shop_inventory` (`inventory_id`, `shop_id`, `item_name`, `quantity_in_stock`, `unit_cost`) VALUES
(1, 1, 'POS Thermal Paper Roll', 50, 150.00),
(2, 1, 'Shopping Bags (Large)', 200, 25.00),
(3, 2, 'POS Thermal Paper Roll', 30, 150.00),
(4, 4, 'Security Tags', 1000, 8.50),
(5, 5, 'Moving Boxes', 50, 250.00);

-- ============================================================================
-- 12. CUSTOMERS TABLE - Customer master data
-- ============================================================================
CREATE TABLE IF NOT EXISTS `customers` (
  `customer_id` int(11) NOT NULL AUTO_INCREMENT,
  `shop_id` int(11) NOT NULL,
  `mobile` varchar(20) NOT NULL,
  `email` varchar(100),
  `customer_name` varchar(100),
  `orders_count` int(11) NOT NULL DEFAULT 0,
  `total_spent` decimal(12, 2) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`customer_id`),
  UNIQUE KEY `unique_mobile_per_shop` (`shop_id`, `mobile`),
  KEY `idx_shop_id` (`shop_id`),
  KEY `idx_mobile` (`mobile`),
  KEY `idx_email` (`email`),
  FOREIGN KEY (`shop_id`) REFERENCES `shops` (`shop_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `customers` (`customer_id`, `shop_id`, `mobile`, `email`, `customer_name`, `orders_count`, `total_spent`) VALUES
(1000, 1, '0771234567', 'sunethra.d@mail.com', 'Sunethra Dias', 2, 15000.00),
(1001, 2, '0719876543', 'mahesh.g@mail.com', 'Mahesh Gamage', 1, 6500.00),
(1002, 1, '0754567890', 'priya.s@mail.com', 'Priya Seneviratne', 0, 0.00),
(1003, 3, '0770001112', NULL, 'Walk-in Customer', 3, 30000.00),
(1004, 1, '0772010915', 'walkin@customer.com', 'John Silva', 1, 5000.00);

-- ============================================================================
-- 13. DISTRICTS TABLE - Geographic locations for deliveries
-- ============================================================================
CREATE TABLE IF NOT EXISTS `districts` (
  `district_id` int(11) NOT NULL AUTO_INCREMENT,
  `district_name` varchar(100) NOT NULL UNIQUE,
  `province_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`district_id`),
  KEY `idx_province_id` (`province_id`),
  FOREIGN KEY (`province_id`) REFERENCES `provinces` (`province_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 14. PROVINCES TABLE - Geographic regions
-- ============================================================================
CREATE TABLE IF NOT EXISTS `provinces` (
  `province_id` int(11) NOT NULL AUTO_INCREMENT,
  `province_name` varchar(100) NOT NULL UNIQUE,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`province_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 15. CITIES TABLE - City locations
-- ============================================================================
CREATE TABLE IF NOT EXISTS `cities` (
  `city_id` int(11) NOT NULL AUTO_INCREMENT,
  `city_name` varchar(100) NOT NULL UNIQUE,
  `district_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`city_id`),
  KEY `idx_district_id` (`district_id`),
  FOREIGN KEY (`district_id`) REFERENCES `districts` (`district_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 16. ORDERS TABLE - Customer orders with embedded delivery address
-- ============================================================================
CREATE TABLE IF NOT EXISTS `orders` (
  `order_id` int(11) NOT NULL AUTO_INCREMENT,
  `shop_id` int(11) NOT NULL,
  `order_number` varchar(50) NOT NULL,
  `customer_id` int(11),
  `user_id` int(11),
  `total_items` int(11) NOT NULL DEFAULT 0,
  `order_status` enum('pending','processing','shipped','delivered','cancelled') NOT NULL DEFAULT 'pending',
  `total_amount` decimal(12, 2) NOT NULL,
  `delivery_charge` decimal(12, 2) DEFAULT 0,
  `final_amount` decimal(12, 2) NOT NULL,
  `advance_paid` decimal(12, 2) DEFAULT 0,
  `balance_due` decimal(12, 2) DEFAULT 0,
  `payment_status` enum('unpaid','partial','fully_paid') NOT NULL DEFAULT 'unpaid',
  `notes` text,
  `order_date` date NOT NULL,
  `delivery_line1` varchar(200) NOT NULL,
  `delivery_line2` varchar(200),
  `delivery_postal_code` varchar(20),
  `delivery_city` varchar(100) NOT NULL,
  `delivery_district` varchar(100) NOT NULL,
  `delivery_province` varchar(100) NOT NULL,
  `recipient_name` varchar(100) NOT NULL,
  `recipient_phone` varchar(20) NOT NULL,
  `tracking_number` varchar(50),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`order_id`),
  UNIQUE KEY `order_number` (`order_number`),
  KEY `idx_shop_id` (`shop_id`),
  KEY `idx_customer_id` (`customer_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_order_date` (`order_date`),
  KEY `idx_order_status` (`order_status`),
  KEY `idx_payment_status` (`payment_status`),
  FOREIGN KEY (`shop_id`) REFERENCES `shops` (`shop_id`) ON DELETE CASCADE,
  FOREIGN KEY (`customer_id`) REFERENCES `customers` (`customer_id`) ON DELETE SET NULL,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `orders` (`order_id`, `shop_id`, `order_number`, `customer_id`, `user_id`, `total_items`, `order_status`, `total_amount`, `delivery_charge`, `final_amount`, `advance_paid`, `balance_due`, `payment_status`, `notes`, `order_date`, `delivery_line1`, `delivery_line2`, `delivery_postal_code`, `delivery_city`, `delivery_district`, `delivery_province`, `recipient_name`, `recipient_phone`, `tracking_number`) VALUES
(16, 1, 'ORD-2025-001', 1000, 103, 3, 'pending', 6900.00, 350.00, 7250.00, 3000.00, 4250.00, 'partial', 'Regular customer, fast delivery requested', '2025-11-15', '45 Galle Road', 'Mount Lavinia', '10370', 'Colombo', 'Colombo', 'Western', 'Sunethra Dias', '0771234567', NULL),
(17, 1, 'ORD-2025-002', 1004, 101, 2, 'shipped', 3700.00, 400.00, 4100.00, 1000.00, 3100.00, 'partial', 'Customer will pay remaining balance on delivery', '2025-11-18', '123 Main Street', 'Wellawatte', '10600', 'Colombo', 'Colombo', 'Western', 'John Silva', '0772010915', 'fdvbwgr32'),
(18, 2, 'ORD-2025-003', 1001, 102, 1, 'shipped', 9000.00, 350.00, 9350.00, 0.00, 9350.00, 'unpaid', 'Online payment completed', '2025-11-20', '78 Peradeniya Road', 'Kandy', '20000', 'Kandy', 'Kandy', 'Central', 'Mahesh Gamage', '0719876543', '35fgvxfcvb'),
(19, 1, 'ORD-2025-004', 1002, 103, 2, 'pending', 3000.00, 350.00, 3350.00, 0.00, 3350.00, 'unpaid', 'Cash on delivery', '2025-11-21', '56 Nawala Road', 'Rajagiriya', '10107', 'Colombo', 'Colombo', 'Western', 'Priya Seneviratne', '0754567890', NULL),
(20, 1, 'ORD-2025-005', 1003, 101, 4, 'delivered', 8700.00, 350.00, 9050.00, 8700.00, 350.00, 'partial', 'Bulk order with discount applied', '2025-11-19', '12 Fort Road', 'Galle Fort', '80000', 'Galle', 'Galle', 'Southern', 'Customer Name', '0770001112', 'besrg'),
(21, 1, 'ORD-2025-006', 1000, 103, 1, 'processing', 1800.00, 300.00, 2100.00, 1800.00, 300.00, 'partial', 'Gift for nephew', '2025-11-22', '45 Galle Road', 'Mount Lavinia', '10370', 'Colombo', 'Colombo', 'Western', 'Sunethra Dias', '0771234567', NULL),
(22, 2, 'ORD-2025-007', 1001, 102, 2, 'delivered', 1000.00, 500.00, 1500.00, 500.00, 1000.00, 'partial', 'Small accessories order', '2025-11-17', '78 Peradeniya Road', 'Kandy', '20000', 'Kandy', 'Kandy', 'Central', 'Mahesh Gamage', '0719876543', 'rwegrgh34');

-- ============================================================================
-- 17. ORDER_ITEMS TABLE - Line items in each order
-- ============================================================================
CREATE TABLE IF NOT EXISTS `order_items` (
  `item_id` int(11) NOT NULL AUTO_INCREMENT,
  `order_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `color_id` int(11) NOT NULL,
  `size_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `sold_price` decimal(12, 2) NOT NULL,
  `total_price` decimal(12, 2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`item_id`),
  KEY `idx_order_id` (`order_id`),
  KEY `idx_product_id` (`product_id`),
  KEY `idx_color_id` (`color_id`),
  KEY `idx_size_id` (`size_id`),
  FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE,
  FOREIGN KEY (`color_id`) REFERENCES `colors` (`color_id`) ON DELETE CASCADE,
  FOREIGN KEY (`size_id`) REFERENCES `sizes` (`size_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `order_items` (`item_id`, `order_id`, `product_id`, `color_id`, `size_id`, `quantity`, `sold_price`, `total_price`) VALUES
(31, 16, 1001, 1, 2, 2, 2500.00, 5000.00),
(32, 16, 1003, 4, 6, 1, 1800.00, 1800.00),
(33, 16, 1005, 3, 1, 1, 100.00, 100.00),
(34, 17, 1001, 2, 1, 1, 2500.00, 2500.00),
(35, 17, 1006, 1, 2, 1, 1200.00, 1200.00),
(36, 18, 1004, 1, 7, 1, 9000.00, 9000.00),
(37, 19, 1003, 1, 6, 1, 1800.00, 1800.00),
(38, 19, 1006, 6, 8, 1, 1200.00, 1200.00),
(39, 20, 1001, 3, 3, 2, 2400.00, 4800.00),
(40, 20, 1001, 1, 1, 1, 2300.00, 2300.00),
(41, 20, 1005, 3, 1, 1, 1100.00, 1100.00),
(42, 20, 1006, 4, 1, 1, 500.00, 500.00),
(43, 21, 1003, 1, 6, 1, 1800.00, 1800.00),
(44, 22, 1007, 1, 4, 1, 500.00, 500.00),
(45, 22, 1007, 5, 5, 1, 500.00, 500.00);

-- ============================================================================
-- 18. BANK_ACCOUNTS TABLE - Bank details for payments (optimized: no separate branch table)
-- ============================================================================
CREATE TABLE IF NOT EXISTS `bank_accounts` (
  `bank_account_id` int(11) NOT NULL AUTO_INCREMENT,
  `shop_id` int(11) NOT NULL,
  `bank_name` varchar(100) NOT NULL,
  `branch_name` varchar(100),
  `account_number` varchar(50) NOT NULL,
  `account_holder_name` varchar(100) NOT NULL,
  `account_type` enum('checking','savings','business') NOT NULL DEFAULT 'business',
  `ifsc_code` varchar(20),
  `initial_balance` decimal(12, 2) NOT NULL DEFAULT 0,
  `current_balance` decimal(12, 2) NOT NULL DEFAULT 0,
  `status` enum('active','inactive','closed') NOT NULL DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`bank_account_id`),
  UNIQUE KEY `unique_account_per_shop` (`shop_id`, `account_number`, `bank_name`),
  KEY `idx_shop_id` (`shop_id`),
  KEY `idx_status` (`status`),
  FOREIGN KEY (`shop_id`) REFERENCES `shops` (`shop_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 19. PAYMENTS TABLE - OPTIMIZED Payment transactions (no separate bank/branch cols)
-- ============================================================================
CREATE TABLE IF NOT EXISTS `payments` (
  `payment_id` int(11) NOT NULL AUTO_INCREMENT,
  `shop_id` int(11) NOT NULL,
  `order_id` int(11),
  `customer_id` int(11),
  `payment_amount` decimal(12, 2) NOT NULL,
  `payment_date` date NOT NULL,
  `payment_time` time,
  `payment_method` enum('cash','online_transfer','bank_deposit') NOT NULL DEFAULT 'cash',
  `bank_name` varchar(100),
  `branch_name` varchar(100),
  `bank_account_id` int(11),
  `transaction_id` varchar(100) UNIQUE,
  `payment_status` enum('completed','pending','failed','refunded') NOT NULL DEFAULT 'completed',
  `notes` text,
  `created_by` int(11),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`payment_id`),
  KEY `idx_shop_id` (`shop_id`),
  KEY `idx_order_id` (`order_id`),
  KEY `idx_customer_id` (`customer_id`),
  KEY `idx_payment_date` (`payment_date`),
  KEY `idx_payment_method` (`payment_method`),
  KEY `idx_payment_status` (`payment_status`),
  KEY `idx_bank_account_id` (`bank_account_id`),
  KEY `idx_created_by` (`created_by`),
  FOREIGN KEY (`shop_id`) REFERENCES `shops` (`shop_id`) ON DELETE CASCADE,
  FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE SET NULL,
  FOREIGN KEY (`customer_id`) REFERENCES `customers` (`customer_id`) ON DELETE SET NULL,
  FOREIGN KEY (`bank_account_id`) REFERENCES `bank_accounts` (`bank_account_id`) ON DELETE SET NULL,
  FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 20. PAYMENT_RECONCILIATION TABLE - Bank reconciliation tracking
-- ============================================================================
CREATE TABLE IF NOT EXISTS `payment_reconciliation` (
  `reconciliation_id` int(11) NOT NULL AUTO_INCREMENT,
  `shop_id` int(11) NOT NULL,
  `bank_account_id` int(11) NOT NULL,
  `bank_statement_date` date NOT NULL,
  `bank_balance` decimal(12, 2) NOT NULL,
  `system_balance` decimal(12, 2) NOT NULL,
  `variance` decimal(12, 2) DEFAULT 0,
  `reconciliation_status` enum('pending','reconciled','unreconciled') NOT NULL DEFAULT 'pending',
  `notes` text,
  `reconciled_by` int(11),
  `reconciled_at` timestamp NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`reconciliation_id`),
  KEY `idx_shop_id` (`shop_id`),
  KEY `idx_bank_account_id` (`bank_account_id`),
  KEY `idx_bank_statement_date` (`bank_statement_date`),
  KEY `idx_reconciliation_status` (`reconciliation_status`),
  FOREIGN KEY (`shop_id`) REFERENCES `shops` (`shop_id`) ON DELETE CASCADE,
  FOREIGN KEY (`bank_account_id`) REFERENCES `bank_accounts` (`bank_account_id`) ON DELETE CASCADE,
  FOREIGN KEY (`reconciled_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 21. AUDIT_LOG TABLE - Complete audit trail for all actions
-- ============================================================================
CREATE TABLE IF NOT EXISTS `audit_log` (
  `audit_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `shop_id` int(11) NOT NULL,
  `user_id` int(11),
  `table_name` varchar(100) NOT NULL,
  `record_id` int(11),
  `action` enum('INSERT','UPDATE','DELETE','LOGIN','LOGOUT') NOT NULL,
  `old_values` json,
  `new_values` json,
  `ip_address` varchar(45),
  `user_agent` varchar(255),
  `changes_description` text,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`audit_id`),
  KEY `idx_shop_id` (`shop_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_table_name` (`table_name`),
  KEY `idx_record_id` (`record_id`),
  KEY `idx_action` (`action`),
  KEY `idx_created_at` (`created_at`),
  FOREIGN KEY (`shop_id`) REFERENCES `shops` (`shop_id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 22. ACTIVITY_LOG TABLE - User activity tracking for business intelligence
-- ============================================================================
CREATE TABLE IF NOT EXISTS `activity_log` (
  `activity_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `shop_id` int(11) NOT NULL,
  `user_id` int(11),
  `activity_type` enum('order_created','order_updated','payment_recorded','payment_updated','product_sold','inventory_adjusted','login','logout','report_generated') NOT NULL,
  `entity_type` varchar(50),
  `entity_id` int(11),
  `description` text,
  `metadata` json,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`activity_id`),
  KEY `idx_shop_id` (`shop_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_activity_type` (`activity_type`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_entity` (`entity_type`, `entity_id`),
  FOREIGN KEY (`shop_id`) REFERENCES `shops` (`shop_id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- ============================================================================

ALTER TABLE `shops`
  ADD PRIMARY KEY (`shop_id`),
  ADD UNIQUE KEY `shop_name` (`shop_name`),
  ADD KEY `idx_status` (`shop_status`);

ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD KEY `idx_shop_id` (`shop_id`),
  ADD KEY `idx_user_role` (`user_role`),
  ADD KEY `idx_user_status` (`user_status`);

ALTER TABLE `size_types`
  ADD PRIMARY KEY (`size_type_id`),
  ADD UNIQUE KEY `size_type_name` (`size_type_name`);

ALTER TABLE `sizes`
  ADD PRIMARY KEY (`size_id`),
  ADD UNIQUE KEY `unique_size_per_shop` (`shop_id`, `size_name`, `size_type_id`);

ALTER TABLE `colors`
  ADD PRIMARY KEY (`color_id`),
  ADD UNIQUE KEY `unique_color_per_shop` (`shop_id`, `color_name`);

ALTER TABLE `categories`
  ADD PRIMARY KEY (`category_id`),
  ADD UNIQUE KEY `unique_category_per_shop` (`shop_id`, `category_name`);

ALTER TABLE `products`
  ADD PRIMARY KEY (`product_id`),
  ADD UNIQUE KEY `unique_sku_per_shop` (`shop_id`, `sku`);

ALTER TABLE `product_sizes`
  ADD PRIMARY KEY (`product_size_id`),
  ADD UNIQUE KEY `unique_product_size` (`product_id`, `size_id`);

ALTER TABLE `product_colors`
  ADD PRIMARY KEY (`product_color_id`),
  ADD UNIQUE KEY `unique_product_color` (`product_id`, `color_id`);

ALTER TABLE `shop_product_stock`
  ADD PRIMARY KEY (`stock_id`),
  ADD UNIQUE KEY `unique_shop_product_stock` (`shop_id`, `product_id`, `size_id`, `color_id`);

ALTER TABLE `shop_inventory`
  ADD PRIMARY KEY (`inventory_id`),
  ADD UNIQUE KEY `unique_shop_item` (`shop_id`, `item_name`);

ALTER TABLE `customers`
  ADD PRIMARY KEY (`customer_id`),
  ADD UNIQUE KEY `unique_mobile_per_shop` (`shop_id`, `mobile`);

ALTER TABLE `provinces`
  ADD PRIMARY KEY (`province_id`),
  ADD UNIQUE KEY `province_name` (`province_name`);

ALTER TABLE `districts`
  ADD PRIMARY KEY (`district_id`);

ALTER TABLE `cities`
  ADD PRIMARY KEY (`city_id`),
  ADD UNIQUE KEY `city_name` (`city_name`);

ALTER TABLE `orders`
  ADD PRIMARY KEY (`order_id`),
  ADD UNIQUE KEY `order_number` (`order_number`);

ALTER TABLE `order_items`
  ADD PRIMARY KEY (`item_id`);

ALTER TABLE `bank_accounts`
  ADD PRIMARY KEY (`bank_account_id`),
  ADD UNIQUE KEY `unique_account_per_shop` (`shop_id`, `account_number`, `bank_name`);

ALTER TABLE `payments`
  ADD PRIMARY KEY (`payment_id`),
  ADD UNIQUE KEY `transaction_id` (`transaction_id`);

ALTER TABLE `payment_reconciliation`
  ADD PRIMARY KEY (`reconciliation_id`);

ALTER TABLE `audit_log`
  ADD PRIMARY KEY (`audit_id`);

ALTER TABLE `activity_log`
  ADD PRIMARY KEY (`activity_id`);

-- ============================================================================
-- AUTO_INCREMENT VALUES
-- ============================================================================

ALTER TABLE `shops` MODIFY `shop_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;
ALTER TABLE `users` MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=106;
ALTER TABLE `size_types` MODIFY `size_type_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;
ALTER TABLE `sizes` MODIFY `size_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;
ALTER TABLE `colors` MODIFY `color_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;
ALTER TABLE `categories` MODIFY `category_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;
ALTER TABLE `products` MODIFY `product_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1008;
ALTER TABLE `product_sizes` MODIFY `product_size_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;
ALTER TABLE `product_colors` MODIFY `product_color_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;
ALTER TABLE `shop_product_stock` MODIFY `stock_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;
ALTER TABLE `shop_inventory` MODIFY `inventory_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;
ALTER TABLE `customers` MODIFY `customer_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1005;
ALTER TABLE `provinces` MODIFY `province_id` int(11) NOT NULL AUTO_INCREMENT;
ALTER TABLE `districts` MODIFY `district_id` int(11) NOT NULL AUTO_INCREMENT;
ALTER TABLE `cities` MODIFY `city_id` int(11) NOT NULL AUTO_INCREMENT;
ALTER TABLE `orders` MODIFY `order_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;
ALTER TABLE `order_items` MODIFY `item_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=46;
ALTER TABLE `bank_accounts` MODIFY `bank_account_id` int(11) NOT NULL AUTO_INCREMENT;
ALTER TABLE `payments` MODIFY `payment_id` int(11) NOT NULL AUTO_INCREMENT;
ALTER TABLE `payment_reconciliation` MODIFY `reconciliation_id` int(11) NOT NULL AUTO_INCREMENT;
ALTER TABLE `audit_log` MODIFY `audit_id` bigint(20) NOT NULL AUTO_INCREMENT;
ALTER TABLE `activity_log` MODIFY `activity_id` bigint(20) NOT NULL AUTO_INCREMENT;

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET CHARACTER_SET_COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
