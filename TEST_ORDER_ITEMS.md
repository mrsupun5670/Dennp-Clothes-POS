# Test Order Items Display - Quick Guide

## ✅ Prerequisites

Before testing, ensure:

```bash
# 1. Order items inserted in database
✓ Run: QUICK_COPY_PASTE.sql in Hostinger
  Result: 11 items inserted across 3 orders

# 2. Migration applied
✓ Run: backend/migrations/004_fix_order_status_enum.sql in Hostinger
  Result: order_status enum updated to support new values

# 3. Backend running
✓ Backend running on: http://localhost:3000
✓ Port: 3000
✓ Status: Running and ready

# 4. Frontend built
✓ Frontend built: npm run build successful
✓ Dist folder: Created
✓ Ready: Yes
```

---

## 🧪 Test Steps

### Step 1: Open Orders Page
```
1. Open your application
2. Navigate to Orders page
3. You should see a list of orders
4. Verify orders are displayed with shop_id filtering
```

### Step 2: Open Order Modal
```
1. Look at the Orders table
2. Double-click on an order row
   (or single-click then check if modal opens)
3. Order detail modal should open
```

### Step 3: Verify Order Items Load
```
1. Modal should show: "Loading order items..."
2. Wait a moment...
3. Loading message should disappear
4. Table with items should appear
```

### Step 4: Check Items Display
```
Verify the Order Items table shows:

Column Headers:
├── Product
├── Qty
├── Unit Price (Rs.)
└── Total (Rs.)

For each item:
├── Product name (e.g., "Product 1")
├── Quantity (e.g., "2")
├── Sold price (e.g., "1500.00")
└── Total price (e.g., "3000.00")

Subtotal row:
└── Should show order total amount
```

### Step 5: Test Multiple Orders
```
1. Close the current modal
2. Open another order
3. Verify new items load for that order
4. Check items are different/correct
```

### Step 6: Test Empty Order (if exists)
```
1. Try to open an order with no items
2. Should show: "No items found for this order"
3. Should NOT crash or error
```

---

## 📊 Expected Data

### Order 1 (order_id = 1)
```
Product 1 | Qty: 2 | Price: 1500 | Total: 3000
Product 2 | Qty: 1 | Price: 2500 | Total: 2500
Product 3 | Qty: 3 | Price: 800  | Total: 2400
Product 4 | Qty: 1 | Price: 3000 | Total: 3000
─────────────────────────────────────────────────
Subtotal:                              10900
```

### Order 2 (order_id = 2)
```
Product 2 | Qty: 2 | Price: 2500 | Total: 5000
Product 3 | Qty: 1 | Price: 800  | Total: 800
Product 5 | Qty: 2 | Price: 1200 | Total: 2400
─────────────────────────────────────────────────
Subtotal:                              8200
```

### Order 3 (order_id = 3)
```
Product 1 | Qty: 1 | Price: 1500 | Total: 1500
Product 4 | Qty: 2 | Price: 3000 | Total: 6000
Product 3 | Qty: 3 | Price: 800  | Total: 2400
Product 5 | Qty: 1 | Price: 1200 | Total: 1200
─────────────────────────────────────────────────
Subtotal:                              11100
```

---

## 🎯 What to Check

### Functionality Tests
- [ ] Modal opens when clicking order
- [ ] Loading message appears
- [ ] Items table loads after loading message
- [ ] All items display correctly
- [ ] Product names are correct
- [ ] Quantities are correct
- [ ] Prices are correct
- [ ] Totals are calculated correctly
- [ ] Subtotal matches order total
- [ ] Modal closes without errors
- [ ] Reopening shows fresh data

### Edge Cases
- [ ] Order with no items shows "No items found"
- [ ] Network error is handled gracefully
- [ ] Closing while loading doesn't crash
- [ ] Opening multiple orders works correctly

### Performance
- [ ] Modal opens quickly
- [ ] Items load within reasonable time
- [ ] No UI freezing or lag

### User Experience
- [ ] Loading state is visible
- [ ] Table is readable and well-formatted
- [ ] Prices are formatted correctly (2 decimals)
- [ ] Layout matches rest of application
- [ ] Colors and styling are consistent

---

## 🐛 Troubleshooting

### Items Not Showing
```
✓ Check: Did you run QUICK_COPY_PASTE.sql?
✓ Check: Are there items in order_items table?
✓ Check: Is backend running on port 3000?
✓ Check: Browser console for errors (F12)
✓ Action: Refresh page and try again
```

### "No items found" Error
```
✓ Check: The order actually has items in DB
✓ Check: Query: SELECT * FROM order_items WHERE order_id = X;
✓ Check: Backend is returning items in API response
✓ Action: Verify data was inserted correctly
```

### Modal Won't Open
```
✓ Check: Order status is correct (pending/processing/shipped/delivered)
✓ Check: Did migration run successfully?
✓ Check: Try refreshing the page
✓ Check: Check browser console for errors
```

### Loading Never Finishes
```
✓ Check: Backend is running
✓ Check: Network tab in DevTools (F12)
✓ Check: Is the API endpoint returning data?
✓ Action: Restart backend and try again
```

### TypeScript or Build Errors
```
✓ Check: npm run build succeeded
✓ Check: No errors in output
✓ Check: dist/ folder exists
✓ Action: Rebuild with: npm run build
```

---

## 🔍 Browser Console Testing

Open browser DevTools (F12) and test:

```javascript
// Check API response manually
fetch('http://localhost:3000/api/v1/orders/1?shop_id=1')
  .then(r => r.json())
  .then(data => console.log(data.data.items));

// Should show array of items with product_name, quantity, sold_price, total_price
```

---

## ✅ Verification Queries

Run these in Hostinger phpMyAdmin to verify data:

```sql
-- Check items exist
SELECT COUNT(*) FROM order_items;
-- Expected: 11

-- Check items for each order
SELECT order_id, COUNT(*) as item_count
FROM order_items
GROUP BY order_id;

-- Expected:
-- order_id 1: 4
-- order_id 2: 3
-- order_id 3: 4

-- Check detailed items
SELECT o.order_id, p.product_name, oi.quantity, oi.sold_price, oi.total_price
FROM order_items oi
JOIN orders o ON oi.order_id = o.order_id
JOIN products p ON oi.product_id = p.product_id
ORDER BY o.order_id, oi.item_id;
```

---

## 📝 Test Result Template

Use this to document your test:

```
Date: ____________
Tested By: ________

Functionality Tests:
[ ] Modal opens: PASS / FAIL
[ ] Loading shows: PASS / FAIL
[ ] Items display: PASS / FAIL
[ ] Data is correct: PASS / FAIL
[ ] Subtotal correct: PASS / FAIL

Edge Cases:
[ ] Empty order: PASS / FAIL
[ ] Error handling: PASS / FAIL

Performance:
[ ] Fast load: PASS / FAIL
[ ] No freezing: PASS / FAIL

Overall Result: ________
Notes: ________________
```

---

## 🎉 Success Criteria

Your test is successful when:

✅ Order items load automatically when modal opens
✅ Items display in a formatted table
✅ All data matches database values
✅ Subtotal calculation is correct
✅ No console errors appear
✅ UI is responsive and fast
✅ Modal can be opened/closed without issues
✅ Feature works with multiple orders

---

## Need Help?

Check these files:
- **ORDER_ITEMS_DISPLAY_SUMMARY.md** - Implementation details
- **Browser Console** (F12) - Error messages
- **Network Tab** (F12) - API calls
- **Backend Logs** - Server errors

---

**You're ready to test! Open the Orders page and try it out! 🚀**
