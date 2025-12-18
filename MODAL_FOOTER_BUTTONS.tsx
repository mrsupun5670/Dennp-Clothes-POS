// ADD THIS CODE TO OrdersPage.tsx
// Insert this BEFORE the closing </div> of the Address Modal (around line 2186)
// This adds Print and Export buttons to the modal footer

{/* Modal Footer - Print & Export Buttons */}
<div className="border-t border-gray-700 pt-4 mt-6">
  <div className="flex gap-3 flex-wrap">
    {/* Print Bill Button - Works for ALL order statuses */}
    <button
      onClick={() => printBill(selectedOrder)}
      className="flex-1 min-w-[150px] py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors bg-blue-600 text-white hover:bg-blue-700"
    >
      🖨️ Print Bill
    </button>

    {/* Export as Image Button */}
    <button
      onClick={() => exportInvoiceAsImage(selectedOrder)}
      className="flex-1 min-w-[150px] py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors bg-purple-600 text-white hover:bg-purple-700"
    >
      📸 Export as Image
    </button>

    {/* Close Modal Button */}
    <button
      onClick={handleCloseModal}
      className="flex-1 min-w-[150px] py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors bg-gray-700 text-gray-300 hover:bg-gray-600"
    >
      ❌ Close
    </button>
  </div>
</div>
