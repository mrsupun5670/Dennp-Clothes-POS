# Dennup Clothes POS - Backend API Documentation

**API Version:** v1
**Base URL:** `http://localhost:3000/api/v1`
**Database:** MySQL (Hostinger)
**Framework:** Express.js + TypeScript

---

## Architecture Overview

This backend uses a simple **MVC (Model-View-Controller)** architecture:

- **Config** (`src/config/`) - Database connection and environment configuration
- **Models** (`src/models/`) - Database queries and operations for each table
- **Controllers** (`src/controllers/`) - Request handlers that call models and return API responses
- **Routes** (`src/routes/`) - API endpoint definitions

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Database
Update `backend/.env` with your Hostinger MySQL credentials:
```env
DB_HOST=193.203.184.9
DB_USER=u331468302_dennup_pos
DB_PASSWORD=gM7LfqqUK;|
DB_NAME=u331468302_dennup_pos
```

### 3. Run Migrations
Before starting the server, execute the SQL migrations to add missing fields:
```bash
# Run migrations on your Hostinger MySQL database
mysql -h 193.203.184.9 -u u331468302_dennup_pos -p u331468302_dennup_pos < migrations/001_add_cost_fields_to_products.sql
mysql -h 193.203.184.9 -u u331468302_dennup_pos -p u331468302_dennup_pos < migrations/002_create_payments_table.sql
mysql -h 193.203.184.9 -u u331468302_dennup_pos -p u331468302_dennup_pos < migrations/003_add_payment_fields_to_orders.sql
```

### 4. Start Server
```bash
npm run dev    # Development mode with auto-reload
npm start      # Production mode
```

Server runs on: `http://localhost:3000`

---

## API Endpoints

### Products API

#### Get All Products
```
GET /api/v1/products
```
Returns all products in the system.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "product_id": 1,
      "sku": "SHIRT-001",
      "product_name": "Blue T-Shirt",
      "category_id": 1,
      "cost_price": 500,
      "print_cost": 100,
      "retail_price": 1500,
      "wholesale_price": 1200,
      "product_status": "active",
      "created_at": "2025-11-19T10:00:00Z",
      "updated_at": "2025-11-19T10:00:00Z"
    }
  ],
  "message": "Retrieved X products"
}
```

#### Get Product by ID
```
GET /api/v1/products/:id
```
Get a specific product by ID.

**Example:** `GET /api/v1/products/1`

#### Get Product by SKU
```
GET /api/v1/products/sku/:sku
```
Get a product by its SKU code.

**Example:** `GET /api/v1/products/sku/SHIRT-001`

#### Get Products by Category
```
GET /api/v1/products/category/:categoryId
```
Get all products in a specific category.

**Example:** `GET /api/v1/products/category/1`

#### Get Active Products (Paginated)
```
GET /api/v1/products/active?page=1&limit=10
```
Get active products with pagination support.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

#### Search Products
```
GET /api/v1/products/search?q=shirt
```
Search products by name or SKU.

**Query Parameters:**
- `q` (required): Search term

#### Get Product Prices
```
GET /api/v1/products/:id/prices
```
Get cost, print, retail, and wholesale prices for a product.

#### Create Product
```
POST /api/v1/products
```
Create a new product.

**Request Body:**
```json
{
  "sku": "SHIRT-002",
  "product_name": "Red T-Shirt",
  "category_id": 1,
  "description": "Premium quality t-shirt",
  "cost_price": 500,
  "print_cost": 100,
  "retail_price": 1500,
  "wholesale_price": 1200,
  "product_status": "active"
}
```

#### Update Product
```
PUT /api/v1/products/:id
```
Update an existing product.

**Request Body:** (all fields optional)
```json
{
  "product_name": "Updated T-Shirt",
  "retail_price": 1600,
  "print_cost": 120
}
```

#### Delete Product
```
DELETE /api/v1/products/:id
```
Soft delete a product (changes status to "discontinued").

---

### Customers API

#### Get All Customers
```
GET /api/v1/customers
```
Returns all customers in the system.

#### Get Customer by ID
```
GET /api/v1/customers/:id
```
Get a specific customer by ID.

**Example:** `GET /api/v1/customers/1000`

#### Get Customer by Mobile
```
GET /api/v1/customers/mobile/:mobile
```
Get customer by mobile number.

**Example:** `GET /api/v1/customers/mobile/0712345678`

#### Get Active Customers (Paginated)
```
GET /api/v1/customers/active?page=1&limit=10
```
Get active customers with pagination.

#### Get Top Customers
```
GET /api/v1/customers/top?limit=10
```
Get top customers by total spending.

#### Search Customers
```
GET /api/v1/customers/search?q=john
```
Search customers by name or mobile number.

**Query Parameters:**
- `q` (required): Search term

#### Create Customer
```
POST /api/v1/customers
```
Create a new customer.

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "mobile": "0712345678",
  "email": "john@example.com",
  "customer_status": "active"
}
```

#### Update Customer
```
PUT /api/v1/customers/:id
```
Update customer information.

**Request Body:** (all fields optional)
```json
{
  "email": "newemail@example.com",
  "customer_status": "inactive"
}
```

#### Block Customer
```
POST /api/v1/customers/:id/block
```
Block a customer (soft delete).

---

### Orders API

#### Get All Orders
```
GET /api/v1/orders?shop_id=1
```
Get all orders, optionally filtered by shop.

**Query Parameters:**
- `shop_id` (optional): Filter by shop ID

#### Get Order by ID
```
GET /api/v1/orders/:id
```
Get a specific order with all its items.

**Response Includes:**
- Order details
- Order items with product, color, and size information

#### Get Orders by Customer
```
GET /api/v1/orders/customer/:customerId
```
Get all orders for a specific customer.

#### Get Pending Orders
```
GET /api/v1/orders/pending?shop_id=1
```
Get orders that haven't been fully paid.

**Query Parameters:**
- `shop_id` (optional): Filter by shop ID

#### Get Order Summary
```
GET /api/v1/orders/summary?shop_id=1&start_date=2025-11-01&end_date=2025-11-30
```
Get order statistics for a date range.

**Query Parameters:**
- `shop_id` (required): Shop ID
- `start_date` (required): Start date (YYYY-MM-DD)
- `end_date` (required): End date (YYYY-MM-DD)

#### Create Order
```
POST /api/v1/orders
```
Create a new order with items.

**Request Body:**
```json
{
  "order_number": "ORD-20251119-001",
  "shop_id": 1,
  "customer_id": 1000,
  "user_id": 1,
  "total_items": 2,
  "total_amount": 3000,
  "payment_method": "cash",
  "order_date": "2025-11-19",
  "notes": "Bulk order",
  "delivery_address": {
    "line1": "123 Main Street",
    "line2": "Apartment 4B",
    "postal_code": "10001",
    "city_name": "Colombo",
    "district_name": "Colombo District",
    "province_name": "Western Province",
    "recipient_name": "John Doe",
    "recipient_phone": "0712345678"
  },
  "items": [
    {
      "product_id": 1,
      "color_id": 1,
      "size_id": 1,
      "quantity": 1,
      "sold_price": 1500,
      "total_price": 1500
    }
  ]
}
```

#### Update Order
```
PUT /api/v1/orders/:id
```
Update order information.

**Request Body:** (all fields optional)
```json
{
  "order_status": "completed",
  "notes": "Order updated"
}
```

#### Record Payment
```
POST /api/v1/orders/:id/payment
```
Record a payment for an order.

**Request Body:**
```json
{
  "amount_paid": 1500,
  "payment_type": "balance",
  "payment_method": "bank_transfer",
  "bank_name": "BOC",
  "branch_name": "Colombo Main",
  "is_online_transfer": true
}
```

**Payment Types:**
- `advance` - Partial/advance payment
- `balance` - Final payment
- `full` - Complete payment

#### Get Order Payments
```
GET /api/v1/orders/:id/payments
```
Get all payments made for an order.

---

## Response Format

All API responses follow this format:

### Success Response (200, 201)
```json
{
  "success": true,
  "data": {},
  "message": "Operation successful",
  "pagination": {}  // Only for paginated endpoints
}
```

### Error Response (400, 404, 500)
```json
{
  "success": false,
  "error": "Error message",
  "details": "Additional error details"
}
```

---

## Common HTTP Status Codes

- `200 OK` - Request successful, resource retrieved
- `201 Created` - Resource successfully created
- `400 Bad Request` - Invalid request parameters
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## Database Tables & Models

### Available Models

1. **ProductModel** (`src/models/Product.ts`)
   - Methods: getAllProducts, getProductById, getProductBySku, getProductsByCategory, createProduct, updateProduct, deleteProduct, searchProducts, getProductPrices

2. **CustomerModel** (`src/models/Customer.ts`)
   - Methods: getAllCustomers, getCustomerById, getCustomerByMobile, createCustomer, updateCustomer, searchCustomers, getActiveCustomers, getTopCustomers, blockCustomer, updateCustomerStats

3. **OrderModel** (`src/models/Order.ts`)
   - Methods: getAllOrders, getOrderById, getOrdersByCustomer, createOrder, updateOrder, recordPayment, getPendingOrders, getOrderSummary

4. **OrderItemModel** (`src/models/OrderItem.ts`)
   - Methods: getOrderItems, getOrderItemById, createOrderItem, createOrderItems, updateOrderItem, deleteOrderItem, getOrderItemsWithDetails, deleteOrderItems

5. **PaymentModel** (`src/models/Payment.ts`)
   - Methods: getAllPayments, getPaymentById, getPaymentsByOrder, createPayment, updatePayment, deletePayment, getPaymentsByDateRange, getTotalPayments, getPaymentsByMethod, getPaymentsByBank

6. **CategoryModel** (`src/models/Category.ts`)
   - Methods: getAllCategories, getCategoryById, getCategoryByName, createCategory, updateCategory, deleteCategory, getCategoryWithSizeType, countProductsInCategory

---

## How to Add New Endpoints

### Step 1: Create a Model Method
Add method to `src/models/YourTable.ts`:
```typescript
async getYourData(): Promise<YourInterface[]> {
  try {
    const results = await query('SELECT * FROM your_table');
    return results as YourInterface[];
  } catch (error) {
    logger.error('Error:', error);
    throw error;
  }
}
```

### Step 2: Create Controller Method
Add method to `src/controllers/YourController.ts`:
```typescript
async getYourData(req: Request, res: Response): Promise<void> {
  try {
    const data = await YourModel.getYourData();
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}
```

### Step 3: Add Route
Add to `src/routes/yourRoutes.ts`:
```typescript
router.get('/', YourController.getYourData.bind(YourController));
```

### Step 4: Register Route
Add to `src/routes/index.ts`:
```typescript
router.use('/yourroute', yourRoutes);
```

---

## Testing the API

### Using cURL

```bash
# Get all products
curl http://localhost:3000/api/v1/products

# Create a product
curl -X POST http://localhost:3000/api/v1/products \
  -H "Content-Type: application/json" \
  -d '{
    "sku": "SHIRT-003",
    "product_name": "Green T-Shirt",
    "category_id": 1,
    "retail_price": 1500
  }'

# Get customer by ID
curl http://localhost:3000/api/v1/customers/1000

# Create an order
curl -X POST http://localhost:3000/api/v1/orders \
  -H "Content-Type: application/json" \
  -d '{...order data...}'
```

### Using Postman

1. Import collection from `/postman-collection.json` (create this file)
2. Set environment variables: `BASE_URL`, `API_VERSION`
3. Use provided request templates to test endpoints

---

## Environment Variables

Create `.env` file in `backend/` directory:

```env
# Server
PORT=3000
NODE_ENV=development
API_URL=http://localhost:3000
API_VERSION=v1

# Database (Hostinger)
DB_HOST=193.203.184.9
DB_PORT=3306
DB_USER=u331468302_dennup_pos
DB_PASSWORD=gM7LfqqUK;|
DB_NAME=u331468302_dennup_pos

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d

# CORS
CORS_ORIGIN=http://localhost:5173,http://localhost:3001

# Logging
LOG_LEVEL=debug

# Rate Limiting
RATE_LIMIT=100
```

---

## Database Schema Changes (Migrations)

Three migrations have been created to align the database with the frontend:

1. **001_add_cost_fields_to_products.sql**
   - Adds `cost_price` and `print_cost` columns to products table

2. **002_create_payments_table.sql**
   - Creates new `payments` table for detailed payment tracking
   - Tracks payment type (advance/balance/full), method, bank, branch

3. **003_add_payment_fields_to_orders.sql**
   - Adds payment summary fields to orders table:
     - `advance_paid`, `balance_paid`, `total_paid`
     - `payment_status`, `remaining_amount`

---

## Frontend Integration

### Fetching Products from React
```typescript
// In your React component
const [products, setProducts] = useState([]);

useEffect(() => {
  fetch('http://localhost:3000/api/v1/products')
    .then(res => res.json())
    .then(data => setProducts(data.data))
    .catch(err => console.error('Error:', err));
}, []);
```

### Creating an Order from React
```typescript
const createOrder = async (orderData) => {
  const response = await fetch('http://localhost:3000/api/v1/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData)
  });
  return response.json();
};
```

### Recording a Payment from React
```typescript
const recordPayment = async (orderId, paymentData) => {
  const response = await fetch(`http://localhost:3000/api/v1/orders/${orderId}/payment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(paymentData)
  });
  return response.json();
};
```

---

## Troubleshooting

### Database Connection Error
- Verify `.env` file has correct credentials
- Check that Hostinger MySQL is accessible
- Test connection using: `mysql -h [host] -u [user] -p [password]`

### Route Not Found (404)
- Ensure route is registered in `src/routes/index.ts`
- Check URL matches route definition
- Verify HTTP method (GET/POST/PUT/DELETE)

### TypeScript Compilation Error
- Run `npm run build` to see detailed errors
- Check that all imports are correct
- Ensure types match between controllers and models

---

## Performance Tips

1. **Use pagination for large datasets:**
   ```
   GET /api/v1/products/active?page=1&limit=50
   ```

2. **Search instead of fetching all:**
   ```
   GET /api/v1/products/search?q=shirt
   ```

3. **Filter by shop or date range:**
   ```
   GET /api/v1/orders?shop_id=1
   GET /api/v1/orders/summary?shop_id=1&start_date=2025-11-01&end_date=2025-11-30
   ```

4. **Connection pooling** is already configured in `src/config/database.ts`

---

## Security Notes

- Rate limiting is enabled (100 requests per 15 minutes)
- CORS configured for allowed origins
- Input validation should be added in controllers
- Never commit `.env` file with real credentials
- Use HTTPS in production
- Implement JWT authentication for protected endpoints

---

**Last Updated:** 2025-11-19
**Backend Version:** 1.0
**API Version:** v1
