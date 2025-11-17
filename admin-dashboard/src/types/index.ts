// Shop Types
export interface Shop {
  id: number;
  name: string;
  location: string;
  contact_info?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// Shop Metrics
export interface ShopMetrics {
  shop_id: number;
  total_sales: number;
  sales_count: number;
  average_transaction: number;
  products_in_stock: number;
  low_stock_items: number;
  today_revenue: number;
}

// User Types
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'manager' | 'cashier' | 'staff';
  shop_id: number;
  is_active: boolean;
}

// Report Types
export interface SalesReport {
  shop_id: number;
  period: string;
  total_sales: number;
  transaction_count: number;
  average_transaction: number;
  top_products: Array<{
    product_id: number;
    product_name: string;
    quantity_sold: number;
    revenue: number;
  }>;
}
