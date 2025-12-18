// ADD PRINT BUTTON TO ORDER DETAILS MODAL HEADER
// In OrdersPage.tsx, find the modal header (around line 1240-1250)
// Replace lines 1246-1250 with this:

              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => printBill(selectedOrder)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
                >
                  🖨️ Print Bill
                </button>
                <button
                  onClick={handleCloseModal}
                  className="text-white hover:text-red-200 transition-colors text-2xl"
                >
                  ✕
                </button>
              </div>

// This adds a Print button in the modal header next to the close (X) button
// The button will be visible for ALL order statuses
// It calls the existing printBill function which:
// - Creates rotated temp file
// - Prints to default printer
// - Deletes temp file
// - No permanent file saved
