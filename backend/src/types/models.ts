/**
 * Database Models - TypeScript interfaces matching the Dennup Clothes POS database schema
 * Generated: 2025-11-19
 * Aligns with database schema after migrations
 */

// ==================== ENUMS ====================

export enum UserRole {
  ADMIN = "admin",
  MANAGER = "manager",
  CASHIER = "cashier",
  STAFF = "staff",
}

export enum UserStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  SUSPENDED = "suspended",
}

export enum ShopStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  CLOSED = "closed",
}

export enum ProductStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  DISCONTINUED = "discontinued",
}

export enum CustomerStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  BLOCKED = "blocked",
}

export enum OrderStatus {
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  REFUNDED = "refunded",
}

export enum PaymentMethod {
  CASH = "cash",
  CARD = "card",
  ONLINE = "online",
  CHECK = "check",
  OTHER = "other",
}

export enum PaymentType {
  ADVANCE = "advance",
  BALANCE = "balance",
  FULL = "full",
}

export enum PaymentStatus {
  UNPAID = "unpaid",
  PARTIAL = "partial",
  FULLY_PAID = "fully_paid",
}

// ==================== USER MODELS ====================

export interface User {
  user_id: number;
  username: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  phone?: string;
  shop_id: number;
  user_role: UserRole;
  joining_date: Date;
  user_status: UserStatus;
  created_at: Date;
}

export interface CreateUserInput {
  username: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  shop_id: number;
  user_role: UserRole;
  joining_date: Date;
}

export interface UpdateUserInput {
  first_name?: string;
  last_name?: string;
  phone?: string;
  user_role?: UserRole;
  user_status?: UserStatus;
}

// ==================== SHOP MODELS ====================

export interface Shop {
  shop_id: number;
  shop_name: string;
  address: string;
  contact_phone: string;
  manager_name: string;
  shop_status: ShopStatus;
  opening_date: Date;
}

export interface CreateShopInput {
  shop_name: string;
  address: string;
  contact_phone: string;
  manager_name: string;
  opening_date: Date;
}

export interface UpdateShopInput {
  shop_name?: string;
  address?: string;
  contact_phone?: string;
  manager_name?: string;
  shop_status?: ShopStatus;
}

// ==================== PRODUCT MODELS ====================

export interface Product {
  product_id: number;
  sku: string;
  product_name: string;
  category_id: number;
  description?: string;
  product_cost: number;
  print_cost: number;
  retail_price: number;
  wholesale_price?: number;
  product_status: ProductStatus;
  created_at: Date;
  updated_at: Date;
}

export interface CreateProductInput {
  sku: string;
  product_name: string;
  category_id: number;
  description?: string;
  product_cost: number;
  print_cost: number;
  retail_price: number;
  wholesale_price?: number;
}

export interface UpdateProductInput {
  sku?: string;
  product_name?: string;
  category_id?: number;
  description?: string;
  product_cost?: number;
  print_cost?: number;
  retail_price?: number;
  wholesale_price?: number;
  product_status?: ProductStatus;
}

// ==================== CATEGORY MODELS ====================

export interface Category {
  category_id: number;
  category_name: string;
  size_type_id: number;
}

export interface CreateCategoryInput {
  category_name: string;
  size_type_id: number;
}

export interface UpdateCategoryInput {
  category_name?: string;
  size_type_id?: number;
}

// ==================== SIZE TYPE MODELS ====================

export interface SizeType {
  size_type_id: number;
  Size_type_name: string;
}

export interface CreateSizeTypeInput {
  Size_type_name: string;
}

// ==================== SIZE MODELS ====================

export interface Size {
  size_id: number;
  size_name: string;
  size_type_id: number;
}

export interface CreateSizeInput {
  size_name: string;
  size_type_id: number;
}

// ==================== COLOR MODELS ====================

export interface Color {
  color_id: number;
  color_name: string;
  hex_code?: string;
}

export interface CreateColorInput {
  color_name: string;
  hex_code?: string;
}

// ==================== PRODUCT VARIANT MODELS ====================

export interface ProductColor {
  product_color_id: number;
  product_id: number;
  color_id: number;
}

export interface ProductSize {
  product_size_id: number;
  product_id: number;
  size_id: number;
}

// ==================== INVENTORY MODELS ====================

export interface ShopProductStock {
  stock_id: number;
  shop_id: number;
  product_id: number;
  size_id: number;
  color_id: number;
  stock_qty: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateShopProductStockInput {
  shop_id: number;
  product_id: number;
  size_id: number;
  color_id: number;
  stock_qty: number;
}

export interface UpdateShopProductStockInput {
  stock_qty: number;
}

export interface ShopInventory {
  inventory_id: number;
  shop_id: number;
  item_name: string;
  quantity_in_stock: number;
  unit_cost: number;
  updated_at: Date;
}

export interface CreateShopInventoryInput {
  shop_id: number;
  item_name: string;
  quantity_in_stock: number;
  unit_cost: number;
}

export interface UpdateShopInventoryInput {
  quantity_in_stock?: number;
  unit_cost?: number;
}

// ==================== CUSTOMER MODELS ====================

export interface Customer {
  customer_id: number;
  first_name: string;
  last_name: string;
  mobile: string;
  email?: string;
  orders_count: number;
  customer_status: CustomerStatus;
  total_spent: number;
  created_at: Date;
}

export interface CreateCustomerInput {
  first_name: string;
  last_name: string;
  mobile: string;
  email?: string;
}

export interface UpdateCustomerInput {
  first_name?: string;
  last_name?: string;
  email?: string;
  customer_status?: CustomerStatus;
}

// ==================== CUSTOMER ADDRESS MODELS ====================

export interface CustomerAddress {
  address_id: number;
  line1: string;
  line2: string;
  postal_code: string;
  city_id: number;
  customer_id: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateCustomerAddressInput {
  line1: string;
  line2: string;
  postal_code: string;
  city_id: number;
  customer_id: number;
}

export interface UpdateCustomerAddressInput {
  line1?: string;
  line2?: string;
  postal_code?: string;
  city_id?: number;
}

// ==================== LOCATION MODELS ====================

export interface Province {
  provinces_id: number;
  provinces_name: string;
}

export interface District {
  district_id: number;
  district_name: string;
  provinces_id: number;
}

export interface City {
  city_id: number;
  city_name: string;
  district_id: number;
}

// ==================== ORDER MODELS ====================

export interface Order {
  order_id: number;
  order_number: string;
  shop_id: number;
  customer_id?: number;
  user_id?: number;
  total_items: number;
  total_amount: number;
  advance_paid: number;
  balance_paid: number;
  total_paid: number;
  payment_status: PaymentStatus;
  remaining_amount: number;
  payment_method: PaymentMethod;
  order_status: OrderStatus;
  notes?: string;
  order_date: Date;
  created_at: Date;
  updated_at: Date;
  // Embedded delivery address fields
  delivery_address: {
    line1: string;
    line2: string;
    postal_code: string;
    city_name: string;
    district_name: string;
    province_name: string;
    recipient_name: string;
    recipient_phone: string;
  };
}

export interface CreateOrderInput {
  shop_id: number;
  customer_id?: number;
  user_id?: number;
  total_items: number;
  total_amount: number;
  payment_method: PaymentMethod;
  notes?: string;
  order_date: Date;
  delivery_address: {
    line1: string;
    line2: string;
    postal_code: string;
    city_name: string;
    district_name: string;
    province_name: string;
    recipient_name: string;
    recipient_phone: string;
  };
}

export interface UpdateOrderInput {
  customer_id?: number;
  user_id?: number;
  total_items?: number;
  total_amount?: number;
  order_status?: OrderStatus;
  notes?: string;
}

// ==================== ORDER ITEM MODELS ====================

export interface OrderItem {
  item_id: number;
  order_id: number;
  product_id: number;
  color_id?: number;
  size_id?: number;
  quantity: number;
  sold_price: number;
  total_price: number;
  created_at: Date;
}

export interface CreateOrderItemInput {
  order_id: number;
  product_id: number;
  color_id?: number;
  size_id?: number;
  quantity: number;
  sold_price: number;
  total_price: number;
}

// ==================== PAYMENT MODELS ====================

export interface Payment {
  payment_id: number;
  order_id: number;
  payment_type: PaymentType;
  amount_paid: number;
  payment_method: PaymentMethod;
  bank_name?: string;
  branch_name?: string;
  is_online_transfer: boolean;
  payment_date: Date;
  created_at: Date;
  updated_at: Date;
}

export interface CreatePaymentInput {
  order_id: number;
  payment_type: PaymentType;
  amount_paid: number;
  payment_method: PaymentMethod;
  bank_name?: string;
  branch_name?: string;
  is_online_transfer?: boolean;
}

// ==================== API RESPONSE MODELS ====================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
  error?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}
