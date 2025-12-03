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
  items: OrderItem[];
  shopName?: string;
  shopAddress?: string;
  shopPhone?: string;
  subtotal?: number;
}

const InvoicePrint: React.FC<{ order: OrderData }> = ({ order }) => {
  // Calculate subtotal from items if not provided
  const subtotal = order.subtotal || order.items.reduce((sum, item) => sum + item.total_price, 0);
  const balance = order.balance_due || 0;
  const paid = order.advance_paid || order.final_amount || 0;

  // Get customer info from different possible fields
  const customerName = order.customer_name || order.recipient_name || "Walk-in Customer";
  const customerPhone = order.customer_mobile || order.recipient_phone || "";

  // Format invoice number
  const invoiceNumber = `IN${order.order_number}`;

  // Format date
  const invoiceDate = new Date(order.order_date).toLocaleDateString();

  return (
    <div className="w-full flex justify-center bg-gray-100 p-4 print:bg-white">
      {/* Watermark */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-9xl font-bold text-red-500 opacity-5 -rotate-45 pointer-events-none z-0">
        DENNP
      </div>

      {/* Invoice Container */}
      <div className="w-[210mm] bg-white p-8 shadow-lg text-sm relative z-10 print:shadow-none print:p-6">
        {/* Header with Red Gradient */}
        <div className="bg-gradient-to-r from-red-600 to-red-800 text-white p-6 mb-6 rounded-t-lg">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-1">{order.shopName || "DENNP CLOTHES"}</h1>
              <p className="text-sm opacity-90">Premium Apparel & Printing Solutions</p>
              {order.shopAddress && <p className="text-xs mt-1">{order.shopAddress}</p>}
              {order.shopPhone && <p className="text-xs">Phone: {order.shopPhone}</p>}
            </div>

            <div className="text-right">
              <div className="bg-white text-red-600 px-4 py-2 rounded inline-block font-bold text-lg mb-2">
                INVOICE
              </div>
              <p className="text-sm"><span className="font-semibold">Invoice #:</span> {invoiceNumber}</p>
              <p className="text-sm"><span className="font-semibold">Date:</span> {invoiceDate}</p>
              <p className="text-sm"><span className="font-semibold">Time:</span> {new Date(order.order_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </div>
        </div>

        {/* Customer Info */}
        <div className="grid grid-cols-2 gap-8 mb-6 pb-6 border-b-2 border-red-600">
          <div>
            <p className="font-bold text-red-600 text-xs uppercase tracking-wide mb-2">Bill To:</p>
            <p className="font-semibold text-gray-900">{customerName}</p>
            {customerPhone && <p className="text-gray-600">{customerPhone}</p>}
          </div>

          <div>
            <p className="font-bold text-red-600 text-xs uppercase tracking-wide mb-2">Order Details:</p>
            <p className="text-gray-700"><span className="font-semibold">Order Status:</span> <span className="capitalize">{order.order_status || "Pending"}</span></p>
            <p className="text-gray-700"><span className="font-semibold">Payment:</span> <span className="capitalize">{order.payment_status || "Unpaid"}</span></p>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-8">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b-2 border-red-600">
                <th className="text-left py-3 px-2 font-bold text-red-600 text-xs uppercase">Item Description</th>
                <th className="text-center py-3 px-2 font-bold text-red-600 text-xs uppercase w-16">Size</th>
                <th className="text-center py-3 px-2 font-bold text-red-600 text-xs uppercase w-16">Color</th>
                <th className="text-center py-3 px-2 font-bold text-red-600 text-xs uppercase w-12">Qty</th>
                <th className="text-right py-3 px-2 font-bold text-red-600 text-xs uppercase w-24">Price</th>
                <th className="text-right py-3 px-2 font-bold text-red-600 text-xs uppercase w-28">Total</th>
              </tr>
            </thead>

            <tbody>
              {order.items.map((item, index) => (
                <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-2 text-gray-900 font-medium">{item.product_name}</td>
                  <td className="text-center py-3 px-2 text-gray-700">{item.size_name || "-"}</td>
                  <td className="text-center py-3 px-2 text-gray-700">{item.color_name || "-"}</td>
                  <td className="text-center py-3 px-2 font-semibold text-gray-900">{item.quantity}</td>
                  <td className="text-right py-3 px-2 font-semibold text-gray-900">Rs. {item.sold_price.toFixed(2)}</td>
                  <td className="text-right py-3 px-2 font-bold text-red-600">Rs. {item.total_price.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Section */}
        <div className="flex justify-end mb-8">
          <div className="w-80">
            {/* Subtotal */}
            <div className="flex justify-between py-2 border-b border-gray-300">
              <span className="text-gray-700">Subtotal:</span>
              <span className="font-semibold">Rs. {subtotal.toFixed(2)}</span>
            </div>

            {/* Delivery Charge */}
            {order.delivery_charge && order.delivery_charge > 0 && (
              <div className="flex justify-between py-2 border-b border-gray-300">
                <span className="text-gray-700">Delivery Charge:</span>
                <span className="font-semibold">Rs. {order.delivery_charge.toFixed(2)}</span>
              </div>
            )}

            {/* Grand Total */}
            <div className="flex justify-between py-3 border-t-2 border-b-2 border-red-600 bg-gray-50 px-3">
              <span className="font-bold text-lg text-gray-900">Grand Total:</span>
              <span className="font-bold text-xl text-red-600">Rs. {order.final_amount.toFixed(2)}</span>
            </div>

            {/* Amount Paid */}
            <div className="flex justify-between py-2 mt-3">
              <span className="text-gray-700">Amount Paid:</span>
              <span className="font-semibold text-green-600">Rs. {paid.toFixed(2)}</span>
            </div>

            {/* Balance Due */}
            {balance > 0 && (
              <div className="flex justify-between py-2 bg-orange-50 px-2 rounded">
                <span className="text-orange-700 font-semibold">Balance Due:</span>
                <span className="font-bold text-orange-700">Rs. {balance.toFixed(2)}</span>
              </div>
            )}

            {/* Fully Paid Badge */}
            {balance <= 0 && (
              <div className="flex justify-between py-2 bg-green-50 px-2 rounded">
                <span className="text-green-700 font-semibold">Status:</span>
                <span className="font-bold text-green-700">✓ Fully Paid</span>
              </div>
            )}
          </div>
        </div>

        {/* Notes */}
        {order.notes && (
          <div className="mb-6 p-3 bg-gray-100 rounded-lg border-l-4 border-red-600">
            <p className="text-xs font-semibold text-red-600 uppercase mb-1">Order Notes:</p>
            <p className="text-sm text-gray-700">{order.notes}</p>
          </div>
        )}

        {/* Footer */}
        <div className="border-t-2 border-red-600 pt-6 text-center">
          <p className="font-bold text-red-600 text-lg mb-2">Thank You for Your Purchase!</p>
          <p className="text-gray-600 text-xs mb-1">We appreciate your business and look forward to serving you again.</p>
          <p className="text-gray-500 text-xs mt-3">This is a computer-generated invoice. Please retain for your records.</p>
          <p className="text-gray-500 text-xs mt-1">© {new Date().getFullYear()} DENNP Clothes. All rights reserved.</p>
        </div>

        {/* Print-specific styles */}
        <style>{`
          @media print {
            body {
              background: white;
            }
            .print\\:shadow-none {
              box-shadow: none !important;
            }
            .print\\:bg-white {
              background-color: white !important;
            }
            .print\\:p-6 {
              padding: 1.5rem !important;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default InvoicePrint;
