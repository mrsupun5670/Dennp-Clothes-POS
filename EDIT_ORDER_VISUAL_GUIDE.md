# Edit Order Mode - Visual Guide

## Cancel Button Behavior

### Normal Sales Mode
```
Order Summary    4 items    📝 Notes  🔄 Clear
                                        ↓
                                   Clears cart
                                   Resets form
```

### Edit Order Mode
```
Order Summary    4 items    📝 Notes  ✕ Cancel
                                        ↓
                                  Discards changes
                                  Returns to sales
```

---

## Payment Amount Display

### Before Entering Amount
```
┌─────────────────────────────────────┐
│ Amount to Collect: Rs. 5,050        │
└─────────────────────────────────────┘
```

### After Entering Cash Amount (Partial)
```
┌─────────────────────────────────────┐
│ Amount to Collect: Rs. 5,050        │
│ Amount Paid:       Rs. 3,000        │
│ Balance Due:       Rs. 2,050   ← RED
└─────────────────────────────────────┘
```

### After Full Payment
```
┌─────────────────────────────────────┐
│ Amount to Collect: Rs. 5,050        │
│ Amount Paid:       Rs. 5,050        │
│ ✓ Full Payment            ← GREEN   │
└─────────────────────────────────────┘
```

### After Overpayment
```
┌─────────────────────────────────────┐
│ Amount to Collect: Rs. 5,050        │
│ Amount Paid:       Rs. 5,500        │
│ Excess: Rs. 450             ← BLUE  │
└─────────────────────────────────────┘
```

---

## Edit Order Complete Flow

### Step 1: View in Orders Page
```
┌─────────────────────────────────────┐
│ Order ID: ORD-1234567890           │
│ Customer: John Doe                 │
│ Items: 2                           │
│ Total: Rs. 2,500                   │
│ Status: Pending                    │
│                                     │
│ [Details] [Edit in Sales] [Delete] │
│              ↓                      │
└─────────────────────────────────────┘
```

### Step 2: Click "Edit in Sales"
```
Data stored:
└─ sessionStorage
   ├─ orderToEdit: {
   │  ├─ orderId: "ORD-1234567890"
   │  ├─ customerId: "C001"
   │  ├─ customerName: "John Doe"
   │  ├─ items: [...]
   │  └─ totalAmount: 2500
   │ }
   └─ navigateToSales: "true"
```

### Step 3: Auto-Navigate to SalesPage
```
App.tsx detects:
└─ navigateToSales = "true"
   ├─ Sets currentPage = "sales"
   └─ Clears flag
```

### Step 4: SalesPage Loads Order Data
```
SalesPage useEffect:
├─ Read sessionStorage.orderToEdit
├─ Set customer: "John Doe"
├─ Set cart items: [Item1, Item2]
├─ Set editingOrderId: "ORD-1234567890"
├─ Button shows: "📝 Update Order"
├─ Header shows: "✕ Cancel" (not "🔄 Clear")
└─ Clear sessionStorage
```

### Step 5: User Edits Order
```
Initial State:
├─ Customer: John Doe ✓
├─ Items: 2 (Rs. 2,500) ✓
├─ Paid: Rs. 0
└─ Balance: Rs. 2,500 ✓

User Actions:
├─ Remove 1 item → Now 1 item (Rs. 1,250)
├─ Enter paid amount → Rs. 1,250
├─ Switch to bank payment
├─ Add bank details
└─ Real-time balance updates

New State:
├─ Customer: John Doe ✓
├─ Items: 1 (Rs. 1,250) ✓
├─ Paid: Rs. 1,250
├─ Balance: Rs. 0 (FULL PAYMENT ✓)
└─ Payment: Bank details saved ✓
```

### Step 6: Save or Cancel

**Option A: Save Changes**
```
Click "📝 Update Order"
├─ Validate all fields
├─ Calculate balance
├─ Log order data: {
│  ├─ orderId: "ORD-1234567890" (same ID!)
│  ├─ isEdit: true
│  ├─ items: [updated items]
│  ├─ total: 1250
│  ├─ paidAmount: 1250
│  ├─ balance: 0
│  └─ orderStatus: "Paid"
│ }
├─ Show success: "Order updated!\nTotal: 1250\nPaid: 1250\nBalance: 0"
├─ Reset form
└─ Return to fresh sales page
```

**Option B: Cancel Changes**
```
Click "✕ Cancel"
├─ Discard all changes
├─ Reset form
└─ Return to fresh sales page
```

---

## Payment Balance Display Colors

```
┌─────────────────────────────────────────────────┐
│ BALANCE VISUALIZATION                           │
├─────────────────────────────────────────────────┤
│                                                 │
│ Balance = Total - Paid                         │
│                                                 │
│ if balance = 0     → ✓ Full Payment (GREEN)   │
│ if balance > 0     → Rs. X Due (RED)          │
│ if balance < 0     → Excess Rs. X (BLUE)      │
│                                                 │
├─────────────────────────────────────────────────┤
│ EXAMPLES                                        │
├─────────────────────────────────────────────────┤
│                                                 │
│ Total: Rs. 1,000, Paid: Rs. 1,000             │
│ Balance: Rs. 0 → ✓ Full Payment (GREEN)       │
│                                                 │
│ Total: Rs. 1,000, Paid: Rs. 600               │
│ Balance: Rs. 400 → Balance Due (RED)          │
│                                                 │
│ Total: Rs. 1,000, Paid: Rs. 1,200             │
│ Balance: -Rs. 200 → Excess Rs. 200 (BLUE)     │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## Edit Mode Scenarios

### Scenario 1: Add Items While Editing
```
BEFORE:                          AFTER:
Total: Rs. 2,500                Total: Rs. 4,500
Paid:  Rs. 1,000                Paid:  Rs. 1,000
Due:   Rs. 1,500 (RED)          Due:   Rs. 3,500 (RED)
```

### Scenario 2: Add Payment While Editing
```
BEFORE:                          AFTER:
Total: Rs. 5,000                Total: Rs. 5,000
Paid:  Rs. 2,000                Paid:  Rs. 5,000
Due:   Rs. 3,000 (RED)          ✓ Full Payment (GREEN)
```

### Scenario 3: Change Payment Method
```
BEFORE:                          AFTER:
Method: Cash                     Method: Bank
Cash payment showing             Bank details modal
                                 Receipt # field
                                 Branch selection
                                 Date/time picker
```

---

## Button States in Edit Mode

### Edit Mode Header
```
Order Summary    4 items    📝 Notes  ✕ Cancel
                              ↓          ↓
                           Opens     Cancels edit
                           notes     & returns to
                           modal     normal sales
```

### Edit Mode Action Buttons
```
[  📝 Update  ]  [  🖨️ Print  ]
     (Green)       (Red outline)
        ↓              ↓
    Saves order    Can't print
    with changes   bank payments
                   Can print cash
                   with full payment
```

---

## Real-Time Balance Updates

```
User Types Cash Amount
        ↓
Value changes: "1" → "10" → "100" → "1000"
        ↓
Component re-renders
        ↓
Balance recalculated
        ↓
Color updates:
"Balance Due: Rs. X" (RED)
↓ (user adds more)
"✓ Full Payment" (GREEN)
↓ (user adds even more)
"Excess: Rs. X" (BLUE)
```

---

## Smooth Transitions

### Payment Method Switch
```
Before Selection              After Selection
(Opacity: 0)                 (Opacity: 1)
(TranslateY: -10px)    →     (TranslateY: 0)
                       0.3s with ease-in-out
```

### Branch Selection Slide
```
Online Transfer Unchecked    Branch Field Appears
(Hidden, No Space)      →    (Slides down 0.3s)
(Opacity: 0)                 (Opacity: 1)
                             (TranslateY: 0)
```

---

## Validation Rules

### When Saving Order (Edit Mode)

```
✓ Customer selected     (Required)
✓ Items in cart         (At least 1 required)
✓ Payment entered       (Depends on method)
  ├─ Cash: Amount required
  └─ Bank: Bank details required

If valid → Show success message
If invalid → Show error alert
```

---

## Success Messages

### New Order
```
Alert Message:
Order ORD-1234567890 created successfully!

Total:   Rs. 5,050
Paid:    Rs. 2,000
Balance: Rs. 3,050
```

### Edit Existing Order
```
Alert Message:
Order ORD-1234567890 updated successfully!

Total:   Rs. 4,500
Paid:    Rs. 4,500
Balance: Rs. 0
```

---

## Error Handling

```
If customer not selected:
└─ Alert: "Please select a customer"

If no items in cart:
└─ Alert: "Please add items to cart"

If cash selected but no amount:
└─ Alert: "Please enter cash amount"

If bank selected but no details:
└─ Alert: "Please add bank payment details"

If branch required but not selected:
└─ Alert: "Please select a branch"

If receipt number missing:
└─ Alert: "Receipt number is required"
```

---

## Summary Flow Diagram

```
┌─────────────────────────────────────────────────────┐
│              EDIT ORDER COMPLETE FLOW               │
├─────────────────────────────────────────────────────┤
│                                                     │
│ OrdersPage → Click "Edit in Sales"                │
│     ↓                                              │
│ sessionStorage stores order data                  │
│     ↓                                              │
│ App detects navigation flag                       │
│     ↓                                              │
│ Switch to SalesPage                              │
│     ↓                                              │
│ Load order from sessionStorage                   │
│     ├─ Customer: John Doe                        │
│     ├─ Items: 2 products                         │
│     ├─ Total: Rs. 2,500                          │
│     ├─ editingOrderId: "ORD-xxx"                │
│     └─ Show "✕ Cancel" button                   │
│     ↓                                              │
│ User edits order                                 │
│     ├─ Add/remove items                         │
│     ├─ Change payment                           │
│     ├─ Real-time balance update                 │
│     └─ Color coding shows status                │
│     ↓                                              │
│ Two options:                                      │
│     ├─ "📝 Update" → Save changes               │
│     │   └─ New total calculated                 │
│     │   └─ Balance recalculated                 │
│     │   └─ Back to sales page                   │
│     │                                            │
│     └─ "✕ Cancel" → Discard changes            │
│         └─ Back to sales page                   │
│                                                    │
└─────────────────────────────────────────────────────┘
```

---

## User Experience Summary

✅ **Clear Visual Feedback:** Color-coded balance display
✅ **Easy Navigation:** One-click edit from orders page
✅ **Real-Time Updates:** Balance recalculates instantly
✅ **Safe Editing:** Cancel button prevents accidental saves
✅ **Full Control:** Can modify all order aspects
✅ **Payment Flexibility:** Supports cash and bank transfers
✅ **Professional Look:** Smooth animations and transitions
✅ **Error Prevention:** Validation prevents incomplete orders

**Everything flows smoothly for a professional editing experience!**

