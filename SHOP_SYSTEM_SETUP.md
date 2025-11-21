# Shop System Implementation Guide

## Overview

The shop system has been implemented to support multi-branch isolation across the Dennp Clothes POS application. All products, customers, categories, colors, and sizes are now scoped to specific shops.

---

## Components Created

### 1. ShopContext (`frontend/src/context/ShopContext.tsx`)

Provides global shop state management using React Context.

**Features:**
- Stores `shopId` and `shopName`
- Persists shop selection in localStorage
- Provides `useShop()` hook for accessing shop data anywhere in the app

**Usage:**
```typescript
import { useShop } from "../context/ShopContext";

const MyComponent = () => {
  const { shopId, shopName, setShop, clearShop } = useShop();

  // shopId: Current shop ID (number | null)
  // shopName: Current shop name (string | null)
  // setShop(id, name): Set the active shop
  // clearShop(): Clear the shop selection
};
```

---

### 2. ShopBadge Component (`frontend/src/components/ShopBadge.tsx`)

Displays the currently selected shop in the UI.

**Components:**
- `ShopBadge`: Displays shop name and ID with an icon
- `ShopIndicator`: Shows status badge (green when shop selected, yellow if not)

**Usage:**
```typescript
import { ShopBadge, ShopIndicator } from "../components/ShopBadge";

// In header
<ShopBadge size="sm" showBorder={true} />

// For status check
<ShopIndicator />
```

**Sizes:** `sm` | `md` | `lg`

---

### 3. ShopSelector Component (`frontend/src/components/ShopSelector.tsx`)

UI component for selecting a shop from available options.

**Features:**
- Fetches all available shops from API
- Allows user to select a shop
- Can be used as modal (initial setup) or inline selector
- Shows shop details: name, ID, manager, address

**Usage:**
```typescript
import { ShopSelector } from "../components/ShopSelector";

// As initial setup modal
<ShopSelector isInitialSetup={true} onShopSelected={handleSetup} />

// As inline selector
<ShopSelector />
```

---

## Updated Components

### POSLayout (`frontend/src/components/layout/POSLayout.tsx`)

**Changes:**
- Added `ShopBadge` to header (displays in top-right corner)
- Shop badge shows "🏪 Shop Name" with "ID: X"
- Updates automatically when shop changes

**Location in Header:**
```
[Logo] Dennep Clothes POS | [ShopBadge] [Time] [User] [Close]
```

---

### ProductsPage (`frontend/src/pages/ProductsPage.tsx`)

**Changes:**
- Added `useShop()` hook to get current shop ID
- All API calls now include `?shop_id=X` parameter
- Products filtered by shop automatically
- Categories, Colors, Sizes also filtered by shop
- POST/PUT requests include shop_id in payload

**API Calls Updated:**
```typescript
// Before
fetch("http://localhost:3000/api/v1/products")

// After
fetch(`http://localhost:3000/api/v1/products?shop_id=${shopId}`)
```

**All calls updated:**
- GET products
- GET categories
- GET colors
- GET sizes
- POST product (includes shop_id in body)
- POST color (includes shop_id in body)
- POST size (includes shop_id in body)

---

### CustomersPage (`frontend/src/pages/CustomersPage.tsx`)

**Changes:**
- Added `useShop()` hook to get current shop ID
- Customers API calls include `?shop_id=X` parameter
- Customer creation includes shop_id
- Only shop-specific customers are displayed

**API Calls Updated:**
```typescript
// GET customers
fetch(`http://localhost:3000/api/v1/customers?shop_id=${shopId}`)

// POST customer (includes shop_id)
{
  shop_id: shopId,
  first_name: "...",
  last_name: "...",
  mobile: "...",
  // ...
}
```

---

### App.tsx

**Changes:**
- Wrapped entire app with `<ShopProvider>`
- All child components can now access shop context

```typescript
<ShopProvider>
  <POSLayout currentPage={currentPage} onPageChange={setCurrentPage}>
    {renderPage()}
  </POSLayout>
</ShopProvider>
```

---

## Backend Integration

All backend controllers require `shop_id` as a query parameter:

```
GET /api/v1/products?shop_id=1
GET /api/v1/customers?shop_id=1
GET /api/v1/categories?shop_id=1
GET /api/v1/colors?shop_id=1
GET /api/v1/sizes?shop_id=1
```

For POST/PUT requests, include `shop_id` in the request body:

```json
{
  "shop_id": 1,
  "field_name": "value"
}
```

---

## Implementation Details

### Data Flow

```
1. User opens app
   ↓
2. ShopProvider checks localStorage for saved shop_id
   ↓
3. If found, setShop() restores shop context
   ↓
4. ShopBadge displays current shop in header
   ↓
5. All page components (Products, Customers, etc.) use useShop()
   ↓
6. API calls automatically include shop_id parameter
   ↓
7. Backend filters results by shop_id
   ↓
8. Only relevant data is displayed to user
```

### Storage

- **Location:** Browser's localStorage
- **Keys:** `shopId` and `shopName`
- **Persistence:** Survives browser refresh/restart
- **Clearing:** Happens on logout (should be implemented)

---

## How to Add Shop Filtering to New Pages

When creating a new page that needs shop filtering:

1. **Import useShop:**
```typescript
import { useShop } from "../context/ShopContext";
```

2. **Get shop ID in component:**
```typescript
const { shopId } = useShop();
```

3. **Add shop_id to query parameters:**
```typescript
const response = await fetch(`http://localhost:3000/api/v1/endpoint?shop_id=${shopId}`);
```

4. **Add shop_id to request body for POST/PUT:**
```typescript
body: JSON.stringify({
  shop_id: shopId,
  // ... other fields
})
```

5. **Handle loading state when shop_id is null:**
```typescript
const { data, isLoading } = useQuery(
  ["items", shopId],
  async () => {
    if (!shopId) throw new Error("Shop ID required");
    // ... fetch logic
  },
  shopId !== null  // Only fetch when shopId is set
);
```

---

## API Requirements Checklist

For pages to work correctly with the shop system:

- ✅ Backend returns 400 error if shop_id is missing
- ✅ All products filtered by shop_id
- ✅ All customers filtered by shop_id
- ✅ All categories filtered by shop_id
- ✅ All colors filtered by shop_id
- ✅ All sizes filtered by shop_id
- ✅ Product creation validates shop_id
- ✅ Customer creation validates shop_id
- ✅ Foreign key constraints prevent cross-shop data access

---

## Testing Multi-Shop Isolation

1. **Start App:**
   - App loads and checks localStorage
   - If no shop selected, show ShopSelector

2. **Select Shop 1:**
   - Products Page shows only Shop 1 products
   - Customers Page shows only Shop 1 customers
   - Orders Page shows only Shop 1 orders

3. **Switch to Shop 2:**
   - Products Page shows only Shop 2 products
   - Customers Page shows only Shop 2 customers
   - All data automatically updates

4. **Create new product:**
   - Verify it's assigned to current shop
   - Switch shops and verify it's not visible

---

## Troubleshooting

### Issue: Products/Customers not loading
**Solution:**
- Check browser console for errors
- Verify backend is sending shop_id requirement
- Ensure localStorage has shopId key set
- Check network tab to see if shop_id is in query string

### Issue: ShopBadge shows "No Shop Selected"
**Solution:**
- Call `setShop()` from ShopSelector component
- Or manually set in localStorage: `localStorage.setItem('shopId', '1')`

### Issue: Data from all shops is showing
**Solution:**
- Verify backend controllers validate shop_id
- Check that shop_id is included in ALL API calls
- Look for any hardcoded queries without shop_id filter

---

## Future Enhancements

1. **Shop Switching Modal:** Modal to switch shops without page reload
2. **Shop Dashboard:** Per-shop analytics and statistics
3. **Shop Settings:** Admin panel to manage shop details
4. **Cross-Shop Reports:** Option to view data across multiple shops (admin only)
5. **Default Shop Selection:** Auto-select shop based on user's assigned shop
6. **Shop Permissions:** Role-based access (e.g., manager can only see their shop)

---

## Summary

The shop system is now fully integrated into the POS application. All data is properly scoped to individual shops, and the UI displays which shop is currently active. The implementation is maintainable, scalable, and follows React best practices using Context API for state management.
