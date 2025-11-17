import React, { useState, useMemo } from "react";

interface Payment {
  id: string;
  receiptNumber: string;
  referenceNumber: string;
  bankName: string;
  branchName: string;
  dateTime: string;
  customerId: string;
  customerName: string;
  customerMobile: string;
  amount: number;
}

const PaymentsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBank, setSelectedBank] = useState<string>("all");
  const [selectedBranch, setSelectedBranch] = useState<string>("all");
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);

  // Sample payments data
  const [payments] = useState<Payment[]>([
    {
      id: "P001",
      receiptNumber: "RCP001",
      referenceNumber: "REF-2024-001",
      bankName: "Bank of Ceylon",
      branchName: "Colombo Main Branch",
      dateTime: "2024-11-15 10:30:00",
      customerId: "C001",
      customerName: "John Doe",
      customerMobile: "+1 234 567 8900",
      amount: 5250.50,
    },
    {
      id: "P002",
      receiptNumber: "RCP002",
      referenceNumber: "REF-2024-002",
      bankName: "Commercial Bank",
      branchName: "Kandy Branch",
      dateTime: "2024-11-15 11:45:00",
      customerId: "C002",
      customerName: "Sarah Smith",
      customerMobile: "+1 234 567 8901",
      amount: 3500.75,
    },
    {
      id: "P003",
      receiptNumber: "RCP003",
      referenceNumber: "REF-2024-003",
      bankName: "Sampath Bank",
      branchName: "Galle Branch",
      dateTime: "2024-11-14 14:20:00",
      customerId: "C003",
      customerName: "Ahmed Khan",
      customerMobile: "+1 234 567 8902",
      amount: 7500.00,
    },
    {
      id: "P004",
      receiptNumber: "RCP004",
      referenceNumber: "REF-2024-004",
      bankName: "Bank of Ceylon",
      branchName: "Colombo Main Branch",
      dateTime: "2024-11-14 09:15:00",
      customerId: "C001",
      customerName: "John Doe",
      customerMobile: "+1 234 567 8900",
      amount: 4250.00,
    },
    {
      id: "P005",
      receiptNumber: "RCP005",
      referenceNumber: "REF-2024-005",
      bankName: "Commercial Bank",
      branchName: "Colombo Branch",
      dateTime: "2024-11-13 13:00:00",
      customerId: "C002",
      customerName: "Sarah Smith",
      customerMobile: "+1 234 567 8901",
      amount: 2500.00,
    },
    {
      id: "P006",
      receiptNumber: "RCP006",
      referenceNumber: "REF-2024-006",
      bankName: "Hatton National Bank",
      branchName: "Colombo Main Branch",
      dateTime: "2024-11-13 10:30:00",
      customerId: "C003",
      customerName: "Ahmed Khan",
      customerMobile: "+1 234 567 8902",
      amount: 6750.25,
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

    // Filter by bank
    if (selectedBank !== "all") {
      result = result.filter((payment) => payment.bankName === selectedBank);
    }

    // Filter by branch
    if (selectedBranch !== "all") {
      result = result.filter((payment) => payment.branchName === selectedBranch);
    }

    // Search by reference number, customer id, name, or mobile
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (payment) =>
          payment.referenceNumber.toLowerCase().includes(query) ||
          payment.customerId.toLowerCase().includes(query) ||
          payment.customerName.toLowerCase().includes(query) ||
          payment.customerMobile.includes(query)
      );
    }

    return result;
  }, [selectedBank, selectedBranch, searchQuery, payments]);

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
          placeholder="Search by reference number, customer ID, name, or mobile..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 bg-gray-700 border-2 border-red-600/30 text-white placeholder-gray-500 rounded-lg focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 transition-colors"
        />
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
                <th className="px-6 py-3 text-left font-semibold text-red-400">
                  Receipt Number
                </th>
                <th className="px-6 py-3 text-left font-semibold text-red-400">
                  Reference Number
                </th>
                <th className="px-6 py-3 text-left font-semibold text-red-400">
                  Bank Name
                </th>
                <th className="px-6 py-3 text-left font-semibold text-red-400">
                  Branch
                </th>
                <th className="px-6 py-3 text-left font-semibold text-red-400">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left font-semibold text-red-400">
                  Customer ID
                </th>
                <th className="px-6 py-3 text-left font-semibold text-red-400">
                  Customer Name
                </th>
                <th className="px-6 py-3 text-left font-semibold text-red-400">
                  Mobile
                </th>
                <th className="px-6 py-3 text-right font-semibold text-red-400">
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
                    <td className="px-6 py-4 text-gray-200 font-medium font-mono">
                      {payment.receiptNumber}
                    </td>
                    <td className="px-6 py-4 text-gray-200 font-mono">
                      {payment.referenceNumber}
                    </td>
                    <td className="px-6 py-4 text-gray-300 font-medium">
                      {payment.bankName}
                    </td>
                    <td className="px-6 py-4 text-gray-400">{payment.branchName}</td>
                    <td className="px-6 py-4 text-gray-400 text-xs">
                      {payment.dateTime}
                    </td>
                    <td className="px-6 py-4 text-gray-400 font-mono">
                      {payment.customerId}
                    </td>
                    <td className="px-6 py-4 text-gray-200">{payment.customerName}</td>
                    <td className="px-6 py-4 text-gray-400">{payment.customerMobile}</td>
                    <td className="px-6 py-4 text-right text-red-400 font-semibold">
                      {payment.amount.toFixed(2)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-gray-400">
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
