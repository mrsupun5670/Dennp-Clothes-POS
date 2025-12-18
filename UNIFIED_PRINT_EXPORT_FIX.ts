// UNIFIED FIX: Both printBill AND exportInvoiceAsImage
// Replace BOTH functions in OrdersPage.tsx with these:

// ============================================
// 1. PRINT BILL FUNCTION (lines 373-471)
// ============================================
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
      ...fullOrder,
      payment_method: paymentMethodValue,
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

    setTimeout(async () => {
      try {
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

        const { documentDir } = await import("@tauri-apps/api/path");
        const { createDir, writeBinaryFile, removeFile } = await import("@tauri-apps/api/fs");
        const { join } = await import("@tauri-apps/api/path");

        const documentDirPath = await documentDir();
        const tempPath = await join(documentDirPath, "Dennep Pos Documents", "Temp");
        await createDir(tempPath, { recursive: true });

        const tempFileName = `print-temp-${fullOrder.order_number}-${Date.now()}.png`;
        const tempFilePath = await join(tempPath, tempFileName);

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

        const command = new Command('cmd', ['/c', 'mspaint', '/pt', tempFilePath]);
        await command.execute();

        setTimeout(async () => {
          try {
            await removeFile(tempFilePath);
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

// ============================================
// 2. EXPORT AS IMAGE FUNCTION (lines 473-581)
// ============================================
const exportInvoiceAsImage = async (order: Order) => {
  try {
    // Fetch complete order with ungrouped items (SAME AS PRINT)
    const orderResponse = await fetch(`${API_URL}/orders/${order.order_id}?shop_id=${shopId}`);
    
    if (!orderResponse.ok) {
      alert("❌ Could not fetch order details. Cannot export.");
      return;
    }
    
    const orderResult = await orderResponse.json();
    
    if (!orderResult.success || !orderResult.data) {
      alert("❌ Order not found. Cannot export.");
      return;
    }
    
    const fullOrder = orderResult.data;
    const exportItems = fullOrder.items || [];
    
    if (exportItems.length === 0) {
      alert("❌ Order items not found. Cannot export.");
      return;
    }

    const paymentMethod = orderPayments[order.order_id] || "other";
    const validPaymentMethods = ["cash", "card", "online", "bank", "other"];
    const paymentMethodValue = validPaymentMethods.includes(paymentMethod)
      ? (paymentMethod as "cash" | "card" | "online" | "bank" | "other")
      : "other";

    const invoiceData = {
      ...fullOrder,
      payment_method: paymentMethodValue,
      items: exportItems,
    };

    const printContainer = document.createElement("div");
    printContainer.style.position = "fixed";
    printContainer.style.left = "-9999px";
    printContainer.style.width = "210mm";
    printContainer.style.background = "white";
    document.body.appendChild(printContainer);

    const root = ReactDOM.createRoot(printContainer);
    root.render(React.createElement(InvoicePrint, { order: invoiceData }));

    setTimeout(async () => {
      try {
        const canvas = await html2canvas(printContainer, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#ffffff",
          width: 794,
          windowWidth: 794,
        });

        // Save NORMAL (non-rotated) canvas for export
        canvas.toBlob(async (blob) => {
          if (!blob) {
            alert("Failed to generate image");
            document.body.removeChild(printContainer);
            return;
          }

          try {
            const { documentDir } = await import("@tauri-apps/api/path");
            const { createDir, writeBinaryFile } = await import("@tauri-apps/api/fs");
            const { join } = await import("@tauri-apps/api/path");

            const documentDirPath = await documentDir();
            const invoicesPath = await join(documentDirPath, "Dennep Pos Documents", "Invoices");
            await createDir(invoicesPath, { recursive: true });

            const timestamp = new Date().toISOString().replace(/[:.]/g, "-").split("T")[0];
            const time = new Date().toTimeString().split(" ")[0].replace(/:/g, "-");
            const fileName = `invoice-${fullOrder.order_number}-${timestamp}_${time}.png`;
            const filePath = await join(invoicesPath, fileName);

            const arrayBuffer = await blob.arrayBuffer();
            const uint8Array = new Uint8Array(arrayBuffer);
            await writeBinaryFile(filePath, uint8Array);

            alert(`✅ Invoice saved as image!\nLocation: Dennep Pos Documents\\Invoices\\${fileName}`);
          } catch (error) {
            console.error("Error saving image:", error);
            alert("Failed to save invoice as image.");
          } finally {
            document.body.removeChild(printContainer);
          }
        }, "image/png");
      } catch (error) {
        console.error("Error generating image:", error);
        alert("Failed to generate invoice image.");
        document.body.removeChild(printContainer);
      }
    }, 1000);
  } catch (error) {
    console.error("Error preparing invoice for export:", error);
    alert("Failed to prepare invoice for export.");
  }
};

// KEY CHANGES:
// 1. Both functions now fetch complete order from GET /orders/:id
// 2. Both use fullOrder.items (ungrouped with size/color)
// 3. Print: Rotated temp file → Silent print → Auto-delete
// 4. Export: Normal portrait → Save to Invoices folder
// 5. Same data source = Same invoice content!
