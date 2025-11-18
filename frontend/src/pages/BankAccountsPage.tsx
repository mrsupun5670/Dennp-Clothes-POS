import React, { useState, useMemo } from "react";

interface PendingCollection {
  id: string;
  bankName: string;
  branchName: string;
  pendingAmount: number;
  fromDate: string;
  toDate: string;
  ordersCount: number;
  status: "pending" | "collected";
  collectedDate?: string;
  collectedAmount?: number;
}

interface BankAccount {
  bankName: string;
  branchName: string;
  totalPendingAmount: number;
  lastUpdated: string;
}

const BankAccountsPage: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<"summary" | "tracking" | "history">(
    "summary"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBank, setSelectedBank] = useState<string>("all");
  const [showReconcileModal, setShowReconcileModal] = useState(false);
  const [selectedCollection, setSelectedCollection] =
    useState<PendingCollection | null>(null);
  const [collectedAmount, setCollectedAmount] = useState("");

  // Sample pending collections data
  const [collections, setCollections] = useState<PendingCollection[]>([
    {
      id: "COL001",
      bankName: "Bank of Ceylon",
      branchName: "Colombo Main Branch",
      pendingAmount: 30000,
      fromDate: "2024-11-01",
      toDate: "2024-11-15",
      ordersCount: 5,
      status: "pending",
    },
    {
      id: "COL002",
      bankName: "Commercial Bank",
      branchName: "Colombo Branch",
      pendingAmount: 15500,
      fromDate: "2024-11-05",
      toDate: "2024-11-14",
      ordersCount: 3,
      status: "pending",
    },
    {
      id: "COL003",
      bankName: "Bank of Ceylon",
      branchName: "Colombo Main Branch",
      pendingAmount: 22000,
      fromDate: "2024-10-15",
      toDate: "2024-10-31",
      ordersCount: 4,
      status: "collected",
      collectedDate: "2024-11-10",
      collectedAmount: 22000,
    },
    {
      id: "COL004",
      bankName: "Commercial Bank",
      branchName: "Colombo Branch",
      pendingAmount: 18750,
      fromDate: "2024-11-08",
      toDate: "2024-11-15",
      ordersCount: 3,
      status: "pending",
    },
    {
      id: "COL005",
      bankName: "Bank of Ceylon",
      branchName: "Colombo Main Branch",
      pendingAmount: 10250,
      fromDate: "2024-11-10",
      toDate: "2024-11-15",
      ordersCount: 2,
      status: "pending",
    },
  ]);

  // Calculate bank account summaries
  const bankAccounts: BankAccount[] = useMemo(() => {
    const accountMap = new Map<string, BankAccount>();

    collections
      .filter((col) => col.status === "pending")
      .forEach((col) => {
        const key = `${col.bankName}|${col.branchName}`;
        const existing = accountMap.get(key);
        if (existing) {
          existing.totalPendingAmount += col.pendingAmount;
        } else {
          accountMap.set(key, {
            bankName: col.bankName,
            branchName: col.branchName,
            totalPendingAmount: col.pendingAmount,
            lastUpdated: col.toDate,
          });
        }
      });

    return Array.from(accountMap.values());
  }, [collections]);

  // Filter collections based on search and bank
  const filteredCollections = useMemo(() => {
    let result = [...collections];

    if (selectedBank !== "all") {
      result = result.filter((col) => col.bankName === selectedBank);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (col) =>
          col.bankName.toLowerCase().includes(query) ||
          col.branchName.toLowerCase().includes(query) ||
          col.id.toLowerCase().includes(query)
      );
    }

    return result;
  }, [selectedBank, searchQuery, collections]);

  const pendingCollections = filteredCollections.filter(
    (col) => col.status === "pending"
  );
  const collectedHistory = filteredCollections.filter(
    (col) => col.status === "collected"
  );

  const totalPendingAmount = pendingCollections.reduce(
    (sum, col) => sum + col.pendingAmount,
    0
  );

  const uniqueBanks = Array.from(
    new Set(collections.map((col) => col.bankName))
  ).sort();

  const handleOpenReconcile = (collection: PendingCollection) => {
    setSelectedCollection(collection);
    setCollectedAmount(collection.pendingAmount.toString());
    setShowReconcileModal(true);
  };

  const handleCloseReconcile = () => {
    setShowReconcileModal(false);
    setSelectedCollection(null);
    setCollectedAmount("");
  };

  const handleMarkAsCollected = () => {
    if (selectedCollection && collectedAmount) {
      setCollections(
        collections.map((col) =>
          col.id === selectedCollection.id
            ? {
                ...col,
                status: "collected",
                collectedDate: new Date().toISOString().split("T")[0],
                collectedAmount: parseFloat(collectedAmount),
              }
            : col
        )
      );
      handleCloseReconcile();
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-red-500">Bank Accounts</h1>
            <span className="text-sm font-semibold text-red-400 bg-red-900/30 px-3 py-1 rounded-full">
              {bankAccounts.length} accounts
            </span>
          </div>
          <p className="text-gray-400 mt-2">Manage bank collections & reconciliation</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-400">Total Pending</p>
          <p className="text-2xl font-bold text-yellow-400">
            Rs. {totalPendingAmount.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-gray-700">
        {[
          { id: "summary", label: "Bank Summary", icon: "🏦" },
          { id: "tracking", label: "Pending Collections", icon: "📍" },
          { id: "history", label: "Reconciliation History", icon: "✓" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id as any)}
            className={`px-4 py-3 font-semibold transition-all border-b-2 ${
              selectedTab === tab.id
                ? "border-b-red-600 text-red-400"
                : "border-b-transparent text-gray-400 hover:text-red-400"
            }`}
          >
            <span>{tab.icon}</span> {tab.label}
          </button>
        ))}
      </div>

      {/* Search and Filter (for tracking and history) */}
      {selectedTab !== "summary" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-red-400">
              Search
            </label>
            <input
              type="text"
              placeholder="Search by bank name, branch, or collection ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border-2 border-red-600/30 text-white placeholder-gray-500 rounded-lg focus:border-red-500 focus:outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-red-400">
              Filter by Bank
            </label>
            <select
              value={selectedBank}
              onChange={(e) => setSelectedBank(e.target.value)}
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
        </div>
      )}

      {/* TAB 1: BANK SUMMARY */}
      {selectedTab === "summary" && (
        <div className="flex-1 overflow-hidden flex flex-col space-y-4">
          {bankAccounts.length === 0 ? (
            <div className="flex-1 flex items-center justify-center bg-gray-800/50 border border-gray-700 rounded-lg">
              <p className="text-gray-400 text-lg">No pending collections</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 overflow-y-auto">
              {bankAccounts.map((account, idx) => (
                <div
                  key={idx}
                  className="bg-gradient-to-br from-gray-800/80 to-gray-900/50 border-2 border-red-600/30 rounded-lg p-6 hover:border-red-600/60 transition-all"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-red-400">
                        {account.bankName}
                      </h3>
                      <p className="text-sm text-gray-400 mt-1">
                        {account.branchName}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400 mb-1">Pending Amount</p>
                      <p className="text-2xl font-bold text-yellow-400">
                        Rs. {account.totalPendingAmount.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-gray-700 pt-3">
                    <p className="text-xs text-gray-400">
                      Last Updated: {account.lastUpdated}
                    </p>
                    <div className="mt-3 flex gap-2">
                      <button className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors">
                        Mark as Collected
                      </button>
                      <button className="flex-1 bg-gray-700 text-gray-300 py-2 rounded-lg text-sm font-semibold hover:bg-gray-600 transition-colors">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PENDING COLLECTIONS */}
      {selectedTab === "tracking" && (
        <div className="flex-1 overflow-hidden flex flex-col bg-gray-800/50 border border-gray-700 rounded-lg">
          <div className="overflow-x-auto overflow-y-auto flex-1">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-gray-700/80 border-b-2 border-red-600 z-10">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-red-400">
                    Collection ID
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-red-400">
                    Bank Name
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-red-400">
                    Branch
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-red-400">
                    Period
                  </th>
                  <th className="px-6 py-3 text-right font-semibold text-red-400">
                    Amount (Rs.)
                  </th>
                  <th className="px-6 py-3 text-center font-semibold text-red-400">
                    Orders
                  </th>
                  <th className="px-6 py-3 text-center font-semibold text-red-400">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {pendingCollections.length > 0 ? (
                  pendingCollections.map((col) => (
                    <tr
                      key={col.id}
                      className="hover:bg-gray-700/30 border-l-4 border-l-yellow-600 transition-all"
                    >
                      <td className="px-6 py-4 text-gray-200 font-medium font-mono">
                        {col.id}
                      </td>
                      <td className="px-6 py-4 text-gray-300">{col.bankName}</td>
                      <td className="px-6 py-4 text-gray-400">{col.branchName}</td>
                      <td className="px-6 py-4 text-gray-400 text-xs">
                        {col.fromDate} to {col.toDate}
                      </td>
                      <td className="px-6 py-4 text-right text-yellow-400 font-bold">
                        Rs. {col.pendingAmount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs font-semibold">
                          {col.ordersCount}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleOpenReconcile(col)}
                          className="bg-red-600 text-white px-3 py-1 rounded text-xs font-semibold hover:bg-red-700 transition-colors"
                        >
                          Collect
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                      No pending collections found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: RECONCILIATION HISTORY */}
      {selectedTab === "history" && (
        <div className="flex-1 overflow-hidden flex flex-col bg-gray-800/50 border border-gray-700 rounded-lg">
          <div className="overflow-x-auto overflow-y-auto flex-1">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-gray-700/80 border-b-2 border-red-600 z-10">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-red-400">
                    Collection ID
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-red-400">
                    Bank Name
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-red-400">
                    Branch
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-red-400">
                    Period
                  </th>
                  <th className="px-6 py-3 text-right font-semibold text-red-400">
                    Amount (Rs.)
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-red-400">
                    Collected Date
                  </th>
                  <th className="px-6 py-3 text-right font-semibold text-red-400">
                    Collected (Rs.)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {collectedHistory.length > 0 ? (
                  collectedHistory.map((col) => (
                    <tr
                      key={col.id}
                      className="hover:bg-gray-700/30 border-l-4 border-l-green-600 transition-all"
                    >
                      <td className="px-6 py-4 text-gray-200 font-medium font-mono">
                        {col.id}
                      </td>
                      <td className="px-6 py-4 text-gray-300">{col.bankName}</td>
                      <td className="px-6 py-4 text-gray-400">{col.branchName}</td>
                      <td className="px-6 py-4 text-gray-400 text-xs">
                        {col.fromDate} to {col.toDate}
                      </td>
                      <td className="px-6 py-4 text-right text-gray-400">
                        Rs. {col.pendingAmount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {col.collectedDate}
                      </td>
                      <td className="px-6 py-4 text-right text-green-400 font-bold">
                        Rs. {(col.collectedAmount || 0).toFixed(2)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                      No reconciliation history found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reconciliation Modal */}
      {showReconcileModal && selectedCollection && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg shadow-2xl border-2 border-red-600 w-full max-w-lg">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-red-700 to-red-900 text-white p-6 border-b border-red-600 flex justify-between items-center">
              <h2 className="text-2xl font-bold">Mark as Collected</h2>
              <button
                onClick={handleCloseReconcile}
                className="text-white hover:text-red-200 transition-colors text-2xl"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {/* Collection Details */}
              <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Collection ID:</span>
                  <span className="text-gray-200 font-mono font-semibold">
                    {selectedCollection.id}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Bank:</span>
                  <span className="text-gray-200 font-semibold">
                    {selectedCollection.bankName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Branch:</span>
                  <span className="text-gray-200">{selectedCollection.branchName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Period:</span>
                  <span className="text-gray-200">
                    {selectedCollection.fromDate} to {selectedCollection.toDate}
                  </span>
                </div>
                <div className="border-t border-gray-600 pt-3 flex justify-between">
                  <span className="text-gray-300 font-semibold">Pending Amount:</span>
                  <span className="text-yellow-400 font-bold text-lg">
                    Rs. {selectedCollection.pendingAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Collected Amount Input */}
              <div>
                <label className="block text-sm font-semibold text-red-400 mb-2">
                  Amount Collected (Rs.) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={collectedAmount}
                  onChange={(e) => setCollectedAmount(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 border-2 border-red-600/30 text-white placeholder-gray-500 rounded-lg focus:border-red-500 focus:outline-none"
                />
                <p className="text-xs text-gray-400 mt-2">
                  {parseFloat(collectedAmount || "0") ===
                  selectedCollection.pendingAmount
                    ? "✓ Full amount matched"
                    : parseFloat(collectedAmount || "0") >
                      selectedCollection.pendingAmount
                    ? "⚠ Amount exceeds pending"
                    : "Partial collection"}
                </p>
              </div>

              {/* Collected Date Display */}
              <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4">
                <p className="text-xs text-gray-400 font-semibold mb-1">
                  Collection Date
                </p>
                <p className="text-gray-200 font-semibold">
                  {new Date().toISOString().split("T")[0]}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-700">
                <button
                  onClick={handleMarkAsCollected}
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  ✓ Confirm Collected
                </button>
                <button
                  onClick={handleCloseReconcile}
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

export default BankAccountsPage;
