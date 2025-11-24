import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { writeFile, BaseDirectory, createDir } from '@tauri-apps/api/fs';
import { message } from '@tauri-apps/api/dialog';

// A4 size in mm for jsPDF
const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;

// A4 size in pixels at 96 DPI (for canvas)
const A4_WIDTH_PX = 794; // ~210mm
const A4_HEIGHT_PX = 1123; // ~297mm

/**
 * Print HTML content directly
 */
export const printContent = (htmlContent: string, title: string) => {
  const printWindow = window.open('', '', 'width=1000,height=600');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.document.title = title;
    setTimeout(() => printWindow.print(), 250);
  }
};

/**
 * Save HTML content as PDF with A4 pagination
 */
export const saveAsPDF = async (
  htmlContent: string,
  fileName: string,
  folderName: 'inventory' | 'products' | 'orders' | 'customers' | 'sales'
) => {
  try {
    // Get export path from environment variable or use default
    const exportBasePath = import.meta.env.VITE_EXPORT_IMAGES_PATH || 'DennepPOS_Exports';

    // Create a hidden container div that won't cause visual disruption
    const hiddenContainer = document.createElement('div');
    hiddenContainer.style.position = 'fixed';
    hiddenContainer.style.top = '-10000px';
    hiddenContainer.style.left = '-10000px';
    hiddenContainer.style.width = `${A4_WIDTH_PX}px`;
    hiddenContainer.style.visibility = 'hidden';
    hiddenContainer.style.pointerEvents = 'none';
    hiddenContainer.style.zIndex = '-9999';
    document.body.appendChild(hiddenContainer);

    // Create a temporary container to render the HTML
    const container = document.createElement('div');
    container.style.width = `${A4_WIDTH_PX}px`;
    container.innerHTML = htmlContent;
    hiddenContainer.appendChild(container);

    // Wait for images and styles to load
    await new Promise(resolve => setTimeout(resolve, 500));

    // Calculate how many pages we need
    const contentHeight = container.scrollHeight;
    const pagesNeeded = Math.ceil(contentHeight / A4_HEIGHT_PX);

    // Create PDF document
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    // Generate images for each page and add to PDF
    for (let page = 0; page < pagesNeeded; page++) {
      // Create a wrapper for this page
      const pageWrapper = document.createElement('div');
      pageWrapper.style.width = `${A4_WIDTH_PX}px`;
      pageWrapper.style.height = `${A4_HEIGHT_PX}px`;
      pageWrapper.style.overflow = 'hidden';
      pageWrapper.style.position = 'relative';
      pageWrapper.style.backgroundColor = 'white';

      // Clone the content
      const pageContent = container.cloneNode(true) as HTMLElement;
      pageContent.style.position = 'absolute';
      pageContent.style.top = `-${page * A4_HEIGHT_PX}px`;

      pageWrapper.appendChild(pageContent);
      hiddenContainer.appendChild(pageWrapper);

      // Small delay to ensure rendering
      await new Promise(resolve => setTimeout(resolve, 100));

      // Capture the page as canvas
      const canvas = await html2canvas(pageWrapper, {
        width: A4_WIDTH_PX,
        height: A4_HEIGHT_PX,
        scale: 2, // Higher quality
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      // Convert canvas to image data
      const imgData = canvas.toDataURL('image/png', 1.0);

      // Add page to PDF (add new page for all except first)
      if (page > 0) {
        pdf.addPage();
      }

      // Add image to PDF page
      pdf.addImage(imgData, 'PNG', 0, 0, A4_WIDTH_MM, A4_HEIGHT_MM, undefined, 'FAST');

      // Clean up page wrapper
      hiddenContainer.removeChild(pageWrapper);

      console.log(`Added page ${page + 1} to PDF`);
    }

    // Clean up container
    document.body.removeChild(hiddenContainer);

    // Convert PDF to binary data
    const pdfBlob = pdf.output('blob');
    const arrayBuffer = await pdfBlob.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Ensure directory exists
    const dirPath = `${exportBasePath}/${folderName}`;
    try {
      await createDir(dirPath, { dir: BaseDirectory.Download, recursive: true });
    } catch (e) {
      console.log('Directory creation info:', e);
    }

    // Generate filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const time = new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
    const pdfFileName = `${fileName}_${timestamp}_${time}.pdf`;

    // Save file using Tauri API
    const filePath = `${dirPath}/${pdfFileName}`;
    await writeFile(
      { path: filePath, contents: uint8Array },
      { dir: BaseDirectory.Download }
    );

    console.log(`Saved PDF: ${filePath}`);

    await message(`Successfully saved PDF (${pagesNeeded} page${pagesNeeded > 1 ? 's' : ''}) to:\nDownloads\\${dirPath}`, {
      title: 'Export Successful',
      type: 'info'
    });
  } catch (error) {
    console.error('Error saving as PDF:', error);
    await message(`Failed to save PDF: ${error}`, {
      title: 'Export Failed',
      type: 'error'
    });
  }
};

/**
 * Generate inventory report HTML
 */
export const generateInventoryHTML = (materials: any[]) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Raw Materials Inventory Report</title>
      <style>
        @page { size: A4; margin: 0; }
        body {
          font-family: Arial, sans-serif;
          padding: 20px;
          margin: 0;
          width: 210mm;
          box-sizing: border-box;
        }
        h1 { color: #ef4444; text-align: center; margin-bottom: 10px; }
        .date { text-align: center; color: #666; margin-bottom: 20px; }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
          page-break-inside: auto;
        }
        tr { page-break-inside: avoid; page-break-after: auto; }
        th {
          background-color: #374151;
          color: white;
          padding: 10px;
          text-align: left;
          border: 1px solid #1f2937;
        }
        td { padding: 8px; border: 1px solid #d1d5db; }
        tr:nth-child(even) { background-color: #f9fafb; }
        .text-right { text-align: right; }
        .summary {
          margin-top: 30px;
          padding: 15px;
          background-color: #f3f4f6;
          border: 1px solid #d1d5db;
          border-radius: 5px;
          page-break-inside: avoid;
        }
        .summary p { margin: 5px 0; }
      </style>
    </head>
    <body>
      <h1>Raw Materials Inventory Report</h1>
      <p class="date">Generated on ${new Date().toLocaleString()}</p>
      <table>
        <thead>
          <tr>
            <th>Material Name</th>
            <th class="text-right">Quantity</th>
            <th class="text-right">Unit Cost (Rs.)</th>
            <th class="text-right">Total Value (Rs.)</th>
            <th>Last Updated</th>
          </tr>
        </thead>
        <tbody>
          ${materials.map(m => `
            <tr>
              <td>${m.item_name}</td>
              <td class="text-right">${m.quantity_in_stock}</td>
              <td class="text-right">${m.unit_cost.toFixed(2)}</td>
              <td class="text-right">${(m.quantity_in_stock * m.unit_cost).toFixed(2)}</td>
              <td>${new Date(m.updated_at).toLocaleDateString()}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div class="summary">
        <p><strong>Total Items Count:</strong> ${materials.reduce((sum, m) => sum + m.quantity_in_stock, 0)}</p>
        <p><strong>Total Inventory Value:</strong> Rs. ${materials.reduce((sum, m) => sum + (m.quantity_in_stock * m.unit_cost), 0).toFixed(2)}</p>
        <p><strong>Items Listed:</strong> ${materials.length}</p>
      </div>
    </body>
    </html>
  `;
};

/**
 * Generate customers report HTML
 */
export const generateCustomersHTML = (customers: any[]) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Customers Report</title>
      <style>
        @page { size: A4; margin: 0; }
        body {
          font-family: Arial, sans-serif;
          padding: 20px;
          margin: 0;
          width: 210mm;
          box-sizing: border-box;
        }
        h1 { color: #ef4444; text-align: center; margin-bottom: 10px; }
        .date { text-align: center; color: #666; margin-bottom: 20px; }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
          page-break-inside: auto;
        }
        tr { page-break-inside: avoid; page-break-after: auto; }
        th {
          background-color: #374151;
          color: white;
          padding: 10px;
          text-align: left;
          border: 1px solid #1f2937;
        }
        td { padding: 8px; border: 1px solid #d1d5db; }
        tr:nth-child(even) { background-color: #f9fafb; }
        .text-right { text-align: right; }
        .footer {
          margin-top: 30px;
          color: #666;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <h1>Customers Report</h1>
      <p class="date">Generated on ${new Date().toLocaleString()}</p>
      <table>
        <thead>
          <tr>
            <th>Customer ID</th>
            <th>Name</th>
            <th>Mobile</th>
            <th>Email</th>
            <th class="text-right">Total Spent (Rs.)</th>
            <th class="text-right">Total Orders</th>
            <th>Joined Date</th>
          </tr>
        </thead>
        <tbody>
          ${customers.map(c => `
            <tr>
              <td>${c.customer_id}</td>
              <td>${c.first_name || ''} ${c.last_name || ''}</td>
              <td>${c.mobile}</td>
              <td>${c.email || '-'}</td>
              <td class="text-right">Rs. ${c.total_spent ? parseFloat(c.total_spent).toFixed(2) : '0.00'}</td>
              <td class="text-right">${c.orders_count || 0}</td>
              <td>${new Date(c.created_at).toLocaleDateString()}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <p class="footer">Total Customers: ${customers.length}</p>
    </body>
    </html>
  `;
};

/**
 * Generate products report HTML
 */
export const generateProductsHTML = (products: any[]) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Products Report</title>
      <style>
        @page { size: A4; margin: 0; }
        body {
          font-family: Arial, sans-serif;
          padding: 20px;
          margin: 0;
          width: 210mm;
          box-sizing: border-box;
        }
        h1 { color: #ef4444; text-align: center; margin-bottom: 10px; }
        .date { text-align: center; color: #666; margin-bottom: 20px; }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
          page-break-inside: auto;
        }
        tr { page-break-inside: avoid; page-break-after: auto; }
        th {
          background-color: #374151;
          color: white;
          padding: 10px;
          text-align: left;
          border: 1px solid #1f2937;
        }
        td { padding: 8px; border: 1px solid #d1d5db; }
        tr:nth-child(even) { background-color: #f9fafb; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .footer {
          margin-top: 30px;
          color: #666;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <h1>Products Report</h1>
      <p class="date">Generated on ${new Date().toLocaleString()}</p>
      <table>
        <thead>
          <tr>
            <th>Product Code</th>
            <th>Name</th>
            <th>Colors</th>
            <th>Sizes</th>
            <th class="text-right">Product Cost (Rs.)</th>
            <th class="text-right">Print Cost (Rs.)</th>
            <th class="text-right">Retail Price (Rs.)</th>
            <th class="text-right">Wholesale Price (Rs.)</th>
          </tr>
        </thead>
        <tbody>
          ${products.map(p => `
            <tr>
              <td>${p.code}</td>
              <td>${p.name}</td>
              <td>${p.colors}</td>
              <td>${p.sizes}</td>
              <td class="text-right">${p.cost.toFixed(2)}</td>
              <td class="text-right">${p.printCost ? p.printCost.toFixed(2) : '0.00'}</td>
              <td class="text-right">${p.retailPrice.toFixed(2)}</td>
              <td class="text-right">${p.wholesalePrice.toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <p class="footer">Total Products: ${products.length}</p>
    </body>
    </html>
  `;
};

/**
 * Generate order bill HTML
 */
export const generateOrderBillHTML = (data: {
  selectedCustomer: any;
  cartItems: any[];
  subtotal: number;
  total: number;
  paidAmount: string;
}) => {
  const { selectedCustomer, cartItems, subtotal, total, paidAmount } = data;
  const paid = parseFloat(paidAmount) || 0;
  const balance = total - paid;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Order Bill</title>
      <style>
        @page { size: A4; margin: 0; }
        body {
          font-family: 'Courier New', monospace;
          padding: 20px;
          background: white;
          color: #333;
          margin: 0;
          width: 210mm;
          box-sizing: border-box;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          border: 2px solid #333;
          padding: 20px;
        }
        h1 {
          text-align: center;
          font-size: 24px;
          margin-bottom: 5px;
          color: #d32f2f;
        }
        .header {
          text-align: center;
          border-bottom: 2px solid #333;
          padding-bottom: 15px;
          margin-bottom: 15px;
        }
        .date {
          text-align: center;
          font-size: 12px;
          color: #666;
        }
        .section {
          margin-bottom: 15px;
        }
        .section-title {
          font-weight: bold;
          border-bottom: 1px solid #333;
          padding-bottom: 5px;
          margin-bottom: 8px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th {
          background-color: #f5f5f5;
          padding: 8px;
          text-align: left;
          border-bottom: 1px solid #333;
        }
        td {
          padding: 8px;
          border-bottom: 1px solid #ddd;
        }
        .text-right { text-align: right; }
        .totals {
          border-top: 2px solid #333;
          border-bottom: 2px solid #333;
          padding: 10px 0;
          margin: 10px 0;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          padding: 5px 0;
        }
        .total-amount {
          font-weight: bold;
          font-size: 16px;
          color: #d32f2f;
        }
        .footer {
          text-align: center;
          font-size: 12px;
          margin-top: 20px;
          color: #666;
        }
        .status-badge {
          font-weight: bold;
          padding: 5px 10px;
          border-radius: 3px;
          display: inline-block;
        }
        .status-paid {
          background-color: #c8e6c9;
          color: #2e7d32;
        }
        .status-balance {
          background-color: #ffccbc;
          color: #d84315;
        }
        .info-line {
          display: flex;
          justify-content: space-between;
          margin: 5px 0;
          font-size: 13px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>DENNP CLOTHES</h1>
          <p>Order Bill</p>
          <div class="date">${new Date().toLocaleString()}</div>
        </div>

        <div class="section">
          <div class="section-title">Customer Information</div>
          <div class="info-line">
            <span>Name:</span>
            <span>${selectedCustomer.name}</span>
          </div>
          <div class="info-line">
            <span>Mobile:</span>
            <span>${selectedCustomer.mobile}</span>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Order Items</div>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Size</th>
                <th>Color</th>
                <th class="text-right">Qty</th>
                <th class="text-right">Price</th>
                <th class="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${cartItems.map(item => `
                <tr>
                  <td>${item.productName}</td>
                  <td>${item.size}</td>
                  <td>${item.color}</td>
                  <td class="text-right">${item.quantity}</td>
                  <td class="text-right">Rs. ${item.price.toFixed(2)}</td>
                  <td class="text-right">Rs. ${(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="totals">
          <div class="total-row">
            <span>Subtotal:</span>
            <span>Rs. ${subtotal.toFixed(2)}</span>
          </div>
          <div class="total-row">
            <span class="total-amount">Total:</span>
            <span class="total-amount">Rs. ${total.toFixed(2)}</span>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Payment Details</div>
          <div class="info-line">
            <span>Amount Paid:</span>
            <span class="total-amount">Rs. ${paid.toFixed(2)}</span>
          </div>
          ${balance > 0 ? `
            <div class="info-line">
              <span>Balance Due:</span>
              <span class="status-badge status-balance">Rs. ${balance.toFixed(2)}</span>
            </div>
          ` : balance < 0 ? `
            <div class="info-line">
              <span>Change:</span>
              <span>Rs. ${Math.abs(balance).toFixed(2)}</span>
            </div>
          ` : `
            <div class="info-line">
              <span>Status:</span>
              <span class="status-badge status-paid">✓ Fully Paid</span>
            </div>
          `}
        </div>

        <div class="footer">
          <p>Thank you for your purchase!</p>
          <p style="font-size: 11px; margin-top: 20px;">This is a computer-generated bill</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
