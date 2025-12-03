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
  folderName: 'inventory' | 'products' | 'orders' | 'customers' | 'sales' | 'reports'
) => {
  try {
    // Get export path from environment variable or use default
    const exportBasePath = (import.meta as any).env?.VITE_EXPORT_IMAGES_PATH || 'DennepPOS_Exports';

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
      filePath,
      new TextDecoder().decode(uint8Array),
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
 * Generate inventory report HTML with eye-catching design
 */
export const generateInventoryHTML = (materials: any[]) => {
  const totalItems = materials.reduce((sum, m) => sum + m.quantity_in_stock, 0);
  const totalValue = materials.reduce((sum, m) => sum + (m.quantity_in_stock * m.unit_cost), 0);

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Raw Materials Inventory Report</title>
      <style>
        @page {
          size: A4 portrait;
          margin: 10mm;
          margin-header: 0;
          margin-footer: 0;
        }
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          padding: 15px;
          width: 210mm;
          height: 297mm;
          background: white;
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 15px;
          border-radius: 4px;
          text-align: center;
          margin-bottom: 12px;
          page-break-after: avoid;
        }
        .header h1 {
          margin: 0;
          font-size: 22px;
          font-weight: 700;
          letter-spacing: 0.5px;
        }
        .header-subtitle {
          font-size: 11px;
          opacity: 0.95;
          margin-top: 4px;
        }
        .date-info {
          background: white;
          padding: 8px 12px;
          border-radius: 4px;
          text-align: center;
          color: #666;
          font-size: 10px;
          margin-bottom: 12px;
          border-left: 4px solid #667eea;
          page-break-after: avoid;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 4px;
          overflow: hidden;
          font-size: 10px;
        }
        thead {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        th {
          padding: 8px 10px;
          text-align: left;
          font-weight: 600;
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          border: none;
        }
        td {
          padding: 6px 10px;
          border-bottom: 1px solid #e5e7eb;
          font-size: 10px;
        }
        tbody tr {
          page-break-inside: avoid;
        }
        tbody tr:nth-child(odd) {
          background-color: #f8f9fa;
        }
        tbody tr:nth-child(even) {
          background-color: white;
        }
        .text-right {
          text-align: right;
          font-weight: 500;
        }
        .summary {
          margin-top: 12px;
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 8px;
          page-break-inside: avoid;
        }
        .summary-card {
          background: #f8f9fa;
          padding: 10px;
          border-radius: 4px;
          border-left: 4px solid #667eea;
          text-align: center;
          page-break-inside: avoid;
        }
        .summary-card h3 {
          margin: 0 0 4px 0;
          font-size: 9px;
          text-transform: uppercase;
          color: #999;
          letter-spacing: 0.3px;
          font-weight: 600;
        }
        .summary-card .value {
          font-size: 16px;
          font-weight: 700;
          color: #667eea;
        }
        .footer {
          margin-top: 12px;
          text-align: center;
          font-size: 9px;
          color: #999;
          border-top: 1px solid #e5e7eb;
          padding-top: 8px;
          page-break-before: avoid;
        }
        .footer-text {
          margin: 2px 0;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>📊 INVENTORY REPORT</h1>
        <p class="header-subtitle">Raw Materials Inventory Management System</p>
      </div>

      <div class="date-info">
        <strong>Report Generated:</strong> ${new Date().toLocaleString()}
      </div>

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
              <td class="text-right">Rs. ${m.unit_cost.toFixed(2)}</td>
              <td class="text-right"><strong>Rs. ${(m.quantity_in_stock * m.unit_cost).toFixed(2)}</strong></td>
              <td>${new Date(m.updated_at).toLocaleDateString()}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="summary">
        <div class="summary-card">
          <h3>Total Items</h3>
          <div class="value">${totalItems}</div>
        </div>
        <div class="summary-card">
          <h3>Materials Listed</h3>
          <div class="value">${materials.length}</div>
        </div>
        <div class="summary-card">
          <h3>Total Value</h3>
          <div class="value">Rs. ${totalValue.toFixed(0)}</div>
        </div>
      </div>

      <div class="footer">
        <div class="footer-text">Generated by DENNP Clothes POS System</div>
        <div class="footer-text">© ${new Date().getFullYear()} All Rights Reserved</div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Generate customers report HTML with eye-catching design
 */
export const generateCustomersHTML = (customers: any[]) => {
  const totalSpent = customers.reduce((sum, c) => sum + (parseFloat(c.total_spent) || 0), 0);
  const totalOrders = customers.reduce((sum, c) => sum + (c.orders_count || 0), 0);
  const avgSpent = customers.length > 0 ? totalSpent / customers.length : 0;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Customers Report</title>
      <style>
        @page {
          size: A4 portrait;
          margin: 10mm;
          margin-header: 0;
          margin-footer: 0;
        }
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          padding: 15px;
          width: 210mm;
          height: 297mm;
          background: white;
        }
        .header {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          color: white;
          padding: 15px;
          border-radius: 4px;
          text-align: center;
          margin-bottom: 12px;
          page-break-after: avoid;
        }
        .header h1 {
          margin: 0;
          font-size: 22px;
          font-weight: 700;
          letter-spacing: 0.5px;
        }
        .header-subtitle {
          font-size: 11px;
          opacity: 0.95;
          margin-top: 4px;
        }
        .date-info {
          background: white;
          padding: 8px 12px;
          border-radius: 4px;
          text-align: center;
          color: #666;
          font-size: 10px;
          margin-bottom: 12px;
          border-left: 4px solid #f5576c;
          page-break-after: avoid;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 4px;
          overflow: hidden;
          font-size: 10px;
        }
        thead {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          color: white;
        }
        th {
          padding: 8px 10px;
          text-align: left;
          font-weight: 600;
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          border: none;
        }
        td {
          padding: 6px 10px;
          border-bottom: 1px solid #e5e7eb;
          font-size: 10px;
        }
        tbody tr {
          page-break-inside: avoid;
        }
        tbody tr:nth-child(odd) {
          background-color: #fef5f9;
        }
        tbody tr:nth-child(even) {
          background-color: white;
        }
        .text-right {
          text-align: right;
          font-weight: 500;
        }
        .stats {
          margin-top: 12px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          page-break-inside: avoid;
        }
        .stat-card {
          background: #fef5f9;
          padding: 10px;
          border-radius: 4px;
          border-left: 4px solid #f5576c;
          text-align: center;
          page-break-inside: avoid;
        }
        .stat-card h3 {
          margin: 0 0 4px 0;
          font-size: 9px;
          text-transform: uppercase;
          color: #999;
          letter-spacing: 0.3px;
          font-weight: 600;
        }
        .stat-card .value {
          font-size: 14px;
          font-weight: 700;
          color: #f5576c;
        }
        .footer {
          margin-top: 12px;
          text-align: center;
          font-size: 9px;
          color: #999;
          border-top: 1px solid #e5e7eb;
          padding-top: 8px;
          page-break-before: avoid;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>👥 CUSTOMERS REPORT</h1>
        <p class="header-subtitle">Customer Database & Transaction Summary</p>
      </div>

      <div class="date-info">
        <strong>Report Generated:</strong> ${new Date().toLocaleString()}
      </div>

      <table>
        <thead>
          <tr>
            <th>Customer ID</th>
            <th>Name</th>
            <th>Mobile</th>
            <th>Email</th>
            <th class="text-right">Total Spent (Rs.)</th>
            <th class="text-right">Orders</th>
            <th>Joined Date</th>
          </tr>
        </thead>
        <tbody>
          ${customers.map(c => `
            <tr>
              <td><strong>#${c.customer_id}</strong></td>
              <td>${c.first_name || ''} ${c.last_name || ''}</td>
              <td>${c.mobile}</td>
              <td>${c.email || '-'}</td>
              <td class="text-right"><strong>Rs. ${c.total_spent ? parseFloat(c.total_spent).toFixed(2) : '0.00'}</strong></td>
              <td class="text-right">${c.orders_count || 0}</td>
              <td>${new Date(c.created_at).toLocaleDateString()}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="stats">
        <div class="stat-card">
          <h3>Total Customers</h3>
          <div class="value">${customers.length}</div>
        </div>
        <div class="stat-card">
          <h3>Total Spent</h3>
          <div class="value">Rs. ${totalSpent.toFixed(0)}</div>
        </div>
        <div class="stat-card">
          <h3>Total Orders</h3>
          <div class="value">${totalOrders}</div>
        </div>
        <div class="stat-card">
          <h3>Avg. Spent</h3>
          <div class="value">Rs. ${avgSpent.toFixed(0)}</div>
        </div>
      </div>

      <div class="footer">
        <div class="footer-text">Generated by DENNP Clothes POS System</div>
        <div class="footer-text">© ${new Date().getFullYear()} All Rights Reserved</div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Generate products report HTML with eye-catching design
 */
export const generateProductsHTML = (products: any[]) => {
  const totalCost = products.reduce((sum, p) => sum + (p.cost || 0), 0);
  const totalRetailValue = products.reduce((sum, p) => sum + (p.retailPrice || 0), 0);

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Products Report</title>
      <style>
        @page {
          size: A4 portrait;
          margin: 10mm;
          margin-header: 0;
          margin-footer: 0;
        }
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          padding: 15px;
          width: 210mm;
          height: 297mm;
          background: white;
        }
        .header {
          background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
          color: white;
          padding: 15px;
          border-radius: 4px;
          text-align: center;
          margin-bottom: 12px;
          page-break-after: avoid;
        }
        .header h1 {
          margin: 0;
          font-size: 22px;
          font-weight: 700;
          letter-spacing: 0.5px;
          text-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header-subtitle {
          font-size: 11px;
          opacity: 0.95;
          margin-top: 4px;
        }
        .date-info {
          background: white;
          padding: 8px 12px;
          border-radius: 4px;
          text-align: center;
          color: #666;
          font-size: 10px;
          margin-bottom: 12px;
          border-left: 4px solid #fa709a;
          page-break-after: avoid;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 4px;
          overflow: hidden;
          font-size: 9px;
        }
        thead {
          background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
          color: white;
        }
        th {
          padding: 8px 10px;
          text-align: left;
          font-weight: 600;
          font-size: 8px;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          border: none;
        }
        td {
          padding: 6px 8px;
          border-bottom: 1px solid #e5e7eb;
          font-size: 9px;
        }
        tbody tr {
          page-break-inside: avoid;
        }
        tbody tr:nth-child(odd) {
          background-color: #fff9f0;
        }
        tbody tr:nth-child(even) {
          background-color: white;
        }
        .text-right {
          text-align: right;
          font-weight: 500;
        }
        .text-center {
          text-align: center;
        }
        .metrics {
          margin-top: 12px;
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 8px;
          page-break-inside: avoid;
        }
        .metric-card {
          background: #fff9f0;
          padding: 10px;
          border-radius: 4px;
          border-left: 4px solid #fa709a;
          text-align: center;
          page-break-inside: avoid;
        }
        .metric-card h3 {
          margin: 0 0 4px 0;
          font-size: 9px;
          text-transform: uppercase;
          color: #999;
          letter-spacing: 0.3px;
          font-weight: 600;
        }
        .metric-card .value {
          font-size: 16px;
          font-weight: 700;
          color: #fa709a;
        }
        .footer {
          margin-top: 12px;
          text-align: center;
          font-size: 9px;
          color: #999;
          border-top: 1px solid #e5e7eb;
          padding-top: 8px;
          page-break-before: avoid;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>📦 PRODUCTS REPORT</h1>
        <p class="header-subtitle">Complete Product Inventory & Pricing</p>
      </div>

      <div class="date-info">
        <strong>Report Generated:</strong> ${new Date().toLocaleString()}
      </div>

      <table>
        <thead>
          <tr>
            <th>Product Code</th>
            <th>Name</th>
            <th class="text-center">Colors</th>
            <th class="text-center">Sizes</th>
            <th class="text-right">Product Cost (Rs.)</th>
            <th class="text-right">Print Cost (Rs.)</th>
            <th class="text-right">Retail Price (Rs.)</th>
            <th class="text-right">Wholesale (Rs.)</th>
          </tr>
        </thead>
        <tbody>
          ${products.map(p => `
            <tr>
              <td><strong>${p.code}</strong></td>
              <td>${p.name}</td>
              <td class="text-center">${p.colors}</td>
              <td class="text-center">${p.sizes}</td>
              <td class="text-right">Rs. ${p.cost.toFixed(2)}</td>
              <td class="text-right">Rs. ${p.printCost ? p.printCost.toFixed(2) : '0.00'}</td>
              <td class="text-right"><strong>Rs. ${p.retailPrice.toFixed(2)}</strong></td>
              <td class="text-right">Rs. ${p.wholesalePrice.toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="metrics">
        <div class="metric-card">
          <h3>Total Products</h3>
          <div class="value">${products.length}</div>
        </div>
        <div class="metric-card">
          <h3>Total Cost</h3>
          <div class="value">Rs. ${totalCost.toFixed(0)}</div>
        </div>
        <div class="metric-card">
          <h3>Retail Value</h3>
          <div class="value">Rs. ${totalRetailValue.toFixed(0)}</div>
        </div>
      </div>

      <div class="footer">
        <div class="footer-text">Generated by DENNP Clothes POS System</div>
        <div class="footer-text">© ${new Date().getFullYear()} All Rights Reserved</div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Generate sales report HTML
 */
export const generateSalesReportHTML = (items: any[]) => {
  const totalSales = items.reduce((sum, item) => sum + (item.total_price || 0), 0);
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Sales Report</title>
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
        }
      </style>
    </head>
    <body>
      <h1>Sales Report</h1>
      <p class="date">Generated on ${new Date().toLocaleString()}</p>
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th class="text-right">Quantity</th>
            <th class="text-right">Price per Unit (Rs.)</th>
            <th class="text-right">Total (Rs.)</th>
          </tr>
        </thead>
        <tbody>
          ${items.map(item => `
            <tr>
              <td>${item.product_name || 'N/A'}</td>
              <td class="text-right">${item.quantity || 0}</td>
              <td class="text-right">Rs. ${(item.sold_price || 0).toFixed(2)}</td>
              <td class="text-right">Rs. ${((item.total_price || 0).toFixed(2))}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div class="summary">
        <p><strong>Total Sales:</strong> Rs. ${totalSales.toFixed(2)}</p>
        <p><strong>Total Items Sold:</strong> ${items.length}</p>
      </div>
    </body>
    </html>
  `;
};

/**
 * Generate product costs report HTML
 */
export const generateProductCostsReportHTML = (costs: any) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Product Costs Report</title>
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
        .section {
          margin-top: 30px;
          padding: 15px;
          background-color: #f3f4f6;
          border: 1px solid #d1d5db;
        }
        .section h2 {
          margin-top: 0;
          color: #374151;
          border-bottom: 2px solid #d1d5db;
          padding-bottom: 10px;
        }
        .info-line {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #d1d5db;
        }
        .info-line:last-child {
          border-bottom: none;
        }
        .text-right { text-align: right; }
        .amount { font-weight: bold; color: #ef4444; }
      </style>
    </head>
    <body>
      <h1>Product Costs Report</h1>
      <p class="date">Generated on ${new Date().toLocaleString()}</p>
      <div class="section">
        <h2>Cost Breakdown</h2>
        <div class="info-line">
          <span>Total Product Cost:</span>
          <span class="amount text-right">Rs. ${(costs.totalProductCost || 0).toFixed(2)}</span>
        </div>
        <div class="info-line">
          <span>Total Print Cost:</span>
          <span class="amount text-right">Rs. ${(costs.totalPrintCost || 0).toFixed(2)}</span>
        </div>
        <div class="info-line">
          <span>Total Material Cost:</span>
          <span class="amount text-right">Rs. ${(costs.totalMaterialCost || 0).toFixed(2)}</span>
        </div>
        <div class="info-line">
          <span><strong>Grand Total Costs:</strong></span>
          <span class="amount text-right"><strong>Rs. ${(costs.totalProductCost + costs.totalPrintCost + costs.totalMaterialCost || 0).toFixed(2)}</strong></span>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Generate delivery costs report HTML
 */
export const generateDeliveryCostsReportHTML = (costs: any) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Delivery Costs Report</title>
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
        .section {
          margin-top: 30px;
          padding: 15px;
          background-color: #f3f4f6;
          border: 1px solid #d1d5db;
        }
        .section h2 {
          margin-top: 0;
          color: #374151;
          border-bottom: 2px solid #d1d5db;
          padding-bottom: 10px;
        }
        .info-line {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #d1d5db;
        }
        .info-line:last-child {
          border-bottom: none;
        }
        .text-right { text-align: right; }
        .amount { font-weight: bold; color: #ef4444; }
      </style>
    </head>
    <body>
      <h1>Delivery Costs Report</h1>
      <p class="date">Generated on ${new Date().toLocaleString()}</p>
      <div class="section">
        <h2>Delivery Charges</h2>
        <div class="info-line">
          <span>Total Delivery Cost:</span>
          <span class="amount text-right">Rs. ${(costs.totalDeliveryCost || 0).toFixed(2)}</span>
        </div>
        <div class="info-line">
          <span>Number of Deliveries:</span>
          <span class="text-right">${costs.totalDeliveries || 0}</span>
        </div>
        <div class="info-line">
          <span>Average Delivery Cost:</span>
          <span class="amount text-right">Rs. ${((costs.totalDeliveryCost || 0) / (costs.totalDeliveries || 1)).toFixed(2)}</span>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Generate profits report HTML
 */
export const generateProfitsReportHTML = (data: any) => {
  const totalRevenue = data.totalRevenue || 0;
  const totalCosts = data.totalCosts || 0;
  const totalProfit = totalRevenue - totalCosts;
  const profitMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(2) : 0;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Profits Report</title>
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
        .section {
          margin-top: 30px;
          padding: 15px;
          background-color: #f3f4f6;
          border: 1px solid #d1d5db;
        }
        .section h2 {
          margin-top: 0;
          color: #374151;
          border-bottom: 2px solid #d1d5db;
          padding-bottom: 10px;
        }
        .info-line {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #d1d5db;
        }
        .info-line:last-child {
          border-bottom: none;
        }
        .text-right { text-align: right; }
        .amount { font-weight: bold; }
        .profit { color: #16a34a; }
        .loss { color: #dc2626; }
      </style>
    </head>
    <body>
      <h1>Profits Report</h1>
      <p class="date">Generated on ${new Date().toLocaleString()}</p>
      <div class="section">
        <h2>Profit & Loss Summary</h2>
        <div class="info-line">
          <span>Total Revenue:</span>
          <span class="amount text-right">Rs. ${totalRevenue.toFixed(2)}</span>
        </div>
        <div class="info-line">
          <span>Total Costs:</span>
          <span class="amount text-right">Rs. ${totalCosts.toFixed(2)}</span>
        </div>
        <div class="info-line">
          <span><strong>Net Profit:</strong></span>
          <span class="amount ${totalProfit >= 0 ? 'profit' : 'loss'} text-right"><strong>Rs. ${totalProfit.toFixed(2)}</strong></span>
        </div>
        <div class="info-line">
          <span><strong>Profit Margin:</strong></span>
          <span class="amount ${totalProfit >= 0 ? 'profit' : 'loss'} text-right"><strong>${profitMargin}%</strong></span>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Generate orders report HTML with eye-catching design
 */
export const generateOrdersHTML = (orders: any[]) => {
  const totalAmount = orders.reduce((sum, o) => sum + (parseFloat(o.final_amount) || 0), 0);
  const totalItems = orders.reduce((sum, o) => sum + (o.total_items || 0), 0);
  const avgOrder = orders.length > 0 ? totalAmount / orders.length : 0;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Orders Report</title>
      <style>
        @page {
          size: A4 portrait;
          margin: 10mm;
          margin-header: 0;
          margin-footer: 0;
        }
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          padding: 15px;
          width: 210mm;
          height: 297mm;
          background: white;
        }
        .header {
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          color: white;
          padding: 15px;
          border-radius: 4px;
          text-align: center;
          margin-bottom: 12px;
          page-break-after: avoid;
        }
        .header h1 {
          margin: 0;
          font-size: 22px;
          font-weight: 700;
          letter-spacing: 0.5px;
          text-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header-subtitle {
          font-size: 11px;
          opacity: 0.95;
          margin-top: 4px;
        }
        .date-info {
          background: white;
          padding: 8px 12px;
          border-radius: 4px;
          text-align: center;
          color: #666;
          font-size: 10px;
          margin-bottom: 12px;
          border-left: 4px solid #4facfe;
          page-break-after: avoid;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 4px;
          overflow: hidden;
          font-size: 9px;
        }
        thead {
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          color: white;
        }
        th {
          padding: 8px 10px;
          text-align: left;
          font-weight: 600;
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          border: none;
        }
        td {
          padding: 6px 8px;
          border-bottom: 1px solid #e5e7eb;
          font-size: 9px;
        }
        tbody tr {
          page-break-inside: avoid;
        }
        tbody tr:nth-child(odd) {
          background-color: #f0f9ff;
        }
        tbody tr:nth-child(even) {
          background-color: white;
        }
        .text-right {
          text-align: right;
          font-weight: 500;
        }
        .status-badge {
          display: inline-block;
          padding: 3px 8px;
          border-radius: 12px;
          font-size: 8px;
          font-weight: 600;
        }
        .status-paid {
          background-color: #d1fae5;
          color: #065f46;
        }
        .status-pending {
          background-color: #fef3c7;
          color: #92400e;
        }
        .status-completed {
          background-color: #dbeafe;
          color: #1e40af;
        }
        .status-cancelled {
          background-color: #fee2e2;
          color: #7f1d1d;
        }
        .summary {
          margin-top: 12px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          page-break-inside: avoid;
        }
        .summary-card {
          background: #f0f9ff;
          padding: 10px;
          border-radius: 4px;
          border-left: 4px solid #4facfe;
          text-align: center;
          page-break-inside: avoid;
        }
        .summary-card h3 {
          margin: 0 0 4px 0;
          font-size: 9px;
          text-transform: uppercase;
          color: #999;
          letter-spacing: 0.3px;
          font-weight: 600;
        }
        .summary-card .value {
          font-size: 14px;
          font-weight: 700;
          color: #4facfe;
        }
        .footer {
          margin-top: 12px;
          text-align: center;
          font-size: 9px;
          color: #999;
          border-top: 1px solid #e5e7eb;
          padding-top: 8px;
          page-break-before: avoid;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>📋 ORDERS REPORT</h1>
        <p class="header-subtitle">Complete Order Management & Transaction Summary</p>
      </div>

      <div class="date-info">
        <strong>Report Generated:</strong> ${new Date().toLocaleString()}
      </div>

      <table>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Order #</th>
            <th class="text-right">Items</th>
            <th class="text-right">Total Amount (Rs.)</th>
            <th>Payment Status</th>
            <th>Order Status</th>
            <th>Order Date</th>
          </tr>
        </thead>
        <tbody>
          ${orders.map(o => {
            let paymentClass = 'status-pending';
            if (o.payment_status?.toLowerCase() === 'paid' || o.payment_status?.toLowerCase() === 'completed') {
              paymentClass = 'status-paid';
            }

            let orderClass = 'status-pending';
            if (o.order_status?.toLowerCase() === 'completed') {
              orderClass = 'status-completed';
            } else if (o.order_status?.toLowerCase() === 'cancelled') {
              orderClass = 'status-cancelled';
            }

            return '<tr>' +
              '<td><strong>#' + o.order_id + '</strong></td>' +
              '<td>' + o.order_number + '</td>' +
              '<td class="text-right">' + o.total_items + '</td>' +
              '<td class="text-right"><strong>Rs. ' + (o.final_amount ? parseFloat(o.final_amount).toFixed(2) : '0.00') + '</strong></td>' +
              '<td><span class="status-badge ' + paymentClass + '">' + o.payment_status + '</span></td>' +
              '<td><span class="status-badge ' + orderClass + '">' + o.order_status + '</span></td>' +
              '<td>' + new Date(o.order_date).toLocaleDateString() + '</td>' +
              '</tr>';
          }).join('')}
        </tbody>
      </table>

      <div class="summary">
        <div class="summary-card">
          <h3>Total Orders</h3>
          <div class="value">${orders.length}</div>
        </div>
        <div class="summary-card">
          <h3>Total Amount</h3>
          <div class="value">Rs. ${totalAmount.toFixed(0)}</div>
        </div>
        <div class="summary-card">
          <h3>Total Items</h3>
          <div class="value">${totalItems}</div>
        </div>
        <div class="summary-card">
          <h3>Avg. Order</h3>
          <div class="value">Rs. ${avgOrder.toFixed(0)}</div>
        </div>
      </div>

      <div class="footer">
        <div class="footer-text">Generated by DENNP Clothes POS System</div>
        <div class="footer-text">© ${new Date().getFullYear()} All Rights Reserved</div>
      </div>
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
