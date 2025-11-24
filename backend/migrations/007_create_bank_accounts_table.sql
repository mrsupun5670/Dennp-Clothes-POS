-- Create bank_accounts table
CREATE TABLE IF NOT EXISTS bank_accounts (
  bank_account_id INT AUTO_INCREMENT PRIMARY KEY,
  shop_id INT NOT NULL,
  bank_name VARCHAR(100) NOT NULL,
  account_number VARCHAR(50) NOT NULL,
  account_holder_name VARCHAR(100) NOT NULL,
  account_type ENUM('checking', 'savings', 'business') NOT NULL DEFAULT 'checking',
  branch_code VARCHAR(50),
  ifsc_code VARCHAR(20),
  initial_balance DECIMAL(12, 2) NOT NULL DEFAULT 0,
  current_balance DECIMAL(12, 2) NOT NULL DEFAULT 0,
  status ENUM('active', 'inactive', 'closed') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (shop_id) REFERENCES shops(shop_id) ON DELETE CASCADE,
  UNIQUE KEY unique_account_number (account_number, bank_name),
  INDEX idx_shop_id (shop_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create payments table if not exists
CREATE TABLE IF NOT EXISTS payments (
  payment_id INT AUTO_INCREMENT PRIMARY KEY,
  shop_id INT NOT NULL,
  order_id INT,
  customer_id INT,
  payment_amount DECIMAL(12, 2) NOT NULL,
  payment_date DATE NOT NULL,
  payment_time TIME,
  payment_method ENUM('cash', 'card', 'online', 'check', 'bank_transfer') NOT NULL DEFAULT 'cash',
  bank_account_id INT,
  transaction_id VARCHAR(100),
  payment_status ENUM('completed', 'pending', 'failed', 'refunded') NOT NULL DEFAULT 'completed',
  notes TEXT,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (shop_id) REFERENCES shops(shop_id) ON DELETE CASCADE,
  FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE SET NULL,
  FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE SET NULL,
  FOREIGN KEY (bank_account_id) REFERENCES bank_accounts(bank_account_id) ON DELETE SET NULL,
  INDEX idx_shop_id (shop_id),
  INDEX idx_order_id (order_id),
  INDEX idx_customer_id (customer_id),
  INDEX idx_payment_date (payment_date),
  INDEX idx_payment_status (payment_status),
  INDEX idx_payment_method (payment_method)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
