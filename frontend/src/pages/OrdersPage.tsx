import React, { useState, useMemo, useEffect } from "react";
import { useQuery } from "../hooks/useQuery";
import { useShop } from "../context/ShopContext";
import { API_URL } from "../config/api";

interface OrderItem {
  product_id: number;
  product_name: string;
  quantity: number;
  sold_price: number;
  total_price: number;
  color_id: number;
  size_id: number;
}

interface Order {
  order_id: number;
  order_number: string;
  customer_id: number | null;
  total_items: number;
  total_amount: number;
  advance_paid: number;
  balance_paid: number;
  total_paid: number;
  payment_status: "unpaid" | "partial" | "fully_paid";
  remaining_amount: number;
  payment_method: "cash" | "card" | "online" | "other";
  order_status: "Pending" | "Processing" | "Shipped" | "Delivered";
  notes: string | null;
  order_date: string;
  recipient_name: string;
  recipient_phone: string;
  line1: string;
  line2: string;
  city_name: string;
  district_name: string;
  province_name: string;
  postal_code: string;
  items?: OrderItem[];
}

// Utility function to print receipt with proper print dialog
const printReceipt = async (orderId: number) => {
  try {
    const receiptElement = document.getElementById(`receipt-${orderId}`);
    if (!receiptElement) {
      alert("Receipt not loaded. Please click 'Show Receipt' first.");
      return;
    }

    // Create a new window for printing
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to print receipt");
      return;
    }

    // Write the HTML content
    const receiptHTML = receiptElement.innerHTML;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt Print</title>
        <style>
          @media print {
            body { margin: 0; padding: 0; }
            * { margin: 0; padding: 0; }
          }
        </style>
      </head>
      <body>
        ${receiptHTML}
        <script>
          window.onload = function() {
            window.print();
            setTimeout(() => window.close(), 500);
          }
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  } catch (error) {
    console.error("Error printing receipt:", error);
    alert("Failed to print receipt. Please try again.");
  }
};

// Utility function to export receipt as image
const exportReceiptAsImage = async (
  orderId: number,
  customerMobile: string,
  format: "png" | "jpg"
) => {
  try {
    const receiptElement = document.getElementById(`receipt-${orderId}`);
    if (!receiptElement) {
      alert("Receipt not loaded. Please click 'Show Receipt' first.");
      return;
    }

    // Dynamic import html2canvas
    const html2canvas = (await import("html2canvas")).default;

    const canvas = await html2canvas(receiptElement, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
    });

    const link = document.createElement("a");
    link.href = canvas.toDataURL(`image/${format}`);
    link.download = `${customerMobile}_${orderId}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    alert(`Receipt saved as ${customerMobile}_${orderId}.${format}\nCheck your Downloads folder.`);
  } catch (error) {
    console.error("Error exporting receipt:", error);
    alert("Failed to export receipt. Please try again.");
  }
};

const OrdersPage: React.FC = () => {
  const { shopId } = useShop();
  const [selectedStatus, setSelectedStatus] = useState<string>("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showReceiptPreview, setShowReceiptPreview] = useState(false);

  // Payment form state
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentType, setPaymentType] = useState<"advance" | "balance">(
    "balance"
  );
  const [paymentMethod, setPaymentMethod] = useState<
    "cash" | "card" | "online" | "other"
  >("cash");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState("");

  // Order update state
  const [editingStatus, setEditingStatus] = useState<
    "Pending" | "Processing" | "Shipped" | "Delivered"
  >("Pending");
  const [isUpdatingOrder, setIsUpdatingOrder] = useState(false);

  // Receipt HTML state
  const [receiptHTML, setReceiptHTML] = useState<string>("");

  const {
    data: orders,
    isLoading: isLoadingOrders,
    refetch: refetchOrders,
  } = useQuery<Order[]>(["orders", selectedStatus, shopId], async () => {
    if (!shopId) {
      throw new Error("Shop ID is required");
    }
    const response = await fetch(
      `${API_URL}/orders?shop_id=${shopId}&status=${selectedStatus}`
    );
    const result = await response.json();
    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.error || "Failed to fetch orders");
    }
  }, { enabled: shopId !== null });

  // Filter and search orders
  const filteredOrders = useMemo(() => {
    let result = [...(orders || [])];

    // Search by customer ID, customer name, or order ID
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (order) =>
          order.recipient_name.toLowerCase().includes(query) ||
          (order.customer_id && order.customer_id.toString().includes(query)) ||
          order.order_id.toString().includes(query)
      );
    }

    return result;
  }, [selectedStatus, searchQuery, orders]);

  const totalOrders = filteredOrders.length;
  const totalValue = filteredOrders.reduce(
    (sum, order) => sum + order.total_amount,
    0
  );

  const selectedOrder = orders?.find(
    (order) => order.order_id === selectedOrderId
  );

  // Fetch receipt HTML when showing receipt
  useEffect(() => {
    if (selectedOrderId && showReceiptPreview) {
      const fetchReceipt = async () => {
        try {
          const response = await fetch(
            `${API_URL}/orders/${selectedOrderId}/receipt`
          );
          const result = await response.json();
          if (result.success) {
            setReceiptHTML(result.data.html);
          } else {
            alert("Failed to load receipt");
          }
        } catch (error) {
          console.error("Error fetching receipt:", error);
          alert("Error loading receipt");
        }
      };
      fetchReceipt();
    }
  }, [selectedOrderId, showReceiptPreview]);

  const handleOpenOrderDetails = (order: Order) => {
    setSelectedOrderId(order.order_id);
    setEditingStatus(order.order_status);
    setPaymentAmount("");
    setPaymentType("balance");
    setPaymentMethod("cash");
    setPaymentMessage("");
    setShowReceiptPreview(false);
    setShowOrderModal(true);
  };

  const handleCloseModal = () => {
    setShowOrderModal(false);
    setShowReceiptPreview(false);
    setSelectedOrderId(null);
    setPaymentAmount("");
    setPaymentMessage("");
    setReceiptHTML("");
  };

  const handleUpdateOrder = async () => {
    if (!selectedOrderId) return;

    setIsUpdatingOrder(true);
    try {
      const response = await fetch(
        `${API_URL}/orders/${selectedOrderId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            order_status: editingStatus,
          }),
        }
      );
      const result = await response.json();
      if (result.success) {
        setPaymentMessage("✅ Order updated successfully!");
        setTimeout(() => {
          refetchOrders();
          handleCloseModal();
        }, 1000);
      } else {
        setPaymentMessage(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      console.error("Error updating order:", error);
      setPaymentMessage("❌ Failed to update order");
    } finally {
      setIsUpdatingOrder(false);
    }
  };

  const handleRecordPayment = async () => {
    if (!selectedOrderId || !paymentAmount) {
      setPaymentMessage("❌ Please enter a payment amount");
      return;
    }

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      setPaymentMessage("❌ Please enter a valid amount");
      return;
    }

    if (amount > (selectedOrder?.remaining_amount || 0)) {
      setPaymentMessage(
        `❌ Amount cannot exceed remaining balance (Rs. ${selectedOrder?.remaining_amount.toFixed(2)})`
      );
      return;
    }

    setIsProcessingPayment(true);
    setPaymentMessage("");

    try {
      const response = await fetch(
        `${API_URL}/orders/${selectedOrderId}/payment`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount_paid: amount,
            payment_type: paymentType,
            payment_method: paymentMethod,
          }),
        }
      );

      const result = await response.json();
      if (result.success) {
        setPaymentMessage(
          `✅ Payment of Rs. ${amount.toFixed(2)} recorded successfully!`
        );
        setPaymentAmount("");
        setTimeout(() => {
          refetchOrders();
          handleCloseModal();
        }, 1500);
      } else {
        setPaymentMessage(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      console.error("Error recording payment:", error);
      setPaymentMessage("❌ Failed to record payment");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleEditOrder = () => {
    if (!selectedOrder) return;

    // Store order data for editing in SalesPage
    sessionStorage.setItem(
      "editingOrder",
      JSON.stringify({
        orderId: selectedOrder.order_id,
        orderNumber: selectedOrder.order_number,
        customerId: selectedOrder.customer_id,
        customerName: selectedOrder.recipient_name,
        customerMobile: selectedOrder.recipient_phone,
        items: selectedOrder.items || [],
        totalAmount: selectedOrder.total_amount,
        orderStatus: selectedOrder.order_status,
        paymentMethod: selectedOrder.payment_method,
      })
    );

    // Close modal and navigate to sales
    handleCloseModal();
    sessionStorage.setItem("navigateToSales", "true");
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-900/50 text-yellow-400";
      case "Processing":
        return "bg-blue-900/50 text-blue-400";
      case "Shipped":
        return "bg-purple-900/50 text-purple-400";
      case "Delivered":
        return "bg-green-900/50 text-green-400";
      default:
        return "bg-gray-700/50 text-gray-400";
    }
  };

  const getPaymentStatusBadgeColor = (status: string) => {
    switch (status) {
      case "unpaid":
        return "bg-red-900/50 text-red-400";
      case "partial":
        return "bg-yellow-900/50 text-yellow-400";
      case "fully_paid":
        return "bg-green-900/50 text-green-400";
      default:
        return "bg-gray-700/50 text-gray-400";
    }
  };

  if (isLoadingOrders) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-400 text-lg">Loading orders...</p>
      </div>
    );
  }

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
          <p className="text-gray-400 mt-2">
            Manage, settle payments, and track orders
          </p>
        </div>
        <div className="flex flex-col items-end gap-3">
          <div className="text-right">
            <p className="text-sm text-gray-400">Total Order Value</p>
            <p className="text-2xl font-bold text-red-400">
              Rs. {totalValue.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Status Filter Chips */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-red-400">
          Filter by Status
        </label>
        <div className="flex gap-2 flex-wrap">
          {[
            {
              value: "pending",
              label: "Pending",
              color: "bg-yellow-600 hover:bg-yellow-700",
            },
            {
              value: "processing",
              label: "Processing",
              color: "bg-blue-600 hover:bg-blue-700",
            },
            {
              value: "shipped",
              label: "Shipped",
              color: "bg-purple-600 hover:bg-purple-700",
            },
            {
              value: "delivered",
              label: "Delivered",
              color: "bg-green-600 hover:bg-green-700",
            },
            {
              value: "all",
              label: "All Orders",
              color: "bg-gray-600 hover:bg-gray-700",
            },
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
          placeholder="Search by customer ID, name, or order ID..."
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
                <th className="px-6 py-3 text-left font-semibold text-red-400">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left font-semibold text-red-400">
                  Customer ID
                </th>
                <th className="px-6 py-3 text-left font-semibold text-red-400">
                  Mobile
                </th>
                <th className="px-6 py-3 text-left font-semibold text-red-400">
                  Order Date
                </th>
                <th className="px-6 py-3 text-right font-semibold text-red-400">
                  Order Total (Rs.)
                </th>
                <th className="px-6 py-3 text-left font-semibold text-red-400">
                  Status
                </th>
                <th className="px-6 py-3 text-left font-semibold text-red-400">
                  Payment Status
                </th>
              </tr>
            </thead>

            {/* Table Body - Scrollable Rows */}
            <tbody className="divide-y divide-gray-700">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr
                    key={order.order_id}
                    onClick={() => setSelectedOrderId(order.order_id)}
                    onDoubleClick={() => handleOpenOrderDetails(order)}
                    className={`cursor-pointer transition-all duration-200 ${
                      selectedOrderId === order.order_id
                        ? "bg-red-900/40 border-l-4 border-l-red-600"
                        : "hover:bg-gray-700/30 border-l-4 border-l-transparent"
                    }`}
                    title="Double-click to open details"
                  >
                    <td className="px-6 py-4 text-gray-200 font-medium font-mono">
                      {order.order_id}
                    </td>
                    <td className="px-6 py-4 text-gray-200 font-mono">
                      {order.customer_id || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-gray-400">
                      {order.recipient_phone}
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm">
                      {new Date(order.order_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right text-red-400 font-semibold">
                      {order.total_amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(
                          order.order_status
                        )}`}
                      >
                        {order.order_status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getPaymentStatusBadgeColor(
                          order.payment_status
                        )}`}
                      >
                        {order.payment_status.replace("_", " ").toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                    No orders found for this status
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg shadow-2xl border-2 border-red-600 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-red-700 to-red-900 text-white p-6 border-b border-red-600 flex justify-between items-center sticky top-0 z-20">
              <div>
                <h2 className="text-2xl font-bold">Order Details</h2>
                <p className="text-red-200 text-sm mt-1">
                  Order #{selectedOrder.order_number}
                </p>
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
                <h3 className="text-lg font-bold text-red-400 mb-4">
                  Customer & Order Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4">
                    <p className="text-xs text-gray-400 font-semibold mb-1">
                      Customer ID
                    </p>
                    <p className="text-gray-200 font-medium text-lg font-mono">
                      {selectedOrder.customer_id || "N/A"}
                    </p>
                  </div>
                  <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4">
                    <p className="text-xs text-gray-400 font-semibold mb-1">
                      Mobile
                    </p>
                    <p className="text-gray-200 font-medium">
                      {selectedOrder.recipient_phone}
                    </p>
                  </div>
                  <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4">
                    <p className="text-xs text-gray-400 font-semibold mb-1">
                      Order Date
                    </p>
                    <p className="text-gray-200 font-medium">
                      {new Date(selectedOrder.order_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4">
                    <p className="text-xs text-gray-400 font-semibold mb-1">
                      Payment Method
                    </p>
                    <p className="text-gray-200 font-medium">
                      {selectedOrder.payment_method.toUpperCase()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="text-lg font-bold text-red-400 mb-4">
                  Order Items
                </h3>
                <div className="bg-gray-700/30 border border-gray-700 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-700/50 border-b border-gray-600">
                        <tr>
                          <th className="px-4 py-3 text-left text-gray-300 font-semibold">
                            Product
                          </th>
                          <th className="px-4 py-3 text-center text-gray-300 font-semibold">
                            Qty
                          </th>
                          <th className="px-4 py-3 text-right text-gray-300 font-semibold">
                            Unit Price (Rs.)
                          </th>
                          <th className="px-4 py-3 text-right text-gray-300 font-semibold">
                            Total (Rs.)
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700">
                        {(selectedOrder.items || []).map((item, idx) => (
                          <tr key={idx}>
                            <td className="px-4 py-3 text-gray-200">
                              {item.product_name}
                            </td>
                            <td className="px-4 py-3 text-center text-gray-300">
                              {item.quantity}
                            </td>
                            <td className="px-4 py-3 text-right text-gray-400">
                              {item.sold_price.toFixed(2)}
                            </td>
                            <td className="px-4 py-3 text-right text-red-400 font-semibold">
                              {item.total_price.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-gray-700/50 font-semibold">
                          <td colSpan={3} className="px-4 py-3 text-right">
                            Subtotal:
                          </td>
                          <td className="px-4 py-3 text-right text-red-400">
                            Rs. {selectedOrder.total_amount.toFixed(2)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Payment Summary Section */}
              <div className="border-t border-gray-700 pt-6">
                <h3 className="text-lg font-bold text-red-400 mb-4">
                  Payment Summary
                </h3>

                <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4 mb-6 space-y-3">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-400 font-semibold mb-2">
                        Total Amount
                      </p>
                      <p className="text-gray-100 font-bold text-xl">
                        Rs. {selectedOrder.total_amount.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-semibold mb-2">
                        Total Paid
                      </p>
                      <p className="text-green-400 font-bold text-xl">
                        Rs. {selectedOrder.total_paid.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-semibold mb-2">
                        Remaining Balance
                      </p>
                      <p
                        className={`font-bold text-xl ${
                          selectedOrder.remaining_amount <= 0
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        Rs. {Math.max(0, selectedOrder.remaining_amount).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-600">
                    <div className="flex gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">Advance Paid</p>
                        <p className="text-gray-200 font-semibold">
                          Rs. {selectedOrder.advance_paid.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">Balance Paid</p>
                        <p className="text-gray-200 font-semibold">
                          Rs. {selectedOrder.balance_paid.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex-1">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold inline-block ${getPaymentStatusBadgeColor(
                            selectedOrder.payment_status
                          )}`}
                        >
                          {selectedOrder.payment_status.replace("_", " ").toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Recording Form - Only show if balance remaining */}
                {selectedOrder.remaining_amount > 0 && (
                  <div className="bg-blue-900/20 border-2 border-blue-600/50 rounded-lg p-4 mb-6">
                    <h4 className="text-sm font-bold text-blue-300 mb-4">
                      💰 Record Payment
                    </h4>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-semibold text-gray-300 block mb-2">
                            Payment Amount (Rs.)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max={selectedOrder.remaining_amount}
                            value={paymentAmount}
                            onChange={(e) => setPaymentAmount(e.target.value)}
                            placeholder="0.00"
                            className="w-full px-3 py-2 bg-gray-700 border border-blue-600/50 text-white rounded text-sm focus:border-blue-500 focus:outline-none"
                          />
                          <p className="text-xs text-gray-400 mt-1">
                            Max: Rs. {selectedOrder.remaining_amount.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-300 block mb-2">
                            Payment Method
                          </label>
                          <select
                            value={paymentMethod}
                            onChange={(e) =>
                              setPaymentMethod(
                                e.target.value as
                                  | "cash"
                                  | "card"
                                  | "online"
                                  | "other"
                              )
                            }
                            className="w-full px-3 py-2 bg-gray-700 border border-blue-600/50 text-white rounded text-sm focus:border-blue-500 focus:outline-none"
                          >
                            <option value="cash">💵 Cash</option>
                            <option value="card">💳 Card</option>
                            <option value="online">🌐 Online Transfer</option>
                            <option value="other">📌 Other</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-semibold text-gray-300 block mb-2">
                            Payment Type
                          </label>
                          <select
                            value={paymentType}
                            onChange={(e) =>
                              setPaymentType(
                                e.target.value as "advance" | "balance"
                              )
                            }
                            className="w-full px-3 py-2 bg-gray-700 border border-blue-600/50 text-white rounded text-sm focus:border-blue-500 focus:outline-none"
                          >
                            <option value="advance">📥 Advance</option>
                            <option value="balance">✅ Balance</option>
                          </select>
                        </div>
                        <div />
                      </div>
                      {paymentMessage && (
                        <div
                          className={`text-sm p-3 rounded ${
                            paymentMessage.includes("✅")
                              ? "bg-green-900/30 text-green-300"
                              : "bg-red-900/30 text-red-300"
                          }`}
                        >
                          {paymentMessage}
                        </div>
                      )}
                      <button
                        onClick={handleRecordPayment}
                        disabled={
                          isProcessingPayment || !paymentAmount.trim()
                        }
                        className={`w-full py-2 rounded-lg font-semibold transition-colors ${
                          isProcessingPayment || !paymentAmount.trim()
                            ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                            : "bg-green-600 text-white hover:bg-green-700"
                        }`}
                      >
                        {isProcessingPayment ? "Processing..." : "✅ Record Payment"}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Order Status Update */}
              <div className="border-t border-gray-700 pt-6">
                <h3 className="text-lg font-bold text-red-400 mb-4">
                  Order Status
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-red-400 mb-2">
                      Update Status
                    </label>
                    <select
                      value={editingStatus}
                      onChange={(e) =>
                        setEditingStatus(
                          e.target.value as
                            | "Pending"
                            | "Processing"
                            | "Shipped"
                            | "Delivered"
                        )
                      }
                      className="w-full px-4 py-2 bg-gray-700 border-2 border-red-600/30 text-white rounded-lg focus:border-red-500 focus:outline-none"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </div>
                  <button
                    onClick={handleUpdateOrder}
                    disabled={
                      isUpdatingOrder || editingStatus === selectedOrder.order_status
                    }
                    className={`w-full py-2 rounded-lg font-semibold transition-colors ${
                      isUpdatingOrder || editingStatus === selectedOrder.order_status
                        ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                        : "bg-red-600 text-white hover:bg-red-700"
                    }`}
                  >
                    {isUpdatingOrder ? "Updating..." : "🔄 Update Order Status"}
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-700 flex-wrap">
                {/* Edit Order - Only for Pending and Processing */}
                {(selectedOrder.order_status === "Pending" ||
                  selectedOrder.order_status === "Processing") && (
                  <button
                    onClick={handleEditOrder}
                    className="flex-1 min-w-[150px] bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    ✏️ Edit Order
                  </button>
                )}

                {/* Show Receipt Button */}
                <button
                  onClick={() => setShowReceiptPreview(!showReceiptPreview)}
                  className="flex-1 min-w-[150px] bg-purple-600 text-white py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                >
                  {showReceiptPreview ? "📄 Hide Receipt" : "📄 Show Receipt"}
                </button>

                {/* Print Receipt Button */}
                <button
                  onClick={() => printReceipt(selectedOrder.order_id)}
                  disabled={!receiptHTML}
                  className={`flex-1 min-w-[150px] py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors ${
                    !receiptHTML
                      ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  🖨️ Print Receipt
                </button>

                {/* Save as PNG Button */}
                <button
                  onClick={() =>
                    exportReceiptAsImage(
                      selectedOrder.order_id,
                      selectedOrder.recipient_phone,
                      "png"
                    )
                  }
                  disabled={!receiptHTML}
                  className={`flex-1 min-w-[150px] py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors ${
                    !receiptHTML
                      ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                      : "bg-indigo-600 text-white hover:bg-indigo-700"
                  }`}
                >
                  💾 Save as PNG
                </button>

                {/* Close Button */}
                <button
                  onClick={handleCloseModal}
                  className="flex-1 min-w-[150px] bg-gray-700 text-gray-300 py-2 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Preview Modal */}
      {showReceiptPreview && selectedOrder && receiptHTML && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full my-8">
            <div
              id={`receipt-${selectedOrder.order_id}`}
              dangerouslySetInnerHTML={{ __html: receiptHTML }}
              className="p-8"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
