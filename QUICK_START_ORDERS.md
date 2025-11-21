# Orders Page - Quick Start Guide

## 🚀 Getting Started (5 Minutes)

### Step 1: Install Dependencies
```bash
cd frontend
npm install
```

### Step 2: Start Backend
```bash
cd backend
npm start
# Should be running on http://localhost:3000
```

### Step 3: Start Frontend
```bash
cd frontend
npm run dev
# Should be running on http://localhost:5173
```

### Step 4: Navigate to Orders
- Open the application
- Click on "Orders" tab

---

## 💰 Managing Payments

### Record a Payment
1. **Double-click** any order to open details
2. Scroll to **"Payment Summary & Settlement"**
3. If there's a remaining balance, you'll see the payment form
4. Enter **Payment Amount** (Rs.)
5. Select **Payment Method** (Cash/Card/Online/Other)
6. Select **Payment Type** (Advance/Balance)
7. Click **"Record Payment"** button
8. ✅ Payment recorded! Order updates automatically

### View Payment Status
- **UNPAID** - Red badge, no payment received
- **PARTIAL** - Yellow badge, some payment received
- **FULLY PAID** - Green badge, complete payment received

---

## 📋 Filtering & Searching Orders

### By Status
Click on status buttons at the top:
- **Pending** - New orders, not started
- **Processing** - Being prepared
- **Shipped** - On the way
- **Delivered** - Completed
- **All Orders** - Show everything

### By Customer/Order
Type in search box to find orders by:
- Customer name
- Customer ID
- Order ID

---

## 📄 Printing & Saving Receipts

### Print Receipt
1. Open order details
2. Click **"📄 Show Receipt"** to preview
3. Click **"🖨️ Print Receipt"**
4. Select your printer
5. Click Print

### Save Receipt as Image
1. Open order details
2. Click **"📄 Show Receipt"** to preview
3. Click **"💾 Save as PNG"**
4. File saves to Downloads folder
5. Filename format: `0771234567_5.png` (mobile_orderid)

---

## 🔄 Updating Order Status

1. Open order details
2. Scroll to **"Order Status"** section
3. Select new status from dropdown
4. Click **"Update Order Status"**
5. ✅ Status updated instantly

**Status Flow:**
```
Pending → Processing → Shipped → Delivered
```

---

## 💡 Tips & Tricks

### Quick Actions
- **Single-click** row to select order
- **Double-click** row to open details
- **Search + Filter** to find specific orders quickly

### Payment Tips
- Advance = Payment received before delivery
- Balance = Payment received after partial/delivery
- Set max amount = Remaining balance (can't overpay)

### Receipt Tips
- Receipt shows full payment history
- Optimized for A4 printer (portrait)
- PNG export works great for sending via WhatsApp/Email
- Print to PDF for digital archiving

---

## 📊 Payment Status Summary

In the modal, you'll see:
```
Total Amount       : Rs. 8,500.00
Total Paid         : Rs. 5,000.00  (Green)
Remaining Balance  : Rs. 3,500.00  (Red if pending)

---
Advance Paid       : Rs. 5,000.00
Balance Paid       : Rs. 0.00
Status             : PARTIAL (Yellow)
```

---

## ❌ Troubleshooting

| Issue | Solution |
|-------|----------|
| Payment not saving | Check backend running on :3000 |
| Receipt not showing | Click "Show Receipt" first |
| Can't print | Try "Save as PNG" instead |
| Search not working | Check spelling, try clear field |
| Payment form hidden | Check if balance remaining > 0 |
| Image not downloading | Check browser downloads settings |

---

## 📱 Mobile Support

✅ Works on tablets and mobile devices:
- Touch-friendly buttons
- Responsive table
- Portrait/landscape support
- Optimized for 10"+ screens

---

## 🔐 Data Safety

- All payments recorded in database
- Order history never deleted
- Payment confirmation with timestamp
- Real-time balance calculation
- Transaction logging enabled

---

## ⚡ Performance

- Fast payment processing (<1 second)
- Instant receipt generation
- Smooth animations & transitions
- No page refreshes needed

---

## 📞 Need Help?

Check order details modal for:
- ✅ All payment information
- ✅ Detailed order items
- ✅ Shipping address
- ✅ Payment history
- ✅ Current balance
- ✅ Payment status

---

## 🎯 Common Workflows

### Workflow 1: Accept Payment
1. Find order by customer name
2. Double-click to open
3. Record payment (advance or balance)
4. Receipt auto-prints or save as PNG
5. Status updates automatically

### Workflow 2: Dispatch Order
1. Filter by "Processing" status
2. Update order to "Shipped"
3. Provide tracking info if needed
4. Print receipt for customer

### Workflow 3: Mark as Delivered
1. Filter by "Shipped" status
2. Verify customer received
3. Update status to "Delivered"
4. Confirm in system

---

## ✨ Features

✅ Order status filtering
✅ Advanced search
✅ Payment tracking (Advance + Balance)
✅ Real-time balance calculation
✅ Professional receipts
✅ Print to any printer
✅ Export to PNG/JPG
✅ Mobile responsive
✅ Error handling
✅ Loading states
✅ Success notifications

---

**Ready to use! Happy selling! 🎉**
