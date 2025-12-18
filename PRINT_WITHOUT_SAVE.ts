// UPDATED SOLUTION: Print Button - NO SAVING, Just Print
// Replace handleSimplePrint function (lines ~1840-1930) with this:

const handleSimplePrint = async () => {
  const result = await saveOrderInternal();
  if (result.success && result.data) {
    const { orderNumber, total, paid, balance } = result.data;
    setMessage({
      type: "success",
      text: `✓ Order ${orderNumber} saved and ready to print`,
    });

    // Prepare invoice data
    const invoiceData = {
      order_id: 0,
      order_number: orderNumber,
      customer_id: selectedCustomer?.customer_id || 0,
      total_items: cartItems.length,
      total_amount: subtotal,
      final_amount: total,
      advance_paid: paid,
      balance_due: balance || 0,
      payment_status: (balance > 0 ? (paid > 0 ? "partial" : "unpaid") : "fully_paid") as "unpaid" | "partial" | "fully_paid",
      payment_method: paymentMethod as "cash" | "card" | "online" | "bank" | "other",
      order_status: "pending" as const,
      notes: orderNotes || null,
      order_date: new Date().toISOString(),
      recipient_name: selectedCustomer?.first_name || selectedCustomer?.last_name || "",
      customer_mobile: selectedCustomer?.mobile || "",
      recipient_phone: selectedCustomer?.mobile || "",
      delivery_charge: deliveryCharge,
      delivery_line1: null,
      delivery_line2: null,
      delivery_city: null,
      items: cartItems.map(item => ({
        product_name: item.productName,
        size_name: item.size,
        color_name: item.color,
        quantity: item.quantity,
        sold_price: item.price,
        total_price: item.price * item.quantity,
      })),
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
        const { Command } = await import("@tauri-apps/api/shell");

        const documentDirPath = await documentDir();
        const tempPath = await join(documentDirPath, "Dennep Pos Documents", "Temp");
        await createDir(tempPath, { recursive: true });

        const tempFileName = `print-temp-${orderNumber}-${Date.now()}.png`;
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

        // Print the temp file
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

        setMessage({
          type: "success",
          text: `✅ Invoice ${orderNumber} sent to printer!`
        });
      } catch (error) {
        console.error('Print error:', error);
        setMessage({
          type: "error",
          text: `Failed to print: ${error}`
        });
      } finally {
        document.body.removeChild(printContainer);
      }
    }, 1000);

    resetSalesState();
  } else if (result.error) {
    setMessage({ type: "error", text: result.error });
  }
};

// RESULT:
// - Print button: Creates temp rotated file → Prints → Deletes temp file
// - Export button: Saves normal portrait image to Invoices folder
// - No unnecessary files saved when printing!
