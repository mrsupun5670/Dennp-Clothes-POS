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
  const finalAmount = parseFloat(String(order.final_amount || 0));
  const deliveryCharge = parseFloat(String(order.delivery_charge || 0));

  // Get customer info from different possible fields
  const customerPhone = order.customer_mobile || order.recipient_phone || "";
  const customerId = order.customer_id
    ? `C${String(order.customer_id).padStart(5, "0")}`
    : "";

  // Format invoice number with IN prefix
  const invoiceNumber = `IN${order.order_number}`;

  // Format date and time
  const orderDateTime = new Date(order.order_date);
  const invoiceDate = orderDateTime.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const invoiceTime = orderDateTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  // Dennep Clothes address
  const companyName = "Dennep Clothes";
  const companyAddress = "Kebellewa, Nikaweratiya, Kurunegala";
  const companyPhone = "0703813223";

  // Business policies and terms
  const businessPolicies = `• No returns or refunds on purchased items
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
        className="w-[210mm] bg-white print:shadow-none relative"
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
          <div className="border-b-2 border-black pb-4 mb-6">
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
          <div className="mb-8">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-red-600 text-white">
                  <th className="text-center py-2 px-3 font-bold text-sm w-12">
                    No.
                  </th>
                  <th className="text-left py-2 px-3 font-bold text-sm">
                    Item
                  </th>
                  <th className="text-center py-2 px-3 font-bold text-sm w-20">
                    Size
                  </th>
                  <th className="text-center py-2 px-3 font-bold text-sm w-20">
                    Color
                  </th>
                  <th className="text-center py-2 px-3 font-bold text-sm w-16">
                    Qty
                  </th>
                  <th className="text-right py-2 px-3 font-bold text-sm w-24">
                    Price (Rs.)
                  </th>
                  <th className="text-right py-2 px-3 font-bold text-sm w-28">
                    Total (Rs.)
                  </th>
                </tr>
              </thead>
              <tbody>
                {order.items && order.items.length > 0 ? (
                  order.items.map((item, index) => (
                    <tr key={index} className="border-b border-gray-300">
                      <td className="text-center py-2 px-3 text-sm">
                        {index + 1}
                      </td>
                      <td className="py-2 px-3 text-sm font-medium">
                        {item.product_name}
                      </td>
                      <td className="text-center py-2 px-3 text-sm">
                        {item.size_name || "-"}
                      </td>
                      <td className="text-center py-2 px-3 text-sm">
                        {item.color_name || "-"}
                      </td>
                      <td className="text-center py-2 px-3 text-sm font-semibold">
                        {item.quantity}
                      </td>
                      <td className="text-right py-2 px-3 text-sm">
                        {parseFloat(String(item.sold_price || 0)).toFixed(2)}
                      </td>
                      <td className="text-right py-2 px-3 text-sm font-semibold">
                        {parseFloat(String(item.total_price || 0)).toFixed(2)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={7}
                      className="text-center py-3 text-sm text-gray-500"
                    >
                      No items found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Payment and Total Section */}
          <div className="flex justify-between items-start">
            {/* Send Payment To */}
            <div className="w-1/2">
              {order.bankDetails && (
                <>
                  <p className="text-sm font-bold mb-2">Send Payment to :</p>
                  <div className="text-sm text-gray-700 whitespace-pre-line">
                    {order.bankDetails}
                  </div>
                </>
              )}
            </div>

            {/* Totals */}
            <div className="w-5/12">
              <div className="flex justify-between py-2 border-b border-gray-300">
                <span className="text-sm">Sub-total :</span>
                <span className="text-sm font-semibold">
                  Rs. {subtotal.toFixed(2)}
                </span>
              </div>

              {deliveryCharge > 0 && (
                <div className="flex justify-between py-2 border-b border-gray-300">
                  <span className="text-sm">Delivery :</span>
                  <span className="text-sm font-semibold">
                    Rs. {deliveryCharge.toFixed(2)}
                  </span>
                </div>
              )}

              <div className="flex justify-between py-3 bg-red-600 text-white px-4 mt-2">
                <span className="text-base font-bold">Total :</span>
                <span className="text-xl font-bold">
                  Rs. {finalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="mt-6 p-3 bg-transparent border-l-4 border-red-600">
            <p className="text-xs font-bold text-red-600 uppercase mb-1">
              Notes:
            </p>
            <p className="text-sm text-gray-700 whitespace-pre-line">
              {businessPolicies}
            </p>
          </div>

          {/* Footer */}
          <div className="mt-8">
            {/* Company Contact Info */}
            <div className="mb-4 text-sm text-gray-700">
              <p>{companyName}</p>
              <p>{companyAddress}</p>
              <p>{companyPhone}</p>
            </div>

            {/* Thank You Message */}
            <div className="text-center">
              <p className="text-2xl font-semibold text-red-600 mb-2">
                Thank you for purchase!
              </p>
            </div>
          </div>
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
