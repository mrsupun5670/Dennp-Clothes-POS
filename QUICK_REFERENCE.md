# Quick Reference - Add Product Implementation

## 🚀 Quick Start

### 1. Start Backend
```bash
cd backend
npm run dev
```

### 2. Start Frontend
```bash
cd frontend
npm run dev
```

### 3. Test Add Product
1. Navigate to Stock page
2. Click "+ Add Product" button
3. Fill form and click "Add Product"
4. See success message and product in list

---

## 📊 API Endpoints

### Products
```
POST   /api/v1/products                    Create product
GET    /api/v1/products                    Get all products
GET    /api/v1/products/:id                Get product by ID
GET    /api/v1/products/:id/details        Get with colors/sizes
PUT    /api/v1/products/:id                Update product
DELETE /api/v1/products/:id                Delete product
```

### Colors
```
POST   /api/v1/colors                      Create color
GET    /api/v1/colors                      Get all colors
POST   /api/v1/products/:id/colors         Add color to product
DELETE /api/v1/products/:id/colors/:cid    Remove color
```

### Sizes
```
POST   /api/v1/sizes                       Create size
GET    /api/v1/sizes                       Get all sizes
POST   /api/v1/products/:id/sizes          Add size to product
DELETE /api/v1/products/:id/sizes/:sid     Remove size
```

### Categories
```
GET    /api/v1/categories                  Get all categories
POST   /api/v1/categories                  Create category
PUT    /api/v1/categories/:id              Update category
DELETE /api/v1/categories/:id              Delete category
```

---

## 💾 Database Tables

| Table | Purpose | Key Fields |
|-------|---------|-----------|
| products | Product info | sku, product_name, cost_price, print_cost, retail_price |
| colors | Available colors | color_id, color_name, hex_code |
| sizes | Available sizes | size_id, size_name, size_type_id |
| product_colors | Color associations | product_id, color_id |
| product_sizes | Size associations | product_id, size_id |
| categories | Product categories | category_id, category_name, size_type_id |

---

## 🔧 Key Files

### Backend Models
- `backend/src/models/Product.ts` - Product CRUD + variants
- `backend/src/models/Color.ts` - Color management
- `backend/src/models/Size.ts` - Size management
- `backend/src/models/Category.ts` - Category management

### Backend Controllers
- `backend/src/controllers/ProductController.ts` - Product API handlers
- `backend/src/controllers/ColorController.ts` - Color API handlers
- `backend/src/controllers/SizeController.ts` - Size API handlers
- `backend/src/controllers/CategoryController.ts` - Category API handlers

### Backend Routes
- `backend/src/routes/productRoutes.ts` - Product endpoints
- `backend/src/routes/colorRoutes.ts` - Color endpoints
- `backend/src/routes/sizeRoutes.ts` - Size endpoints
- `backend/src/routes/categoryRoutes.ts` - Category endpoints

### Frontend
- `frontend/src/pages/ProductsPage.tsx` - Product page with form

---

## 📝 Form Structure

```
Add Product Modal
├── Row 1: Product Code | Category
├── Row 2: Product Name (full width)
├── Row 3: Cost Price | Print Cost | Retail Price | Wholesale Price
├── Stock Grid:
│   ├── Size | Color | Qty | +Size | +Color | Delete
│   └── ... (multiple rows)
└── Buttons: Add Product | Cancel
```

---

## ✅ Validation Rules

| Field | Required | Rules |
|-------|----------|-------|
| Product Code | Yes | Unique, non-empty |
| Product Name | Yes | Non-empty |
| Cost Price | Yes | Numeric, >= 0 |
| Print Cost | Yes | Numeric, >= 0 |
| Retail Price | Yes | Numeric, >= 0 |
| Wholesale Price | No | Numeric, >= 0 |
| Size | Yes | At least one row |
| Color | Yes | At least one row |

---

## 🔄 Data Flow

```
User Input
   ↓
Frontend Validation
   ↓
API Call to Backend
   ↓
Backend Validation
   ↓
Create/Update Product
   ↓
Create/Link Colors
   ↓
Create/Link Sizes
   ↓
Response to Frontend
   ↓
Show Success Message
   ↓
Refresh Product List
```

---

## 🐛 Troubleshooting

| Error | Solution |
|-------|----------|
| "Cannot connect to API" | Make sure backend is running on port 3000 |
| "Product Code is required" | Fill in SKU field |
| "Price validation error" | Enter valid decimal numbers |
| "Database error" | Check MySQL connection and migrations |
| Product not appearing | Check browser console for fetch errors |

---

## 📋 Feature Checklist

- ✅ Create product
- ✅ Update product
- ✅ Add colors to product
- ✅ Add sizes to product
- ✅ Auto-create colors if missing
- ✅ Auto-create sizes if missing
- ✅ Form validation
- ✅ Error messages
- ✅ Success messages
- ✅ Loading states
- ✅ Refresh product list
- ✅ Backend persistence

---

## 🎯 Example API Call

### Create Product
```bash
curl -X POST http://localhost:3000/api/v1/products \
  -H "Content-Type: application/json" \
  -d '{
    "sku": "TSB-001",
    "product_name": "Blue T-Shirt",
    "category_id": 1,
    "cost_price": 12.50,
    "print_cost": 8.50,
    "retail_price": 29.99,
    "wholesale_price": 18.99,
    "product_status": "active"
  }'
```

### Add Color to Product
```bash
curl -X POST http://localhost:3000/api/v1/products/1/colors \
  -H "Content-Type: application/json" \
  -d '{ "color_id": 1 }'
```

### Add Size to Product
```bash
curl -X POST http://localhost:3000/api/v1/products/1/sizes \
  -H "Content-Type: application/json" \
  -d '{ "size_id": 1 }'
```

---

## 📞 Support

For issues or questions:
1. Check the full `PRODUCT_IMPLEMENTATION_GUIDE.md`
2. Review error messages in browser console
3. Check backend logs
4. Verify database connection
5. Check database migrations were run

---

**Version:** 1.0
**Last Updated:** 2025-11-19
**Status:** ✅ Production Ready
