# Tracking Number Update Fix - Debugging Guide

**Date:** 2025-11-22
**Issue:** Tracking number not persisting to database when order status changes
**Status:** ✅ Debug logging added, ready to test

---

## What Was Added

### 1. Debug Logging in Backend

**OrderController.ts (Line 210):**
```typescript
logger.info('Update order request', { id, shop_id, order_status, updateData });
```
This logs what data is being received from the frontend.

**Order.ts (Lines 207-208):**
```typescript
logger.info('Update SQL', { sql, orderId, shopId });
logger.info('Update data', { fields, allValues: values });
```
This logs the exact SQL query and values being sent to the database.

### 2. Database Migration Script

**File:** `backend/migrations/006_update_order_status_enum.sql`

Contains:
```sql
ALTER TABLE orders MODIFY COLUMN order_status
ENUM('pending','processing','shipped','delivered','cancelled') NOT NULL;
```

### 3. Database Fixes Guide

**File:** `DATABASE_FIXES.sql`

Contains test queries to verify tracking_number column and test manual updates.

---

## How to Debug This Issue

### Step 1: Restart Backend with New Logging

The backend needs to be restarted to pick up the new logging code:

```bash
# Kill existing backend process
kill <PID_OF_BACKEND>

# Or restart in Hostinger

# Check backend logs for the debug messages
```

### Step 2: Test Tracking Number Update

1. Open an order in the POS system
2. Change status to "shipped"
3. Enter a tracking number: `TEST123456`
4. Click "Update Order Status"

### Step 3: Check Backend Logs

Look for these log messages:

**Request log:**
```
Update order request: {
  id: "16",
  shop_id: 1,
  order_status: "shipped",
  updateData: { tracking_number: "TEST123456" }
}
```

**SQL log:**
```
Update SQL: {
  sql: "UPDATE orders SET order_status = ?, tracking_number = ?, updated_at = NOW() WHERE order_id = ? AND shop_id = ?",
  orderId: 16,
  shopId: 1
}

Update data: {
  fields: ["order_status = ?", "tracking_number = ?", "updated_at = NOW()"],
  allValues: ["shipped", "TEST123456", 16, 1]
}
```

### Step 4: Verify in Database

Run this in Hostinger phpMyAdmin:

```sql
-- Check if tracking_number updated
SELECT order_id, order_number, order_status, tracking_number
FROM orders
WHERE order_id = 16 AND shop_id = 1;
```

---

## Possible Issues & Solutions

### Issue 1: Tracking number not in updateData

**Symptom:** Log shows `updateData: {}`
**Cause:** Frontend not sending tracking_number
**Solution:** Verify frontend is sending it:
- Check browser console (F12) → Network tab
- Look for PUT request body
- Should include `"tracking_number": "TEST123456"`

### Issue 2: SQL query doesn't include tracking_number

**Symptom:** Log shows SQL without `tracking_number = ?`
**Cause:** Field not in updateableFields array
**Status:** ✅ Fixed - tracking_number is in the array

### Issue 3: Database column type mismatch

**Symptom:** Update fails silently
**Solution:** Check column definition:
```sql
SHOW COLUMNS FROM orders LIKE 'tracking_number';
-- Should show: varchar(25)
```

### Issue 4: Status enum doesn't include 'cancelled'

**Symptom:** Cannot change status to 'cancelled'
**Solution:** Run migration 006:
```sql
ALTER TABLE orders MODIFY COLUMN order_status
ENUM('pending','processing','shipped','delivered','cancelled') NOT NULL;
```

---

## Expected Behavior

### Before Fix
- Status updates ✓
- Tracking number NOT updating ✗
- No debug logs in backend

### After Fix
- Status updates ✓
- Tracking number updates ✓
- Debug logs show request and SQL queries

---

## Code Flow for Tracking Number Update

```
1. Frontend: User enters tracking number
   ├─ trackingNumber state = "TEST123456"

2. User clicks "Update Order Status"
   ├─ handleUpdateOrder() called

3. Frontend builds updateData:
   └─ {
        shop_id: 1,
        order_status: "shipped",
        tracking_number: "TEST123456"  ← KEY PART
      }

4. Frontend sends PUT request to /api/v1/orders/16
   └─ Body contains above data

5. Backend receives request
   ├─ Logs: Update order request with updateData

6. OrderController destructures data
   ├─ shop_id = 1
   ├─ order_status = "shipped"
   ├─ updateData = { tracking_number: "TEST123456" }

7. OrderController calls OrderModel.updateOrder()
   └─ Passes { order_status, ...updateData }

8. Order.ts loops through updateableFields
   ├─ Checks if each field is in orderData
   ├─ If tracking_number is in orderData → adds to SQL

9. Builds SQL query:
   └─ UPDATE orders SET order_status = ?, tracking_number = ?, ...
      WHERE order_id = ? AND shop_id = ?

10. Executes query with values:
    └─ ["shipped", "TEST123456", 16, 1]

11. Database updates both columns
    └─ order_status → "shipped"
       tracking_number → "TEST123456"

12. Returns success response to frontend
```

---

## Manual Testing in Database

You can manually test if tracking_number updates work:

```sql
-- Test 1: Update just tracking_number
UPDATE orders SET tracking_number = 'MANUAL123'
WHERE order_id = 16 AND shop_id = 1;

-- Verify
SELECT order_id, tracking_number FROM orders WHERE order_id = 16;
-- Should show: tracking_number = 'MANUAL123'

-- Test 2: Update both status and tracking_number
UPDATE orders SET order_status = 'shipped', tracking_number = 'MANUAL456'
WHERE order_id = 17 AND shop_id = 1;

-- Verify
SELECT order_id, order_status, tracking_number FROM orders WHERE order_id = 17;
```

If manual SQL works but the app doesn't, the issue is in how the backend is constructing the query.

---

## Next Steps

1. **Restart Backend** in Hostinger
2. **Test Tracking Update** in the POS system
3. **Check Backend Logs** for debug messages
4. **Verify Database** manually if issue persists
5. **Run Migration 006** if not yet done for 'cancelled' status

---

## Files Modified

- `backend/src/controllers/OrderController.ts` - Added request logging
- `backend/src/models/Order.ts` - Added SQL logging
- `backend/migrations/006_update_order_status_enum.sql` - New migration
- `DATABASE_FIXES.sql` - Manual test queries

---

## Build Status

✅ **Backend:** Compiles successfully
✅ **Frontend:** Builds successfully
✅ **Logging:** Added throughout
✅ **Ready to test**

**Commit:** a5c09f7 - Add detailed debug logging for order updates

---

## Summary

The tracking number update issue should now be debuggable with the logging we've added. When you test:

1. The backend will log exactly what data is received
2. The backend will log exactly what SQL is being executed
3. If it's still not updating, the logs will show us where the problem is

Check the backend logs after testing to see what's happening!
