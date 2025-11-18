import React, { useState, useMemo } from "react";

// Helper function to print all orders
const handlePrintAllOrders = (orders: any[]) => {
  const printWindow = window.open("", "", "width=1000,height=600");
  if (printWindow) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Orders Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #ef4444; text-align: center; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background-color: #374151; color: white; padding: 10px; text-align: left; border: 1px solid #1f2937; }
          td { padding: 8px; border: 1px solid #d1d5db; }
          tr:nth-child(even) { background-color: #f9fafb; }
          .text-right { text-align: right; }
          .status-badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
          .status-pending { background-color: #fef08a; color: #7c2d12; }
          .status-processing { background-color: #dbeafe; color: #164e63; }
          .status-shipped { background-color: #c7d2fe; color: #3730a3; }
          .status-delivered { background-color: #bbf7d0; color: #065f46; }
        </style>
      </head>
      <body>
        <h1>Orders Report</h1>
        <p style="text-align: center; color: #666;">Generated on ${new Date().toLocaleString()}</p>
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer Name</th>
              <th>Order Date</th>
              <th class="text-right">Total Amount (Rs.)</th>
              <th>Status</th>
              <th>Tracking Number</th>
            </tr>
          </thead>
          <tbody>
            ${orders.map(o => `
              <tr>
                <td>${o.id}</td>
                <td>${o.customerName}</td>
                <td>${o.orderDate}</td>
                <td class="text-right">Rs. ${o.totalAmount.toFixed(2)}</td>
                <td><span class="status-badge status-${o.status}">${o.status.toUpperCase()}</span></td>
                <td>${o.trackingNumber || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <p style="margin-top: 30px; color: #666; font-size: 12px;">Total Orders: ${orders.length} | Total Value: Rs. ${orders.reduce((sum, o) => sum + o.totalAmount, 0).toFixed(2)}</p>
      </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 250);
  }
};

// Helper function to print single order
const handlePrintSingleOrder = (order: any) => {
  const printWindow = window.open("", "", "width=800,height=600");
  if (printWindow) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Order ${order.id}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .header { border-bottom: 2px solid #ef4444; margin-bottom: 20px; }
          h1 { color: #ef4444; margin: 0; }
          .order-info { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
          .info-section { background-color: #f3f4f6; padding: 10px; border-radius: 5px; }
          .info-section strong { color: #ef4444; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th { background-color: #374151; color: white; padding: 10px; text-align: left; border: 1px solid #1f2937; }
          td { padding: 8px; border: 1px solid #d1d5db; }
          tr:nth-child(even) { background-color: #f9fafb; }
          .text-right { text-align: right; }
          .total { font-size: 18px; font-weight: bold; color: #ef4444; }
          .status-badge { padding: 6px 12px; border-radius: 4px; font-size: 12px; font-weight: bold; display: inline-block; }
          .status-pending { background-color: #fef08a; color: #7c2d12; }
          .status-processing { background-color: #dbeafe; color: #164e63; }
          .status-shipped { background-color: #c7d2fe; color: #3730a3; }
          .status-delivered { background-color: #bbf7d0; color: #065f46; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Order #${order.id}</h1>
          <p style="margin: 5px 0 0 0; color: #666;">Generated on ${new Date().toLocaleString()}</p>
        </div>

        <div class="order-info">
          <div class="info-section">
            <strong>Order Date:</strong> ${order.orderDate}<br>
            <strong>Customer:</strong> ${order.customerName} (ID: ${order.customerId})<br>
            <strong>Status:</strong> <span class="status-badge status-${order.status}">${order.status.toUpperCase()}</span>
          </div>
          <div class="info-section">
            <strong>Tracking Number:</strong> ${order.trackingNumber || 'Not assigned'}<br>
            <strong>Total Amount:</strong> Rs. ${order.totalAmount.toFixed(2)}
          </div>
        </div>

        <h3 style="color: #ef4444; margin-bottom: 10px;">Order Items</h3>
        <table>
          <thead>
            <tr>
              <th>Product Name</th>
              <th class="text-right">Quantity</th>
              <th class="text-right">Unit Price (Rs.)</th>
              <th class="text-right">Total (Rs.)</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map((item: any) => `
              <tr>
                <td>${item.productName}</td>
                <td class="text-right">${item.quantity}</td>
                <td class="text-right">${item.price.toFixed(2)}</td>
                <td class="text-right">${(item.quantity * item.price).toFixed(2)}</td>
              </tr>
            `).join('')}
            <tr style="border-top: 2px solid #ef4444;">
              <td colspan="3" class="text-right"><strong>TOTAL ORDER AMOUNT:</strong></td>
              <td class="text-right total">Rs. ${order.totalAmount.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 250);
  }
};

interface OrderItem {
  productName: string;
  quantity: number;
  price: number;
}

interface PaymentTransaction {
  id: string;
  type: "advance" | "balance";
  amount: number;
  method: "cash" | "card" | "check";
  date: string;
  time: string;
  notes?: string;
  paidBy?: string;
}

interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerMobile: string;
  customerAddress: string;
  customerEmail?: string;
  orderDate: string;

  // Payment tracking
  totalAmount: number;
  advancePaid: number;
  balancePaid: number;
  totalPaid: number; // = advancePaid + balancePaid
  remainingAmount: number; // = totalAmount - totalPaid
  paymentStatus: "unpaid" | "partial" | "fully_paid";
  paymentLocked: boolean; // true when status = 'shipped'
  paymentHistory: PaymentTransaction[];

  // Order workflow
  status: "pending" | "processing" | "shipped" | "delivered";
  trackingNumber: string;

  items: OrderItem[];

  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

const OrdersPage: React.FC = () => {
  const [selectedStatus, setSelectedStatus] = useState<string>("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orders, setOrders] = useState<Order[]>([
    {
      id: "ORD001",
      customerId: "C001",
      customerName: "John Doe",
      customerMobile: "+92-300-1234567",
      customerAddress: "123 Main Street, Karachi",
      customerEmail: "john@example.com",
      orderDate: "2024-11-15",
      totalAmount: 5250.50,
      advancePaid: 1500.00,
      balancePaid: 0,
      totalPaid: 1500.00,
      remainingAmount: 3750.50,
      paymentStatus: "partial",
      paymentLocked: false,
      status: "pending",
      trackingNumber: "",
      items: [
        { productName: "T-Shirt Blue", quantity: 2, price: 1250.00 },
        { productName: "Jeans Black", quantity: 1, price: 3000.50 },
      ],
      paymentHistory: [
        {
          id: "PAY001",
          type: "advance",
          amount: 1500.00,
          method: "cash",
          date: "2024-11-15",
          time: "10:30",
          notes: "Initial advance payment",
        },
      ],
      createdAt: "2024-11-15",
      updatedAt: "2024-11-15",
    },
    {
      id: "ORD002",
      customerId: "C002",
      customerName: "Sarah Smith",
      customerMobile: "+92-300-5678901",
      customerAddress: "456 Oak Avenue, Lahore",
      customerEmail: "sarah@example.com",
      orderDate: "2024-11-14",
      totalAmount: 3500.75,
      advancePaid: 2000.00,
      balancePaid: 1500.75,
      totalPaid: 3500.75,
      remainingAmount: 0,
      paymentStatus: "fully_paid",
      paymentLocked: false,
      status: "processing",
      trackingNumber: "",
      items: [
        { productName: "Dress White", quantity: 1, price: 3500.75 },
      ],
      paymentHistory: [
        {
          id: "PAY002",
          type: "advance",
          amount: 2000.00,
          method: "cash",
          date: "2024-11-14",
          time: "09:15",
          notes: "Advance payment",
        },
        {
          id: "PAY003",
          type: "balance",
          amount: 1500.75,
          method: "card",
          date: "2024-11-18",
          time: "14:00",
          notes: "Balance payment",
        },
      ],
      createdAt: "2024-11-14",
      updatedAt: "2024-11-18",
    },
    {
      id: "ORD003",
      customerId: "C001",
      customerName: "John Doe",
      customerMobile: "+92-300-1234567",
      customerAddress: "123 Main Street, Karachi",
      customerEmail: "john@example.com",
      orderDate: "2024-11-10",
      totalAmount: 7500.00,
      advancePaid: 3000.00,
      balancePaid: 4500.00,
      totalPaid: 7500.00,
      remainingAmount: 0,
      paymentStatus: "fully_paid",
      paymentLocked: true,
      status: "shipped",
      trackingNumber: "TRK123456789",
      items: [
        { productName: "Jacket Navy", quantity: 2, price: 3750.00 },
      ],
      paymentHistory: [
        {
          id: "PAY004",
          type: "advance",
          amount: 3000.00,
          method: "cash",
          date: "2024-11-10",
          time: "11:00",
          notes: "Advance payment",
        },
        {
          id: "PAY005",
          type: "balance",
          amount: 4500.00,
          method: "cash",
          date: "2024-11-12",
          time: "15:30",
          notes: "Balance payment",
        },
      ],
      createdAt: "2024-11-10",
      updatedAt: "2024-11-12",
    },
    {
      id: "ORD004",
      customerId: "C003",
      customerName: "Ahmed Khan",
      customerMobile: "+92-300-9876543",
      customerAddress: "789 Pine Road, Islamabad",
      customerEmail: "ahmed@example.com",
      orderDate: "2024-11-08",
      totalAmount: 4250.00,
      advancePaid: 2125.00,
      balancePaid: 2125.00,
      totalPaid: 4250.00,
      remainingAmount: 0,
      paymentStatus: "fully_paid",
      paymentLocked: true,
      status: "delivered",
      trackingNumber: "TRK987654321",
      items: [
        { productName: "Shirt Red", quantity: 3, price: 1416.67 },
      ],
      paymentHistory: [
        {
          id: "PAY006",
          type: "advance",
          amount: 2125.00,
          method: "card",
          date: "2024-11-08",
          time: "12:00",
          notes: "Advance payment",
        },
        {
          id: "PAY007",
          type: "balance",
          amount: 2125.00,
          method: "card",
          date: "2024-11-10",
          time: "16:45",
          notes: "Balance payment",
        },
      ],
      createdAt: "2024-11-08",
      updatedAt: "2024-11-10",
    },
    {
      id: "ORD005",
      customerId: "C002",
      customerName: "Sarah Smith",
      customerMobile: "+92-300-5678901",
      customerAddress: "456 Oak Avenue, Lahore",
      customerEmail: "sarah@example.com",
      orderDate: "2024-11-05",
      totalAmount: 2500.00,
      advancePaid: 1300.00,
      balancePaid: 0,
      totalPaid: 1300.00,
      remainingAmount: 1200.00,
      paymentStatus: "partial",
      paymentLocked: false,
      status: "pending",
      trackingNumber: "",
      items: [
        { productName: "T-Shirt Black", quantity: 2, price: 1250.00 },
      ],
      paymentHistory: [
        {
          id: "PAY008",
          type: "advance",
          amount: 1300.00,
          method: "cash",
          date: "2024-11-05",
          time: "13:20",
          notes: "Advance payment",
        },
      ],
      createdAt: "2024-11-05",
      updatedAt: "2024-11-05",
    },
  ]);

  const [editingTrackingNumber, setEditingTrackingNumber] = useState("");
  const [editingStatus, setEditingStatus] = useState<
    "pending" | "processing" | "shipped" | "delivered"
  >("pending");
  const [editingBalanceAmount, setEditingBalanceAmount] = useState("");
  const [editingPaymentMethod, setEditingPaymentMethod] = useState<"cash" | "card" | "check">("cash");
  const [editingPaymentNotes, setEditingPaymentNotes] = useState("");

  // Filter and search orders
  const filteredOrders = useMemo(() => {
    let result = [...orders];

    // Filter by status
    if (selectedStatus !== "all") {
      result = result.filter((order) => order.status === selectedStatus);
    }

    // Search by customer name, customer id, or order id
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (order) =>
          order.customerName.toLowerCase().includes(query) ||
          order.customerId.toLowerCase().includes(query) ||
          order.id.toLowerCase().includes(query)
      );
    }

    return result;
  }, [selectedStatus, searchQuery, orders]);

  const totalOrders = filteredOrders.length;
  const totalValue = filteredOrders.reduce((sum, order) => sum + order.totalAmount, 0);

  const handleOpenOrderDetails = (order: Order) => {
    setSelectedOrderId(order.id);
    setEditingStatus(order.status);
    setEditingTrackingNumber(order.trackingNumber);
    setShowOrderModal(true);
  };

  const handleCloseModal = () => {
    setShowOrderModal(false);
    setSelectedOrderId(null);
    setEditingStatus("pending");
    setEditingTrackingNumber("");
  };

  const handleUpdateOrder = () => {
    setOrders(
      orders.map((order) =>
        order.id === selectedOrderId
          ? {
              ...order,
              status: editingStatus,
              trackingNumber: editingTrackingNumber,
            }
          : order
      )
    );
    handleCloseModal();
  };

  const selectedOrder = orders.find((order) => order.id === selectedOrderId);

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-900/50 text-yellow-400";
      case "processing":
        return "bg-blue-900/50 text-blue-400";
      case "shipped":
        return "bg-purple-900/50 text-purple-400";
      case "delivered":
        return "bg-green-900/50 text-green-400";
      default:
        return "bg-gray-700/50 text-gray-400";
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-red-500">Orders</h1>
            <span className="text-sm font-semibold text-red-400 bg-red-900/30 px-3 py-1 rounded-full">
              {totalOrders} orders
            </span>
          </div>
          <p className="text-gray-400 mt-2">Manage and track customer orders</p>
        </div>
        <div className="flex flex-col items-end gap-3">
          <div className="text-right">
            <p className="text-sm text-gray-400">Total Order Value</p>
            <p className="text-2xl font-bold text-red-400">
              Rs. {totalValue.toFixed(2)}
            </p>
          </div>
          <button
            onClick={() => handlePrintAllOrders(filteredOrders)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center gap-2"
            title="Print/Export all orders as PDF"
          >
            🖨️ Print All Orders
          </button>
        </div>
      </div>

      {/* Status Filter Chips */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-red-400">
          Filter by Status
        </label>
        <div className="flex gap-2 flex-wrap">
          {[
            { value: "pending", label: "Pending", color: "bg-yellow-600 hover:bg-yellow-700" },
            { value: "processing", label: "Processing", color: "bg-blue-600 hover:bg-blue-700" },
            { value: "shipped", label: "Shipped", color: "bg-purple-600 hover:bg-purple-700" },
            { value: "delivered", label: "Delivered", color: "bg-green-600 hover:bg-green-700" },
            { value: "all", label: "All Orders", color: "bg-gray-600 hover:bg-gray-700" },
          ].map((status) => (
            <button
              key={status.value}
              onClick={() => setSelectedStatus(status.value)}
              className={`px-4 py-2 rounded-full font-semibold text-white transition-all ${
                selectedStatus === status.value
                  ? `${status.color} ring-2 ring-offset-2 ring-offset-gray-800`
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              {status.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-red-400">
          Search Orders
        </label>
        <input
          type="text"
          placeholder="Search by customer name, ID, or order ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 bg-gray-700 border-2 border-red-600/30 text-white placeholder-gray-500 rounded-lg focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 transition-colors"
        />
      </div>

      {/* Orders Table - Scrollable */}
      <div className="flex-1 overflow-hidden flex flex-col bg-gray-800/50 border border-gray-700 rounded-lg">
        <div className="overflow-x-auto overflow-y-auto flex-1">
          <table className="w-full text-sm">
            {/* Sticky Table Header */}
            <thead className="sticky top-0 bg-gray-700/80 border-b-2 border-red-600 z-10">
              <tr>
                <th className="px-6 py-3 text-left font-semibold text-red-400">Order ID</th>
                <th className="px-6 py-3 text-left font-semibold text-red-400">Customer</th>
                <th className="px-6 py-3 text-left font-semibold text-red-400">Customer ID</th>
                <th className="px-6 py-3 text-left font-semibold text-red-400">Order Date</th>
                <th className="px-6 py-3 text-right font-semibold text-red-400">Amount (Rs.)</th>
                <th className="px-6 py-3 text-left font-semibold text-red-400">Status</th>
                <th className="px-6 py-3 text-left font-semibold text-red-400">Tracking</th>
              </tr>
            </thead>

            {/* Table Body - Scrollable Rows */}
            <tbody className="divide-y divide-gray-700">
              {filteredOrders.map((order) => (
                <tr
                  key={order.id}
                  onClick={() => setSelectedOrderId(order.id)}
                  onDoubleClick={() => handleOpenOrderDetails(order)}
                  className={`cursor-pointer transition-all duration-200 ${
                    selectedOrderId === order.id
                      ? "bg-red-900/40 border-l-4 border-l-red-600"
                      : "hover:bg-gray-700/30 border-l-4 border-l-transparent"
                  }`}
                  title="Double-click to view details"
                >
                  <td className="px-6 py-4 text-gray-200 font-medium font-mono">
                    {order.id}
                  </td>
                  <td className="px-6 py-4 text-gray-200">{order.customerName}</td>
                  <td className="px-6 py-4 text-gray-400 font-mono">{order.customerId}</td>
                  <td className="px-6 py-4 text-gray-400 text-sm">{order.orderDate}</td>
                  <td className="px-6 py-4 text-right text-red-400 font-semibold">
                    {order.totalAmount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(
                        order.status
                      )}`}
                    >
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-sm">
                    {order.trackingNumber || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg shadow-2xl border-2 border-red-600 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-red-700 to-red-900 text-white p-6 border-b border-red-600 flex justify-between items-center sticky top-0">
              <div>
                <h2 className="text-2xl font-bold">Order Details</h2>
                <p className="text-red-200 text-sm mt-1">Order ID: {selectedOrder.id}</p>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-white hover:text-red-200 transition-colors text-2xl"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Customer Information */}
              <div>
                <h3 className="text-lg font-bold text-red-400 mb-4">Customer Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4">
                    <p className="text-xs text-gray-400 font-semibold mb-1">Customer Name</p>
                    <p className="text-gray-200 font-medium">{selectedOrder.customerName}</p>
                  </div>
                  <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4">
                    <p className="text-xs text-gray-400 font-semibold mb-1">Customer ID</p>
                    <p className="text-gray-200 font-medium font-mono">{selectedOrder.customerId}</p>
                  </div>
                  <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4">
                    <p className="text-xs text-gray-400 font-semibold mb-1">Order Date</p>
                    <p className="text-gray-200 font-medium">{selectedOrder.orderDate}</p>
                  </div>
                  <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4">
                    <p className="text-xs text-gray-400 font-semibold mb-1">Total Amount</p>
                    <p className="text-red-400 font-bold text-lg">
                      Rs. {selectedOrder.totalAmount.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="text-lg font-bold text-red-400 mb-4">Order Items</h3>
                <div className="bg-gray-700/30 border border-gray-700 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-700/50 border-b border-gray-600">
                        <tr>
                          <th className="px-4 py-3 text-left text-gray-300 font-semibold">
                            Product Name
                          </th>
                          <th className="px-4 py-3 text-right text-gray-300 font-semibold">
                            Quantity
                          </th>
                          <th className="px-4 py-3 text-right text-gray-300 font-semibold">
                            Price (Rs.)
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700">
                        {selectedOrder.items.map((item, idx) => (
                          <tr key={idx}>
                            <td className="px-4 py-3 text-gray-200">{item.productName}</td>
                            <td className="px-4 py-3 text-right text-gray-300">{item.quantity}</td>
                            <td className="px-4 py-3 text-right text-red-400 font-semibold">
                              {item.price.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Order Status and Tracking */}
              <div className="border-t border-gray-700 pt-5">
                <h3 className="text-lg font-bold text-red-400 mb-4">Order Status & Tracking</h3>

                {/* Status Dropdown */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-red-400 mb-2">
                    Order Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={editingStatus}
                    onChange={(e) =>
                      setEditingStatus(
                        e.target.value as "pending" | "processing" | "shipped" | "delivered"
                      )
                    }
                    className="w-full px-4 py-2 bg-gray-700 border-2 border-red-600/30 text-white rounded-lg focus:border-red-500 focus:outline-none"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                  </select>
                </div>

                {/* Tracking Number Input */}
                <div>
                  <label className="block text-sm font-semibold text-red-400 mb-2">
                    Tracking Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., TRK123456789"
                    value={editingTrackingNumber}
                    onChange={(e) => setEditingTrackingNumber(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 border-2 border-red-600/30 text-white placeholder-gray-500 rounded-lg focus:border-red-500 focus:outline-none"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Add a tracking number to keep the customer updated
                  </p>
                </div>

                {/* Current Status Badge */}
                {selectedOrder.trackingNumber && (
                  <div className="mt-4 bg-gray-700/50 border border-gray-600 rounded-lg p-4">
                    <p className="text-xs text-gray-400 font-semibold mb-1">
                      Current Tracking Number
                    </p>
                    <p className="text-gray-200 font-mono font-semibold">
                      {selectedOrder.trackingNumber}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-700">
                <button
                  onClick={handleUpdateOrder}
                  className="flex-1 bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                >
                  Update Order
                </button>
                <button
                  onClick={() => handlePrintSingleOrder(selectedOrder)}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  🖨️ Print Order
                </button>
                <button
                  onClick={handleCloseModal}
                  className="flex-1 bg-gray-700 text-gray-300 py-2 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
