// UPDATED printBill function for OrdersPage.tsx
// This converts the invoice to an image first, then prints the image
// Much more reliable than printing HTML directly!

const printBill = async (order: Order) => {
  try {
    console.log('🖨️ Starting print for order:', order.order_id);
    
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

    // Create hidden container for rendering
    const printContainer = document.createElement("div");
    printContainer.style.position = "fixed";
    printContainer.style.left = "-9999px";
    printContainer.style.width = "210mm"; // A4 width
    printContainer.style.backgroundColor = "white";
    document.body.appendChild(printContainer);

    // Render invoice component
    const root = ReactDOM.createRoot(printContainer);
    root.render(React.createElement(InvoicePrint, { order: invoiceData }));

    console.log('⏳ Waiting for render...');

    // Wait for render, then convert to image and print
    setTimeout(async () => {
      try {
        console.log('📸 Converting to image...');
        
        // Convert to canvas using html2canvas
        const canvas = await html2canvas(printContainer, {
          scale: 2, // High quality
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#ffffff",
          width: 794, // A4 width in pixels at 96 DPI
          windowWidth: 794,
        });

        console.log('✅ Image generated');

        // Convert canvas to base64 image
        const imageData = canvas.toDataURL('image/png');

        // Create a new window for printing
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
          alert('Please allow popups to print');
          document.body.removeChild(printContainer);
          return;
        }

        // Write HTML with the image
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Print Invoice</title>
            <style>
              @page {
                size: A4 portrait;
                margin: 0;
              }
              body {
                margin: 0;
                padding: 0;
                display: flex;
                justify-content: center;
                align-items: center;
              }
              img {
                width: 100%;
                height: auto;
                display: block;
              }
              @media print {
                body { margin: 0; padding: 0; }
                img { page-break-inside: avoid; }
              }
            </style>
          </head>
          <body>
            <img src="${imageData}" alt="Invoice" />
            <script>
              window.onload = function() {
                setTimeout(() => {
                  window.print();
                  setTimeout(() => window.close(), 500);
                }, 500);
              };
            </script>
          </body>
          </html>
        `);
        
        printWindow.document.close();
        console.log('✅ Print window opened');

      } catch (e) {
        console.error("❌ Error printing:", e);
        alert(`Failed to print bill: ${e}`);
      } finally {
        document.body.removeChild(printContainer);
      }
    }, 1500);
  } catch (error) {
    console.error("❌ Error preparing for print:", error);
    alert(`Failed to prepare bill: ${error}`);
  }
};
