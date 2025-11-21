# Shop Details Display - Complete Guide

## 📍 Overview

The shop system now displays complete shop information retrieved directly from the database `shops` table. Users can see the shop they're currently working with, along with all relevant details.

---

## 🎯 What's Displayed

### Shop Information from Database

All of this information is fetched from the `shops` table in your database:

```
Table: shops
├── shop_id: Unique shop identifier
├── shop_name: Name of the shop
├── address: Physical address
├── contact_phone: Contact number
├── manager_name: Shop manager's name
├── shop_status: active/inactive/closed
└── opening_date: Date shop was opened
```

---

## 🖥️ Display Locations

### 1. Header - Shop Badge (Compact)
**Location:** Top-right of the header

**Shows:**
```
🏪 Shop Name
ID: 1
```

**Features:**
- Always visible
- Compact design
- Quick reference
- Red accent color

---

### 2. Header - Status Indicator
**Location:** Next to shop badge in header

**Shows:**
```
✓ Active     [ACTIVE]
```

**Features:**
- Color-coded status
- Quick status check
- Green = Active, Yellow = Inactive, Red = Closed

---

### 3. Floating Info Button
**Location:** Bottom-right corner of screen

**Icon:** ℹ️

**Features:**
- Always accessible
- Floating button
- Click to open detailed modal
- Appears on every page

---

### 4. Shop Details Modal
**Opening:** Click the ℹ️ button in bottom-right

**Displays:**

#### Header
```
🏪
Colombo Flagship
Shop ID: 1
Status: ACTIVE
```

#### Main Information
```
👤 Manager
Aisha Khan

📞 Contact Phone
0112345678

📍 Address
123 Galle Rd, Colombo 03

📅 Opening Date
Sunday, January 15, 2023
```

#### Key Information Section
```
🔑 Shop ID: #1
Data Scope: All products, customers, and orders isolated to this shop
Status: This shop is currently ACTIVE and ready for operations
```

---

## 🎨 Component Details

### ShopBadge Component

**Location:** `frontend/src/components/ShopBadge.tsx`

**Props:**
```typescript
interface ShopBadgeProps {
  size?: "sm" | "md" | "lg";      // Compact, Medium, Large
  showBorder?: boolean;            // Show red border
  showFullDetails?: boolean;       // Expand to show full info
}
```

**Usage Examples:**

```typescript
// Compact badge (header)
<ShopBadge size="sm" />

// Medium badge with full details
<ShopBadge size="md" showFullDetails={true} />

// Large badge without border
<ShopBadge size="lg" showBorder={false} />
```

---

### ShopInfoPanel Component

**Location:** `frontend/src/components/ShopInfoPanel.tsx`

**Props:**
```typescript
interface ShopInfoPanelProps {
  variant?: "card" | "inline" | "detailed";
  showStatus?: boolean;
  className?: string;
}
```

**Variants:**

#### Inline
```
🏪 Colombo Flagship | ID: 1
```

```typescript
<ShopInfoPanel variant="inline" />
```

#### Card
```
┌─────────────────────┐
│ 🏪 Colombo Flagship │
│    ID: 1            │
│    Manager: Aisha   │
└─────────────────────┘
```

```typescript
<ShopInfoPanel variant="card" showStatus={true} />
```

#### Detailed
```
┌──────────────────────────────────────┐
│ 🏪 Colombo Flagship                  │
│    ID: 1 | [ACTIVE]                  │
│                                      │
│ Manager: Aisha Khan                  │
│ 📞 0112345678                        │
│ 📍 123 Galle Rd, Colombo 03          │
│ 📅 Jan 15, 2023                      │
└──────────────────────────────────────┘
```

```typescript
<ShopInfoPanel variant="detailed" />
```

---

### ShopStatus Component

**Location:** `frontend/src/components/ShopInfoPanel.tsx`

**Shows:** Active/Inactive status badge

**Usage:**
```typescript
<ShopStatus />
```

**Display:**
```
✓ Active     [ACTIVE]    (green badge)
✓ Active     [INACTIVE]  (yellow badge)
✓ Active     [CLOSED]    (red badge)
```

---

### ShopDetailsModal Component

**Location:** `frontend/src/components/ShopDetailsModal.tsx`

**Features:**
- Floating info button (ℹ️)
- Click to open full details
- Shows all shop information
- Database origin note
- Close button

**Usage:**
```typescript
// Automatically added to App.tsx
<ShopDetailsModal />
```

---

## 💾 Data Storage

### localStorage Keys

```javascript
// Simple shop data
localStorage.getItem('shopId')        // "1"
localStorage.getItem('shopName')      // "Colombo Flagship"

// Full shop data from database
localStorage.getItem('shopData')      // JSON string with full object
// {
//   "shop_id": 1,
//   "shop_name": "Colombo Flagship",
//   "address": "123 Galle Rd, Colombo 03",
//   "contact_phone": "0112345678",
//   "manager_name": "Aisha Khan",
//   "shop_status": "active",
//   "opening_date": "2023-01-15"
// }
```

### Context Data

```typescript
const { shopId, shopName, shopData } = useShop();

// shopId: number | null → 1
// shopName: string | null → "Colombo Flagship"
// shopData: Shop | null → Full shop object from database
```

---

## 🔄 How It Works

### 1. User Opens App
```
App loads
  ↓
ShopProvider checks localStorage
  ↓
If shopData found → Restore all shop info
If not found → Show ShopSelector
```

### 2. User Selects Shop from ShopSelector
```
User clicks shop in modal
  ↓
Full shop object fetched from API
  ↓
setShopData() called with complete object
  ↓
Saved to localStorage as JSON
  ↓
Context updated with shop info
  ↓
Header badge updates
  ↓
All pages can access via useShop()
```

### 3. User Clicks Info Button
```
Click ℹ️ button
  ↓
ShopDetailsModal opens
  ↓
Displays all shop details from shopData
  ↓
Color-coded status badge
  ↓
Click Close to dismiss
```

---

## 🎨 Color Coding

### Status Colors

```
ACTIVE    → Green   bg-green-900/30 text-green-400
INACTIVE  → Yellow  bg-yellow-900/30 text-yellow-400
CLOSED    → Red     bg-red-900/30 text-red-400
```

### Shop Badge Colors

```
Background: bg-red-900/30
Border:     border-red-600
Text:       text-red-400
Icon:       🏪 (building emoji)
```

---

## 📝 API Integration

### Shop Data Fetching

```typescript
// In ShopSelector component
const fetchShops = async () => {
  const response = await fetch("http://localhost:3000/api/v1/shops");
  const result = await response.json();
  // Returns array of Shop objects from database
  return result.data; // [{ shop_id, shop_name, address, ... }]
};
```

### Shop Data Storage

```typescript
// When user selects a shop
const handleSelectShop = (shop: Shop) => {
  setShopData(shop);  // Full database object
  // Automatically saves to:
  // - localStorage (JSON)
  // - Context state (object)
};
```

---

## 🔍 Current Shop Information Example

### Colombo Flagship Shop
```
Shop ID:        1
Shop Name:      Colombo Flagship
Manager:        Aisha Khan
Contact:        0112345678
Address:        123 Galle Rd, Colombo 03
Status:         ACTIVE
Opened:         January 15, 2023
```

### Kandy Boutique Shop
```
Shop ID:        2
Shop Name:      Kandy Boutique
Manager:        Nimal Perera
Contact:        0819876543
Address:        45 Temple St, Kandy
Status:         ACTIVE
Opened:         May 20, 2023
```

### Jaffna Store Shop
```
Shop ID:        4
Shop Name:      Jaffna Store
Manager:        Ravi Shankar
Contact:        0217778899
Address:        20 Main Rd, Jaffna
Status:         ACTIVE
Opened:         March 10, 2024
```

---

## 🚀 Usage Examples

### Example 1: Show Shop in Component
```typescript
import { ShopBadge } from "./components/ShopBadge";

export const MyComponent = () => {
  return (
    <div>
      <ShopBadge size="md" />
      {/* Shows shop badge with name and ID */}
    </div>
  );
};
```

### Example 2: Access Shop Data
```typescript
import { useShop } from "./context/ShopContext";

export const MyPage = () => {
  const { shopData, shopId } = useShop();

  return (
    <div>
      <h1>{shopData?.shop_name}</h1>
      <p>Manager: {shopData?.manager_name}</p>
      <p>Contact: {shopData?.contact_phone}</p>
      <p>Address: {shopData?.address}</p>
    </div>
  );
};
```

### Example 3: Show Shop Details Panel
```typescript
import { ShopInfoPanel } from "./components/ShopInfoPanel";

export const Dashboard = () => {
  return (
    <div>
      {/* Show detailed shop information */}
      <ShopInfoPanel variant="detailed" />

      {/* Or inline version */}
      <ShopInfoPanel variant="inline" />

      {/* Or card version */}
      <ShopInfoPanel variant="card" />
    </div>
  );
};
```

---

## ✅ Features

- ✅ Shop name always visible in header
- ✅ Shop ID displayed
- ✅ Manager information shown
- ✅ Contact phone number displayed
- ✅ Complete address shown
- ✅ Shop status (active/inactive/closed)
- ✅ Opening date displayed
- ✅ Data persisted in localStorage
- ✅ Automatic restoration on page reload
- ✅ Floating info button for quick access
- ✅ Comprehensive details modal
- ✅ Multiple display variants
- ✅ Database integration (real data from shops table)
- ✅ Color-coded status indicators

---

## 🔧 Technical Details

### Context Interface

```typescript
interface ShopContextType {
  shopId: number | null;
  shopName: string | null;
  shopData: Shop | null;           // ← Full shop object
  setShop: (shopId: number, shopName: string) => void;
  setShopData: (shop: Shop) => void;  // ← Set full object
  clearShop: () => void;
}
```

### Shop Interface

```typescript
export interface Shop {
  shop_id: number;
  shop_name: string;
  address: string;
  contact_phone: string;
  manager_name: string;
  shop_status: string;
  opening_date?: string;
}
```

---

## 📍 Files Modified/Created

### Created
```
✅ frontend/src/components/ShopInfoPanel.tsx
✅ frontend/src/components/ShopDetailsModal.tsx
```

### Modified
```
✅ frontend/src/context/ShopContext.tsx      (added shopData)
✅ frontend/src/components/ShopBadge.tsx     (added full details variant)
✅ frontend/src/components/ShopSelector.tsx  (updated to use setShopData)
✅ frontend/src/components/layout/POSLayout.tsx (added ShopStatus)
✅ frontend/src/App.tsx                      (added ShopDetailsModal)
```

---

## 🎯 Summary

The shop system now provides **complete visibility** into which shop is currently active and all its details from the database. Users can:

1. **Always see** their current shop in the header
2. **Quick check** shop status with color-coded badge
3. **Access full details** by clicking the info button
4. **Know all details** about their shop (manager, contact, address, etc.)
5. **Trust the data** - it comes directly from the database shops table

This ensures clarity and transparency about which shop's data users are working with at all times.
