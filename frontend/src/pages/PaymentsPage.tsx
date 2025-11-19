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

  // Filter payments based on search query only
  const filteredPayments = useMemo(() => {
    let result = [...payments];

    // Search by order id, receipt number, customer id, or mobile
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (payment) =>
          payment.orderId.toLowerCase().includes(query) ||
          payment.receiptNumber.toLowerCase().includes(query) ||
          payment.customerId.toLowerCase().includes(query) ||
          payment.customerMobile.includes(query)
      );
    }

    return result;
  }, [searchQuery, payments]);

  const totalPayments = filteredPayments.length;
  const totalAmount = filteredPayments.reduce(
    (sum, payment) => sum + payment.amount,
    0
  );


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

      {/* Search is sufficient for simplified view - removed filters */}

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
