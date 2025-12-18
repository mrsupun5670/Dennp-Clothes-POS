// SIMPLEST FIX: Use existing /orders/:id endpoint
// Replace printBill function (lines 373-471) with this:

const printBill = async (order: Order) => {
  try {
    // Fetch complete order with ungrouped items
    const orderResponse = await fetch(`${API_URL}/orders/${order.order_id}?shop_id=${shopId}`);
    
    if (!orderResponse.ok) {
      alert("❌ Could not fetch order details. Cannot print bill.");
      return;
    }
    
    const orderResult = await orderResponse.json();
    
    if (!orderResult.success || !orderResult.data) {
      alert("❌ Order not found. Cannot print bill.");
      return;
    }
    
    const fullOrder = orderResult.data;
    const printItems = fullOrder.items || [];
    
    if (printItems.length === 0) {
      alert("❌ Order items not found. Cannot print bill.");
      return;
    }

    const paymentMethod = orderPayments[order.order_id] || "other";
    const validPaymentMethods = ["cash", "card", "online", "bank", "other"];
    const paymentMethodValue = validPaymentMethods.includes(paymentMethod)
      ? (paymentMethod as "cash" | "card" | "online" | "bank" | "other")
      : "other";

    const invoiceData = {
      order_id: fullOrder.order_id,
      order_number: fullOrder.order_number,
      customer_id: fullOrder.customer_id,
      total_items: fullOrder.total_items,
      total_amount: fullOrder.total_amount,
      final_amount: fullOrder.final_amount,
      advance_paid: fullOrder.advance_paid,
      balance_due: fullOrder.balance_due,
      payment_status: fullOrder.payment_status,
      payment_method: paymentMethodValue,
      order_status: fullOrder.order_status,
      notes: fullOrder.notes,
      order_date: fullOrder.order_date,
      recipient_name: fullOrder.recipient_name,
      customer_mobile: fullOrder.customer_mobile,
      recipient_phone: fullOrder.recipient_phone,
      delivery_charge: fullOrder.delivery_charge,
      delivery_line1: fullOrder.delivery_line1,
      delivery_line2: fullOrder.delivery_line2,
      delivery_city: fullOrder.delivery_city,
      items: printItems,
    };

    // Create temporary container
    const printContainer = document.createElement("div");
    printContainer.style.position = "fixed";
    printContainer.style.left = "-9999px";
    printContainer.style.width = "210mm";
    printContainer.style.background = "white";
    document.body.appendChild(printContainer);

    const root = ReactDOM.createRoot(printContainer);
    root.render(React.createElement(InvoicePrint, { order: invoiceData }));

    // Wait for rendering then print
    setTimeout(async () => {
      try {
        // Convert to canvas
        const canvas = await html2canvas(printContainer, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#ffffff",
          width: 794,
          windowWidth: 794,
        });

        // Create ROTATED canvas for printing
        const rotatedCanvas = document.createElement('canvas');
        rotatedCanvas.width = canvas.height;
        rotatedCanvas.height = canvas.width;
        const ctx = rotatedCanvas.getContext('2d');
        if (ctx) {
          ctx.translate(rotatedCanvas.width / 2, rotatedCanvas.height / 2);
          ctx.rotate(90 * Math.PI / 180);
          ctx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);
        }

        // Save rotated version to TEMP file for printing
        const { documentDir } = await import("@tauri-apps/api/path");
        const { createDir, writeBinaryFile, removeFile } = await import("@tauri-apps/api/fs");
        const { join } = await import("@tauri-apps/api/path");

        const documentDirPath = await documentDir();
        const tempPath = await join(documentDirPath, "Dennep Pos Documents", "Temp");
        await createDir(tempPath, { recursive: true });

        const tempFileName = `print-temp-${fullOrder.order_number}-${Date.now()}.png`;
        const tempFilePath = await join(tempPath, tempFileName);

        // Save rotated temp file
        await new Promise<void>((resolve, reject) => {
          rotatedCanvas.toBlob(async (blob) => {
            if (!blob) {
              reject(new Error("Failed to generate image"));
              return;
            }

            try {
              const arrayBuffer = await blob.arrayBuffer();
              const uint8Array = new Uint8Array(arrayBuffer);
              await writeBinaryFile(tempFilePath, uint8Array);
              resolve();
            } catch (error) {
              reject(error);
            }
          }, "image/png");
        });

        // Print the temp file silently
        console.log('🖨️ Printing...');
        const command = new Command('cmd', [
          '/c',
          'mspaint',
          '/pt',
          tempFilePath
        ]);
        
        await command.execute();

        // Delete temp file after 5 seconds
        setTimeout(async () => {
          try {
            await removeFile(tempFilePath);
            console.log('🗑️ Temp file deleted');
          } catch (e) {
            console.log('Could not delete temp file:', e);
          }
        }, 5000);

        alert(`✅ Invoice ${fullOrder.order_number} sent to printer!`);
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

// USES: GET /orders/:id?shop_id=X
// This endpoint returns the complete order with ungrouped items including size/color
