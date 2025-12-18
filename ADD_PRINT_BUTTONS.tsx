// ADD PRINT BUTTONS TO ORDERSPAGE MODAL
// Add these Print buttons after each status update button

// 1. FOR PENDING STATUS (after line 1703):
<button
  onClick={() => printBill(selectedOrder)}
  className="w-full py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors bg-blue-600 text-white hover:bg-blue-700 mt-2"
>
  🖨️ Print Bill
</button>

// 2. FOR PROCESSING STATUS (after line 1731):
<button
  onClick={() => printBill(selectedOrder)}
  className="w-full py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors bg-blue-600 text-white hover:bg-blue-700 mt-2"
>
  🖨️ Print Bill
</button>

// 3. FOR SHIPPED STATUS (after line 1756):
<button
  onClick={() => printBill(selectedOrder)}
  className="w-full py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors bg-blue-600 text-white hover:bg-blue-700 mt-2"
>
  🖨️ Print Bill
</button>

// 4. FOR DELIVERED STATUS - Find the delivered section (around line 1770-1800)
// and add this button in the appropriate place:
<button
  onClick={() => printBill(selectedOrder)}
  className="w-full py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors bg-blue-600 text-white hover:bg-blue-700 mt-2"
>
  🖨️ Print Bill
</button>

// INSTRUCTIONS:
// 1. Open OrdersPage.tsx
// 2. Find each status section (pending, processing, shipped, delivered)
// 3. Add the Print button after the status update button
// 4. Make sure it's inside the same conditional block
// 5. Save and test!
