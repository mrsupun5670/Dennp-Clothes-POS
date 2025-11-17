// User Types
export interface IUser {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: 'admin' | 'manager' | 'cashier' | 'staff';
  shop_id: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// Shop Types
export interface IShop {
  id: number;
  name: string;
  location: string;
  contact_info?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// Product Types
export interface IProduct {
  id: number;
  sku: string;
  name: string;
  description?: string;
  price: number;
  cost_price?: number;
  shop_id?: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// Inventory Types
export interface IShopInventory {
  id: number;
  shop_id: number;
  product_id: number;
  quantity_in_stock: number;
  reorder_level?: number;
  last_sync_time?: Date;
  updated_at: Date;
}

// Sale Types
export interface ISale {
  id: number;
  invoice_number: string;
  shop_id: number;
  user_id: number;
  customer_id?: number;
  total_amount: number;
  discount_amount?: number;
  payment_method: 'cash' | 'card' | 'check' | 'other';
  status: 'completed' | 'refunded' | 'pending';
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface ISaleItem {
  id: number;
  sale_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: Date;
}

// Customer Types
export interface ICustomer {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  shop_id: number;
  loyalty_points?: number;
  created_at: Date;
  updated_at: Date;
}

// Sync Types
export interface ISyncLog {
  id: number;
  shop_id: number;
  device_id: string;
  pending_operations: string; // JSON string
  status: 'pending' | 'synced' | 'failed';
  error_message?: string;
  created_at: Date;
  synced_at?: Date;
}

// Auth Response
export interface IAuthResponse {
  user: Omit<IUser, 'password_hash'>;
  shop: IShop;
  token: string;
}

// JWT Payload
export interface IJWTPayload {
  id: number;
  username: string;
  email: string;
  role: string;
  shop_id: number;
}

// API Response
export interface IApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  timestamp: string;
}

// Pagination
export interface IPaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export interface IPaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}
