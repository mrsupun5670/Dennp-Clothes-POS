-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Nov 24, 2025 at 02:06 AM
-- Server version: 11.8.3-MariaDB-log
-- PHP Version: 7.2.34

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `u331468302_dennup_pos`
--

-- --------------------------------------------------------

--
-- Table structure for table `bank_accounts`
--

CREATE TABLE `bank_accounts` (
  `bank_account_id` int(11) NOT NULL,
  `shop_id` int(11) NOT NULL,
  `bank_name` varchar(100) NOT NULL,
  `account_number` varchar(50) NOT NULL,
  `account_holder_name` varchar(100) NOT NULL,
  `account_type` enum('checking','savings','business') NOT NULL DEFAULT 'business',
  `branch_code` varchar(20) DEFAULT NULL,
  `ifsc_code` varchar(15) DEFAULT NULL,
  `initial_balance` double DEFAULT 0,
  `current_balance` double DEFAULT 0,
  `status` enum('active','inactive','closed') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `category_id` int(11) NOT NULL,
  `shop_id` int(11) NOT NULL DEFAULT 1,
  `category_name` varchar(100) NOT NULL,
  `size_type_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`category_id`, `shop_id`, `category_name`, `size_type_id`) VALUES
(1, 1, 'Men_T-Shirts', 1),
(2, 1, 'Women_Jeans', 2),
(3, 1, 'Kids_Trousers', 3),
(4, 1, 'Footwear', 2),
(5, 1, 'Accessories', 1);

-- --------------------------------------------------------

--
-- Table structure for table `cities`
--

CREATE TABLE `cities` (
  `city_id` int(11) NOT NULL,
  `city_name` varchar(15) NOT NULL,
  `district_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `colors`
--

CREATE TABLE `colors` (
  `color_id` int(11) NOT NULL,
  `shop_id` int(11) NOT NULL DEFAULT 1,
  `color_name` varchar(50) NOT NULL,
  `hex_code` varchar(7) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `colors`
--

INSERT INTO `colors` (`color_id`, `shop_id`, `color_name`, `hex_code`) VALUES
(1, 1, 'Black', '#000000'),
(2, 1, 'White', '#FFFFFF'),
(3, 1, 'Navy Blue', '#000080'),
(4, 1, 'Red', '#FF0000'),
(5, 1, 'Grey', '#808080'),
(6, 1, 'N/A', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

CREATE TABLE `customers` (
  `customer_id` int(11) NOT NULL,
  `mobile` varchar(20) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `orders_count` int(11) DEFAULT 0,
  `total_spent` double DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `shop_id` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `customers`
--

INSERT INTO `customers` (`customer_id`, `mobile`, `email`, `orders_count`, `total_spent`, `created_at`, `shop_id`) VALUES
(1000, '0771234567', 'sunethra.d@mail.com', 2, 15000, '2025-11-19 16:22:05', 1),
(1001, '0719876543', 'mahesh.g@mail.com', 1, 6500, '2025-11-19 16:22:05', 2),
(1002, '0754567890', 'priya.s@mail.com', 0, 0, '2025-11-19 16:22:05', 1),
(1003, '0770001112', NULL, 3, 30000, '2025-11-19 16:22:05', 3),
(1004, '0772010915', 'walkin@customer.com', 1, 5000, '2025-11-19 16:22:05', 1);

-- --------------------------------------------------------

--
-- Table structure for table `customer_addresses`
--

CREATE TABLE `customer_addresses` (
  `address_id` int(11) NOT NULL,
  `line1` varchar(30) NOT NULL,
  `line2` varchar(45) NOT NULL,
  `postal_code` varchar(15) NOT NULL,
  `created_at` timestamp NOT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `city_id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `districts`
--

CREATE TABLE `districts` (
  `district_id` int(11) NOT NULL,
  `district_name` varchar(45) NOT NULL,
  `provinces_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `order_id` int(11) NOT NULL,
  `order_number` varchar(50) NOT NULL,
  `shop_id` int(11) NOT NULL,
  `customer_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `total_items` int(11) NOT NULL DEFAULT 0,
  `order_status` enum('pending','processing','shipped','delivered') NOT NULL,
  `total_amount` double NOT NULL,
  `advance_paid` double DEFAULT 0,
  `balance_paid` double DEFAULT 0,
  `delivery_charge` double DEFAULT NULL,
  `total_paid` double DEFAULT 0,
  `payment_status` enum('unpaid','partial','fully_paid') DEFAULT 'unpaid',
  `remaining_amount` double DEFAULT 0,
  `payment_method` enum('cash','card','online','other') NOT NULL DEFAULT 'cash',
  `payment_received_date` date DEFAULT NULL,
  `payment_reconciled` tinyint(1) DEFAULT 0,
  `notes` text DEFAULT NULL,
  `order_date` date NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `line1` varchar(200) NOT NULL,
  `line2` varchar(200) NOT NULL,
  `postal_code` varchar(45) NOT NULL,
  `city_name` varchar(45) NOT NULL,
  `district_name` varchar(45) NOT NULL,
  `province_name` varchar(45) NOT NULL,
  `recipient_name` varchar(100) NOT NULL,
  `recipient_phone` varchar(12) NOT NULL,
  `tracking_number` varchar(25) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`order_id`, `order_number`, `shop_id`, `customer_id`, `user_id`, `total_items`, `order_status`, `total_amount`, `advance_paid`, `balance_paid`, `delivery_charge`, `total_paid`, `payment_status`, `remaining_amount`, `payment_method`, `payment_received_date`, `payment_reconciled`, `notes`, `order_date`, `created_at`, `updated_at`, `line1`, `line2`, `postal_code`, `city_name`, `district_name`, `province_name`, `recipient_name`, `recipient_phone`, `tracking_number`) VALUES
(16, 'ORD-2025-001', 1, 1000, 103, 3, 'pending', 6900, 3000, 3900, 350, 6900, 'fully_paid', 0, 'cash', NULL, 0, 'Regular customer, fast delivery requested', '2025-11-15', '2025-11-22 05:35:20', '2025-11-22 17:00:01', '45 Galle Road', 'Mount Lavinia', '10370', 'Colombo', 'Colombo', 'Western', 'Sunethra Dias', '0771234567', NULL),
(17, 'ORD-2025-002', 1, 1004, 101, 2, 'shipped', 3700, 1000, 0, 400, 1400, 'partial', 2700, 'card', NULL, 0, 'Customer will pay remaining balance on delivery', '2025-11-18', '2025-11-22 05:35:20', '2025-11-22 17:01:04', '123 Main Street', 'Wellawatte', '10600', 'Colombo', 'Colombo', 'Western', 'John Silva', '0772010915', 'fdvbwgr32'),
(18, 'ORD-2025-003', 2, 1001, 102, 1, 'shipped', 9000, 0, 9000, 350, 9350, 'fully_paid', 0, 'online', NULL, 0, 'Online payment completed', '2025-11-20', '2025-11-22 05:35:20', '2025-11-22 17:00:56', '78 Peradeniya Road', 'Kandy', '20000', 'Kandy', 'Kandy', 'Central', 'Mahesh Gamage', '0719876543', '35fgvxfcvb'),
(19, 'ORD-2025-004', 1, 1002, 103, 2, 'pending', 3000, 0, 0, 350, 0, 'unpaid', 3000, 'cash', NULL, 0, 'Cash on delivery', '2025-11-21', '2025-11-22 05:35:20', '2025-11-22 17:00:17', '56 Nawala Road', 'Rajagiriya', '10107', 'Colombo', 'Colombo', 'Western', 'Priya Seneviratne', '0754567890', NULL),
(20, 'ORD-2025-005', 1, 1003, 101, 4, 'delivered', 8700, 8700, 0, 350, 9050, 'fully_paid', 0, 'cash', NULL, 0, 'Bulk order with discount applied', '2025-11-19', '2025-11-22 05:35:20', '2025-11-22 17:00:47', '12 Fort Road', 'Galle Fort', '80000', 'Galle', 'Galle', 'Southern', 'Customer Name', '0770001112', 'besrg'),
(21, 'ORD-2025-006', 1, 1000, 103, 1, 'processing', 1800, 1800, 0, 300, 1800, 'fully_paid', 0, 'card', NULL, 0, 'Gift for nephew', '2025-11-22', '2025-11-22 05:35:20', '2025-11-22 17:00:23', '45 Galle Road', 'Mount Lavinia', '10370', 'Colombo', 'Colombo', 'Western', 'Sunethra Dias', '0771234567', NULL),
(22, 'ORD-2025-007', 2, 1001, 102, 2, 'delivered', 1000, 500, 500, 500, 1500, 'fully_paid', 0, 'cash', NULL, 0, 'Small accessories order', '2025-11-17', '2025-11-22 05:35:20', '2025-11-22 17:00:38', '78 Peradeniya Road', 'Kandy', '20000', 'Kandy', 'Kandy', 'Central', 'Mahesh Gamage', '0719876543', 'rwegrgh34');

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `item_id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `color_id` int(11) NOT NULL,
  `size_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `sold_price` double NOT NULL,
  `total_price` double NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`item_id`, `order_id`, `product_id`, `color_id`, `size_id`, `quantity`, `sold_price`, `total_price`, `created_at`) VALUES
(31, 16, 1001, 1, 2, 2, 2500, 5000, '2025-11-22 05:35:46'),
(32, 16, 1003, 4, 6, 1, 1800, 1800, '2025-11-22 05:35:46'),
(33, 16, 1005, 3, 1, 1, 100, 100, '2025-11-22 05:35:46'),
(34, 17, 1001, 2, 1, 1, 2500, 2500, '2025-11-22 05:35:46'),
(35, 17, 1006, 1, 2, 1, 1200, 1200, '2025-11-22 05:35:46'),
(36, 18, 1004, 1, 7, 1, 9000, 9000, '2025-11-22 05:35:46'),
(37, 19, 1003, 1, 6, 1, 1800, 1800, '2025-11-22 05:35:46'),
(38, 19, 1006, 6, 8, 1, 1200, 1200, '2025-11-22 05:35:46'),
(39, 20, 1001, 3, 3, 2, 2400, 4800, '2025-11-22 05:35:46'),
(40, 20, 1001, 1, 1, 1, 2300, 2300, '2025-11-22 05:35:46'),
(41, 20, 1005, 3, 1, 1, 1100, 1100, '2025-11-22 05:35:46'),
(42, 20, 1006, 4, 1, 1, 500, 500, '2025-11-22 05:35:46'),
(43, 21, 1003, 1, 6, 1, 1800, 1800, '2025-11-22 05:35:46'),
(44, 22, 1007, 1, 4, 1, 500, 500, '2025-11-22 05:35:46'),
(45, 22, 1007, 5, 5, 1, 500, 500, '2025-11-22 05:35:46');

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `payment_id` int(11) NOT NULL,
  `shop_id` int(11) NOT NULL,
  `order_id` int(11) DEFAULT NULL,
  `customer_id` int(11) DEFAULT NULL,
  `payment_amount` double NOT NULL,
  `payment_date` date NOT NULL,
  `payment_time` time DEFAULT NULL,
  `payment_method` enum('cash','card','online','check','bank_transfer') NOT NULL,
  `bank_account_id` int(11) DEFAULT NULL,
  `transaction_id` varchar(100) DEFAULT NULL,
  `payment_status` enum('completed','pending','failed','refunded') DEFAULT 'completed',
  `notes` text DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payment_reconciliation`
--

CREATE TABLE `payment_reconciliation` (
  `reconciliation_id` int(11) NOT NULL,
  `shop_id` int(11) NOT NULL,
  `bank_account_id` int(11) NOT NULL,
  `bank_statement_date` date NOT NULL,
  `bank_balance` double NOT NULL,
  `system_balance` double NOT NULL,
  `variance` double DEFAULT 0,
  `reconciliation_status` enum('pending','reconciled','unreconciled') DEFAULT 'pending',
  `notes` text DEFAULT NULL,
  `reconciled_by` int(11) DEFAULT NULL,
  `reconciled_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `product_id` int(11) NOT NULL,
  `shop_id` int(11) NOT NULL DEFAULT 1,
  `sku` varchar(50) NOT NULL,
  `product_name` varchar(150) NOT NULL,
  `category_id` int(11) NOT NULL,
  `description` text DEFAULT NULL,
  `retail_price` double NOT NULL,
  `wholesale_price` double DEFAULT NULL,
  `product_cost` double NOT NULL,
  `print_cost` double NOT NULL,
  `product_status` enum('active','inactive','discontinued') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`product_id`, `shop_id`, `sku`, `product_name`, `category_id`, `description`, `retail_price`, `wholesale_price`, `product_cost`, `print_cost`, `product_status`, `created_at`, `updated_at`) VALUES
(1001, 1, 'TSHIRT001', 'Premium Cotton Crew Tee', 1, '', 2500, 1500, 0, 30, 'active', '2025-11-19 16:22:05', '2025-11-19 17:26:43'),
(1002, 3, 'WJNS002', 'High-Waist Skinny Jean', 1, '', 6500, 4000, 500, 20, 'active', '2025-11-19 16:22:05', '2025-11-21 14:56:15'),
(1003, 1, 'KTR001', 'Kids Elastic Trousers', 1, '', 1800, 1000, 0, 33, 'active', '2025-11-19 16:22:05', '2025-11-19 18:35:59'),
(1004, 2, 'SHOE001', 'Leather Formal Shoes', 4, 'Classic lace-up shoes.', 9000, 5500, 0, 0, 'active', '2025-11-19 16:22:05', '2025-11-21 14:56:07'),
(1005, 1, 'ACC001', 'Sports Cap', 5, 'Adjustable sports cap.', 1200, 700, 0, 0, 'active', '2025-11-19 16:22:05', '2025-11-19 16:22:05'),
(1006, 1, 'Test-001', 'Test tshirt', 1, '', 1200, 1000, 0, 30, 'active', '2025-11-19 17:11:41', '2025-11-19 18:36:21'),
(1007, 2, 'Test-002', 'dgfss', 1, '', 500, 200, 0, 10, 'active', '2025-11-19 17:28:09', '2025-11-21 09:08:32');

-- --------------------------------------------------------

--
-- Table structure for table `product_colors`
--

CREATE TABLE `product_colors` (
  `product_color_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `color_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `product_colors`
--

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
(12, 1006, 4),
(11, 1006, 6),
(14, 1007, 1),
(13, 1007, 5);

-- --------------------------------------------------------

--
-- Table structure for table `product_sizes`
--

CREATE TABLE `product_sizes` (
  `product_size_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `size_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `product_sizes`
--

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
(11, 1006, 2),
(10, 1006, 8),
(13, 1007, 4),
(12, 1007, 5);

-- --------------------------------------------------------

--
-- Table structure for table `provinces`
--

CREATE TABLE `provinces` (
  `provinces_id` int(11) NOT NULL,
  `provinces_name` varchar(45) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `shops`
--

CREATE TABLE `shops` (
  `shop_id` int(11) NOT NULL,
  `shop_name` varchar(100) NOT NULL,
  `address` varchar(255) DEFAULT NULL,
  `contact_phone` varchar(20) NOT NULL,
  `manager_name` varchar(100) DEFAULT NULL,
  `shop_status` enum('active','inactive','closed') DEFAULT 'active',
  `opening_date` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `shops`
--

INSERT INTO `shops` (`shop_id`, `shop_name`, `address`, `contact_phone`, `manager_name`, `shop_status`, `opening_date`) VALUES
(1, 'Colombo Flagship', '123 Galle Rd, Colombo 03', '0112345678', 'Aisha Khan', 'active', '2023-01-15'),
(2, 'Kandy Boutique', '45 Temple St, Kandy', '0819876543', 'Nimal Perera', 'active', '2023-05-20'),
(3, 'Galle Outpost', '78 Lighthouse St, Galle', '0915551234', 'Kamala Silva', 'inactive', '2023-11-01'),
(4, 'Jaffna Store', '20 Main Rd, Jaffna', '0217778899', 'Ravi Shankar', 'active', '2024-03-10'),
(5, 'Warehouse Outlet', '99 Industrial Zone, Biyagama', '0334445566', 'Sunil Fernando', 'active', '2024-06-01');

-- --------------------------------------------------------

--
-- Table structure for table `shop_inventory`
--

CREATE TABLE `shop_inventory` (
  `inventory_id` int(11) NOT NULL,
  `shop_id` int(11) NOT NULL,
  `item_name` varchar(255) NOT NULL,
  `quantity_in_stock` int(11) NOT NULL DEFAULT 0,
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `unit_cost` double NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `shop_inventory`
--

INSERT INTO `shop_inventory` (`inventory_id`, `shop_id`, `item_name`, `quantity_in_stock`, `updated_at`, `unit_cost`) VALUES
(1, 1, 'POS Thermal Paper Roll', 50, '2025-11-19 16:22:05', 150),
(2, 1, 'Shopping Bags (Large)', 200, '2025-11-19 16:22:05', 25),
(3, 2, 'POS Thermal Paper Roll', 30, '2025-11-19 16:22:05', 150),
(4, 4, 'Security Tags', 1000, '2025-11-19 16:22:05', 8.5),
(5, 5, 'Moving Boxes', 50, '2025-11-19 16:22:05', 250);

-- --------------------------------------------------------

--
-- Table structure for table `shop_product_stock`
--

CREATE TABLE `shop_product_stock` (
  `stock_id` int(11) NOT NULL,
  `shop_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `size_id` int(11) NOT NULL,
  `color_id` int(11) NOT NULL,
  `stock_qty` int(11) NOT NULL,
  `created_at` timestamp NOT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `shop_product_stock`
--

INSERT INTO `shop_product_stock` (`stock_id`, `shop_id`, `product_id`, `size_id`, `color_id`, `stock_qty`, `created_at`, `updated_at`) VALUES
(1, 1, 1001, 1, 1, 50, '2025-11-19 16:22:05', '2025-11-19 16:22:05'),
(2, 1, 1001, 2, 2, 45, '2025-11-19 16:22:05', '2025-11-19 16:22:05'),
(3, 1, 1002, 4, 3, 30, '2025-11-19 16:22:05', '2025-11-19 16:22:05'),
(4, 1, 1003, 6, 4, 20, '2025-11-19 16:22:05', '2025-11-19 16:22:05'),
(5, 1, 1004, 7, 1, 15, '2025-11-19 16:22:05', '2025-11-19 16:22:05'),
(6, 2, 1001, 3, 3, 40, '2025-11-19 16:22:05', '2025-11-19 16:22:05'),
(7, 2, 1002, 5, 5, 25, '2025-11-19 16:22:05', '2025-11-19 16:22:05'),
(8, 1, 1001, 3, 1, 15, '2025-11-19 17:26:43', NULL),
(9, 1, 1007, 5, 5, 40, '2025-11-19 17:28:11', '2025-11-19 17:29:19'),
(11, 1, 1007, 4, 1, 10, '2025-11-19 17:28:40', '2025-11-19 17:29:19'),
(13, 1, 1007, 5, 1, 10, '2025-11-19 17:29:19', NULL),
(14, 1, 1007, 4, 5, 10, '2025-11-19 17:29:19', NULL),
(17, 1, 1006, 2, 1, 1, '2025-11-19 18:26:08', '2025-11-19 18:36:22'),
(19, 1, 1003, 6, 1, 10, '2025-11-19 18:35:59', NULL),
(21, 1, 1002, 4, 5, 14, '2025-11-19 18:52:10', NULL),
(22, 1, 1002, 5, 5, 14, '2025-11-19 18:52:10', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `sizes`
--

CREATE TABLE `sizes` (
  `size_id` int(11) NOT NULL,
  `shop_id` int(11) NOT NULL DEFAULT 1,
  `size_name` varchar(10) NOT NULL,
  `size_type_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sizes`
--

INSERT INTO `sizes` (`size_id`, `shop_id`, `size_name`, `size_type_id`) VALUES
(4, 1, '30', 2),
(5, 1, '32', 2),
(6, 1, '3T', 3),
(7, 1, '8', 2),
(3, 1, 'L', 1),
(2, 1, 'M', 1),
(8, 1, 'N/A', 1),
(1, 1, 'S', 1);

-- --------------------------------------------------------

--
-- Table structure for table `size_type`
--

CREATE TABLE `size_type` (
  `size_type_id` int(11) NOT NULL,
  `Size_type_name` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `size_type`
--

INSERT INTO `size_type` (`size_type_id`, `Size_type_name`) VALUES
(1, 'Alpha'),
(2, 'Numeric'),
(3, 'Kids');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `username` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `shop_id` int(11) DEFAULT NULL,
  `user_role` enum('admin','manager','cashier','staff') DEFAULT 'staff',
  `joining_date` date DEFAULT NULL,
  `user_status` enum('active','inactive','suspended') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `username`, `password_hash`, `first_name`, `last_name`, `phone`, `shop_id`, `user_role`, `joining_date`, `user_status`, `created_at`) VALUES
(101, 'admin_ak', '$2y$10$hash1', 'Admin', 'Khan', '0771112223', 1, 'admin', '2023-01-10', 'active', '2025-11-19 16:22:05'),
(102, 'nimal_mngr', '$2y$10$hash2', 'Nimal', 'Perera', '0763334445', 2, 'manager', '2023-05-15', 'active', '2025-11-19 16:22:05'),
(103, 'cashier_c', '$2y$10$hash3', 'Chathuri', 'Jay', '0715556667', 1, 'cashier', '2024-01-20', 'active', '2025-11-19 16:22:05'),
(104, 'staff_r', '$2y$10$hash4', 'Ramesh', 'Wick', '0778889990', 4, 'staff', '2024-04-01', 'active', '2025-11-19 16:22:05'),
(105, 'sri_mngr', '$2y$10$hash5', 'Sriyan', 'Abe', '0750001112', 5, 'manager', '2024-06-01', 'active', '2025-11-19 16:22:05');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `bank_accounts`
--
ALTER TABLE `bank_accounts`
  ADD PRIMARY KEY (`bank_account_id`),
  ADD UNIQUE KEY `unique_account_per_shop` (`shop_id`,`account_number`),
  ADD KEY `idx_shop_id` (`shop_id`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`category_id`),
  ADD UNIQUE KEY `category_name` (`category_name`),
  ADD UNIQUE KEY `unique_category_per_shop` (`shop_id`,`category_name`),
  ADD KEY `idx_category_name` (`category_name`),
  ADD KEY `fk_categories_size_type1_idx` (`size_type_id`),
  ADD KEY `idx_shop_id` (`shop_id`);

--
-- Indexes for table `cities`
--
ALTER TABLE `cities`
  ADD PRIMARY KEY (`city_id`),
  ADD KEY `fk_cities_districts1_idx` (`district_id`);

--
-- Indexes for table `colors`
--
ALTER TABLE `colors`
  ADD PRIMARY KEY (`color_id`),
  ADD UNIQUE KEY `color_name` (`color_name`),
  ADD UNIQUE KEY `unique_color_per_shop` (`shop_id`,`color_name`),
  ADD KEY `idx_color_name` (`color_name`),
  ADD KEY `idx_shop_id` (`shop_id`);

--
-- Indexes for table `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`customer_id`),
  ADD UNIQUE KEY `mobile` (`mobile`),
  ADD UNIQUE KEY `unique_mobile_per_shop` (`shop_id`,`mobile`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_mobile` (`mobile`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `customer_addresses`
--
ALTER TABLE `customer_addresses`
  ADD PRIMARY KEY (`address_id`),
  ADD KEY `fk_addresses_cities1_idx` (`city_id`),
  ADD KEY `fk_addresses_customers1_idx` (`customer_id`);

--
-- Indexes for table `districts`
--
ALTER TABLE `districts`
  ADD PRIMARY KEY (`district_id`),
  ADD KEY `fk_districts_provinces1_idx` (`provinces_id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`order_id`),
  ADD UNIQUE KEY `order_number` (`order_number`),
  ADD KEY `idx_shop_id` (`shop_id`),
  ADD KEY `idx_customer_id` (`customer_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_order_date` (`order_date`),
  ADD KEY `idx_order_number` (`order_number`),
  ADD KEY `idx_payment_method` (`payment_method`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`item_id`),
  ADD KEY `idx_order_id` (`order_id`),
  ADD KEY `idx_product_id` (`product_id`),
  ADD KEY `fk_order_items_colors1_idx` (`color_id`),
  ADD KEY `fk_order_items_sizes1_idx` (`size_id`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`payment_id`),
  ADD UNIQUE KEY `transaction_id` (`transaction_id`),
  ADD KEY `idx_shop_id` (`shop_id`),
  ADD KEY `idx_order_id` (`order_id`),
  ADD KEY `idx_customer_id` (`customer_id`),
  ADD KEY `idx_payment_date` (`payment_date`),
  ADD KEY `idx_payment_method` (`payment_method`),
  ADD KEY `idx_bank_account_id` (`bank_account_id`),
  ADD KEY `idx_created_by` (`created_by`);

--
-- Indexes for table `payment_reconciliation`
--
ALTER TABLE `payment_reconciliation`
  ADD PRIMARY KEY (`reconciliation_id`),
  ADD KEY `idx_shop_id` (`shop_id`),
  ADD KEY `idx_bank_account_id` (`bank_account_id`),
  ADD KEY `idx_bank_statement_date` (`bank_statement_date`),
  ADD KEY `idx_status` (`reconciliation_status`),
  ADD KEY `fk_reconciliation_users` (`reconciled_by`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`product_id`),
  ADD UNIQUE KEY `sku` (`sku`),
  ADD UNIQUE KEY `unique_sku_per_shop` (`shop_id`,`sku`),
  ADD KEY `idx_sku` (`sku`),
  ADD KEY `idx_category_id` (`category_id`),
  ADD KEY `idx_status` (`product_status`),
  ADD KEY `idx_retail_price` (`retail_price`),
  ADD KEY `idx_shop_id` (`shop_id`);

--
-- Indexes for table `product_colors`
--
ALTER TABLE `product_colors`
  ADD PRIMARY KEY (`product_color_id`),
  ADD UNIQUE KEY `unique_product_color` (`product_id`,`color_id`),
  ADD KEY `fk_product_colors_products1_idx` (`product_id`),
  ADD KEY `fk_product_colors_colors1_idx` (`color_id`);

--
-- Indexes for table `product_sizes`
--
ALTER TABLE `product_sizes`
  ADD PRIMARY KEY (`product_size_id`),
  ADD UNIQUE KEY `unique_product_size` (`product_id`,`size_id`),
  ADD KEY `fk_product_sizes_products1_idx` (`product_id`),
  ADD KEY `fk_product_sizes_sizes1_idx` (`size_id`);

--
-- Indexes for table `provinces`
--
ALTER TABLE `provinces`
  ADD PRIMARY KEY (`provinces_id`);

--
-- Indexes for table `shops`
--
ALTER TABLE `shops`
  ADD PRIMARY KEY (`shop_id`),
  ADD UNIQUE KEY `shop_name` (`shop_name`),
  ADD KEY `idx_status` (`shop_status`);

--
-- Indexes for table `shop_inventory`
--
ALTER TABLE `shop_inventory`
  ADD PRIMARY KEY (`inventory_id`),
  ADD UNIQUE KEY `unique_shop_item` (`shop_id`,`item_name`),
  ADD KEY `idx_shop_id` (`shop_id`),
  ADD KEY `idx_item_name` (`item_name`),
  ADD KEY `idx_quantity` (`quantity_in_stock`);

--
-- Indexes for table `shop_product_stock`
--
ALTER TABLE `shop_product_stock`
  ADD PRIMARY KEY (`stock_id`),
  ADD UNIQUE KEY `unique_shop_product_color_size` (`shop_id`,`product_id`,`size_id`,`color_id`),
  ADD KEY `fk_shop_product_stock_shops1_idx` (`shop_id`),
  ADD KEY `fk_shop_product_stock_products1_idx` (`product_id`),
  ADD KEY `fk_shop_product_stock_sizes1_idx` (`size_id`),
  ADD KEY `fk_shop_product_stock_colors1_idx` (`color_id`);

--
-- Indexes for table `sizes`
--
ALTER TABLE `sizes`
  ADD PRIMARY KEY (`size_id`),
  ADD UNIQUE KEY `unique_size_type` (`size_name`,`size_type_id`),
  ADD UNIQUE KEY `unique_size_per_shop` (`shop_id`,`size_name`,`size_type_id`),
  ADD KEY `idx_size_name` (`size_name`),
  ADD KEY `fk_sizes_size_type1_idx` (`size_type_id`),
  ADD KEY `idx_shop_id` (`shop_id`);

--
-- Indexes for table `size_type`
--
ALTER TABLE `size_type`
  ADD PRIMARY KEY (`size_type_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD KEY `idx_username` (`username`),
  ADD KEY `idx_shop_id` (`shop_id`),
  ADD KEY `idx_user_role` (`user_role`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `bank_accounts`
--
ALTER TABLE `bank_accounts`
  MODIFY `bank_account_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `category_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `cities`
--
ALTER TABLE `cities`
  MODIFY `city_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `colors`
--
ALTER TABLE `colors`
  MODIFY `color_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `customers`
--
ALTER TABLE `customers`
  MODIFY `customer_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1005;

--
-- AUTO_INCREMENT for table `customer_addresses`
--
ALTER TABLE `customer_addresses`
  MODIFY `address_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `districts`
--
ALTER TABLE `districts`
  MODIFY `district_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `order_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `item_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=46;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `payment_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payment_reconciliation`
--
ALTER TABLE `payment_reconciliation`
  MODIFY `reconciliation_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `product_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1008;

--
-- AUTO_INCREMENT for table `product_colors`
--
ALTER TABLE `product_colors`
  MODIFY `product_color_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `product_sizes`
--
ALTER TABLE `product_sizes`
  MODIFY `product_size_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `provinces`
--
ALTER TABLE `provinces`
  MODIFY `provinces_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `shops`
--
ALTER TABLE `shops`
  MODIFY `shop_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `shop_inventory`
--
ALTER TABLE `shop_inventory`
  MODIFY `inventory_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `shop_product_stock`
--
ALTER TABLE `shop_product_stock`
  MODIFY `stock_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `sizes`
--
ALTER TABLE `sizes`
  MODIFY `size_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `size_type`
--
ALTER TABLE `size_type`
  MODIFY `size_type_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=106;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `bank_accounts`
--
ALTER TABLE `bank_accounts`
  ADD CONSTRAINT `fk_bank_accounts_shops` FOREIGN KEY (`shop_id`) REFERENCES `shops` (`shop_id`) ON DELETE CASCADE;

--
-- Constraints for table `categories`
--
ALTER TABLE `categories`
  ADD CONSTRAINT `fk_categories_shops` FOREIGN KEY (`shop_id`) REFERENCES `shops` (`shop_id`),
  ADD CONSTRAINT `fk_categories_size_type1` FOREIGN KEY (`size_type_id`) REFERENCES `size_type` (`size_type_id`);

--
-- Constraints for table `cities`
--
ALTER TABLE `cities`
  ADD CONSTRAINT `fk_cities_districts1` FOREIGN KEY (`district_id`) REFERENCES `districts` (`district_id`);

--
-- Constraints for table `colors`
--
ALTER TABLE `colors`
  ADD CONSTRAINT `fk_colors_shops` FOREIGN KEY (`shop_id`) REFERENCES `shops` (`shop_id`);

--
-- Constraints for table `customers`
--
ALTER TABLE `customers`
  ADD CONSTRAINT `customers_ibfk_1` FOREIGN KEY (`shop_id`) REFERENCES `shops` (`shop_id`);

--
-- Constraints for table `customer_addresses`
--
ALTER TABLE `customer_addresses`
  ADD CONSTRAINT `fk_addresses_cities1` FOREIGN KEY (`city_id`) REFERENCES `cities` (`city_id`),
  ADD CONSTRAINT `fk_addresses_customers1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`customer_id`);

--
-- Constraints for table `districts`
--
ALTER TABLE `districts`
  ADD CONSTRAINT `fk_districts_provinces1` FOREIGN KEY (`provinces_id`) REFERENCES `provinces` (`provinces_id`);

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`shop_id`) REFERENCES `shops` (`shop_id`),
  ADD CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`customer_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `orders_ibfk_3` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL;

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `fk_order_items_colors1` FOREIGN KEY (`color_id`) REFERENCES `colors` (`color_id`),
  ADD CONSTRAINT `fk_order_items_sizes1` FOREIGN KEY (`size_id`) REFERENCES `sizes` (`size_id`),
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`);

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `fk_payments_bank_accounts` FOREIGN KEY (`bank_account_id`) REFERENCES `bank_accounts` (`bank_account_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_payments_customers` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`customer_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_payments_orders` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_payments_shops` FOREIGN KEY (`shop_id`) REFERENCES `shops` (`shop_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_payments_users` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL;

--
-- Constraints for table `payment_reconciliation`
--
ALTER TABLE `payment_reconciliation`
  ADD CONSTRAINT `fk_reconciliation_bank_accounts` FOREIGN KEY (`bank_account_id`) REFERENCES `bank_accounts` (`bank_account_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_reconciliation_shops` FOREIGN KEY (`shop_id`) REFERENCES `shops` (`shop_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_reconciliation_users` FOREIGN KEY (`reconciled_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL;

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `fk_products_shops` FOREIGN KEY (`shop_id`) REFERENCES `shops` (`shop_id`),
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`);

--
-- Constraints for table `product_colors`
--
ALTER TABLE `product_colors`
  ADD CONSTRAINT `fk_product_colors_colors1` FOREIGN KEY (`color_id`) REFERENCES `colors` (`color_id`),
  ADD CONSTRAINT `fk_product_colors_products1` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`);

--
-- Constraints for table `product_sizes`
--
ALTER TABLE `product_sizes`
  ADD CONSTRAINT `fk_product_sizes_products1` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`),
  ADD CONSTRAINT `fk_product_sizes_sizes1` FOREIGN KEY (`size_id`) REFERENCES `sizes` (`size_id`);

--
-- Constraints for table `shop_inventory`
--
ALTER TABLE `shop_inventory`
  ADD CONSTRAINT `shop_inventory_ibfk_1` FOREIGN KEY (`shop_id`) REFERENCES `shops` (`shop_id`) ON DELETE CASCADE;

--
-- Constraints for table `shop_product_stock`
--
ALTER TABLE `shop_product_stock`
  ADD CONSTRAINT `fk_shop_product_stock_colors1` FOREIGN KEY (`color_id`) REFERENCES `colors` (`color_id`),
  ADD CONSTRAINT `fk_shop_product_stock_products1` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`),
  ADD CONSTRAINT `fk_shop_product_stock_shops1` FOREIGN KEY (`shop_id`) REFERENCES `shops` (`shop_id`),
  ADD CONSTRAINT `fk_shop_product_stock_sizes1` FOREIGN KEY (`size_id`) REFERENCES `sizes` (`size_id`);

--
-- Constraints for table `sizes`
--
ALTER TABLE `sizes`
  ADD CONSTRAINT `fk_sizes_shops` FOREIGN KEY (`shop_id`) REFERENCES `shops` (`shop_id`),
  ADD CONSTRAINT `fk_sizes_size_type1` FOREIGN KEY (`size_type_id`) REFERENCES `size_type` (`size_type_id`);

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`shop_id`) REFERENCES `shops` (`shop_id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
