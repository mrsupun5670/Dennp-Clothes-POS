import React, { useState, useMemo, useEffect } from "react";
import { useShop } from "../context/ShopContext";
import {
  getShopPayments,
  createPayment,
  updatePayment,
  getPaymentSummary,
  Payment,
  PaymentSummary,
} from "../services/paymentService";
import { getShopBankAccounts, BankAccount } from "../services/bankAccountService";

interface Notification {
  type: "success" | "error";
  message: string;
}

const PaymentsPage: React.FC = () => {
  const { shopId: contextShopId } = useShop();
  const shopId = contextShopId || 1;

  const [payments, setPayments] = useState<Payment[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [summary, setSummary] = useState<PaymentSummary>({
    total_count: 0,
    total_amount: 0,
    completed_count: 0,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [filterMethod, setFilterMethod] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterDateRange, setFilterDateRange] = useState<"all" | "today" | "week" | "month">("all");

  const [showModal, setShowModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<Notification | null>(null);

  const [formData, setFormData] = useState({
    order_id: "",
    customer_id: "",
    payment_amount: "",
    payment_date: new Date().toISOString().split("T")[0],
    payment_time: new Date().toTimeString().slice(0, 5),
    payment_method: "cash" as "cash" | "online_transfer" | "bank_deposit",
    bank_name: "",
    branch_name: "",
    bank_account_id: "",
    transaction_id: "",
    payment_status: "completed" as "completed" | "pending" | "failed" | "refunded",
    notes: "",
  });

  // Load payments and summary
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Load payments and summary
        try {
          const [paymentsData, summaryData] = await Promise.all([
            getShopPayments(shopId),
            getPaymentSummary(shopId),
          ]);
          setPayments(paymentsData || []);
          setSummary(summaryData || { total_count: 0, total_amount: 0, completed_count: 0 });
        } catch (error) {
          console.error("Error fetching payments or summary:", error);
          setPayments([]);
          setSummary({ total_count: 0, total_amount: 0, completed_count: 0 });
        }

        // Load bank accounts separately (optional, won't crash if fails)
        try {
          const accountsData = await getShopBankAccounts(shopId);
          setBankAccounts(accountsData || []);
        } catch (error) {
          console.warn("Could not load bank accounts:", error);
          setBankAccounts([]);
        }
      } catch (error) {
        showNotification("error", "Failed to load payments");
        console.error("Error loading payments:", error);
        setPayments([]);
        setSummary({ total_count: 0, total_amount: 0, completed_count: 0 });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [shopId]);

  // Filter payments
  const filteredPayments = useMemo(() => {
    let result = [...payments];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.payment_id.toString().includes(query) ||
          p.order_id?.toString().includes(query) ||
          p.transaction_id?.toLowerCase().includes(query) ||
          p.notes?.toLowerCase().includes(query)
      );
    }

    // Payment method filter
    if (filterMethod !== "all") {
      result = result.filter((p) => p.payment_method === filterMethod);
    }

    // Status filter
    if (filterStatus !== "all") {
      result = result.filter((p) => p.payment_status === filterStatus);
    }

    // Date range filter
    if (filterDateRange !== "all") {
      const today = new Date();
      const paymentDate = (p: Payment) => new Date(p.payment_date);

      result = result.filter((p) => {
        const pDate = paymentDate(p);
        switch (filterDateRange) {
          case "today":
            return pDate.toDateString() === today.toDateString();
          case "week":
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            return pDate >= weekAgo;
          case "month":
            const monthAgo = new Date(today);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            return pDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    return result.sort(
      (a, b) =>
        new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime()
    );
  }, [payments, searchQuery, filterMethod, filterStatus, filterDateRange]);

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleOpenModal = (payment?: Payment) => {
    if (payment) {
      setEditingPayment(payment);
      setFormData({
        order_id: payment.order_id?.toString() || "",
        customer_id: payment.customer_id?.toString() || "",
        payment_amount: payment.payment_amount.toString(),
        payment_date: payment.payment_date,
        payment_time: payment.payment_time || "",
        payment_method: payment.payment_method,
        bank_name: payment.bank_name || "",
        branch_name: payment.branch_name || "",
        bank_account_id: payment.bank_account_id?.toString() || "",
        transaction_id: payment.transaction_id || "",
        payment_status: payment.payment_status,
        notes: payment.notes || "",
      });
    } else {
      setEditingPayment(null);
      setFormData({
        order_id: "",
        customer_id: "",
        payment_amount: "",
        payment_date: new Date().toISOString().split("T")[0],
        payment_time: new Date().toTimeString().slice(0, 5),
        payment_method: "cash",
        bank_name: "",
        branch_name: "",
        bank_account_id: "",
        transaction_id: "",
        payment_status: "completed",
        notes: "",
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPayment(null);
  };

  const handleSavePayment = async () => {
    try {
      if (!formData.payment_amount || !formData.payment_date) {
        showNotification("error", "Please fill in required fields");
        return;
      }

      if (editingPayment) {
        await updatePayment(editingPayment.payment_id, shopId, {
          payment_amount: parseFloat(formData.payment_amount),
          payment_date: formData.payment_date,
          payment_time: formData.payment_time || undefined,
          payment_method: formData.payment_method,
          bank_name: formData.bank_name || undefined,
          branch_name: formData.branch_name || undefined,
          bank_account_id: formData.bank_account_id
            ? parseInt(formData.bank_account_id)
            : undefined,
          transaction_id: formData.transaction_id || undefined,
          payment_status: formData.payment_status,
          notes: formData.notes || undefined,
        });
        showNotification("success", "Payment updated successfully");
      } else {
        await createPayment(shopId, {
          order_id: formData.order_id ? parseInt(formData.order_id) : undefined,
          customer_id: formData.customer_id
            ? parseInt(formData.customer_id)
            : undefined,
          payment_amount: parseFloat(formData.payment_amount),
          payment_date: formData.payment_date,
          payment_time: formData.payment_time || undefined,
          payment_method: formData.payment_method,
          bank_name: formData.bank_name || undefined,
          branch_name: formData.branch_name || undefined,
          bank_account_id: formData.bank_account_id
            ? parseInt(formData.bank_account_id)
            : undefined,
          transaction_id: formData.transaction_id || undefined,
          payment_status: formData.payment_status,
          notes: formData.notes || undefined,
        } as any);
        showNotification("success", "Payment created successfully");
      }

      // Reload payments
      const [paymentsData, summaryData] = await Promise.all([
        getShopPayments(shopId),
        getPaymentSummary(shopId),
      ]);
      setPayments(paymentsData);
      setSummary(summaryData);
      handleCloseModal();
    } catch (error) {
      showNotification("error", "Failed to save payment");
      console.error("Error saving payment:", error);
    }
  };

  const getPaymentMethodBadgeColor = (method: string) => {
    const colors: Record<string, string> = {
      cash: "bg-green-600 text-white",
      online_transfer: "bg-blue-600 text-white",
      bank_deposit: "bg-purple-600 text-white",
    };
    return colors[method] || "bg-gray-600 text-white";
  };

  const getStatusBadgeColor = (status: string) => {
    const colors: Record<string, string> = {
      completed: "bg-green-600/30 text-green-400 border border-green-600",
      pending: "bg-yellow-600/30 text-yellow-400 border border-yellow-600",
      failed: "bg-red-600/30 text-red-400 border border-red-600",
      refunded: "bg-gray-600/30 text-gray-400 border border-gray-600",
    };
    return colors[status] || "bg-gray-600/30 text-gray-400 border border-gray-600";
  };

  const completedPercentage =
    summary.total_count > 0
      ? Math.round((summary.completed_count / summary.total_count) * 100)
      : 0;

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg text-sm font-semibold z-40 ${
            notification.type === "success"
              ? "bg-green-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {notification.message}
        </div>
      )}

      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-red-500">Payments</h1>
            <span className="text-sm font-semibold text-red-400 bg-red-900/30 px-3 py-1 rounded-full">
              {filteredPayments.length} payments
            </span>
          </div>
          <p className="text-gray-400 mt-2">
            Manage and track all payment transactions
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors"
        >
          + Add Payment
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Payments Card */}
        <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 border-2 border-blue-600/40 rounded-lg p-6 hover:border-blue-600/60 transition-all">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-blue-400 mb-1">
                TOTAL TRANSACTIONS
              </p>
              <p className="text-3xl font-bold text-blue-300">
                {summary.total_count}
              </p>
            </div>
            <div className="text-3xl text-blue-400">💳</div>
          </div>
          <p className="text-xs text-gray-400 mt-3">
            All recorded payments
          </p>
        </div>

        {/* Total Amount Card */}
        <div className="bg-gradient-to-br from-green-900/40 to-green-800/20 border-2 border-green-600/40 rounded-lg p-6 hover:border-green-600/60 transition-all">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-green-400 mb-1">
                TOTAL AMOUNT
              </p>
              <p className="text-3xl font-bold text-green-300">
                Rs. {(parseFloat(String(summary?.total_amount)) || 0).toFixed(2)}
              </p>
            </div>
            <div className="text-3xl text-green-400">💰</div>
          </div>
          <p className="text-xs text-gray-400 mt-3">
            Sum of all transactions
          </p>
        </div>

        {/* Completed Payments Card */}
        <div className="bg-gradient-to-br from-yellow-900/40 to-yellow-800/20 border-2 border-yellow-600/40 rounded-lg p-6 hover:border-yellow-600/60 transition-all">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-yellow-400 mb-1">
                COMPLETED
              </p>
              <p className="text-3xl font-bold text-yellow-300">
                {completedPercentage}%
              </p>
            </div>
            <div className="text-3xl text-yellow-400">✓</div>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
            <div
              className="bg-yellow-500 h-2 rounded-full transition-all"
              style={{ width: `${completedPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-red-400">
            Search
          </label>
          <input
            type="text"
            placeholder="Search by ID, order, or transaction..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 bg-gray-700 border-2 border-red-600/30 text-white placeholder-gray-500 rounded-lg focus:border-red-500 focus:outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-red-400">
            Payment Method
          </label>
          <select
            value={filterMethod}
            onChange={(e) => setFilterMethod(e.target.value)}
            className="w-full px-4 py-2 bg-gray-700 border-2 border-red-600/30 text-white rounded-lg focus:border-red-500 focus:outline-none"
          >
            <option value="all">All Methods</option>
            <option value="cash">Cash</option>
            <option value="online_transfer">Online Transfer</option>
            <option value="bank_deposit">Bank Deposit</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-red-400">
            Status
          </label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-4 py-2 bg-gray-700 border-2 border-red-600/30 text-white rounded-lg focus:border-red-500 focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-red-400">
            Date Range
          </label>
          <select
            value={filterDateRange}
            onChange={(e) =>
              setFilterDateRange(e.target.value as "all" | "today" | "week" | "month")
            }
            className="w-full px-4 py-2 bg-gray-700 border-2 border-red-600/30 text-white rounded-lg focus:border-red-500 focus:outline-none"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </div>

      {/* Payments Table */}
      <div className="flex-1 overflow-hidden flex flex-col bg-gray-800/50 border border-gray-700 rounded-lg">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-400">Loading payments...</p>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-400 text-lg">No payments found</p>
          </div>
        ) : (
          <div className="overflow-x-auto overflow-y-auto flex-1">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-gray-700/80 border-b-2 border-red-600 z-10">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-red-400">
                    Payment ID
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-red-400">
                    Order/Customer
                  </th>
                  <th className="px-6 py-3 text-right font-semibold text-red-400">
                    Amount (Rs.)
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-red-400">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-center font-semibold text-red-400">
                    Method
                  </th>
                  <th className="px-6 py-3 text-center font-semibold text-red-400">
                    Status
                  </th>
                  <th className="px-6 py-3 text-center font-semibold text-red-400">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredPayments.map((payment) => (
                  <tr
                    key={payment.payment_id}
                    className="hover:bg-gray-700/30 transition-all cursor-pointer"
                    onDoubleClick={() => handleOpenModal(payment)}
                  >
                    <td className="px-6 py-4 text-gray-200 font-mono font-semibold">
                      #{payment.payment_id}
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {payment.order_id ? `Order #${payment.order_id}` : "Direct Payment"}
                      {payment.customer_id && (
                        <p className="text-xs text-gray-400 mt-1">
                          Customer: {payment.customer_id}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right text-green-400 font-bold">
                      Rs. {(parseFloat(String(payment?.payment_amount)) || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-xs">
                      <div>{payment.payment_date}</div>
                      {payment.payment_time && (
                        <div className="text-gray-500">{payment.payment_time}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPaymentMethodBadgeColor(payment.payment_method)}`}>
                        {payment.payment_method.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(payment.payment_status)}`}
                      >
                        {payment.payment_status.charAt(0).toUpperCase() +
                          payment.payment_status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenModal(payment);
                        }}
                        className="bg-red-600 text-white px-3 py-1 rounded text-xs font-semibold hover:bg-red-700 transition-colors"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Payment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg shadow-2xl border-2 border-red-600 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-red-700 to-red-900 text-white p-6 border-b border-red-600 flex justify-between items-center sticky top-0">
              <h2 className="text-2xl font-bold">
                {editingPayment ? "Edit Payment" : "Add New Payment"}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-white hover:text-red-200 transition-colors text-2xl"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {/* Payment Amount */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-red-400 mb-2">
                    Payment Amount (Rs.) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.payment_amount}
                    onChange={(e) =>
                      setFormData({ ...formData, payment_amount: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-gray-700 border-2 border-red-600/30 text-white placeholder-gray-500 rounded-lg focus:border-red-500 focus:outline-none"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-red-400 mb-2">
                    Payment Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.payment_status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        payment_status: e.target.value as any,
                      })
                    }
                    className="w-full px-4 py-2 bg-gray-700 border-2 border-red-600/30 text-white rounded-lg focus:border-red-500 focus:outline-none"
                  >
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-red-400 mb-2">
                    Payment Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.payment_date}
                    onChange={(e) =>
                      setFormData({ ...formData, payment_date: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-gray-700 border-2 border-red-600/30 text-white rounded-lg focus:border-red-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-red-400 mb-2">
                    Payment Time
                  </label>
                  <input
                    type="time"
                    value={formData.payment_time}
                    onChange={(e) =>
                      setFormData({ ...formData, payment_time: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-gray-700 border-2 border-red-600/30 text-white rounded-lg focus:border-red-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Order and Customer */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-red-400 mb-2">
                    Order ID
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.order_id}
                    onChange={(e) =>
                      setFormData({ ...formData, order_id: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-gray-700 border-2 border-red-600/30 text-white placeholder-gray-500 rounded-lg focus:border-red-500 focus:outline-none"
                    placeholder="Optional"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-red-400 mb-2">
                    Customer ID
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.customer_id}
                    onChange={(e) =>
                      setFormData({ ...formData, customer_id: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-gray-700 border-2 border-red-600/30 text-white placeholder-gray-500 rounded-lg focus:border-red-500 focus:outline-none"
                    placeholder="Optional"
                  />
                </div>
              </div>

              {/* Payment Method and Bank Account */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-red-400 mb-2">
                    Payment Method <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.payment_method}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        payment_method: e.target.value as any,
                      })
                    }
                    className="w-full px-4 py-2 bg-gray-700 border-2 border-red-600/30 text-white rounded-lg focus:border-red-500 focus:outline-none"
                  >
                    <option value="cash">Cash</option>
                    <option value="online_transfer">Online Transfer</option>
                    <option value="bank_deposit">Bank Deposit</option>
                  </select>
                </div>

                {(formData.payment_method === "online_transfer" || formData.payment_method === "bank_deposit") && (
                  <div>
                    <label className="block text-sm font-semibold text-red-400 mb-2">
                      Bank Account
                    </label>
                    <select
                      value={formData.bank_account_id}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bank_account_id: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 bg-gray-700 border-2 border-red-600/30 text-white rounded-lg focus:border-red-500 focus:outline-none"
                    >
                      <option value="">Select Bank Account</option>
                      {bankAccounts.map((account) => (
                        <option key={account.bank_account_id} value={account.bank_account_id}>
                          {account.bank_name} - {account.account_number}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Bank Name and Branch Name */}
              {(formData.payment_method === "online_transfer" || formData.payment_method === "bank_deposit") && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-red-400 mb-2">
                      Bank Name
                    </label>
                    <input
                      type="text"
                      value={formData.bank_name}
                      onChange={(e) =>
                        setFormData({ ...formData, bank_name: e.target.value })
                      }
                      className="w-full px-4 py-2 bg-gray-700 border-2 border-red-600/30 text-white placeholder-gray-500 rounded-lg focus:border-red-500 focus:outline-none"
                      placeholder="e.g., Commercial Bank"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-red-400 mb-2">
                      Branch Name
                    </label>
                    <input
                      type="text"
                      value={formData.branch_name}
                      onChange={(e) =>
                        setFormData({ ...formData, branch_name: e.target.value })
                      }
                      className="w-full px-4 py-2 bg-gray-700 border-2 border-red-600/30 text-white placeholder-gray-500 rounded-lg focus:border-red-500 focus:outline-none"
                      placeholder="e.g., Colombo Main"
                    />
                  </div>
                </div>
              )}

              {/* Transaction ID */}
              <div>
                <label className="block text-sm font-semibold text-red-400 mb-2">
                  Transaction ID
                </label>
                <input
                  type="text"
                  value={formData.transaction_id}
                  onChange={(e) =>
                    setFormData({ ...formData, transaction_id: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-gray-700 border-2 border-red-600/30 text-white placeholder-gray-500 rounded-lg focus:border-red-500 focus:outline-none"
                  placeholder="Optional - for reference"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-red-400 mb-2">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-2 bg-gray-700 border-2 border-red-600/30 text-white placeholder-gray-500 rounded-lg focus:border-red-500 focus:outline-none resize-none"
                  placeholder="Add any notes or remarks..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-700">
                <button
                  onClick={handleSavePayment}
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  {editingPayment ? "✓ Update Payment" : "✓ Create Payment"}
                </button>
                <button
                  onClick={handleCloseModal}
                  className="flex-1 bg-gray-700 text-gray-300 py-2 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentsPage;
