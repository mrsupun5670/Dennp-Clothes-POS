# Backend Setup Guide - Dennup Clothes POS

## Overview

The backend is built with:
- **Framework:** Express.js + TypeScript
- **Database:** MySQL (Hostinger)
- **Architecture:** MVC (Models → Controllers → Routes)
- **Port:** 3000

## File Structure

```
backend/
├── .env                          # Environment variables (with your credentials)
├── src/
│   ├── config/
│   │   ├── env.ts               # Configuration loader
│   │   ├── database.ts          # Database connection pool
│   │   └── database.config.ts   # Database pool options
│   ├── models/                  # Database query methods
│   │   ├── Product.ts           # Product table operations
│   │   ├── Order.ts             # Order table operations
│   │   ├── Customer.ts          # Customer table operations
│   │   ├── OrderItem.ts         # Order items operations
│   │   ├── Payment.ts           # Payments operations
│   │   └── Category.ts          # Categories operations
│   ├── controllers/             # Request handlers
│   │   ├── ProductController.ts
│   │   ├── OrderController.ts
│   │   └── CustomerController.ts
│   ├── routes/                  # API endpoints
│   │   ├── index.ts            # Main router
│   │   ├── productRoutes.ts
│   │   ├── orderRoutes.ts
│   │   └── customerRoutes.ts
│   ├── utils/
│   │   └── logger.ts           # Logging utility
│   ├── app.ts                  # Express app setup
│   └── server.ts               # Server startup
├── migrations/                  # SQL migration scripts
│   ├── 001_add_cost_fields_to_products.sql
│   ├── 002_create_payments_table.sql
│   ├── 003_add_payment_fields_to_orders.sql
│   └── MIGRATION_GUIDE.md
├── API_DOCUMENTATION.md        # Complete API docs
└── BACKEND_SETUP.md           # This file
```

## Quick Setup (5 Steps)

### Step 1: Install Dependencies
```bash
cd backend
npm install
```

### Step 2: Configure Database
Edit `backend/.env` and ensure these values match your Hostinger MySQL:
```env
DB_HOST=193.203.184.9
DB_USER=u331468302_dennup_pos
DB_PASSWORD=gM7LfqqUK;|
DB_NAME=u331468302_dennup_pos
```

### Step 3: Run Database Migrations
**IMPORTANT:** Run these migrations on your Hostinger MySQL BEFORE starting the server.

Using MySQL CLI:
```bash
cd backend/migrations
mysql -h 193.203.184.9 -u u331468302_dennup_pos -p u331468302_dennup_pos < 001_add_cost_fields_to_products.sql
mysql -h 193.203.184.9 -u u331468302_dennup_pos -p u331468302_dennup_pos < 002_create_payments_table.sql
mysql -h 193.203.184.9 -u u331468302_dennup_pos -p u331468302_dennup_pos < 003_add_payment_fields_to_orders.sql
```

When prompted, enter your password: `gM7LfqqUK;|`

Or using phpMyAdmin (from Hostinger cPanel):
1. Log in to Hostinger cPanel
2. Open phpMyAdmin
3. Select database `u331468302_dennup_pos`
4. Go to "Import" tab
5. Upload and execute each migration file in order

### Step 4: Start the Server
```bash
cd backend
npm run dev    # Development mode (auto-reload)
npm start      # Production mode
```

Server will run on: `http://localhost:3000`

### Step 5: Test the API
```bash
# Health check
curl http://localhost:3000/health

# Get all products
curl http://localhost:3000/api/v1/products

# Get all customers
curl http://localhost:3000/api/v1/customers

# Get all orders
curl http://localhost:3000/api/v1/orders
```

---

## How the Backend Works

### 1. Request Flow

```
Frontend (React)
    ↓ (HTTP Request)
Routes (src/routes/)
    ↓
Controller (src/controllers/)
    ↓
Model (src/models/)
    ↓
Database (MySQL)
    ↓ (Returns data)
Model
    ↓
Controller (formats response)
    ↓ (JSON Response)
Frontend (React)
```

### 2. Example: Create a Product

**Frontend (React):**
```typescript
const response = await fetch('http://localhost:3000/api/v1/products', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sku: 'SHIRT-001',
    product_name: 'Blue T-Shirt',
    category_id: 1,
    cost_price: 500,
    print_cost: 100,
    retail_price: 1500
  })
});
```

**Route** (`src/routes/productRoutes.ts`):
```typescript
router.post('/', ProductController.createProduct.bind(ProductController));
```

**Controller** (`src/controllers/ProductController.ts`):
```typescript
async createProduct(req: Request, res: Response) {
  const data = req.body;
  const productId = await ProductModel.createProduct(data);
  res.status(201).json({
    success: true,
    data: { product_id: productId }
  });
}
```

**Model** (`src/models/Product.ts`):
```typescript
async createProduct(productData) {
  const results = await query(
    'INSERT INTO products (...) VALUES (...)',
    [sku, product_name, ...]
  );
  return results.insertId;
}
```

---

## Available Models & Methods

### ProductModel
```typescript
getAllProducts()                    // Get all products
getProductById(id)                 // Get by ID
getProductBySku(sku)               // Get by SKU
getProductsByCategory(categoryId)  // Get by category
createProduct(data)                // Create new
updateProduct(id, data)            // Update existing
deleteProduct(id)                  // Delete (soft)
searchProducts(term)               // Search by name/SKU
getProductPrices(id)              // Get pricing info
```

### CustomerModel
```typescript
getAllCustomers()                  // Get all
getCustomerById(id)               // Get by ID
getCustomerByMobile(mobile)       // Get by mobile
createCustomer(data)              // Create new
updateCustomer(id, data)          // Update existing
searchCustomers(term)             // Search
getActiveCustomers(page, limit)   // Paginated
getTopCustomers(limit)            // Top spenders
blockCustomer(id)                 // Block/soft delete
updateCustomerStats(id)           // Update order count
```

### OrderModel
```typescript
getAllOrders(shopId)              // Get all
getOrderById(id)                  // Get by ID
getOrdersByCustomer(customerId)   // Get by customer
createOrder(data)                 // Create new
updateOrder(id, data)             // Update existing
recordPayment(id, amount, type)   // Record payment
getPendingOrders(shopId)          // Unpaid orders
getOrderSummary(shopId, dates)    // Statistics
```

### OrderItemModel
```typescript
getOrderItems(orderId)            // Get items in order
getOrderItemById(id)              // Get by ID
createOrderItem(data)             // Create new
createOrderItems(items)           // Create multiple
updateOrderItem(id, data)         // Update
deleteOrderItem(id)               // Delete
getOrderItemsWithDetails(id)      // Get with product info
deleteOrderItems(orderId)         // Delete all in order
```

### PaymentModel
```typescript
getAllPayments()                  // Get all
getPaymentById(id)                // Get by ID
getPaymentsByOrder(orderId)       // Get by order
createPayment(data)               // Create new
updatePayment(id, data)           // Update
deletePayment(id)                 // Delete
getPaymentsByDateRange(dates)     // Get by date range
getTotalPayments(dates)           // Sum by date range
getPaymentsByMethod(method)       // Get by method
getPaymentsByBank(bank)           // Get by bank
```

### CategoryModel
```typescript
getAllCategories()                // Get all
getCategoryById(id)               // Get by ID
getCategoryByName(name)           // Get by name
createCategory(name, sizeTypeId)  // Create new
updateCategory(id, name, type)    // Update
deleteCategory(id)                // Delete
getCategoryWithSizeType(id)       // Get with size type
countProductsInCategory(id)       // Count products
```

---

## Database Connection

**File:** `src/config/database.ts`

This creates a connection pool that:
- Manages 10 connections (development) or 20 (production)
- Reuses connections for efficiency
- Auto-reconnects on failure
- Has 10-second timeout

The pool is used by all models:
```typescript
const results = await query(sql, values);
```

---

## Adding a New Feature

### Example: Add a "Stock Level Alert" feature

#### 1. Add Model Method
**File:** `src/models/Product.ts`
```typescript
async getLowStockProducts(threshold: number = 10): Promise<Product[]> {
  const results = await query(
    'SELECT * FROM products WHERE stock_qty < ? AND product_status = "active"',
    [threshold]
  );
  return results;
}
```

#### 2. Add Controller Method
**File:** `src/controllers/ProductController.ts`
```typescript
async getLowStockProducts(req: Request, res: Response): Promise<void> {
  try {
    const threshold = Number(req.query.threshold) || 10;
    const products = await ProductModel.getLowStockProducts(threshold);
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
```

#### 3. Add Route
**File:** `src/routes/productRoutes.ts`
```typescript
router.get('/low-stock', ProductController.getLowStockProducts.bind(ProductController));
```

#### 4. Call from Frontend
```typescript
const getLowStock = async () => {
  const response = await fetch('http://localhost:3000/api/v1/products/low-stock?threshold=5');
  const data = await response.json();
  return data.data;
};
```

---

## API Response Examples

### Success Response
```json
{
  "success": true,
  "data": [...],
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Product not found",
  "details": "No product with ID 999"
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "pages": 15
  }
}
```

---

## Troubleshooting

### Problem: "Cannot connect to database"
**Solution:**
1. Check `.env` file has correct credentials
2. Verify Hostinger MySQL is running
3. Test with: `mysql -h 193.203.184.9 -u u331468302_dennup_pos -p`
4. Check if firewall allows connection

### Problem: "Tables not found"
**Solution:**
1. Ensure migrations have been run
2. Check database exists: `u331468302_dennup_pos`
3. Verify migrations were successful
4. Check database in phpMyAdmin

### Problem: "API returns 404"
**Solution:**
1. Check route is registered in `src/routes/index.ts`
2. Verify URL matches route definition
3. Check HTTP method (GET/POST/PUT/DELETE)
4. Ensure server is running on port 3000

### Problem: "TypeScript compilation errors"
**Solution:**
1. Run: `npm run build`
2. Fix import paths
3. Check type definitions match
4. Install missing dependencies: `npm install`

---

## Development Workflow

### 1. Start the Server
```bash
cd backend
npm run dev
```
This auto-reloads when you change files.

### 2. Test with cURL
```bash
curl http://localhost:3000/api/v1/products
```

### 3. Check Logs
Logs show:
- Database connections
- Request/response info
- Errors and debug info

### 4. Debug Issues
Edit log level in `.env`:
```env
LOG_LEVEL=debug    # Shows all details
LOG_LEVEL=info     # Shows important events
LOG_LEVEL=error    # Shows only errors
```

---

## Production Deployment

### Before Deploying:
1. ✅ Run all migrations on production database
2. ✅ Update `.env` with production credentials
3. ✅ Set `NODE_ENV=production`
4. ✅ Change `JWT_SECRET` to strong random value
5. ✅ Enable CORS for production domain
6. ✅ Test all endpoints thoroughly

### Deployment Steps:
1. Push code to server
2. Install dependencies: `npm install --production`
3. Build TypeScript: `npm run build`
4. Start server: `npm start`
5. Use PM2 or similar to keep running: `pm2 start npm -- start`

---

## Support

For issues or questions:
1. Check API_DOCUMENTATION.md for endpoint details
2. Review model methods for available queries
3. Check error logs for detailed messages
4. Verify database migrations were run
5. Test database connection directly

---

**Last Updated:** 2025-11-19
**Version:** 1.0
