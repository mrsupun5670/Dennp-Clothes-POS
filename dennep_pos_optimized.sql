-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Nov 24, 2025 at 04:45 AM
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
-- Database: `u331468302_dennep_pos`
--

-- --------------------------------------------------------

--
-- Table structure for table `activity_log`
--

CREATE TABLE `activity_log` (
  `activity_id` bigint(20) NOT NULL,
  `shop_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `activity_type` enum('order_created','order_updated','payment_recorded','payment_updated','product_sold','inventory_adjusted','login','logout','report_generated') NOT NULL,
  `entity_type` varchar(50) DEFAULT NULL,
  `entity_id` int(11) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `activity_log`
--

INSERT INTO `activity_log` (`activity_id`, `shop_id`, `user_id`, `activity_type`, `entity_type`, `entity_id`, `description`, `metadata`, `created_at`) VALUES
(1, 1, 103, 'order_created', 'order', 16, 'Order ORD-2025-001 created for Sunethra Dias', '{\"customer_id\": 1000, \"total_amount\": 6900.00, \"delivery_charge\": 350.00}', '2025-11-15 10:00:00'),
(2, 1, 103, 'payment_recorded', 'payment', 1, 'Advance payment of Rs. 3000.00 received (cash)', '{\"payment_method\": \"cash\", \"order_id\": 16}', '2025-11-15 10:30:00'),
(3, 1, 103, 'payment_recorded', 'payment', 2, 'Final payment of Rs. 4250.00 received (online transfer)', '{\"payment_method\": \"online_transfer\", \"bank_name\": \"Commercial Bank of Ceylon\"}', '2025-11-24 14:15:00'),
(4, 1, 103, 'order_created', 'order', 17, 'Order ORD-2025-002 created for John Silva', '{\"customer_id\": 1004, \"total_amount\": 3700.00, \"delivery_charge\": 400.00}', '2025-11-18 10:30:00'),
(5, 1, 103, 'payment_recorded', 'payment', 3, 'Advance payment of Rs. 1000.00 received (cash)', '{\"payment_method\": \"cash\", \"order_id\": 17}', '2025-11-18 11:00:00'),
(6, 1, 103, 'order_updated', 'order', 17, 'Order status changed to shipped', '{\"status\": \"shipped\", \"tracking_number\": \"fdvbwgr32\"}', '2025-11-20 09:00:00'),
(7, 2, 102, 'order_created', 'order', 18, 'Order ORD-2025-003 created for Mahesh Gamage', '{\"customer_id\": 1001, \"total_amount\": 9000.00, \"delivery_charge\": 350.00}', '2025-11-20 11:00:00'),
(8, 2, 102, 'payment_recorded', 'payment', 5, 'Partial payment of Rs. 5000.00 received (online transfer)', '{\"payment_method\": \"online_transfer\", \"bank_name\": \"Commercial Bank of Ceylon\"}', '2025-11-21 09:00:00'),
(9, 1, 103, 'order_created', 'order', 19, 'Order ORD-2025-004 created for Priya Seneviratne (COD)', '{\"customer_id\": 1002, \"total_amount\": 3000.00, \"delivery_charge\": 350.00}', '2025-11-21 14:00:00'),
(10, 1, 101, 'order_created', 'order', 20, 'Order ORD-2025-005 created for Walk-in Customer (bulk)', '{\"customer_id\": 1003, \"total_amount\": 8700.00, \"delivery_charge\": 350.00}', '2025-11-19 13:00:00'),
(11, 1, 101, 'order_updated', 'order', 20, 'Order status changed to delivered', '{\"status\": \"delivered\", \"tracking_number\": \"besrg\"}', '2025-11-22 10:00:00'),
(12, 1, 103, 'order_created', 'order', 21, 'Order ORD-2025-006 created for Sunethra Dias (gift order)', '{\"customer_id\": 1000, \"total_amount\": 1800.00, \"delivery_charge\": 300.00}', '2025-11-22 13:30:00'),
(13, 2, 102, 'order_created', 'order', 22, 'Order ORD-2025-007 created for Mahesh Gamage (accessories)', '{\"customer_id\": 1001, \"total_amount\": 1000.00, \"delivery_charge\": 500.00}', '2025-11-17 10:00:00'),
(14, 2, 102, 'order_updated', 'order', 22, 'Order status changed to delivered', '{\"status\": \"delivered\", \"tracking_number\": \"rwegrgh34\"}', '2025-11-22 14:00:00'),
(15, 1, 101, 'product_sold', 'order_item', 31, 'Sold 2x Premium Cotton Crew Tee (Black, Size M) for ORD-2025-001', '{\"product_id\": 1001, \"quantity\": 2, \"price\": 2500.00}', '2025-11-15 10:00:00'),
(16, 1, 101, 'product_sold', 'order_item', 32, 'Sold 1x Kids Elastic Trousers (Red, Size 3T) for ORD-2025-001', '{\"product_id\": 1003, \"quantity\": 1, \"price\": 1800.00}', '2025-11-15 10:00:00'),
(17, 1, 103, 'inventory_adjusted', 'product', 1001, 'Stock adjusted for order ORD-2025-001', '{\"product_id\": 1001, \"quantity_before\": 50, \"quantity_after\": 48}', '2025-11-15 10:00:00'),
(18, 2, 102, 'inventory_adjusted', 'product', 1004, 'Stock adjusted for order ORD-2025-003', '{\"product_id\": 1004, \"quantity_before\": 15, \"quantity_after\": 14}', '2025-11-20 11:00:00'),
(19, 1, 103, 'login', 'user', 103, 'Cashier Chathuri logged in', '{\"ip\": \"192.168.1.100\", \"user_agent\": \"Mozilla/5.0...\"}', '2025-11-24 08:00:00'),
(20, 1, 101, 'login', 'user', 101, 'Admin Khan logged in', '{\"ip\": \"192.168.1.101\", \"user_agent\": \"Mozilla/5.0...\"}', '2025-11-24 08:15:00'),
(21, 1, 101, 'report_generated', 'report', 1, 'Daily sales report generated', '{\"date\": \"2025-11-24\", \"total_orders\": 5, \"total_sales\": 22150.00}', '2025-11-24 17:30:00'),
(22, 2, 102, 'report_generated', 'report', 2, 'Daily sales report generated', '{\"date\": \"2025-11-24\", \"total_orders\": 2, \"total_sales\": 10350.00}', '2025-11-24 17:30:00');

-- --------------------------------------------------------

--
-- Table structure for table `audit_log`
--

CREATE TABLE `audit_log` (
  `audit_id` bigint(20) NOT NULL,
  `shop_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `table_name` varchar(100) NOT NULL,
  `record_id` int(11) DEFAULT NULL,
  `action` enum('INSERT','UPDATE','DELETE','LOGIN','LOGOUT') NOT NULL,
  `old_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`old_values`)),
  `new_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`new_values`)),
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` varchar(255) DEFAULT NULL,
  `changes_description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `audit_log`
--

INSERT INTO `audit_log` (`audit_id`, `shop_id`, `user_id`, `table_name`, `record_id`, `action`, `old_values`, `new_values`, `ip_address`, `user_agent`, `changes_description`, `created_at`) VALUES
(1, 1, 103, 'payments', 1, 'INSERT', NULL, '{\"payment_id\": 1, \"order_id\": 16, \"payment_amount\": 3000.00, \"payment_method\": \"cash\"}', '192.168.1.100', 'Mozilla/5.0', 'Payment record created', '2025-11-15 10:30:00'),
(2, 1, 103, 'payments', 2, 'INSERT', NULL, '{\"payment_id\": 2, \"order_id\": 16, \"payment_amount\": 4250.00, \"payment_method\": \"online_transfer\"}', '192.168.1.100', 'Mozilla/5.0', 'Payment record created', '2025-11-24 14:15:00'),
(3, 1, 103, 'orders', 17, 'UPDATE', '{\"order_status\": \"pending\"}', '{\"order_status\": \"shipped\", \"tracking_number\": \"fdvbwgr32\"}', '192.168.1.100', 'Mozilla/5.0', 'Order marked as shipped', '2025-11-20 09:00:00'),
(4, 1, 101, 'orders', 20, 'UPDATE', '{\"order_status\": \"pending\"}', '{\"order_status\": \"delivered\"}', '192.168.1.101', 'Mozilla/5.0', 'Order marked as delivered', '2025-11-22 10:00:00'),
(5, 2, 102, 'orders', 22, 'UPDATE', '{\"order_status\": \"pending\"}', '{\"order_status\": \"delivered\"}', '192.168.1.102', 'Mozilla/5.0', 'Order marked as delivered', '2025-11-22 14:00:00'),
(6, 1, 103, 'bank_accounts', 1, 'INSERT', NULL, '{\"bank_account_id\": 1, \"bank_name\": \"Commercial Bank\", \"account_number\": \"ACC-1001-2024\"}', '192.168.1.100', 'Mozilla/5.0', 'Bank account added', '2025-11-24 04:26:21'),
(7, 1, 103, 'bank_accounts', 2, 'INSERT', NULL, '{\"bank_account_id\": 2, \"bank_name\": \"Hatton National Bank\", \"account_number\": \"HNB-1002-2024\"}', '192.168.1.100', 'Mozilla/5.0', 'Bank account added', '2025-11-24 04:26:21'),
(8, 2, 102, 'bank_accounts', 3, 'INSERT', NULL, '{\"bank_account_id\": 3, \"bank_name\": \"Commercial Bank\", \"account_number\": \"ACC-2001-2024\"}', '192.168.1.102', 'Mozilla/5.0', 'Bank account added', '2025-11-24 04:26:21'),
(9, 1, 103, 'payments', 6, 'INSERT', NULL, '{\"payment_id\": 6, \"order_id\": 19, \"payment_status\": \"pending\"}', '192.168.1.100', 'Mozilla/5.0', 'COD payment created (pending)', '2025-11-24 16:20:00'),
(10, 1, 103, 'payment_reconciliation', 1, 'INSERT', NULL, '{\"reconciliation_id\": 1, \"bank_account_id\": 1, \"reconciliation_status\": \"reconciled\"}', '192.168.1.100', 'Mozilla/5.0', 'Bank reconciliation completed', '2025-11-24 17:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `bank_accounts`
--

CREATE TABLE `bank_accounts` (
  `bank_account_id` int(11) NOT NULL,
  `shop_id` int(11) NOT NULL,
  `bank_name` varchar(100) NOT NULL,
  `branch_name` varchar(100) DEFAULT NULL,
  `account_number` varchar(50) NOT NULL,
  `account_holder_name` varchar(100) NOT NULL,
  `account_type` enum('checking','savings','business') NOT NULL DEFAULT 'business',
  `ifsc_code` varchar(20) DEFAULT NULL,
  `initial_balance` decimal(12,2) NOT NULL DEFAULT 0.00,
  `current_balance` decimal(12,2) NOT NULL DEFAULT 0.00,
  `status` enum('active','inactive','closed') NOT NULL DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `bank_accounts`
--

INSERT INTO `bank_accounts` (`bank_account_id`, `shop_id`, `bank_name`, `branch_name`, `account_number`, `account_holder_name`, `account_type`, `ifsc_code`, `initial_balance`, `current_balance`, `status`, `created_at`, `updated_at`) VALUES
(1, 1, 'Commercial Bank of Ceylon', 'Colombo Main', 'ACC-1001-2024', 'Aisha Khan', 'business', 'CBCE0000001', 150000.00, 142500.00, 'active', '2025-11-24 04:26:21', '2025-11-24 04:28:18'),
(2, 1, 'Hatton National Bank', 'Colombo Fort', 'HNB-1002-2024', 'Aisha Khan', 'business', 'HATF0000001', 100000.00, 98750.00, 'active', '2025-11-24 04:26:21', '2025-11-24 04:28:18'),
(3, 1, 'Commercial Bank of Ceylon', 'Kandy Central', 'ACC-2001-2024', 'Nimal Perera', 'business', 'CBCE0000002', 80000.00, 77350.00, 'active', '2025-11-24 04:26:21', '2025-11-24 04:44:33'),
(4, 2, 'DFCC Bank', 'Kandy Branch', 'DFCC-2002-2024', 'Nimal Perera', 'savings', 'DFCC0000002', 50000.00, 49500.00, 'active', '2025-11-24 04:26:21', '2025-11-24 04:28:18'),
(5, 3, 'Peoples Bank', 'Galle Fort', 'PB-3001-2024', 'Kamala Silva', 'business', 'PBKK0000001', 60000.00, 59350.00, 'active', '2025-11-24 04:26:21', '2025-11-24 04:28:18'),
(6, 4, 'Commercial Bank of Ceylon', 'Jaffna Main', 'ACC-4001-2024', 'Ravi Shankar', 'business', 'CBCE0000003', 75000.00, 74000.00, 'active', '2025-11-24 04:26:21', '2025-11-24 04:28:18'),
(7, 5, 'Hatton National Bank', 'Biyagama', 'HNB-5001-2024', 'Sunil Fernando', 'business', 'HATF0000002', 120000.00, 118500.00, 'active', '2025-11-24 04:26:21', '2025-11-24 04:28:18');

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `category_id` int(11) NOT NULL,
  `shop_id` int(11) NOT NULL,
  `category_name` varchar(100) NOT NULL,
  `size_type_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`category_id`, `shop_id`, `category_name`, `size_type_id`, `created_at`, `updated_at`) VALUES
(1, 1, 'Men_T-Shirts', 1, '2025-11-24 04:26:21', '2025-11-24 04:26:21'),
(2, 1, 'Women_Jeans', 2, '2025-11-24 04:26:21', '2025-11-24 04:26:21'),
(3, 1, 'Kids_Trousers', 3, '2025-11-24 04:26:21', '2025-11-24 04:26:21'),
(4, 1, 'Footwear', 2, '2025-11-24 04:26:21', '2025-11-24 04:26:21'),
(5, 1, 'Accessories', 1, '2025-11-24 04:26:21', '2025-11-24 04:26:21');

-- --------------------------------------------------------

--
-- Table structure for table `cities`
--

CREATE TABLE `cities` (
  `city_id` int(11) NOT NULL,
  `city_name` varchar(100) NOT NULL,
  `district_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `colors`
--

CREATE TABLE `colors` (
  `color_id` int(11) NOT NULL,
  `shop_id` int(11) NOT NULL,
  `color_name` varchar(50) NOT NULL,
  `hex_code` varchar(7) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `colors`
--

INSERT INTO `colors` (`color_id`, `shop_id`, `color_name`, `hex_code`, `created_at`, `updated_at`) VALUES
(1, 1, 'Black', '#000000', '2025-11-24 04:26:21', '2025-11-24 04:26:21'),
(2, 1, 'White', '#FFFFFF', '2025-11-24 04:26:21', '2025-11-24 04:26:21'),
(3, 1, 'Navy Blue', '#000080', '2025-11-24 04:26:21', '2025-11-24 04:26:21'),
(4, 1, 'Red', '#FF0000', '2025-11-24 04:26:21', '2025-11-24 04:26:21'),
(5, 1, 'Grey', '#808080', '2025-11-24 04:26:21', '2025-11-24 04:26:21'),
(6, 1, 'N/A', NULL, '2025-11-24 04:26:21', '2025-11-24 04:26:21');

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

CREATE TABLE `customers` (
  `customer_id` int(11) NOT NULL,
  `shop_id` int(11) NOT NULL,
  `mobile` varchar(20) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `customer_name` varchar(100) DEFAULT NULL,
  `orders_count` int(11) NOT NULL DEFAULT 0,
  `total_spent` decimal(12,2) NOT NULL DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `customers`
--

INSERT INTO `customers` (`customer_id`, `shop_id`, `mobile`, `email`, `customer_name`, `orders_count`, `total_spent`, `created_at`, `updated_at`) VALUES
(1000, 1, '0771234567', 'sunethra.d@mail.com', 'Sunethra Dias', 2, 15000.00, '2025-11-24 04:26:21', '2025-11-24 04:26:21'),
(1001, 2, '0719876543', 'mahesh.g@mail.com', 'Mahesh Gamage', 1, 6500.00, '2025-11-24 04:26:21', '2025-11-24 04:26:21'),
(1002, 1, '0754567890', 'priya.s@mail.com', 'Priya Seneviratne', 0, 0.00, '2025-11-24 04:26:21', '2025-11-24 04:26:21'),
(1003, 3, '0770001112', NULL, 'Walk-in Customer', 3, 30000.00, '2025-11-24 04:26:21', '2025-11-24 04:26:21'),
(1004, 1, '0772010915', 'walkin@customer.com', 'John Silva', 1, 5000.00, '2025-11-24 04:26:21', '2025-11-24 04:26:21');

-- --------------------------------------------------------

--
-- Table structure for table `districts`
--

CREATE TABLE `districts` (
  `district_id` int(11) NOT NULL,
  `district_name` varchar(100) NOT NULL,
  `province_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `order_id` int(11) NOT NULL,
  `shop_id` int(11) NOT NULL,
  `order_number` varchar(50) NOT NULL,
  `customer_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `total_items` int(11) NOT NULL DEFAULT 0,
  `order_status` enum('pending','processing','shipped','delivered','cancelled') NOT NULL DEFAULT 'pending',
  `total_amount` decimal(12,2) NOT NULL,
  `delivery_charge` decimal(12,2) DEFAULT 0.00,
  `final_amount` decimal(12,2) NOT NULL,
  `advance_paid` decimal(12,2) DEFAULT 0.00,
  `balance_due` decimal(12,2) DEFAULT 0.00,
  `payment_status` enum('unpaid','partial','fully_paid') NOT NULL DEFAULT 'unpaid',
  `notes` text DEFAULT NULL,
  `order_date` date NOT NULL,
  `delivery_line1` varchar(200) NOT NULL,
  `delivery_line2` varchar(200) DEFAULT NULL,
  `delivery_postal_code` varchar(20) DEFAULT NULL,
  `delivery_city` varchar(100) NOT NULL,
  `delivery_district` varchar(100) NOT NULL,
  `delivery_province` varchar(100) NOT NULL,
  `recipient_name` varchar(100) NOT NULL,
  `recipient_phone` varchar(20) NOT NULL,
  `tracking_number` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`order_id`, `shop_id`, `order_number`, `customer_id`, `user_id`, `total_items`, `order_status`, `total_amount`, `delivery_charge`, `final_amount`, `advance_paid`, `balance_due`, `payment_status`, `notes`, `order_date`, `delivery_line1`, `delivery_line2`, `delivery_postal_code`, `delivery_city`, `delivery_district`, `delivery_province`, `recipient_name`, `recipient_phone`, `tracking_number`, `created_at`, `updated_at`) VALUES
(16, 1, 'ORD-2025-001', 1000, 103, 3, 'pending', 6900.00, 350.00, 7250.00, 3000.00, 4250.00, 'partial', 'Regular customer, fast delivery requested', '2025-11-15', '45 Galle Road', 'Mount Lavinia', '10370', 'Colombo', 'Colombo', 'Western', 'Sunethra Dias', '0771234567', NULL, '2025-11-24 04:28:18', '2025-11-24 04:28:18'),
(17, 1, 'ORD-2025-002', 1004, 101, 2, 'shipped', 3700.00, 400.00, 4100.00, 1000.00, 3100.00, 'partial', 'Customer will pay remaining balance on delivery', '2025-11-18', '123 Main Street', 'Wellawatte', '10600', 'Colombo', 'Colombo', 'Western', 'John Silva', '0772010915', 'fdvbwgr32', '2025-11-24 04:28:18', '2025-11-24 04:28:18'),
(18, 2, 'ORD-2025-003', 1001, 102, 1, 'shipped', 9000.00, 350.00, 9350.00, 0.00, 9350.00, 'unpaid', 'Online payment completed', '2025-11-20', '78 Peradeniya Road', 'Kandy', '20000', 'Kandy', 'Kandy', 'Central', 'Mahesh Gamage', '0719876543', '35fgvxfcvb', '2025-11-24 04:28:18', '2025-11-24 04:28:18'),
(19, 1, 'ORD-2025-004', 1002, 103, 2, 'pending', 3000.00, 350.00, 3350.00, 0.00, 3350.00, 'unpaid', 'Cash on delivery', '2025-11-21', '56 Nawala Road', 'Rajagiriya', '10107', 'Colombo', 'Colombo', 'Western', 'Priya Seneviratne', '0754567890', NULL, '2025-11-24 04:28:18', '2025-11-24 04:28:18'),
(20, 1, 'ORD-2025-005', 1003, 101, 4, 'delivered', 8700.00, 350.00, 9050.00, 8700.00, 350.00, 'partial', 'Bulk order with discount applied', '2025-11-19', '12 Fort Road', 'Galle Fort', '80000', 'Galle', 'Galle', 'Southern', 'Customer Name', '0770001112', 'besrg', '2025-11-24 04:28:18', '2025-11-24 04:28:18'),
(21, 1, 'ORD-2025-006', 1000, 103, 1, 'processing', 1800.00, 300.00, 2100.00, 1800.00, 300.00, 'partial', 'Gift for nephew', '2025-11-22', '45 Galle Road', 'Mount Lavinia', '10370', 'Colombo', 'Colombo', 'Western', 'Sunethra Dias', '0771234567', NULL, '2025-11-24 04:28:18', '2025-11-24 04:28:18'),
(22, 2, 'ORD-2025-007', 1001, 102, 2, 'delivered', 1000.00, 500.00, 1500.00, 500.00, 1000.00, 'partial', 'Small accessories order', '2025-11-17', '78 Peradeniya Road', 'Kandy', '20000', 'Kandy', 'Kandy', 'Central', 'Mahesh Gamage', '0719876543', 'rwegrgh34', '2025-11-24 04:28:18', '2025-11-24 04:28:18');

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
  `sold_price` decimal(12,2) NOT NULL,
  `total_price` decimal(12,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`item_id`, `order_id`, `product_id`, `color_id`, `size_id`, `quantity`, `sold_price`, `total_price`, `created_at`) VALUES
(31, 16, 1001, 1, 2, 2, 2500.00, 5000.00, '2025-11-24 04:28:18'),
(32, 16, 1003, 4, 6, 1, 1800.00, 1800.00, '2025-11-24 04:28:18'),
(33, 16, 1005, 3, 1, 1, 100.00, 100.00, '2025-11-24 04:28:18'),
(34, 17, 1001, 2, 1, 1, 2500.00, 2500.00, '2025-11-24 04:28:18'),
(35, 17, 1006, 1, 2, 1, 1200.00, 1200.00, '2025-11-24 04:28:18'),
(36, 18, 1004, 1, 7, 1, 9000.00, 9000.00, '2025-11-24 04:28:18'),
(37, 19, 1003, 1, 6, 1, 1800.00, 1800.00, '2025-11-24 04:28:18'),
(38, 19, 1006, 6, 8, 1, 1200.00, 1200.00, '2025-11-24 04:28:18'),
(39, 20, 1001, 3, 3, 2, 2400.00, 4800.00, '2025-11-24 04:28:18'),
(40, 20, 1001, 1, 1, 1, 2300.00, 2300.00, '2025-11-24 04:28:18'),
(41, 20, 1005, 3, 1, 1, 1100.00, 1100.00, '2025-11-24 04:28:18'),
(42, 20, 1006, 4, 1, 1, 500.00, 500.00, '2025-11-24 04:28:18'),
(43, 21, 1003, 1, 6, 1, 1800.00, 1800.00, '2025-11-24 04:28:18'),
(44, 22, 1007, 1, 4, 1, 500.00, 500.00, '2025-11-24 04:28:18'),
(45, 22, 1007, 5, 5, 1, 500.00, 500.00, '2025-11-24 04:28:18');

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `payment_id` int(11) NOT NULL,
  `shop_id` int(11) NOT NULL,
  `order_id` int(11) DEFAULT NULL,
  `customer_id` int(11) DEFAULT NULL,
  `payment_amount` decimal(12,2) NOT NULL,
  `payment_date` date NOT NULL,
  `payment_time` time DEFAULT NULL,
  `payment_method` enum('cash','online_transfer','bank_deposit') NOT NULL DEFAULT 'cash',
  `bank_name` varchar(100) DEFAULT NULL,
  `branch_name` varchar(100) DEFAULT NULL,
  `bank_account_id` int(11) DEFAULT NULL,
  `transaction_id` varchar(100) DEFAULT NULL,
  `payment_status` enum('completed','pending','failed','refunded') NOT NULL DEFAULT 'completed',
  `notes` text DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `payments`
--

INSERT INTO `payments` (`payment_id`, `shop_id`, `order_id`, `customer_id`, `payment_amount`, `payment_date`, `payment_time`, `payment_method`, `bank_name`, `branch_name`, `bank_account_id`, `transaction_id`, `payment_status`, `notes`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 1, 16, 1000, 3000.00, '2025-11-15', '10:30:00', 'cash', NULL, NULL, NULL, NULL, 'completed', 'Advance payment received', 103, '2025-11-15 10:30:00', '2025-11-15 10:30:00'),
(2, 1, 16, 1000, 4250.00, '2025-11-24', '14:15:00', 'online_transfer', 'Commercial Bank of Ceylon', 'Colombo Main', 1, 'TXN-20251124-001', 'completed', 'Final payment via online transfer', 103, '2025-11-24 14:15:00', '2025-11-24 14:15:00'),
(3, 1, 17, 1004, 1000.00, '2025-11-18', '11:00:00', 'cash', NULL, NULL, NULL, NULL, 'completed', 'Advance payment at order', 103, '2025-11-18 11:00:00', '2025-11-18 11:00:00'),
(4, 1, 17, 1004, 3100.00, '2025-11-22', '15:45:00', 'bank_deposit', 'Hatton National Bank', 'Colombo Fort', 2, 'DEP-20251122-001', 'completed', 'Balance paid via cheque deposit', 103, '2025-11-22 15:45:00', '2025-11-22 15:45:00'),
(5, 2, 18, 1001, 5000.00, '2025-11-21', '09:00:00', 'online_transfer', 'Commercial Bank of Ceylon', 'Kandy Central', 3, 'TXN-20251121-001', 'completed', 'Partial payment received', 102, '2025-11-21 09:00:00', '2025-11-21 09:00:00'),
(6, 1, 19, 1002, 3350.00, '2025-11-24', '16:20:00', 'cash', NULL, NULL, NULL, NULL, 'pending', 'Awaiting delivery', 103, '2025-11-24 16:20:00', '2025-11-24 16:20:00'),
(7, 1, 20, 1003, 8700.00, '2025-11-19', '13:30:00', 'cash', NULL, NULL, NULL, NULL, 'completed', 'Bulk order advance', 101, '2025-11-19 13:30:00', '2025-11-19 13:30:00'),
(8, 1, 20, 1003, 350.00, '2025-11-24', '10:00:00', 'cash', NULL, NULL, NULL, NULL, 'completed', 'Remaining balance', 101, '2025-11-24 10:00:00', '2025-11-24 10:00:00'),
(9, 1, 21, 1000, 1800.00, '2025-11-22', '14:00:00', 'cash', NULL, NULL, NULL, NULL, 'completed', 'Advance for gift order', 103, '2025-11-22 14:00:00', '2025-11-22 14:00:00'),
(10, 1, 21, 1000, 300.00, '2025-11-24', '11:30:00', 'cash', NULL, NULL, NULL, NULL, 'completed', 'Balance payment', 103, '2025-11-24 11:30:00', '2025-11-24 11:30:00'),
(11, 2, 22, 1001, 500.00, '2025-11-17', '10:15:00', 'cash', NULL, NULL, NULL, NULL, 'completed', 'Advance for accessories', 102, '2025-11-17 10:15:00', '2025-11-17 10:15:00'),
(12, 2, 22, 1001, 1000.00, '2025-11-24', '12:00:00', 'online_transfer', 'DFCC Bank', 'Kandy Branch', 4, 'TXN-20251124-002', 'completed', 'Final payment', 102, '2025-11-24 12:00:00', '2025-11-24 12:00:00'),
(13, 1, NULL, 1000, 5000.00, '2025-11-20', '09:30:00', 'cash', NULL, NULL, NULL, NULL, 'completed', 'General deposit from Sunethra Dias', 101, '2025-11-20 09:30:00', '2025-11-20 09:30:00'),
(14, 3, NULL, 1003, 2000.00, '2025-11-23', '14:45:00', 'bank_deposit', 'Peoples Bank', 'Galle Fort', 5, 'DEP-20251123-001', 'completed', 'Deposit from walk-in customer', 104, '2025-11-23 14:45:00', '2025-11-23 14:45:00');

-- --------------------------------------------------------

--
-- Table structure for table `payment_reconciliation`
--

CREATE TABLE `payment_reconciliation` (
  `reconciliation_id` int(11) NOT NULL,
  `shop_id` int(11) NOT NULL,
  `bank_account_id` int(11) NOT NULL,
  `bank_statement_date` date NOT NULL,
  `bank_balance` decimal(12,2) NOT NULL,
  `system_balance` decimal(12,2) NOT NULL,
  `variance` decimal(12,2) DEFAULT 0.00,
  `reconciliation_status` enum('pending','reconciled','unreconciled') NOT NULL DEFAULT 'pending',
  `notes` text DEFAULT NULL,
  `reconciled_by` int(11) DEFAULT NULL,
  `reconciled_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `payment_reconciliation`
--

INSERT INTO `payment_reconciliation` (`reconciliation_id`, `shop_id`, `bank_account_id`, `bank_statement_date`, `bank_balance`, `system_balance`, `variance`, `reconciliation_status`, `notes`, `reconciled_by`, `reconciled_at`, `created_at`, `updated_at`) VALUES
(1, 1, 1, '2025-11-24', 142500.00, 142500.00, 0.00, 'reconciled', 'All transactions matched perfectly', 103, '2025-11-24 17:00:00', '2025-11-24 04:26:21', '2025-11-24 17:00:00'),
(2, 1, 2, '2025-11-24', 98750.00, 98750.00, 0.00, 'reconciled', 'Bank balance verified', 103, '2025-11-24 17:00:00', '2025-11-24 04:26:21', '2025-11-24 17:00:00'),
(3, 2, 3, '2025-11-24', 77350.00, 77350.00, 0.00, 'reconciled', 'Kandy branch reconciliation complete', 102, '2025-11-24 16:30:00', '2025-11-24 04:26:21', '2025-11-24 16:30:00'),
(4, 2, 4, '2025-11-24', 49500.00, 49500.00, 0.00, 'reconciled', 'Savings account verified', 102, '2025-11-24 16:30:00', '2025-11-24 04:26:21', '2025-11-24 16:30:00'),
(5, 3, 5, '2025-11-24', 59350.00, 59350.00, 0.00, 'reconciled', 'Galle branch reconciliation done', 104, '2025-11-24 16:00:00', '2025-11-24 04:26:21', '2025-11-24 16:00:00'),
(6, 4, 6, '2025-11-24', 74000.00, 74000.00, 0.00, 'pending', 'Awaiting bank statement', 104, NULL, '2025-11-24 04:26:21', '2025-11-24 04:26:21'),
(7, 5, 7, '2025-11-24', 118500.00, 118500.00, 0.00, 'reconciled', 'Warehouse outlet reconciliation complete', 105, '2025-11-24 15:30:00', '2025-11-24 04:26:21', '2025-11-24 15:30:00');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `product_id` int(11) NOT NULL,
  `shop_id` int(11) NOT NULL,
  `sku` varchar(50) NOT NULL,
  `product_name` varchar(150) NOT NULL,
  `category_id` int(11) NOT NULL,
  `description` text DEFAULT NULL,
  `retail_price` decimal(12,2) NOT NULL,
  `wholesale_price` decimal(12,2) DEFAULT NULL,
  `product_cost` decimal(12,2) NOT NULL DEFAULT 0.00,
  `print_cost` decimal(12,2) NOT NULL DEFAULT 0.00,
  `product_status` enum('active','inactive','discontinued') NOT NULL DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`product_id`, `shop_id`, `sku`, `product_name`, `category_id`, `description`, `retail_price`, `wholesale_price`, `product_cost`, `print_cost`, `product_status`, `created_at`, `updated_at`) VALUES
(1001, 1, 'TSHIRT001', 'Premium Cotton Crew Tee', 1, '', 2500.00, 1500.00, 0.00, 30.00, 'active', '2025-11-24 04:26:21', '2025-11-24 04:26:21'),
(1002, 3, 'WJNS002', 'High-Waist Skinny Jean', 1, '', 6500.00, 4000.00, 500.00, 20.00, 'active', '2025-11-24 04:26:21', '2025-11-24 04:26:21'),
(1003, 1, 'KTR001', 'Kids Elastic Trousers', 1, '', 1800.00, 1000.00, 0.00, 33.00, 'active', '2025-11-24 04:26:21', '2025-11-24 04:26:21'),
(1004, 2, 'SHOE001', 'Leather Formal Shoes', 4, 'Classic lace-up shoes.', 9000.00, 5500.00, 0.00, 0.00, 'active', '2025-11-24 04:26:21', '2025-11-24 04:26:21'),
(1005, 1, 'ACC001', 'Sports Cap', 5, 'Adjustable sports cap.', 1200.00, 700.00, 0.00, 0.00, 'active', '2025-11-24 04:26:21', '2025-11-24 04:26:21'),
(1006, 1, 'Test-001', 'Test tshirt', 1, '', 1200.00, 1000.00, 0.00, 30.00, 'active', '2025-11-24 04:26:21', '2025-11-24 04:26:21'),
(1007, 2, 'Test-002', 'dgfss', 1, '', 500.00, 200.00, 0.00, 10.00, 'active', '2025-11-24 04:26:21', '2025-11-24 04:26:21');

-- --------------------------------------------------------

--
-- Table structure for table `product_colors`
--

CREATE TABLE `product_colors` (
  `product_color_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `color_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `product_colors`
--

INSERT INTO `product_colors` (`product_color_id`, `product_id`, `color_id`, `created_at`) VALUES
(1, 1001, 1, '2025-11-24 04:26:21'),
(2, 1001, 2, '2025-11-24 04:26:21'),
(3, 1001, 3, '2025-11-24 04:26:21'),
(4, 1002, 3, '2025-11-24 04:26:21'),
(5, 1002, 5, '2025-11-24 04:26:21'),
(6, 1003, 1, '2025-11-24 04:26:21'),
(7, 1003, 4, '2025-11-24 04:26:21'),
(8, 1004, 1, '2025-11-24 04:26:21'),
(9, 1005, 3, '2025-11-24 04:26:21'),
(10, 1006, 1, '2025-11-24 04:26:21'),
(11, 1006, 4, '2025-11-24 04:26:21'),
(12, 1006, 6, '2025-11-24 04:26:21'),
(13, 1007, 1, '2025-11-24 04:26:21'),
(14, 1007, 5, '2025-11-24 04:26:21');

-- --------------------------------------------------------

--
-- Table structure for table `product_sizes`
--

CREATE TABLE `product_sizes` (
  `product_size_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `size_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `product_sizes`
--

INSERT INTO `product_sizes` (`product_size_id`, `product_id`, `size_id`, `created_at`) VALUES
(1, 1001, 1, '2025-11-24 04:26:21'),
(2, 1001, 2, '2025-11-24 04:26:21'),
(3, 1001, 3, '2025-11-24 04:26:21'),
(4, 1002, 4, '2025-11-24 04:26:21'),
(5, 1002, 5, '2025-11-24 04:26:21'),
(6, 1003, 6, '2025-11-24 04:26:21'),
(7, 1004, 7, '2025-11-24 04:26:21'),
(8, 1005, 1, '2025-11-24 04:26:21'),
(9, 1006, 1, '2025-11-24 04:26:21'),
(10, 1006, 2, '2025-11-24 04:26:21'),
(11, 1006, 8, '2025-11-24 04:26:21'),
(12, 1007, 4, '2025-11-24 04:26:21'),
(13, 1007, 5, '2025-11-24 04:26:21');

-- --------------------------------------------------------

--
-- Table structure for table `provinces`
--

CREATE TABLE `provinces` (
  `province_id` int(11) NOT NULL,
  `province_name` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `shops`
--

CREATE TABLE `shops` (
  `shop_id` int(11) NOT NULL,
  `shop_name` varchar(100) NOT NULL,
  `shop_status` enum('active','inactive','closed') NOT NULL DEFAULT 'active',
  `opening_date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `shops`
--

INSERT INTO `shops` (`shop_id`, `shop_name`, `shop_status`, `opening_date`, `created_at`, `updated_at`) VALUES
(1, 'Colombo Flagship', 'active', '2023-01-15', '2025-11-24 04:22:26', '2025-11-24 04:22:26'),
(2, 'Kandy Boutique', 'active', '2023-05-20', '2025-11-24 04:22:26', '2025-11-24 04:22:26'),
(3, 'Galle Outpost', 'inactive', '2023-11-01', '2025-11-24 04:22:26', '2025-11-24 04:22:26'),
(4, 'Jaffna Store', 'active', '2024-03-10', '2025-11-24 04:22:26', '2025-11-24 04:22:26'),
(5, 'Warehouse Outlet', 'active', '2024-06-01', '2025-11-24 04:22:26', '2025-11-24 04:22:26');

-- --------------------------------------------------------

--
-- Table structure for table `shop_inventory`
--

CREATE TABLE `shop_inventory` (
  `inventory_id` int(11) NOT NULL,
  `shop_id` int(11) NOT NULL,
  `item_name` varchar(255) NOT NULL,
  `quantity_in_stock` int(11) NOT NULL DEFAULT 0,
  `unit_cost` decimal(12,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `shop_inventory`
--

INSERT INTO `shop_inventory` (`inventory_id`, `shop_id`, `item_name`, `quantity_in_stock`, `unit_cost`, `created_at`, `updated_at`) VALUES
(1, 1, 'POS Thermal Paper Roll', 50, 150.00, '2025-11-24 04:26:21', '2025-11-24 04:26:21'),
(2, 1, 'Shopping Bags (Large)', 200, 25.00, '2025-11-24 04:26:21', '2025-11-24 04:26:21'),
(3, 2, 'POS Thermal Paper Roll', 30, 150.00, '2025-11-24 04:26:21', '2025-11-24 04:26:21'),
(4, 4, 'Security Tags', 1000, 8.50, '2025-11-24 04:26:21', '2025-11-24 04:26:21'),
(5, 5, 'Moving Boxes', 50, 250.00, '2025-11-24 04:26:21', '2025-11-24 04:26:21');

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
  `stock_qty` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `shop_product_stock`
--

INSERT INTO `shop_product_stock` (`stock_id`, `shop_id`, `product_id`, `size_id`, `color_id`, `stock_qty`, `created_at`, `updated_at`) VALUES
(1, 1, 1001, 1, 1, 50, '2025-11-24 04:26:21', '2025-11-24 04:26:21'),
(2, 1, 1001, 2, 2, 45, '2025-11-24 04:26:21', '2025-11-24 04:26:21'),
(3, 1, 1002, 4, 3, 30, '2025-11-24 04:26:21', '2025-11-24 04:26:21'),
(4, 1, 1003, 6, 4, 20, '2025-11-24 04:26:21', '2025-11-24 04:26:21'),
(5, 1, 1004, 7, 1, 15, '2025-11-24 04:26:21', '2025-11-24 04:26:21'),
(6, 2, 1001, 3, 3, 40, '2025-11-24 04:26:21', '2025-11-24 04:26:21'),
(7, 2, 1002, 5, 5, 25, '2025-11-24 04:26:21', '2025-11-24 04:26:21'),
(8, 1, 1001, 3, 1, 15, '2025-11-24 04:26:21', '2025-11-24 04:26:21'),
(9, 1, 1007, 5, 5, 40, '2025-11-24 04:26:21', '2025-11-24 04:26:21'),
(10, 1, 1007, 4, 1, 10, '2025-11-24 04:26:21', '2025-11-24 04:26:21'),
(11, 1, 1007, 5, 1, 10, '2025-11-24 04:26:21', '2025-11-24 04:26:21'),
(12, 1, 1007, 4, 5, 10, '2025-11-24 04:26:21', '2025-11-24 04:26:21'),
(13, 1, 1006, 2, 1, 1, '2025-11-24 04:26:21', '2025-11-24 04:26:21'),
(14, 1, 1003, 6, 1, 10, '2025-11-24 04:26:21', '2025-11-24 04:26:21'),
(15, 1, 1002, 4, 5, 14, '2025-11-24 04:26:21', '2025-11-24 04:26:21'),
(16, 1, 1002, 5, 5, 14, '2025-11-24 04:26:21', '2025-11-24 04:26:21');

-- --------------------------------------------------------

--
-- Table structure for table `sizes`
--

CREATE TABLE `sizes` (
  `size_id` int(11) NOT NULL,
  `shop_id` int(11) NOT NULL,
  `size_name` varchar(20) NOT NULL,
  `size_type_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sizes`
--

INSERT INTO `sizes` (`size_id`, `shop_id`, `size_name`, `size_type_id`, `created_at`, `updated_at`) VALUES
(1, 1, 'S', 1, '2025-11-24 04:26:21', '2025-11-24 04:26:21'),
(2, 1, 'M', 1, '2025-11-24 04:26:21', '2025-11-24 04:26:21'),
(3, 1, 'L', 1, '2025-11-24 04:26:21', '2025-11-24 04:26:21'),
(4, 1, '30', 2, '2025-11-24 04:26:21', '2025-11-24 04:26:21'),
(5, 1, '32', 2, '2025-11-24 04:26:21', '2025-11-24 04:26:21'),
(6, 1, '3T', 3, '2025-11-24 04:26:21', '2025-11-24 04:26:21'),
(7, 1, '8', 2, '2025-11-24 04:26:21', '2025-11-24 04:26:21'),
(8, 1, 'N/A', 1, '2025-11-24 04:26:21', '2025-11-24 04:26:21');

-- --------------------------------------------------------

--
-- Table structure for table `size_types`
--

CREATE TABLE `size_types` (
  `size_type_id` int(11) NOT NULL,
  `size_type_name` varchar(50) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `size_types`
--

INSERT INTO `size_types` (`size_type_id`, `size_type_name`, `created_at`) VALUES
(1, 'Alphabetic', '2025-11-24 04:26:21'),
(2, 'Numeric', '2025-11-24 04:26:21'),
(3, 'Kids', '2025-11-24 04:26:21');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `shop_id` int(11) NOT NULL,
  `user_role` enum('admin','manager','cashier','staff') NOT NULL DEFAULT 'staff',
  `joining_date` date DEFAULT NULL,
  `user_status` enum('active','inactive','suspended') NOT NULL DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `password_hash`, `first_name`, `shop_id`, `user_role`, `joining_date`, `user_status`, `created_at`, `updated_at`) VALUES
(101, '$2y$10$hash1', 'Admin', 1, 'admin', '2023-01-10', 'active', '2025-11-24 04:26:21', '2025-11-24 04:26:21'),
(102, '$2y$10$hash2', 'Nimal', 2, 'manager', '2023-05-15', 'active', '2025-11-24 04:26:21', '2025-11-24 04:26:21'),
(103, '$2y$10$hash3', 'Chathuri', 1, 'cashier', '2024-01-20', 'active', '2025-11-24 04:26:21', '2025-11-24 04:26:21'),
(104, '$2y$10$hash4', 'Ramesh', 4, 'staff', '2024-04-01', 'active', '2025-11-24 04:26:21', '2025-11-24 04:26:21'),
(105, '$2y$10$hash5', 'Sriyan', 5, 'manager', '2024-06-01', 'active', '2025-11-24 04:26:21', '2025-11-24 04:26:21');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activity_log`
--
ALTER TABLE `activity_log`
  ADD PRIMARY KEY (`activity_id`),
  ADD KEY `idx_shop_id` (`shop_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_activity_type` (`activity_type`),
  ADD KEY `idx_created_at` (`created_at`),
  ADD KEY `idx_entity` (`entity_type`,`entity_id`);

--
-- Indexes for table `audit_log`
--
ALTER TABLE `audit_log`
  ADD PRIMARY KEY (`audit_id`),
  ADD KEY `idx_shop_id` (`shop_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_table_name` (`table_name`),
  ADD KEY `idx_record_id` (`record_id`),
  ADD KEY `idx_action` (`action`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `bank_accounts`
--
ALTER TABLE `bank_accounts`
  ADD PRIMARY KEY (`bank_account_id`),
  ADD UNIQUE KEY `unique_account_per_shop` (`shop_id`,`account_number`,`bank_name`),
  ADD KEY `idx_shop_id` (`shop_id`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`category_id`),
  ADD UNIQUE KEY `unique_category_per_shop` (`shop_id`,`category_name`),
  ADD KEY `idx_shop_id` (`shop_id`),
  ADD KEY `idx_size_type_id` (`size_type_id`);

--
-- Indexes for table `cities`
--
ALTER TABLE `cities`
  ADD PRIMARY KEY (`city_id`),
  ADD UNIQUE KEY `city_name` (`city_name`),
  ADD KEY `idx_district_id` (`district_id`);

--
-- Indexes for table `colors`
--
ALTER TABLE `colors`
  ADD PRIMARY KEY (`color_id`),
  ADD UNIQUE KEY `unique_color_per_shop` (`shop_id`,`color_name`),
  ADD KEY `idx_shop_id` (`shop_id`);

--
-- Indexes for table `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`customer_id`),
  ADD UNIQUE KEY `unique_mobile_per_shop` (`shop_id`,`mobile`),
  ADD KEY `idx_shop_id` (`shop_id`),
  ADD KEY `idx_mobile` (`mobile`),
  ADD KEY `idx_email` (`email`);

--
-- Indexes for table `districts`
--
ALTER TABLE `districts`
  ADD PRIMARY KEY (`district_id`),
  ADD UNIQUE KEY `district_name` (`district_name`),
  ADD KEY `idx_province_id` (`province_id`);

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
  ADD KEY `idx_order_status` (`order_status`),
  ADD KEY `idx_payment_status` (`payment_status`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`item_id`),
  ADD KEY `idx_order_id` (`order_id`),
  ADD KEY `idx_product_id` (`product_id`),
  ADD KEY `idx_color_id` (`color_id`),
  ADD KEY `idx_size_id` (`size_id`);

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
  ADD KEY `idx_payment_status` (`payment_status`),
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
  ADD KEY `idx_reconciliation_status` (`reconciliation_status`),
  ADD KEY `reconciled_by` (`reconciled_by`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`product_id`),
  ADD UNIQUE KEY `unique_sku_per_shop` (`shop_id`,`sku`),
  ADD KEY `idx_shop_id` (`shop_id`),
  ADD KEY `idx_category_id` (`category_id`),
  ADD KEY `idx_sku` (`sku`),
  ADD KEY `idx_product_status` (`product_status`);

--
-- Indexes for table `product_colors`
--
ALTER TABLE `product_colors`
  ADD PRIMARY KEY (`product_color_id`),
  ADD UNIQUE KEY `unique_product_color` (`product_id`,`color_id`),
  ADD KEY `idx_product_id` (`product_id`),
  ADD KEY `idx_color_id` (`color_id`);

--
-- Indexes for table `product_sizes`
--
ALTER TABLE `product_sizes`
  ADD PRIMARY KEY (`product_size_id`),
  ADD UNIQUE KEY `unique_product_size` (`product_id`,`size_id`),
  ADD KEY `idx_product_id` (`product_id`),
  ADD KEY `idx_size_id` (`size_id`);

--
-- Indexes for table `provinces`
--
ALTER TABLE `provinces`
  ADD PRIMARY KEY (`province_id`),
  ADD UNIQUE KEY `province_name` (`province_name`);

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
  ADD KEY `idx_item_name` (`item_name`);

--
-- Indexes for table `shop_product_stock`
--
ALTER TABLE `shop_product_stock`
  ADD PRIMARY KEY (`stock_id`),
  ADD UNIQUE KEY `unique_shop_product_stock` (`shop_id`,`product_id`,`size_id`,`color_id`),
  ADD KEY `idx_shop_id` (`shop_id`),
  ADD KEY `idx_product_id` (`product_id`),
  ADD KEY `idx_size_id` (`size_id`),
  ADD KEY `idx_color_id` (`color_id`);

--
-- Indexes for table `sizes`
--
ALTER TABLE `sizes`
  ADD PRIMARY KEY (`size_id`),
  ADD UNIQUE KEY `unique_size_per_shop` (`shop_id`,`size_name`,`size_type_id`),
  ADD KEY `idx_shop_id` (`shop_id`),
  ADD KEY `idx_size_type_id` (`size_type_id`);

--
-- Indexes for table `size_types`
--
ALTER TABLE `size_types`
  ADD PRIMARY KEY (`size_type_id`),
  ADD UNIQUE KEY `size_type_name` (`size_type_name`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD KEY `idx_shop_id` (`shop_id`),
  ADD KEY `idx_user_role` (`user_role`),
  ADD KEY `idx_user_status` (`user_status`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activity_log`
--
ALTER TABLE `activity_log`
  MODIFY `activity_id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `audit_log`
--
ALTER TABLE `audit_log`
  MODIFY `audit_id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `bank_accounts`
--
ALTER TABLE `bank_accounts`
  MODIFY `bank_account_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

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
  MODIFY `payment_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `payment_reconciliation`
--
ALTER TABLE `payment_reconciliation`
  MODIFY `reconciliation_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

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
  MODIFY `province_id` int(11) NOT NULL AUTO_INCREMENT;

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
  MODIFY `stock_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `sizes`
--
ALTER TABLE `sizes`
  MODIFY `size_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `size_types`
--
ALTER TABLE `size_types`
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
-- Constraints for table `activity_log`
--
ALTER TABLE `activity_log`
  ADD CONSTRAINT `activity_log_ibfk_1` FOREIGN KEY (`shop_id`) REFERENCES `shops` (`shop_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `activity_log_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL;

--
-- Constraints for table `audit_log`
--
ALTER TABLE `audit_log`
  ADD CONSTRAINT `audit_log_ibfk_1` FOREIGN KEY (`shop_id`) REFERENCES `shops` (`shop_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `audit_log_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL;

--
-- Constraints for table `bank_accounts`
--
ALTER TABLE `bank_accounts`
  ADD CONSTRAINT `bank_accounts_ibfk_1` FOREIGN KEY (`shop_id`) REFERENCES `shops` (`shop_id`) ON DELETE CASCADE;

--
-- Constraints for table `categories`
--
ALTER TABLE `categories`
  ADD CONSTRAINT `categories_ibfk_1` FOREIGN KEY (`shop_id`) REFERENCES `shops` (`shop_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `categories_ibfk_2` FOREIGN KEY (`size_type_id`) REFERENCES `size_types` (`size_type_id`);

--
-- Constraints for table `cities`
--
ALTER TABLE `cities`
  ADD CONSTRAINT `cities_ibfk_1` FOREIGN KEY (`district_id`) REFERENCES `districts` (`district_id`) ON DELETE CASCADE;

--
-- Constraints for table `colors`
--
ALTER TABLE `colors`
  ADD CONSTRAINT `colors_ibfk_1` FOREIGN KEY (`shop_id`) REFERENCES `shops` (`shop_id`) ON DELETE CASCADE;

--
-- Constraints for table `customers`
--
ALTER TABLE `customers`
  ADD CONSTRAINT `customers_ibfk_1` FOREIGN KEY (`shop_id`) REFERENCES `shops` (`shop_id`) ON DELETE CASCADE;

--
-- Constraints for table `districts`
--
ALTER TABLE `districts`
  ADD CONSTRAINT `districts_ibfk_1` FOREIGN KEY (`province_id`) REFERENCES `provinces` (`province_id`) ON DELETE CASCADE;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`shop_id`) REFERENCES `shops` (`shop_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`customer_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `orders_ibfk_3` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL;

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_items_ibfk_3` FOREIGN KEY (`color_id`) REFERENCES `colors` (`color_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_items_ibfk_4` FOREIGN KEY (`size_id`) REFERENCES `sizes` (`size_id`) ON DELETE CASCADE;

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`shop_id`) REFERENCES `shops` (`shop_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `payments_ibfk_2` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `payments_ibfk_3` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`customer_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `payments_ibfk_4` FOREIGN KEY (`bank_account_id`) REFERENCES `bank_accounts` (`bank_account_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `payments_ibfk_5` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL;

--
-- Constraints for table `payment_reconciliation`
--
ALTER TABLE `payment_reconciliation`
  ADD CONSTRAINT `payment_reconciliation_ibfk_1` FOREIGN KEY (`shop_id`) REFERENCES `shops` (`shop_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `payment_reconciliation_ibfk_2` FOREIGN KEY (`bank_account_id`) REFERENCES `bank_accounts` (`bank_account_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `payment_reconciliation_ibfk_3` FOREIGN KEY (`reconciled_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL;

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`shop_id`) REFERENCES `shops` (`shop_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `products_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`);

--
-- Constraints for table `product_colors`
--
ALTER TABLE `product_colors`
  ADD CONSTRAINT `product_colors_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `product_colors_ibfk_2` FOREIGN KEY (`color_id`) REFERENCES `colors` (`color_id`) ON DELETE CASCADE;

--
-- Constraints for table `product_sizes`
--
ALTER TABLE `product_sizes`
  ADD CONSTRAINT `product_sizes_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `product_sizes_ibfk_2` FOREIGN KEY (`size_id`) REFERENCES `sizes` (`size_id`) ON DELETE CASCADE;

--
-- Constraints for table `shop_inventory`
--
ALTER TABLE `shop_inventory`
  ADD CONSTRAINT `shop_inventory_ibfk_1` FOREIGN KEY (`shop_id`) REFERENCES `shops` (`shop_id`) ON DELETE CASCADE;

--
-- Constraints for table `shop_product_stock`
--
ALTER TABLE `shop_product_stock`
  ADD CONSTRAINT `shop_product_stock_ibfk_1` FOREIGN KEY (`shop_id`) REFERENCES `shops` (`shop_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `shop_product_stock_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `shop_product_stock_ibfk_3` FOREIGN KEY (`size_id`) REFERENCES `sizes` (`size_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `shop_product_stock_ibfk_4` FOREIGN KEY (`color_id`) REFERENCES `colors` (`color_id`) ON DELETE CASCADE;

--
-- Constraints for table `sizes`
--
ALTER TABLE `sizes`
  ADD CONSTRAINT `sizes_ibfk_1` FOREIGN KEY (`shop_id`) REFERENCES `shops` (`shop_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `sizes_ibfk_2` FOREIGN KEY (`size_type_id`) REFERENCES `size_types` (`size_type_id`);

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`shop_id`) REFERENCES `shops` (`shop_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
