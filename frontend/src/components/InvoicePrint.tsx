import React from "react";

interface OrderItem {
  product_id?: number;
  product_name: string;
  quantity: number;
  sold_price: number;
  total_price: number;
  color_name?: string;
  size_name?: string;
}

interface OrderData {
  order_id?: number;
  order_number: string;
  customer_id?: number | null;
  total_items: number;
  total_amount?: number;
  final_amount: number;
  advance_paid?: number;
  balance_due?: number;
  payment_status?: "unpaid" | "partial" | "fully_paid";
  payment_method?: "cash" | "card" | "online" | "bank" | "other";
  order_status?: string;
  notes?: string | null;
  order_date: string;
  recipient_name?: string;
  customer_name?: string;
  recipient_phone?: string;
  customer_mobile?: string;
  delivery_charge?: number;
  delivery_line1?: string;
  delivery_line2?: string;
  delivery_city?: string;
  items: OrderItem[];
  shopName?: string;
  shopAddress?: string;
  shopPhone?: string;
  subtotal?: number;
  bankDetails?: string;
  specialNotes?: string;
}

interface InvoicePrintProps {
  order: OrderData;
}

const InvoicePrint: React.FC<InvoicePrintProps> = ({ order }) => {
  // Calculate subtotal from items if not provided
  const subtotal =
    order.subtotal ||
    order.items.reduce(
      (sum, item) => sum + parseFloat(String(item.total_price || 0)),
      0
    );
  
  const deliveryCharge = parseFloat(String(order.delivery_charge || 0));
  
  // Calculate Grand Total = Subtotal + Delivery Charge
  const grandTotal = subtotal + deliveryCharge;
  
  const advancePaid = parseFloat(String(order.advance_paid || 0));
  const balanceDue = parseFloat(String(order.balance_due || 0));

  // Get customer info from different possible fields
  const customerPhone = order.customer_mobile || order.recipient_phone || "";
  const customerId = order.customer_id
    ? `C${String(order.customer_id).padStart(5, "0")}`
    : "";

  // Format invoice number with IN prefix
  const invoiceNumber = `IN${order.order_number}`;

  // Format date and time - handle various date formats
  let invoiceDate = "";
  let invoiceTime = "";
  
  try {
    let orderDateTime: Date;
    
    if (order.order_date) {
      // Try parsing the date - handle both ISO strings and other formats
      const dateStr = String(order.order_date);
      
      // If it's already a valid date string, parse it
      if (dateStr.includes('T') || dateStr.includes('Z')) {
        orderDateTime = new Date(dateStr);
      } else {
        // For MySQL datetime format (YYYY-MM-DD HH:MM:SS)
        orderDateTime = new Date(dateStr.replace(' ', 'T'));
      }
      
      // Check if date is valid
      if (!isNaN(orderDateTime.getTime())) {
        invoiceDate = orderDateTime.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
        invoiceTime = orderDateTime.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
      } else {
        // Fallback to current date if invalid
        const now = new Date();
        invoiceDate = now.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
        invoiceTime = now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
      }
    }
  } catch (error) {
    console.error('Error parsing date:', error);
    // Fallback to current date
    const now = new Date();
    invoiceDate = now.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    invoiceTime = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }
  
  // Final fallback if still empty
  if (!invoiceDate || !invoiceTime) {
    const now = new Date();
    if (!invoiceDate) {
      invoiceDate = now.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
    if (!invoiceTime) {
      invoiceTime = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    }
  }


  // Dennep Clothes address
  const companyName = "Dennep Clothes";
  const companyAddress = "Kebellewa, Nikaweratiya, Kurunegala";
  const companyPhone = "0703813223";

  // Business policies and terms
  const businessPolicies = `• No returns or refunds on purchased customised items
• No exchanges possible for size mismatchings, Please verify sizes.
• All sales are final
• Colors may vary slightly from display
• Handle with care - hand wash recommended`;

  // Debug: Log items to see what's being passed
  console.log("InvoicePrint - Order items:", order.items);
  console.log("InvoicePrint - Order data:", order);

  return (
    <div className="w-full min-h-screen flex justify-center bg-white print:bg-white p-4 print:p-0">
      {/* A4 Invoice Container */}
      <div
        className="w-[210mm] min-h-[297mm] bg-white print:shadow-none relative"
        style={{ fontFamily: "'Arial', sans-serif" }}
      >
        {/* Watermark Logo */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ zIndex: 0 }}
        >
          <img
            src="/dennep png.png"
            alt="Watermark"
            className="w-96 h-96 object-contain opacity-5"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>

        {/* Content - All content needs relative positioning to appear above watermark */}
        <div className="relative" style={{ zIndex: 1 }}>
          {/* Header Section */}
          <div className="pb-4 mb-6">
            <div className="flex justify-between items-start">
              {/* Logo and Company Name */}
              <div className="flex items-center gap-3">
                <img
                  src="/dennep png.png"
                  alt="Logo"
                  className="w-16 h-16 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
                <div>
                  <h1 className="text-2xl font-bold text-black">
                    {companyName}
                  </h1>
                  <p className="text-sm text-gray-600 mt-1">
                    {companyAddress} | {companyPhone}
                  </p>
                </div>
              </div>

              {/* INVOICE Title */}
              <div className="text-right">
                <h2 className="text-5xl font-bold text-red-600 tracking-wide">
                  INVOICE
                </h2>
              </div>
            </div>
          </div>

          {/* Customer and Invoice Details Section */}
          <div className="flex justify-between mb-8">
            {/* Left: Customer Details */}
            <div>
              <p className="text-sm font-normal mb-2">Invoice to :</p>
              {customerId && (
                <p className="text-sm text-gray-700">{customerId}</p>
              )}
              {order.delivery_line1 && (
                <p className="text-sm text-gray-700">{order.delivery_line1}</p>
              )}
              {order.delivery_line2 && (
                <p className="text-sm text-gray-700">{order.delivery_line2}</p>
              )}
              {order.delivery_city && (
                <p className="text-sm text-gray-700">{order.delivery_city}</p>
              )}
              {customerPhone && (
                <p className="text-sm text-gray-700">{customerPhone}</p>
              )}
            </div>

            {/* Right: Invoice Number and Date */}
            <div className="text-right">
              <p className="text-lg font-bold text-gray-900">{invoiceNumber}</p>
              <p className="text-lg text-gray-900">{invoiceDate}</p>
              <p className="text-lg text-gray-900">{invoiceTime}</p>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-4">
           <table className="w-full table-fixed border-collapse">
  <colgroup>
    <col style={{ width: "6%" }} />   {/* No. */}
    <col style={{ width: "34%" }} />  {/* Item */}
    <col style={{ width: "12%" }} />  {/* Size */}
    <col style={{ width: "12%" }} />  {/* Color */}
    <col style={{ width: "10%" }} />  {/* Qty */}
    <col style={{ width: "13%" }} />  {/* Price */}
    <col style={{ width: "13%" }} />  {/* Total */}
  </colgroup>

  <thead>
    <tr className="bg-red-600 text-white text-sm">
      <th className="py-2 px-2 text-center align-middle font-bold">No.</th>
      <th className="py-2 px-2 text-left align-middle font-bold">Item</th>
      <th className="py-2 px-2 text-center align-middle font-bold">Size</th>
      <th className="py-2 px-2 text-center align-middle font-bold">Color</th>
      <th className="py-2 px-2 text-center align-middle font-bold">Qty</th>
      <th className="py-2 px-2 text-right align-middle font-bold">Price (Rs.)</th>
      <th className="py-2 px-2 text-right align-middle font-bold">Total (Rs.)</th>
    </tr>
  </thead>

  <tbody>
    {order.items.map((item, index) => (
      <tr
        key={index}
        className="border-b border-gray-300 text-sm"
      >
        <td className="py-2 px-2 text-center align-middle">{index + 1}</td>
        <td className="py-2 px-2 align-middle font-medium">{item.product_name}</td>
        <td className="py-2 px-2 text-center align-middle">{item.size_name || "-"}</td>
        <td className="py-2 px-2 text-center align-middle">{item.color_name || "-"}</td>
        <td className="py-2 px-2 text-center align-middle font-semibold">{item.quantity}</td>
        <td className="py-2 px-2 text-right align-middle">
          {parseFloat(String(item.sold_price || 0)).toFixed(2)}
        </td>
        <td className="py-2 px-2 text-right align-middle font-semibold">
          {parseFloat(String(item.total_price || 0)).toFixed(2)}
        </td>
      </tr>
    ))}
  </tbody>
</table>

          </div>

          {/* Payment and Total Section */}
          <div className="flex justify-end items-end">

            {/* Totals */}
            <div className="w-5/12">
              {/* Subtotal - Always shown */}
              <div className="flex justify-between py-2 border-b border-gray-300">
                <span className="text-sm">Sub-total :</span>
                <span className="text-sm font-semibold">
                  Rs. {subtotal.toFixed(2)}
                </span>
              </div>

              {/* Delivery Charge - Show if available */}
              {deliveryCharge > 0 && (
                <div className="flex justify-between py-2 border-b border-gray-300">
                  <span className="text-sm">Delivery :</span>
                  <span className="text-sm font-semibold">
                    Rs. {deliveryCharge.toFixed(2)}
                  </span>
                </div>
              )}

              {/* Grand Total - Always shown with highlight */}
              <div className="flex justify-between py-3 bg-red-600 text-white px-4 mt-2">
                <span className="text-base font-bold">Grand Total :</span>
                <span className="text-xl font-bold">
                  Rs. {grandTotal.toFixed(2)}
                </span>
              </div>

              {/* Payment Breakdown - Only show if there's a balance due */}
              {balanceDue > 0 && (
                <>
                  {advancePaid > 0 && (
                    <div className="flex justify-between py-2 border-b border-gray-300 mt-2">
                      <span className="text-sm">Advance Paid :</span>
                      <span className="text-sm font-semibold">
                        Rs. {advancePaid.toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between py-2 bg-orange-100 px-4 mt-1">
                    <span className="text-sm font-bold text-red-700">Balance Due :</span>
                    <span className="text-sm font-bold text-red-700">
                      Rs. {balanceDue.toFixed(2)}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Order Notes Section */}
          {order.notes && (
            <div className="mt-6 p-4 bg-gray-50 border border-gray-300 rounded">
              <p className="text-sm font-bold text-gray-900 mb-2">📝 Order Note:</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{order.notes}</p>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8">
            {/* Thank You Message */}
            <div className="text-center">
              <p className="text-2xl font-semibold text-red-600 mb-2">
                Thank you for purchase!
              </p>
            </div>
          </div>
        </div>

        {/* Software Credit - At the very bottom of the page */}
        <div className="absolute bottom-2 left-0 right-0 text-center">
          <p className="text-[14px] text-gray-400">
            Software by zipzipy.com (078 89 15 271)
          </p>
        </div>

        {/* Print Styles */}
        <style>{`
          @media print {
            @page {
              size: A4 portrait;
              margin: 15mm;
            }
            body {
              margin: 0;
              padding: 0;
              background: white;
            }
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default InvoicePrint;
