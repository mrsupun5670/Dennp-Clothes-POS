// FINAL FIXED printBill function for OrdersPage.tsx
// Full A4 size, portrait orientation, no rotation

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

    // Create hidden container for rendering - FULL A4 SIZE
    const printContainer = document.createElement("div");
    printContainer.style.position = "fixed";
    printContainer.style.left = "-9999px";
    printContainer.style.width = "210mm"; // A4 width
    printContainer.style.minHeight = "297mm"; // A4 height
    printContainer.style.backgroundColor = "white";
    printContainer.style.padding = "15mm";
    document.body.appendChild(printContainer);

    // Render invoice component
    const root = ReactDOM.createRoot(printContainer);
    root.render(React.createElement(InvoicePrint, { order: invoiceData }));

    console.log('⏳ Waiting for render...');

    // Wait for render, then convert to image and print
    setTimeout(async () => {
      try {
        console.log('📸 Converting to image...');
        
        // Convert to canvas - FULL A4 dimensions
        const canvas = await html2canvas(printContainer, {
          scale: 2, // High quality
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#ffffff",
          width: 794, // A4 width in pixels (210mm at 96 DPI)
          height: 1123, // A4 height in pixels (297mm at 96 DPI)
        });

        console.log('✅ Image generated:', canvas.width, 'x', canvas.height);

        // Convert canvas to base64 image
        const imageData = canvas.toDataURL('image/png');

        // Create a new window for printing
        const printWindow = window.open('', '_blank', 'width=800,height=1000');
        if (!printWindow) {
          alert('Please allow popups to print');
          document.body.removeChild(printContainer);
          return;
        }

        // Write HTML with FULL A4 image, PORTRAIT orientation
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Print Invoice - ${order.order_number}</title>
            <style>
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
              
              @page {
                size: A4 portrait;
                margin: 0;
              }
              
              html, body {
                width: 210mm;
                height: 297mm;
                margin: 0;
                padding: 0;
              }
              
              body {
                display: flex;
                justify-content: center;
                align-items: flex-start;
                background: white;
              }
              
              img {
                width: 210mm;
                height: auto;
                max-width: 100%;
                display: block;
                page-break-inside: avoid;
              }
              
              @media print {
                html, body {
                  width: 210mm;
                  height: 297mm;
                  margin: 0;
                  padding: 0;
                }
                img {
                  width: 210mm;
                  height: auto;
                  page-break-inside: avoid;
                }
              }
            </style>
          </head>
          <body>
            <img src="${imageData}" alt="Invoice" />
            <script>
              window.onload = function() {
                console.log('Print window loaded');
                setTimeout(() => {
                  window.print();
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
    }, 2000); // Increased timeout for full render
  } catch (error) {
    console.error("❌ Error preparing for print:", error);
    alert(`Failed to prepare bill: ${error}`);
  }
};
