# Design Plan: Order Editing in SalesPage

## Overview
When a user clicks "✏️ Edit Order" in the OrdersPage, the order details should be loaded and displayed in the SalesPage with all corresponding customer information, cart items, and payment details pre-populated.

**Status:** Design Phase (UI/UX planning only)
**Backend Implementation:** To be done later

---

## Current Data Flow Issues

### Issue 1: SessionStorage Key Mismatch
- **OrdersPage stores with key:** `"editingOrder"`
- **SalesPage reads with key:** `"orderToEdit"`
- **Action:** Must use consistent key name

### Issue 2: Incomplete Order Data
OrdersPage currently sends:
```javascript
{
  orderId,
  orderNumber,
  customerId,
  customerName,
  customerMobile,
  items,
  totalAmount,
  orderStatus,
  paymentMethod
}
```

**Missing fields needed for full display:**
- `advance_paid` - Amount already paid
- `balance_due` - Remaining balance
- `delivery_charge` - Delivery cost (if applicable)
- `recipient_name` - Full customer name
- `order_notes` - Special notes/requests
- `orderDate` - When order was created
- Item details: `productCost`, `printCost`, `sizeId`, `colorId`

---

## UI/UX Design: Order Details Display in SalesPage

### 1. PAGE HEADER SECTION
**Current:** Shows "Sales" title
**To Add:**
- Show "Edit Order #IN{orderNumber}" when editing
- Display order creation date
- Show order current status badge

```
┌─────────────────────────────────────────────────────────────┐
│ Edit Order #IN12345                          [Status Badge]  │
│ Created: 28 Nov 2025, 2:30 PM                              │
│ Items in Cart: 3                                            │
└─────────────────────────────────────────────────────────────┘
```

---

### 2. LEFT COLUMN: CUSTOMER SECTION

**Current Display:**
- Customer ID and mobile (minimal)

**Enhanced Display for Edit Mode:**
```
┌─ CUSTOMER INFORMATION ─────────────────────────────────────┐
│                                                             │
│  Customer ID: 5                                            │
│  Name: Ahmed Hassan                                        │
│  Mobile: +94 777 123 456                                   │
│  Customer Type: [Retail] ⭐ Regular Customer               │
│  Total Orders: 5                | Total Spent: Rs. 45,000  │
│                                                             │
│  [✕ Clear Customer] [Find Another Customer]                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Implementation:**
- Display customer name prominently (not just ID)
- Show customer type badge (if customer is wholesale/retail)
- Display customer history (orders count, total spent)
- Add visual indicator for "existing customer"

---

### 3. LEFT COLUMN: PRODUCT CART SECTION

**Current Behavior:** Products added manually via search

**For Edit Mode - Pre-populated Cart:**
```
┌─ CART ITEMS (3 items) ─────────────────────────────────────┐
│                                                             │
│ ┌─ Item 1 ────────────────────────────────────────────────┐│
│ │ Name: Cotton T-Shirt (Product ID: 234)                 ││
│ │ Size: M  │  Color: Blue  │  Qty: 2  │  @ Rs. 1,500     ││
│ │ Total: Rs. 3,000                        [Remove ✕]      ││
│ │                                                         ││
│ │ ⚠️ Note: Quantity changed from 3 to 2                  ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ ┌─ Item 2 ────────────────────────────────────────────────┐│
│ │ Name: Denim Jeans (Product ID: 456)                    ││
│ │ Size: L  │  Color: Black  │  Qty: 1  │  @ Rs. 3,500    ││
│ │ Total: Rs. 3,500                        [Remove ✕]      ││
│ │                                                         ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ [+ Add More Items]                                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Features:**
- Show all items from original order
- Display change indicators (quantity changed, price changed)
- Allow adding/removing items in edit mode
- Show item-level totals

---

### 4. RIGHT COLUMN: ORDER SUMMARY & BILLING

**Current Display:** Basic total
**Enhanced for Edit Mode:**

```
┌─ ORDER SUMMARY & BILLING ──────────────────────────────────┐
│                                                             │
│  Subtotal (3 items)              Rs. 6,500                 │
│  ─────────────────────────────────────────────            │
│  Delivery Charge                 Rs. 500                   │
│  ─────────────────────────────────────────────            │
│  GRAND TOTAL                     Rs. 7,000                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Sub-section: Previous Payment Status**
```
┌─ PREVIOUS PAYMENT ─────────────────────────────────────────┐
│                                                             │
│  Original Total:        Rs. 7,000                          │
│  Already Paid:          Rs. 3,500   (50%)  ✓               │
│  Outstanding Balance:   Rs. 3,500   (50%)  ⚠️              │
│                                                             │
│  📌 Edit Mode Note: Changes to order total will affect     │
│     the outstanding balance calculation.                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Sub-section: Additional Payment**
```
┌─ ADDITIONAL PAYMENT (If updating order) ──────────────────┐
│                                                             │
│  New Total Amount:      Rs. 8,500                          │
│  Increase:              Rs. 1,500                          │
│  Already Paid:          Rs. 3,500                          │
│  New Balance Due:       Rs. 5,000                          │
│                                                             │
│  💰 Add Payment Method:                                    │
│                                                             │
│  ( ) Cash    ( ) Bank Transfer    ( ) Online Transfer     │
│                                                             │
│  If Payment Today:                                         │
│  [Cash Amount: _____________]                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### 5. NOTES/SPECIAL REQUESTS SECTION

**Current:** Modal-based notes editor
**Enhancement for Edit Mode:**

```
┌─ ORDER NOTES & SPECIAL REQUESTS ──────────────────────────┐
│                                                             │
│ [Original Notes]                                            │
│ "Custom printing required. Delivery after 3 days"         │
│                                                             │
│ [Edit Notes]        [View All Order History]              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### 6. ACTION BUTTONS SECTION

**Current:** Single "Save Order" button
**Enhanced for Edit Mode:**

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  [⬅️ Back to Orders]  [💾 Save Changes]  [🖨️ Print Order] │
│                                                             │
│  [❌ Discard Changes]                                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Button States:**
- **Save Changes:** Updates order in database (backend job)
- **Print Order:** Prints updated order details
- **Back to Orders:** Returns to OrdersPage without saving
- **Discard Changes:** Clears all edits and returns

---

## Data Population Logic

### When Edit Order is Clicked (OrdersPage → SalesPage)

**Step 1: Store Complete Order Data**
```javascript
// OrdersPage: handleEditOrder() function
const orderDataToEdit = {
  // Identifiers
  orderId: selectedOrder.order_id,
  orderNumber: selectedOrder.order_number,

  // Customer Information
  customerId: selectedOrder.customer_id,
  customerName: selectedOrder.recipient_name,
  customerMobile: selectedOrder.customer_mobile,

  // Order Items (with full details)
  items: selectedOrder.items.map(item => ({
    productId: item.product_id,
    productName: item.product_name,
    sizeId: item.size_id,
    sizeName: item.size_name,        // Need to fetch
    colorId: item.color_id,
    colorName: item.color_name,      // Need to fetch
    quantity: item.quantity,
    soldPrice: item.sold_price,
    productCost: item.product_cost,  // Need to fetch
    printCost: item.print_cost       // Need to fetch
  })),

  // Payment Information
  totalAmount: selectedOrder.total_amount,
  advancePaid: selectedOrder.advance_paid,
  balanceDue: selectedOrder.balance_due,
  paymentMethod: selectedOrder.payment_method,

  // Metadata
  orderDate: selectedOrder.order_date,
  orderStatus: selectedOrder.order_status,
  orderNotes: selectedOrder.notes,
  deliveryCharge: selectedOrder.delivery_charge
};

sessionStorage.setItem("editingOrder", JSON.stringify(orderDataToEdit));
```

**Step 2: SalesPage Loads and Displays Data**
```javascript
useEffect(() => {
  const orderData = sessionStorage.getItem("editingOrder");
  if (orderData) {
    const order = JSON.parse(orderData);

    // 1. Set page title
    setPageTitle(`Edit Order #IN${order.orderNumber}`);
    setIsEditingOrder(true);
    setEditingOrderId(order.orderId);

    // 2. Load customer
    setSelectedCustomer({
      id: order.customerId,
      name: order.customerName,
      mobile: order.customerMobile,
      // ... other customer fields from API
    });

    // 3. Load cart items
    const cartItems = order.items.map((item, idx) => ({
      id: `edit-${idx}-${Date.now()}`,
      productId: item.productId,
      productName: item.productName,
      size: item.sizeName,
      sizeId: item.sizeId,
      color: item.colorName,
      colorId: item.colorId,
      quantity: item.quantity,
      price: item.soldPrice,
      productCost: item.productCost,
      printCost: item.printCost
    }));
    setCartItems(cartItems);

    // 4. Load payment info
    setPreviouslyPaidAmount(order.advancePaid);
    setPaymentMethod(order.paymentMethod);

    // 5. Load metadata
    setOrderDate(order.orderDate);
    setOrderNotes(order.orderNotes);

    sessionStorage.removeItem("editingOrder");
  }
}, []);
```

---

## Display States & Behaviors

### State 1: View-Only Mode (Default for Edit)
- **When:** Order loaded and user is viewing details
- **Display:**
  - All fields show actual values from order
  - No input enabled
  - "Edit" button to enable editing
  - Change indicators show what's different

### State 2: Edit Mode
- **When:** User clicks "Edit" to modify details
- **Display:**
  - Quantity fields become editable
  - Price fields become editable
  - Can add/remove items
  - Live total recalculation
  - Visual diff shows original vs new values

### State 3: Dirty State (Changes Made)
- **When:** User modifies any field
- **Display:**
  - "Save Changes" button becomes prominent
  - "Discard Changes" button appears
  - Changed fields highlighted
  - New total shown vs original total
  - Balance due recalculated

---

## Information Architecture

### Header Information (Top of Page)
- ✅ Order Number: IN{orderNumber}
- ✅ Order Date: Creation date/time
- ✅ Order Status: Current status badge
- ✅ Customer Name (prominent)

### Left Column (Customer & Products)
- ✅ Customer full information card
- ✅ Cart items with all details
- ✅ Add more items option
- ✅ Item-level change indicators

### Right Column (Billing)
- ✅ Order summary (subtotal, delivery, total)
- ✅ Previous payment breakdown
- ✅ Outstanding balance
- ✅ New total calculation
- ✅ Payment method selector
- ✅ Additional payment input

### Bottom Section (Actions)
- ✅ Back to Orders
- ✅ Save Changes
- ✅ Print Order
- ✅ Discard Changes

---

## UI Components to Add/Modify

### New Components Needed:
1. **OrderMetadataCard** - Shows order date, number, status
2. **CustomerInfoCard** - Full customer details for edit mode
3. **PreviousPaymentInfo** - Shows payment breakdown
4. **ChangeIndicator** - Shows what changed in item
5. **OrderNotesDisplay** - Shows order notes/special requests

### Modified Components:
1. **SalesPage Header** - Show edit mode indicator
2. **CartItem** - Add change indicators
3. **OrderSummary** - Add previous payment section
4. **ActionButtons** - Add back/discard buttons

---

## Color & Visual Coding

### Payment Status Colors:
- 🟢 **Green:** Fully paid
- 🟡 **Yellow:** Partial payment / Outstanding balance
- 🔴 **Red:** Not paid

### Change Indicators:
- 🟦 **Blue:** New item added
- 🟧 **Orange:** Item modified
- 🟨 **Yellow:** Item quantity changed
- ❌ **Red:** Item removed

### Badges:
- `[EDIT MODE]` - Blue badge showing edit mode is active
- `[CHANGE]` - Orange badge showing field changed
- `[NEW ITEM]` - Green badge for newly added items

---

## Data Validation & Rules

### When Loading Order:
1. ✅ Verify order exists
2. ✅ Verify customer exists
3. ✅ Verify all products exist
4. ✅ Check current stock levels (may have changed)
5. ✅ Warn if items out of stock

### When Saving Changes:
1. ✅ Validate all items still exist
2. ✅ Validate quantities don't exceed stock
3. ✅ Validate prices are reasonable
4. ✅ Calculate new total correctly
5. ✅ Preserve payment history

---

## User Flow Diagram

```
OrdersPage
    ↓
[Double-click or "Edit Order" button]
    ↓
Store order data in sessionStorage
    ↓
Navigate to SalesPage
    ↓
SalesPage loads data from sessionStorage
    ↓
Display order details:
├─ Header: Order number & date
├─ Customer info card
├─ Cart with items & quantities
├─ Payment breakdown
└─ Action buttons
    ↓
User can:
├─ View only (initially)
├─ Edit quantities
├─ Add items
├─ Remove items
├─ Change notes
└─ Add additional payment
    ↓
[Save Changes] → Backend API call (future)
or
[Back/Discard] → Return to OrdersPage
```

---

## Notes for Backend Implementation (Phase 2)

When implementing the backend, ensure:

1. **Order Update Endpoint** (`PUT /api/orders/:id`)
   - Accept updated items, quantities, prices
   - Recalculate totals
   - Update order status if needed
   - Record audit trail (what changed)

2. **Payment History** (`GET /api/orders/:id/payments`)
   - Show all historical payments
   - Show payment method used
   - Show payment date/time

3. **Stock Check** (`GET /api/products/:id/stock`)
   - Real-time stock availability
   - Check if current order affects other orders

4. **Order Validation** (`POST /api/orders/:id/validate`)
   - Ensure all products still exist
   - Ensure sufficient stock
   - Ensure prices are reasonable

---

## Summary

This design plan provides:
- ✅ Complete UI specification for order editing
- ✅ Data structure and flow
- ✅ Visual hierarchy and information architecture
- ✅ State management approach
- ✅ Color coding and visual indicators
- ✅ User workflow

Ready for frontend implementation in phase 2, followed by backend API changes.
