import React, { useState, useMemo, useEffect, useRef } from "react";
import { useShop } from "../context/ShopContext";
import {
  getShopPayments,
  getPaymentSummary,
  Payment,
  PaymentSummary,
} from "../services/paymentService";

interface Notification {
  type: "success" | "error";
  message: string;
}

const PaymentsPage: React.FC = () => {
  const { shopId: contextShopId } = useShop();
  const shopId = contextShopId || 1;

  const [payments, setPayments] = useState<Payment[]>([]);
  const [summary, setSummary] = useState<PaymentSummary>({
    total_count: 0,
    total_amount: 0,
    completed_count: 0,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [filterMethod, setFilterMethod] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterDateRange, setFilterDateRange] = useState<"all" | "today" | "week" | "month">("all");

  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<Notification | null>(null);

  // Use ref to prevent duplicate requests in strict mode
  const loadDataRef = useRef(false);

  // Load payments and summary
  useEffect(() => {
    // Prevent duplicate requests in React Strict Mode
    if (loadDataRef.current) return;
    loadDataRef.current = true;

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
      const paymentDate = (p: Payment) => new Date(p.created_at);

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
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
  }, [payments, searchQuery, filterMethod, filterStatus, filterDateRange]);

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const getPaymentMethodBadgeColor = (method: string) => {
    const colors: Record<string, string> = {
      cash: "bg-green-600 text-white",
      online_transfer: "bg-blue-600 text-white",
      bank_deposit: "bg-purple-600 text-white",
    };
    return colors[method] || "bg-gray-600 text-white";
  };

  const formatPaymentMethod = (method: string) => {
    const labels: Record<string, string> = {
      cash: "CASH",
      online_transfer: "ONLINE TRANSFER",
      bank_deposit: "BANK DEPOSIT",
    };
    return labels[method] || method.toUpperCase();
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
                    Customer ID
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-red-400">
                    Bank Name
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-red-400">
                    Branch Name
                  </th>
                  <th className="px-6 py-3 text-center font-semibold text-red-400">
                    Payment Type
                  </th>
                  <th className="px-6 py-3 text-right font-semibold text-red-400">
                    Amount (Rs.)
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-red-400">
                    Date & Time
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredPayments.map((payment) => {
                  // Determine bank name display
                  let bankNameDisplay = "CASH";
                  let branchNameDisplay = "_";
                  let paymentTypeDisplay = "Cash";

                  if (payment.payment_method === "online_transfer") {
                    bankNameDisplay = payment.bank_name || "_";
                    branchNameDisplay = "_";
                    paymentTypeDisplay = "Online Transfer";
                  } else if (payment.payment_method === "bank_deposit") {
                    bankNameDisplay = payment.bank_name || "_";
                    branchNameDisplay = payment.branch_name || "_";
                    paymentTypeDisplay = "Bank Deposit";
                  }

                  return (
                    <tr
                      key={payment.payment_id}
                      className="hover:bg-gray-700/30 transition-all cursor-pointer"
                    >
                      <td className="px-6 py-4 text-gray-200 font-mono font-semibold">
                        #{payment.payment_id}
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {payment.customer_id ? `#${payment.customer_id}` : "_"}
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {bankNameDisplay}
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {branchNameDisplay}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPaymentMethodBadgeColor(payment.payment_method)}`}>
                          {paymentTypeDisplay.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-green-400 font-bold">
                        Rs. {(parseFloat(String(payment?.payment_amount)) || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-xs">
                        <div>{new Date(payment.updated_at).toLocaleDateString()}</div>
                        <div className="text-gray-500">{new Date(payment.updated_at).toLocaleTimeString()}</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentsPage;
