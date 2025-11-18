import React, { useState, useMemo } from "react";

interface Payment {
  id: string;
  receiptNumber: string;
  referenceNumber: string;
  bankName: string;
  branchName: string;
  dateTime: string;
  customerId: string;
  customerNumber: string; // Customer number/phone
  customerMobile: string;
  amount: number;
  totalAmount: number; // Total order amount
  change: number; // Change given (paid - total)
  // Payment system enhancements
  orderId: string; // Link to order
  paymentType: "advance" | "balance"; // Type of payment
  paymentMethod: "cash" | "card" | "check"; // Payment method
  notes?: string; // Optional notes
}

const PaymentsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBank, setSelectedBank] = useState<string>("all");
  const [selectedBranch, setSelectedBranch] = useState<string>("all");
  const [paymentTypeFilter, setPaymentTypeFilter] = useState<"all" | "advance" | "balance">("all");
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);

  // Sample payments data - linked to orders
  const [payments] = useState<Payment[]>([
    {
      id: "PAY001",
      receiptNumber: "RCP001",
      referenceNumber: "REF-2024-001",
      bankName: "Bank of Ceylon",
      branchName: "Colombo Main",
      dateTime: "2024-11-15 10:30:00",
      customerId: "C001",
      customerNumber: "701-234-5678",
      customerMobile: "+94-71-234-5678",
      amount: 1500.00,
      totalAmount: 1500.00,
      change: 0.00,
      orderId: "ORD001",
      paymentType: "advance",
      paymentMethod: "cash",
      notes: "Initial advance payment",
    },
    {
      id: "PAY002",
      receiptNumber: "RCP002",
      referenceNumber: "REF-2024-002",
      bankName: "Commercial Bank",
      branchName: "Kandy Branch",
      dateTime: "2024-11-14 09:15:00",
      customerId: "C002",
      customerNumber: "702-567-8901",
      customerMobile: "+94-76-567-8901",
      amount: 2000.00,
      totalAmount: 1980.00,
      change: 20.00,
      orderId: "ORD002",
      paymentType: "advance",
      paymentMethod: "cash",
      notes: "Advance payment for order",
    },
    {
      id: "PAY003",
      receiptNumber: "RCP003",
      referenceNumber: "REF-2024-003",
      bankName: "Commercial Bank",
      branchName: "Galle Branch",
      dateTime: "2024-11-18 14:00:00",
      customerId: "C002",
      customerNumber: "702-567-8901",
      customerMobile: "+94-76-567-8901",
      amount: 1500.75,
      totalAmount: 1500.75,
      change: 0.00,
      orderId: "ORD002",
      paymentType: "balance",
      paymentMethod: "card",
      notes: "Balance payment received via card",
    },
    {
      id: "PAY004",
      receiptNumber: "RCP004",
      referenceNumber: "REF-2024-004",
      bankName: "Bank of Ceylon",
      branchName: "Colombo Main",
      dateTime: "2024-11-10 11:00:00",
      customerId: "C001",
      customerNumber: "701-234-5678",
      customerMobile: "+94-71-234-5678",
      amount: 3500.00,
      totalAmount: 3500.00,
      change: 0.00,
      orderId: "ORD003",
      paymentType: "advance",
      paymentMethod: "cash",
      notes: "Advance payment",
    },
    {
      id: "PAY005",
      receiptNumber: "RCP005",
      referenceNumber: "REF-2024-005",
      bankName: "Commercial Bank",
      branchName: "Colombo Main",
      dateTime: "2024-11-12 15:30:00",
      customerId: "C001",
      customerNumber: "701-234-5678",
      customerMobile: "+94-71-234-5678",
      amount: 4500.00,
      totalAmount: 4500.00,
      change: 0.00,
      orderId: "ORD003",
      paymentType: "balance",
      paymentMethod: "cash",
      notes: "Balance payment",
    },
    {
      id: "PAY006",
      receiptNumber: "RCP006",
      referenceNumber: "REF-2024-006",
      bankName: "Bank of Ceylon",
      branchName: "Colombo Main",
      dateTime: "2024-11-08 12:00:00",
      customerId: "C003",
      customerNumber: "703-890-1234",
      customerMobile: "+94-77-890-1234",
      amount: 2500.00,
      totalAmount: 2500.00,
      change: 0.00,
      orderId: "ORD004",
      paymentType: "advance",
      paymentMethod: "card",
      notes: "Advance payment",
    },
    {
      id: "PAY007",
      receiptNumber: "RCP007",
      referenceNumber: "REF-2024-007",
      bankName: "Bank of Ceylon",
      branchName: "Colombo Fort",
      dateTime: "2024-11-10 16:45:00",
      customerId: "C003",
      customerNumber: "703-890-1234",
      customerMobile: "+94-77-890-1234",
      amount: 2500.00,
      totalAmount: 2500.00,
      change: 0.00,
      orderId: "ORD004",
      paymentType: "balance",
      paymentMethod: "card",
      notes: "Balance payment",
    },
    {
      id: "PAY008",
      receiptNumber: "RCP008",
      referenceNumber: "REF-2024-008",
      bankName: "Commercial Bank",
      branchName: "Colombo Main",
      dateTime: "2024-11-05 13:20:00",
      customerId: "C002",
      customerNumber: "702-567-8901",
      customerMobile: "+94-76-567-8901",
      amount: 1500.00,
      totalAmount: 1500.00,
      change: 0.00,
      orderId: "ORD005",
      paymentType: "advance",
      paymentMethod: "cash",
      notes: "Advance payment",
    },
  ]);

  // Get unique banks and branches
  const uniqueBanks = Array.from(
    new Set(payments.map((payment) => payment.bankName))
  ).sort();

  const branchesForBank =
    selectedBank === "all"
      ? Array.from(new Set(payments.map((payment) => payment.branchName))).sort()
      : Array.from(
          new Set(
            payments
              .filter((payment) => payment.bankName === selectedBank)
              .map((payment) => payment.branchName)
          )
        ).sort();

  // Filter payments based on search and filters
  const filteredPayments = useMemo(() => {
    let result = [...payments];

    // Filter by payment type
    if (paymentTypeFilter !== "all") {
      result = result.filter((payment) => payment.paymentType === paymentTypeFilter);
    }

    // Filter by bank
    if (selectedBank !== "all") {
      result = result.filter((payment) => payment.bankName === selectedBank);
    }

    // Filter by branch
    if (selectedBranch !== "all") {
      result = result.filter((payment) => payment.branchName === selectedBranch);
    }

    // Search by reference number, order id, customer id, or mobile
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (payment) =>
          payment.referenceNumber.toLowerCase().includes(query) ||
          payment.orderId.toLowerCase().includes(query) ||
          payment.customerId.toLowerCase().includes(query) ||
          payment.customerMobile.includes(query)
      );
    }

    return result;
  }, [selectedBank, selectedBranch, searchQuery, payments, paymentTypeFilter]);

  const totalPayments = filteredPayments.length;
  const totalAmount = filteredPayments.reduce(
    (sum, payment) => sum + payment.amount,
    0
  );

  const handleBankChange = (bank: string) => {
    setSelectedBank(bank);
    setSelectedBranch("all"); // Reset branch when bank changes
  };


  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-red-500">Payments</h1>
            <span className="text-sm font-semibold text-red-400 bg-red-900/30 px-3 py-1 rounded-full">
              {totalPayments} payments
            </span>
          </div>
          <p className="text-gray-400 mt-2">Manage and track payment receipts</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-400">Total Amount Received</p>
          <p className="text-2xl font-bold text-red-400">
            Rs. {totalAmount.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-red-400">
          Search Payments
        </label>
        <input
          type="text"
          placeholder="Search by order ID, reference number, customer ID, name, or mobile..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 bg-gray-700 border-2 border-red-600/30 text-white placeholder-gray-500 rounded-lg focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 transition-colors"
        />
      </div>

      {/* Payment Type Filter */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-red-400">
          Filter by Payment Type
        </label>
        <div className="flex gap-2 flex-wrap">
          {[
            { value: "all", label: "All Payments", count: payments.length },
            { value: "advance", label: "Advance Payments", count: payments.filter(p => p.paymentType === "advance").length },
            { value: "balance", label: "Balance Payments", count: payments.filter(p => p.paymentType === "balance").length },
          ].map((filter) => (
            <button
              key={filter.value}
              onClick={() => setPaymentTypeFilter(filter.value as "all" | "advance" | "balance")}
              className={`px-4 py-2 rounded-full font-semibold text-white transition-all ${
                paymentTypeFilter === filter.value
                  ? filter.value === "advance"
                    ? "bg-yellow-600 hover:bg-yellow-700 ring-2 ring-offset-2 ring-offset-gray-800"
                    : filter.value === "balance"
                    ? "bg-green-600 hover:bg-green-700 ring-2 ring-offset-2 ring-offset-gray-800"
                    : "bg-gray-600 hover:bg-gray-700 ring-2 ring-offset-2 ring-offset-gray-800"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              {filter.label}
              <span className="ml-2 bg-black/30 px-2 py-0.5 rounded-full text-xs">
                {filter.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Bank and Branch Filters */}
      <div className="grid grid-cols-2 gap-4">
        {/* Bank Filter */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-red-400">
            Filter by Bank
          </label>
          <select
            value={selectedBank}
            onChange={(e) => handleBankChange(e.target.value)}
            className="w-full px-4 py-2 bg-gray-700 border-2 border-red-600/30 text-white rounded-lg focus:border-red-500 focus:outline-none"
          >
            <option value="all">All Banks</option>
            {uniqueBanks.map((bank) => (
              <option key={bank} value={bank}>
                {bank}
              </option>
            ))}
          </select>
        </div>

        {/* Branch Filter */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-red-400">
            Filter by Branch
          </label>
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="w-full px-4 py-2 bg-gray-700 border-2 border-red-600/30 text-white rounded-lg focus:border-red-500 focus:outline-none"
          >
            <option value="all">All Branches</option>
            {branchesForBank.map((branch) => (
              <option key={branch} value={branch}>
                {branch}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Payments Table - Scrollable */}
      <div className="flex-1 overflow-hidden flex flex-col bg-gray-800/50 border border-gray-700 rounded-lg">
        <div className="overflow-x-auto overflow-y-auto flex-1">
          <table className="w-full text-sm">
            {/* Sticky Table Header */}
            <thead className="sticky top-0 bg-gray-700/80 border-b-2 border-red-600 z-10">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-red-400">
                  Order ID
                </th>
                <th className="px-4 py-3 text-left font-semibold text-red-400">
                  Receipt Number
                </th>
                <th className="px-4 py-3 text-left font-semibold text-red-400">
                  Bank
                </th>
                <th className="px-4 py-3 text-left font-semibold text-red-400">
                  Branch
                </th>
                <th className="px-4 py-3 text-left font-semibold text-red-400">
                  Date & Time
                </th>
                <th className="px-4 py-3 text-left font-semibold text-red-400">
                  Customer ID : Number
                </th>
                <th className="px-4 py-3 text-right font-semibold text-red-400">
                  Amount (Rs.)
                </th>
              </tr>
            </thead>

            {/* Table Body - Scrollable Rows */}
            <tbody className="divide-y divide-gray-700">
              {filteredPayments.length > 0 ? (
                filteredPayments.map((payment) => (
                  <tr
                    key={payment.id}
                    onClick={() => setSelectedPaymentId(payment.id)}
                    className={`cursor-pointer transition-all duration-200 ${
                      selectedPaymentId === payment.id
                        ? "bg-red-900/40 border-l-4 border-l-red-600"
                        : "hover:bg-gray-700/30 border-l-4 border-l-transparent"
                    }`}
                  >
                    <td className="px-4 py-4 text-gray-200 font-medium font-mono text-sm">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPaymentId(payment.orderId);
                        }}
                        className="hover:text-blue-400 hover:underline transition-colors"
                        title="View order details"
                      >
                        {payment.orderId}
                      </button>
                    </td>
                    <td className="px-4 py-4 text-gray-300 font-medium text-sm">
                      {payment.receiptNumber}
                    </td>
                    <td className="px-4 py-4 text-gray-300 text-sm">
                      {payment.bankName}
                    </td>
                    <td className="px-4 py-4 text-gray-300 text-sm">
                      {payment.branchName}
                    </td>
                    <td className="px-4 py-4 text-gray-400 text-xs">
                      {payment.dateTime}
                    </td>
                    <td className="px-4 py-4 text-gray-200 font-medium text-sm">
                      <span className="font-mono">{payment.customerId}</span> : <span className="text-gray-400">{payment.customerNumber}</span>
                    </td>
                    <td className="px-4 py-4 text-right text-red-400 font-semibold">
                      Rs. {payment.amount.toFixed(2)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                    No payments found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PaymentsPage;
