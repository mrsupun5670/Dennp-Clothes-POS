# Tracking Number Debug Guide - Step by Step

**Date:** 2025-11-22
**Objective:** Identify exactly where tracking_number is being lost
**Build Status:** ✅ Successful with comprehensive logging

---

## How to Debug

### Step 1: Restart Backend

Restart the Node.js backend in Hostinger so it picks up the new logging code.

### Step 2: Open Developer Tools

In your browser:
1. Press `F12` to open Developer Tools
2. Go to **Console** tab
3. Keep this window open

### Step 3: Test Tracking Number Update

1. Open an order with status "pending"
2. Change status to "shipped"
3. **Enter tracking number:** `TEST123456`
4. Click "Update Order Status"

### Step 4: Check Browser Console Logs

You should see these frontend logs in the console:

```
STEP 1: trackingNumber value: TEST123456
STEP 1: trackingNumber trimmed: TEST123456
STEP 2: Added tracking_number to updateData
STEP 3: Final updateData being sent: {
  "shop_id": 1,
  "order_status": "shipped",
  "tracking_number": "TEST123456"
}
STEP 4: Response received: 200
```

**If you see this:** ✅ Frontend is sending tracking_number correctly

**If you DON'T see this:** ❌ Problem is in frontend

---

## Step 5: Check Backend Logs

In Hostinger backend logs, you should see these backend logs:

### Controller Logs:
```
=== STEP 1: Raw request body ===
{
  shop_id: 1,
  order_status: "shipped",
  tracking_number: "TEST123456"
}

=== STEP 2: Destructured values ===
{
  id: "16",
  shop_id: 1,
  order_status: "shipped",
  updateDataKeys: ["tracking_number"],
  updateData: { tracking_number: "TEST123456" }
}

TRACKING_NUMBER CHECK:
{
  has_tracking_number: true,
  tracking_number_value: "TEST123456",
  typeof_tracking_number: "string"
}
```

**If you see this:** ✅ Backend is receiving tracking_number correctly

**If `has_tracking_number: false`:** ❌ Problem is in transmission

---

### Model Logs:

```
=== MODEL STEP 1: updateOrder called with ===
{
  orderId: 16,
  shopId: 1,
  orderDataKeys: ["order_status", "tracking_number"],
  orderData: {
    order_status: "shipped",
    tracking_number: "TEST123456"
  }
}

=== MODEL STEP 2: Building update fields ===
updateableFields: [
  "order_number", "customer_id", ... "tracking_number"
]

Found field: order_status
Found field: tracking_number

=== MODEL STEP 3: Fields after loop ===
{
  fields: ["order_status = ?", "tracking_number = ?"],
  values: ["shipped", "TEST123456"]
}

=== MODEL STEP 4: FINAL SQL QUERY ===
SQL: UPDATE orders SET order_status = ?, tracking_number = ?, updated_at = NOW() WHERE order_id = ? AND shop_id = ?
VALUES: ["shipped", "TEST123456", 16, 1]
TRACKING_NUMBER IN VALUES? true
```

**If you see this:** ✅ SQL query includes tracking_number

**If `TRACKING_NUMBER IN VALUES? false`:** ❌ Problem is in field building

---

## Diagnostic Checklist

Use these checkpoints to pinpoint where tracking_number is lost:

```
☐ STEP 1: Frontend sends tracking_number?
   - Check console log "STEP 3: Final updateData being sent"
   - Should have "tracking_number": "TEST123456"

☐ STEP 2: Backend receives tracking_number?
   - Check backend log "=== STEP 1: Raw request body ==="
   - Should have "tracking_number": "TEST123456"

☐ STEP 3: updateData has tracking_number?
   - Check backend log "=== STEP 2: Destructured values ==="
   - Should have "has_tracking_number": true

☐ STEP 4: Field found in loop?
   - Check backend log "Found field: tracking_number"
   - Should appear

☐ STEP 5: tracking_number in SQL?
   - Check backend log "=== MODEL STEP 4: FINAL SQL QUERY ==="
   - Should have "tracking_number = ?" in SQL
   - Should have "TEST123456" in VALUES array

☐ STEP 6: Database updated?
   - Run this in Hostinger phpMyAdmin:
     SELECT order_id, order_status, tracking_number
     FROM orders WHERE order_id = 16;
   - Should show tracking_number = "TEST123456"
```

---

## If Frontend Logs Missing

**Problem:** Tracking number not sending from frontend

**Check:**
1. Is the tracking number input visible when status = "shipped"?
2. Did you actually type in the tracking number?
3. Check console for any JavaScript errors (red text)

**Solution:** Verify the input field is connected properly:
```typescript
if (trackingNumber && trackingNumber.trim()) {
  updateData.tracking_number = trackingNumber.trim();
}
```

---

## If Backend Controller Logs Missing

**Problem:** Request not reaching backend

**Check:**
1. Is the request returning 200 (success)?
2. Or is it returning an error code (400, 500)?
3. Check if payment validation is blocking (400 error)?

**Solution:** If payment error, need to settle payment first before shipping.

---

## If Model Logs Missing tracking_number

**Problem:** tracking_number not being sent to model

**Possible Cause:** Destructuring issue in controller

**Solution:** Check line 211 in OrderController:
```typescript
const { shop_id, order_status, ...updateData } = req.body;
```

This should separate shop_id and order_status, keeping tracking_number in updateData.

---

## If SQL Doesn't Include tracking_number

**Problem:** Field not being added to SQL query

**Possible Causes:**
1. `tracking_number` not in `updateableFields` array
2. `'tracking_number' in orderData` check failing

**Check:**
- Is tracking_number in updateableFields at line 191? ✅ YES
- Does the loop find the field? Check "Found field: tracking_number" log

---

## If Database Still Not Updated

**Problem:** SQL executes but data not updating

**Check:**
1. Run manual test:
```sql
UPDATE orders SET tracking_number = 'MANUAL123'
WHERE order_id = 16 AND shop_id = 1;

SELECT tracking_number FROM orders WHERE order_id = 16;
```

If manual SQL works, problem is in query execution.
If manual SQL doesn't work, it's a database permission issue.

---

## Quick Test Flow

```
1. Enter tracking: TEST123456
2. Change status: shipped
3. Click update
   ↓
4. Check browser console (F12)
   - See "STEP 3" log with tracking_number?
   ↓
5. Check backend logs
   - See "Raw request body" with tracking_number?
   ↓
6. Check SQL logs
   - See "FINAL SQL QUERY" with tracking_number?
   ↓
7. Check database
   - SELECT tracking_number FROM orders WHERE order_id = 16;
   - Shows TEST123456?
```

At which step does it fail? That's where the bug is!

---

## Expected Logs Output

After each step, you should see:

**Frontend Console (F12 → Console tab):**
```
STEP 1: trackingNumber value: TEST123456
STEP 1: trackingNumber trimmed: TEST123456
STEP 2: Added tracking_number to updateData
STEP 3: Final updateData being sent: {
  "shop_id": 1,
  "order_status": "shipped",
  "tracking_number": "TEST123456"
}
STEP 4: Response received: 200
```

**Backend Logs:**
- Look for "STEP 1: Raw request body" with tracking_number
- Look for "Found field: tracking_number"
- Look for "FINAL SQL QUERY" with tracking_number

---

## After Debugging

Once you know where the problem is:

**If Frontend:** Check input state management
**If Backend Controller:** Check destructuring
**If Model:** Check updateableFields array or field detection
**If SQL:** Check query construction
**If Database:** Check manual SQL works

---

## Run the Test Now

1. Restart backend
2. Open app with F12 console open
3. Enter tracking number and update
4. Share the logs you see
5. We can identify the exact issue!

**Commit:** 2953766 - Add comprehensive step-by-step debug logging
