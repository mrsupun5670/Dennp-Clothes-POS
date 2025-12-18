// FINAL WORKING printBill function for OrdersPage.tsx
// This matches the WORKING SalesPage implementation exactly
// Simple, clean, no rotation issues

const printBill = async (order: Order) => {
  try {
    // Fetch UNGROUPED order items for printing (with size/color data)
    const itemsResponse = await fetch(`${API_URL}/orders/${order.order_id}/items`);
    const itemsResult = await itemsResponse.json();
    
    if (!itemsResult.success || !itemsResult.data || itemsResult.data.length === 0) {
      alert("❌ Order items not found. Cannot print bill.");
      return;
    }
    
    const printItems = itemsResult.data;

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
      items: printItems,
    };

    // Create a temporary container for rendering (SAME AS SALESPAGE)
    const printContainer = document.createElement("div");
    printContainer.style.position = "fixed";
    printContainer.style.left = "-9999px";
    printContainer.style.width = "210mm";
    printContainer.style.background = "white";
    document.body.appendChild(printContainer);

    const root = ReactDOM.createRoot(printContainer);
    root.render(React.createElement(InvoicePrint, { order: invoiceData }));

    // Wait for rendering then print silently using Tauri (SAME AS SALESPAGE)
    setTimeout(async () => {
      try {
        // Get the rendered HTML (SAME SIMPLE STRUCTURE AS SALESPAGE)
        const htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <title>Invoice ${order.order_number}</title>
            <style>
              @page { size: A4 portrait; margin: 15mm; }
              body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
            </style>
          </head>
          <body>
            ${printContainer.innerHTML}
          </body>
          </html>
        `;

        // Call Tauri command to print silently
        const { invoke } = await import('@tauri-apps/api/tauri');
        await invoke('print_invoice', {
          htmlContent: htmlContent,
          invoiceNumber: order.order_number
        });

        alert(`✅ Invoice ${order.order_number} sent to printer!`);
      } catch (error) {
        console.error('Print error:', error);
        alert(`Failed to print: ${error}`);
      } finally {
        document.body.removeChild(printContainer);
      }
    }, 1000);
  } catch (error) {
    console.error("Error preparing for print:", error);
    alert(`Failed to prepare bill: ${error}`);
  }
};
