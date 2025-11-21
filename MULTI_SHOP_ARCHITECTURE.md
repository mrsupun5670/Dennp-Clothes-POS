# Multi-Shop POS System Architecture - Strategic Recommendation

**Document Version**: 1.0
**Date**: November 21, 2025
**Status**: PROPOSAL (Not Yet Implemented)

---

## 🎯 Current Situation Analysis

### What We Have Now
- ✅ Backend models already support `shop_id` (Orders table uses it)
- ✅ Database designed for multi-shop capability
- ✅ Tauri desktop application (can run on multiple machines)
- ✅ Online database (Hostinger) accessible from anywhere
- ⚠️ Frontend **NOT YET** filtering by shop_id
- ⚠️ No shop context mechanism in the UI
- ⚠️ No shop selection/login system

### The Core Problem
Currently the system is designed for **single shop only** even though:
1. Backend supports multi-shop queries
2. Database has shop_id foreign keys
3. Models have shop filtering logic

**Example Issues**:
- ProductsPage loads ALL products (not filtered by shop)
- CustomersPage loads ALL customers (not filtered by shop)
- OrdersPage accepts shop_id but no UI mechanism to set it
- No way for different shops to authenticate or identify themselves

---

## 💡 Proposed Multi-Shop Architecture (3 Options)

### **OPTION 1: Machine-Based Shop Identification (RECOMMENDED) ✅**

#### How It Works
```
Shop 1 Machine
  ↓
App starts → Reads config file → Gets shop_id = 1
  ↓
All API calls use shop_id = 1 automatically
  ↓
Database filters: WHERE shop_id = 1

Shop 2 Machine
  ↓
App starts → Reads config file → Gets shop_id = 2
  ↓
All API calls use shop_id = 2 automatically
  ↓
Database filters: WHERE shop_id = 2
```

#### Implementation Steps
1. **Create config file** (`shop-config.json`)
   ```json
   {
     "shop_id": 1,
     "shop_name": "Dennep Clothes - Shop 1",
     "location": "Colombo",
     "backend_url": "https://your-server.com/api/v1"
   }
   ```

2. **Backend**: Create config service that reads this file
   ```typescript
   class ShopConfigService {
     async getShopId(): Promise<number>
     async getShopName(): Promise<string>
     async getBackendUrl(): Promise<string>
   }
   ```

3. **Frontend**: Create context to share shop_id across all pages
   ```typescript
   const ShopContext = React.createContext<{
     shopId: number;
     shopName: string;
   }>(null);
   ```

4. **All API calls**: Include shop_id in every request
   ```typescript
   // Before: GET /api/products
   // After: GET /api/products?shop_id=1

   // Or in request body for POST/PUT
   ```

#### Pros ✅
- Simple implementation
- No login required (each machine is pre-configured)
- Shop context always available
- Easy to switch shops (just edit config)
- No database changes needed
- Works offline (config is local)

#### Cons ❌
- One machine = one shop (can't switch within same instance)
- Requires manual file configuration for each machine
- If machine is shared, hard to support multiple shops

#### Best For
✅ **YOUR USE CASE** - Multiple shops, each with their own dedicated machine(s)

---

### **OPTION 2: Login-Based Shop Selection (Alternative)**

#### How It Works
```
App starts → Shows login screen
  ↓
User enters: shop_id + manager_id + password
  ↓
Backend verifies credentials
  ↓
App stores shop_id in sessionStorage/localStorage
  ↓
All subsequent API calls include shop_id
  ↓
On logout: shop_id cleared
```

#### Implementation Steps
1. Create Shop User model for login
2. Add authentication middleware to backend
3. Add login page to frontend
4. Store shop context after successful login
5. Clear on logout

#### Pros ✅
- Multiple shops can use same machine
- More secure (password protected)
- Flexible for shared machines
- User can switch shops by logging out/in

#### Cons ❌
- More complex implementation
- Database changes needed (shop_users table)
- Authentication infrastructure required
- User management overhead
- Extra login step every time app starts

#### Best For
✅ If shops want to share machines or have rotating staff

---

### **OPTION 3: Cloud-Based SaaS (Advanced - Likely Overkill)**

#### How It Works
- One centralized web app
- Users login with credentials
- Database has tenant isolation
- Row-level security (RLS) for data separation
- More enterprise approach

#### Pros ✅
- Professional SaaS model
- Scalable
- Easy user management
- Works on any device/browser

#### Cons ❌
- Completely different architecture
- Requires migration from Tauri desktop app
- Much more complex
- Not suitable for offline operation
- High development cost

#### Best For
✗ **NOT suitable for your needs** - You want desktop apps per location

---

## 📋 My Recommendation: OPTION 1 (Machine-Based)

### Why This Is Perfect For You

**Your Requirements**:
- ✅ Multiple shops in different locations
- ✅ Each location has its own POS machine(s)
- ✅ Need to keep data separate by shop
- ✅ Database is online but machines are offline-capable

**Perfect Match With Option 1**:
```
Shop 1 (Colombo) → Machine A → shop-config.json: shop_id=1
Shop 2 (Kandy)   → Machine B → shop-config.json: shop_id=2
Shop 3 (Galle)   → Machine C → shop-config.json: shop_id=3
```

Each machine automatically knows which shop it belongs to!

### Simple Mental Model
```
BEFORE (Current - Broken):
┌─────────────────────────────────┐
│ Product Management              │
│ ❌ Shows ALL products            │
│ (no shop filtering)             │
└─────────────────────────────────┘

AFTER (With Option 1 - Fixed):
┌─────────────────────────────────┐
│ Shop Config: shop_id = 1        │
│         ↓                        │
│ Product Management              │
│ ✅ Shows ONLY Shop 1 products   │
│ (filtered by shop_id)           │
└─────────────────────────────────┘
```

---

## 🔧 Implementation Plan (Option 1)

### Phase 1: Backend Infrastructure
1. Create `ShopConfigService`
2. Update all Model queries to require `shop_id`
3. Add validation to ensure shop_id is always provided
4. Add error handling for missing shop_id

### Phase 2: Frontend Context
1. Create `ShopContext` React context
2. Create `useShop()` custom hook
3. Wrap App with ShopProvider
4. Initialize shop_id on app startup

### Phase 3: Update All Pages
1. **ProductsPage**: Add `shop_id` to all queries
2. **CustomersPage**: Add `shop_id` to all queries
3. **OrdersPage**: Add `shop_id` to all queries
4. **InventoryPage**: Add `shop_id` to all queries
5. **SalesPage**: Include `shop_id` when creating orders
6. etc.

### Phase 4: Configuration
1. Create default `shop-config.json` template
2. Documentation on how to configure for each shop
3. Build script to package config with app

### Phase 5: Testing
1. Test with Shop 1 config
2. Test with Shop 2 config
3. Verify data separation
4. Test cross-shop isolation

---

## 📊 Comparison Table

| Aspect | Option 1 (Recommended) | Option 2 (Login) | Option 3 (Cloud) |
|--------|----------------------|------------------|------------------|
| Implementation Time | 2-3 days | 1-2 weeks | 4-6 weeks |
| Complexity | Low ⭐ | Medium ⭐⭐⭐ | High ⭐⭐⭐⭐ |
| Setup Per Shop | Easy (1 config) | Medium (1 user) | Easy (just login) |
| Security | Good | Better | Best |
| Offline Support | ✅ Yes | ✅ Yes | ❌ No |
| Multiple Shops on Same Machine | ❌ No | ✅ Yes | ✅ Yes |
| Suitable for Your Use Case | ✅✅✅ | ⭐⭐ | ❌ |
| Database Changes | ❌ None | ✅ Required | ✅ Required |
| Code Changes | Medium | Large | Huge |

---

## 🎯 Specific Examples - How Option 1 Works

### Example 1: Load Products for Shop 1
```typescript
// BEFORE (Current - Wrong)
const products = await ProductModel.getAllProducts();
// Returns ALL products from database ❌

// AFTER (With Option 1 - Correct)
const shopId = useShop().shopId; // = 1
const products = await ProductModel.getAllProductsByShop(shopId);
// Returns ONLY products where shop_id = 1 ✅
```

### Example 2: Create New Order for Shop 2
```typescript
// BEFORE (Current - Missing shop_id)
const order = await OrderModel.createOrder({
  customer_id: 5,
  total_amount: 5000,
  // ❌ No shop_id specified - database would need to guess!
});

// AFTER (With Option 1 - Correct)
const shopId = useShop().shopId; // = 2
const order = await OrderModel.createOrder({
  shop_id: shopId,      // ✅ Now explicitly included
  customer_id: 5,
  total_amount: 5000,
});
```

### Example 3: Frontend Component Using Context
```typescript
export const ProductsPage = () => {
  const { shopId, shopName } = useShop();

  useEffect(() => {
    // Automatically uses shop context
    fetchProductsForShop(shopId);
  }, [shopId]);

  return (
    <div>
      <h1>Products for {shopName}</h1>
      {/* All products shown are filtered by shop_id */}
    </div>
  );
};
```

---

## 📁 New File Structure

```
project/
├── backend/
│   └── src/
│       ├── services/
│       │   └── ShopConfigService.ts (NEW)
│       ├── middleware/
│       │   └── shopIdValidation.ts (NEW)
│       └── [existing files]
│
├── frontend/
│   └── src/
│       ├── contexts/
│       │   └── ShopContext.tsx (NEW)
│       ├── hooks/
│       │   └── useShop.ts (NEW)
│       ├── pages/
│       │   └── [existing pages - to be updated]
│       └── [existing files]
│
├── shop-config.json (NEW - Per machine)
└── [existing files]
```

---

## 🚀 Next Steps (When Ready)

1. **Confirm you want Option 1** - This approach recommended
2. **I'll create the infrastructure**:
   - ShopContext + useShop hook
   - ShopConfigService
3. **Update all pages systematically**:
   - Products
   - Customers
   - Orders
   - Inventory
   - etc.
4. **Testing & verification**
5. **Documentation for shop setup**

---

## ❓ Questions to Confirm Before Implementation

1. **Do you want each machine to have ONE shop ID?**
   - YES (Option 1) / NO (Option 2 needed)

2. **Should shop be configurable per machine?**
   - YES (config file) / NO (hardcoded)

3. **Should staff need to login?**
   - NO (simpler) / YES (more secure)

4. **Can machines be shared between shops?**
   - NO (each has one shop) / YES (need Option 2)

5. **How many shops do you have now?**
   - To help plan the initial setup

---

## 🎉 Summary

**Recommended Approach**: **OPTION 1 - Machine-Based Shop Configuration**

**Why**:
- Simple to implement
- Perfect for multi-location POS
- Each machine knows its own shop
- No authentication needed
- Database already supports it

**Effort**: ~2-3 days of work

**When**: After current Orders page is fully tested

---

**Are you ready to proceed with Option 1? Any questions about the architecture?**

