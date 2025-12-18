// FIXED printBill function for OrdersPage.tsx
// Replace the existing printBill function (around line 373) with this:

const printBill = async (order: Order) => {
  try {
    console.log('🖨️ Starting print for order:', order.order_id);
    
    // Fetch UNGROUPED order items for printing (with size/color data)
    const itemsResponse = await fetch(`${API_URL}/orders/${order.order_id}/items`);
    const itemsResult = await itemsResponse.json();
    
    console.log('📦 Items response:', itemsResult);
    
    if (!itemsResult.success || !itemsResult.data || itemsResult.data.length === 0) {
      console.error('❌ No items found');
      alert("❌ Order items not found. Cannot print bill.");
      return;
    }
    
    const printItems = itemsResult.data;
    console.log('✅ Print items loaded:', printItems.length);

    const paymentMethod = orderPayments[order.order_id];
    const validPaymentMethods = ["cash", "card", "online", "bank", "other"];
    const paymentMethodValue = validPaymentMethods.includes(paymentMethod)
      ? (paymentMethod as "cash" | "card" | "online" | "bank" | "other")
      : "other";

    const invoiceData = {
      order_id: order.order_id,
      order_number: order.order_number,
      customer_id: order.customer_id,
      total_items: order.total_items,
      total_amount: order.total_amount,
      final_amount: order.final_amount,
      advance_paid: order.advance_paid,
      balance_due: order.balance_due,
      payment_status: order.payment_status,
      payment_method: paymentMethodValue,
      order_status: order.order_status,
      notes: order.notes,
      order_date: order.order_date,
      recipient_name: order.recipient_name,
      customer_mobile: order.customer_mobile,
      recipient_phone: order.recipient_phone,
      delivery_charge: order.delivery_charge,
      delivery_line1: order.delivery_line1,
      delivery_line2: order.delivery_line2,
      delivery_city: order.delivery_city,
      items: printItems, // Use ungrouped items with size/color
    };

    console.log('📄 Invoice data prepared');

    const printContainer = document.createElement("div");
    printContainer.style.position = "fixed";
    printContainer.style.left = "-9999px";
    document.body.appendChild(printContainer);

    const root = ReactDOM.createRoot(printContainer);
    root.render(React.createElement(InvoicePrint, { order: invoiceData }));

    console.log('⏳ Waiting for render...');

    setTimeout(async () => {
      try {
        const invoiceHTML = printContainer.innerHTML;
        console.log('📝 HTML generated, length:', invoiceHTML.length);

        const fullHtml = `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Invoice</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
              @page {
                size: A4 portrait;
                margin: 15mm;
              }
              body {
                margin: 0;
                padding: 0;
                font-family: Arial, sans-serif;
              }
              @media print {
                body { margin: 0; padding: 0; background: white; }
                * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
              }
            </style>
          </head>
          <body>
            ${invoiceHTML}
          </body>
          </html>
        `;

        console.log('🖨️ Calling Tauri print command...');

        // Call Tauri command to print silently
        const { invoke } = await import('@tauri-apps/api/tauri');
        await invoke('print_invoice', {
          htmlContent: fullHtml,
          invoiceNumber: order.order_number || 'TEMP'
        });

        console.log('✅ Print command sent successfully');
        alert('✅ Bill sent to printer!');

      } catch (e) {
        console.error("❌ Error printing bill:", e);
        alert(`Failed to print bill: ${e}`);
      } finally {
        document.body.removeChild(printContainer);
      }
    }, 1500); // Increased timeout to ensure render completes
  } catch (error) {
    console.error("❌ Error preparing for print:", error);
    alert(`Failed to prepare bill for printing: ${error}`);
  }
};
