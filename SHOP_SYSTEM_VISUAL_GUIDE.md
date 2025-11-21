# Shop System Visual Design & Architecture Guide

## 1. Shop Display Design (Header)

### Current Implementation
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ [Logo] Dennep Clothes POS | [🏪 Shop Info] | [🕐 Time] | [👤 Admin] | [✕] │
└─────────────────────────────────────────────────────────────────────────────┘
        │                           │
        └─ Shop Badge              └─ Shows: "Colombo Flagship"
                                        "ID: 1"
```

### ShopBadge Component Details

```
┌──────────────────────────────────┐
│ 🏪 Colombo Flagship              │
│    ID: 1                         │
├──────────────────────────────────┤
│ Border: 2px red-600              │
│ Background: red-900/30           │
│ Text Color: red-400              │
└──────────────────────────────────┘
```

**Size Variants:**
```
SM (Small):    px-2 py-1 text-xs      → Ideal for header
MD (Medium):   px-3 py-2 text-sm      → Sidebar/cards
LG (Large):    px-4 py-3 text-base    → Dashboard displays
```

---

## 2. Shop Selector Modal

### Initial Load (No Shop Selected)
```
┌─────────────────────────────────────────────────┐
│      ⚠️ SELECT YOUR SHOP                        │
│                                                 │
│  Please select the shop you want to work with  │
│                                                 │
│ ┌─────────────────────────────────────────┐   │
│ │ 🏪 Colombo Flagship                  →  │   │
│ │    ID: 1 | Manager: Aisha Khan         │   │
│ │    123 Galle Rd, Colombo 03            │   │
│ └─────────────────────────────────────────┘   │
│                                                 │
│ ┌─────────────────────────────────────────┐   │
│ │ 🏪 Kandy Boutique                    →  │   │
│ │    ID: 2 | Manager: Nimal Perera       │   │
│ │    45 Temple St, Kandy                 │   │
│ └─────────────────────────────────────────┘   │
│                                                 │
│ ┌─────────────────────────────────────────┐   │
│ │ 🏪 Jaffna Store                      →  │   │
│ │    ID: 4 | Manager: Ravi Shankar       │   │
│ │    20 Main Rd, Jaffna                  │   │
│ └─────────────────────────────────────────┘   │
│                                                 │
│  You can change shops anytime from selector    │
└─────────────────────────────────────────────────┘
```

### Shop Selected (Header Update)
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ [Logo] Dennep Clothes POS | [🏪 Colombo Flagship ID:1] | [🕐 Time] | [✕]   │
└─────────────────────────────────────────────────────────────────────────────┘
                               ↑
                        Shop Badge Active
```

---

## 3. Architecture Overview

### Data Flow Diagram
```
┌──────────────┐
│  App Loads   │
└──────┬───────┘
       │
       ▼
┌──────────────────────────┐
│  ShopProvider Wraps App  │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│  Check localStorage for shopId       │
└──────┬───────────────────────────────┘
       │
       ├─── Found ──→ Restore shopId/shopName
       │
       └─── Not Found ──→ Show ShopSelector Modal
                             │
                             ▼
                        User Selects Shop
                             │
                             ▼
                        setShop(id, name)
                             │
                             ▼
                        Save to localStorage
                             │
                             ▼
                        POSLayout renders
                        with ShopBadge
                             │
                             ▼
                        Pages use useShop()
                             │
                             ▼
                        API calls include shop_id
```

---

## 4. Component Architecture

```
App.tsx
└── ShopProvider (Context)
    ├── POSLayout
    │   ├── ShopBadge (displays current shop)
    │   └── Navigation Tabs
    │
    └── Pages (all have access to useShop())
        ├── SalesPage
        ├── ProductsPage (filters by shop_id)
        ├── CustomersPage (filters by shop_id)
        ├── InventoryPage
        ├── OrdersPage (filters by shop_id)
        ├── ReportsPage
        ├── PaymentsPage
        ├── BankAccountsPage
        ├── AnalyticsPage
        ├── StockPage
        └── [Other Pages]
```

---

## 5. Context API Structure

### ShopContext.tsx
```typescript
interface ShopContextType {
  shopId: number | null;           // Current shop ID
  shopName: string | null;         // Current shop name
  setShop: (id: number, name: string) => void;  // Set shop
  clearShop: () => void;           // Clear shop (for logout)
}

// Usage in any component:
const { shopId, shopName, setShop } = useShop();
```

### localStorage Keys
```
Key: "shopId"     → Stores: number (e.g., "1")
Key: "shopName"   → Stores: string (e.g., "Colombo Flagship")
```

---

## 6. API Integration Points

### Products Page
```
Old: GET /api/v1/products
New: GET /api/v1/products?shop_id=1
     └─ Returns only products for shop_id=1

Old: POST /api/v1/products
New: POST /api/v1/products
     └─ Body includes: { shop_id: 1, ... }

Old: GET /api/v1/categories
New: GET /api/v1/categories?shop_id=1
     └─ Returns only categories for shop_id=1

Old: GET /api/v1/colors
New: GET /api/v1/colors?shop_id=1
     └─ Returns only colors for shop_id=1

Old: GET /api/v1/sizes
New: GET /api/v1/sizes?shop_id=1
     └─ Returns only sizes for shop_id=1
```

### Customers Page
```
Old: GET /api/v1/customers
New: GET /api/v1/customers?shop_id=1
     └─ Returns only customers for shop_id=1

Old: POST /api/v1/customers
New: POST /api/v1/customers
     └─ Body includes: { shop_id: 1, ... }
```

### Orders Page (Already Implemented)
```
GET /api/v1/orders?status=pending&shop_id=1
└─ Already filters by shop_id
```

---

## 7. Page Integration Checklist

```
✅ ProductsPage
   ├─ Import useShop hook
   ├─ GET products with ?shop_id=X
   ├─ GET categories with ?shop_id=X
   ├─ GET colors with ?shop_id=X
   ├─ GET sizes with ?shop_id=X
   ├─ POST product with shop_id in body
   ├─ POST color with shop_id in body
   └─ POST size with shop_id in body

✅ CustomersPage
   ├─ Import useShop hook
   ├─ GET customers with ?shop_id=X
   └─ POST customer with shop_id in body

✅ OrdersPage
   └─ Already filters by shop_id

⏳ Other Pages (To be updated)
   ├─ InventoryPage
   ├─ PaymentsPage
   ├─ ReportsPage
   ├─ AnalyticsPage
   └─ [Other pages with data operations]
```

---

## 8. User Experience Flow

### Scenario 1: First Time User
```
1. Open App
   ↓
2. App checks localStorage (no shopId found)
   ↓
3. ShopSelector Modal appears
   ↓
4. User clicks "🏪 Colombo Flagship"
   ↓
5. shopId=1, shopName="Colombo Flagship" saved
   ↓
6. POSLayout renders with ShopBadge showing "🏪 Colombo Flagship ID: 1"
   ↓
7. User navigates to Products → See only Colombo shop products
   ↓
8. User navigates to Customers → See only Colombo shop customers
```

### Scenario 2: Returning User
```
1. Open App
   ↓
2. App checks localStorage (shopId=1 found)
   ↓
3. Restore context: shopId=1, shopName="Colombo Flagship"
   ↓
4. POSLayout renders immediately with ShopBadge
   ↓
5. All pages load with correct shop filtering
```

### Scenario 3: Switch Shops
```
1. User clicks ShopSelector (implementation pending)
   ↓
2. Modal shows all available shops
   ↓
3. User clicks "🏪 Kandy Boutique"
   ↓
4. setShop(2, "Kandy Boutique")
   ↓
5. localStorage updates
   ↓
6. ShopBadge updates to show new shop
   ↓
7. All pages automatically reload with new shop data
```

---

## 9. Error Handling

### Missing Shop ID
```
API Response:
400 Bad Request
{
  "success": false,
  "error": "shop_id is required"
}

Frontend Handling:
- Show error notification
- Prompt user to select shop
- Display ShopSelector modal
```

### Invalid Shop ID
```
API Response:
404 Not Found
{
  "success": false,
  "error": "Shop not found"
}

Frontend Handling:
- Clear localStorage
- Show ShopSelector modal
- Allow user to select valid shop
```

---

## 10. Design Colors & Styling

### Shop Badge Colors
```
Background:  red-900/30 (rgba(127, 29, 29, 0.3))
Border:      red-600 (2px solid #dc2626)
Text:        red-400 (#f87171)
Icon:        🏪 (building emoji)

Hover Effects:
- Slight brightness increase on border
- Text highlights when interactive
```

### Status Indicator Colors
```
Shop Selected:    bg-green-900/30, border-green-600, text-green-400
No Shop Selected: bg-yellow-900/30, border-yellow-600, text-yellow-400
Error State:      bg-red-900/30, border-red-600, text-red-400
```

### Shop Selector Modal
```
Header Background: bg-gray-800
Option Background: bg-gray-700 (default)
Option Hover:      bg-red-600/30 (on hover)
Text:              text-red-400 (on hover: text-red-300)
Border:            border-gray-600 (on hover: border-red-600)
```

---

## 11. Implementation Timeline

### ✅ Completed
- [x] ShopContext creation
- [x] ShopProvider integration
- [x] ShopBadge component
- [x] ShopSelector component
- [x] POSLayout integration
- [x] ProductsPage shop filtering
- [x] CustomersPage shop filtering
- [x] App.tsx wrapping with ShopProvider

### ⏳ To Be Completed
- [ ] InventoryPage shop filtering
- [ ] PaymentsPage shop filtering
- [ ] ReportsPage shop filtering
- [ ] AnalyticsPage shop filtering
- [ ] SalesPage shop filtering
- [ ] Shop switching functionality (without page reload)
- [ ] Logout to clear shop selection
- [ ] User's default shop assignment

---

## 12. Testing Checklist

```
Manual Testing:

□ App starts and shows ShopSelector if no shop in localStorage
□ ShopBadge displays correctly in header
□ ProductsPage shows only current shop's products
□ ProductsPage shows only current shop's categories
□ ProductsPage shows only current shop's colors
□ ProductsPage shows only current shop's sizes
□ CustomersPage shows only current shop's customers
□ Creating product assigns correct shop_id
□ Creating customer assigns correct shop_id
□ Browser refresh maintains shop selection
□ Switching shops updates all pages' data
□ Shop selection persists after browser close/reopen

API Testing:

□ GET /api/v1/products?shop_id=1 returns shop 1 products only
□ GET /api/v1/customers?shop_id=1 returns shop 1 customers only
□ GET /api/v1/categories?shop_id=1 returns shop 1 categories only
□ POST /api/v1/products creates product for correct shop
□ POST /api/v1/customers creates customer for correct shop
□ Missing shop_id returns 400 error
□ Invalid shop_id returns 404 error
```

---

## Summary

The shop system provides a clean, intuitive way for users to manage multiple branches of the Dennp Clothes POS. The implementation uses React Context for global state, localStorage for persistence, and proper API integration for multi-branch data isolation.

Key features:
- **Visual:** Shop name and ID always visible in header
- **Persistent:** Shop selection survives browser refresh
- **Automatic:** All pages filter by shop without manual configuration
- **Scalable:** Easy to add shop filtering to new pages
- **Secure:** Backend enforces shop-level data isolation
