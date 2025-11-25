import React, { useState, useMemo, useEffect } from "react";
import { useShop } from "../context/ShopContext";
import { useQuery } from "../hooks/useQuery";
import { API_URL } from "../config/api";
import { deleteBankAccount, BankAccount, getShopBankAccounts } from "../services/bankAccountService";
import { getPendingCollections, getCollectionHistory, recordCollection } from "../services/bankCollectionService";
import type { PendingCollection as PendingCollectionType, CollectionRecord } from "../services/bankCollectionService";

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

const BankAccountsPage: React.FC = () => {
  const { shopId: contextShopId } = useShop();
  const shopId = contextShopId || 1;

  const [selectedTab, setSelectedTab] = useState<
    "summary" | "tracking" | "history"
  >("summary");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBank, setSelectedBank] = useState<string>("all");
  const [showReconcileModal, setShowReconcileModal] = useState(false);
  const [selectedCollection, setSelectedCollection] =
    useState<PendingCollection | null>(null);
  const [collectedAmount, setCollectedAmount] = useState("");
  const [bankAccountsData, setBankAccountsData] = useState<BankAccount[]>([]);
  const [pendingCollectionsData, setPendingCollectionsData] = useState<PendingCollection[]>([]);
  const [collectionHistoryData, setCollectionHistoryData] = useState<CollectionRecord[]>([]);
  const [collections, setCollections] = useState<PendingCollection[]>([]);
  const [loading, setLoading] = useState(true);

  // Load bank accounts and collections from database
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [accounts, pending, history] = await Promise.all([
          getShopBankAccounts(shopId),
          getPendingCollections(shopId),
          getCollectionHistory(shopId),
        ]);
        setBankAccountsData(accounts || []);
        setPendingCollectionsData(pending || []);
        setCollectionHistoryData(history || []);
      } catch (error) {
        console.error("Error loading data:", error);
        setBankAccountsData([]);
        setPendingCollectionsData([]);
        setCollectionHistoryData([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [shopId]);

  // Update collections when pending data loads
  useEffect(() => {
    const combinedCollections: PendingCollection[] = [
      ...pendingCollectionsData,
      ...collectionHistoryData.map(col => ({
        id: `COL-${col.collectionId}`,
        bankName: col.bankName,
        branchName: col.branchName,
        pendingAmount: col.pendingAmount,
        fromDate: col.fromDate,
        toDate: col.toDate,
        ordersCount: col.ordersCount,
        status: 'collected' as const,
        collectedDate: col.collectionDate,
        collectedAmount: col.collectedAmount,
      })),
    ];
    setCollections(combinedCollections);
  }, [pendingCollectionsData, collectionHistoryData]);

  // Use real bank account data from database
  const bankAccounts = useMemo(() => {
    return bankAccountsData.filter(account => account.status === 'active');
  }, [bankAccountsData]);

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

  const totalBankBalance = useMemo(() => {
    return bankAccounts.reduce((sum, account) => sum + parseFloat(String(account.current_balance)), 0);
  }, [bankAccounts]);

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
          <p className="text-gray-400 mt-2">
            Manage bank collections & reconciliation
          </p>
        </div>
        <div className="space-y-4">
          <div className="text-right">
            <p className="text-sm text-gray-400">Total Bank Balance</p>
            <p className="text-2xl font-bold text-green-400">
              Rs. {parseFloat(String(totalBankBalance)).toFixed(2)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">Pending Collections</p>
            <p className="text-2xl font-bold text-yellow-400">
              Rs. {parseFloat(String(totalPendingAmount)).toFixed(2)}
            </p>
          </div>
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
          {loading ? (
            <div className="flex-1 flex items-center justify-center bg-gray-800/50 border border-gray-700 rounded-lg">
              <p className="text-gray-400 text-lg">Loading bank accounts...</p>
            </div>
          ) : bankAccounts.length === 0 ? (
            <div className="flex-1 flex items-center justify-center bg-gray-800/50 border border-gray-700 rounded-lg">
              <p className="text-gray-400 text-lg">No active bank accounts found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 overflow-y-auto">
              {bankAccounts.map((account) => (
                <div
                  key={account.bank_account_id}
                  className="bg-gradient-to-br from-gray-800/80 to-gray-900/50 border-2 border-red-600/30 rounded-lg p-6 hover:border-red-600/60 transition-all"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-red-400">
                        {account.bank_name}
                      </h3>
                      <p className="text-sm text-gray-400 mt-1">
                        Account: {account.account_number}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400 mb-1">
                        Current Balance
                      </p>
                      <p className="text-2xl font-bold text-green-400">
                        Rs. {parseFloat(String(account.current_balance)).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 bg-gray-700/30 rounded p-3 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Account Holder:</span>
                      <span className="text-gray-300">{account.account_holder_name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Initial Balance:</span>
                      <span className="text-gray-300">Rs. {parseFloat(String(account.initial_balance)).toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="border-t border-gray-700 pt-3">
                    <p className="text-xs text-gray-400 mb-3">
                      Last Updated: {new Date(account.updated_at).toLocaleDateString()}
                    </p>
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
                      <td className="px-6 py-4 text-gray-300">
                        {col.bankName}
                      </td>
                      <td className="px-6 py-4 text-gray-400">
                        {col.branchName}
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-xs">
                        {col.fromDate} to {col.toDate}
                      </td>
                      <td className="px-6 py-4 text-right text-yellow-400 font-bold">
                        Rs. {parseFloat(String(col.pendingAmount)).toFixed(2)}
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
                    <td
                      colSpan={7}
                      className="px-6 py-8 text-center text-gray-400"
                    >
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
                      <td className="px-6 py-4 text-gray-300">
                        {col.bankName}
                      </td>
                      <td className="px-6 py-4 text-gray-400">
                        {col.branchName}
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-xs">
                        {col.fromDate} to {col.toDate}
                      </td>
                      <td className="px-6 py-4 text-right text-gray-400">
                        Rs. {parseFloat(String(col.pendingAmount)).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {col.collectedDate}
                      </td>
                      <td className="px-6 py-4 text-right text-green-400 font-bold">
                        Rs. {(parseFloat(String(col.collectedAmount)) || 0).toFixed(2)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-8 text-center text-gray-400"
                    >
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
                  <span className="text-gray-200">
                    {selectedCollection.branchName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Period:</span>
                  <span className="text-gray-200">
                    {selectedCollection.fromDate} to {selectedCollection.toDate}
                  </span>
                </div>
                <div className="border-t border-gray-600 pt-3 flex justify-between">
                  <span className="text-gray-300 font-semibold">
                    Pending Amount:
                  </span>
                  <span className="text-yellow-400 font-bold text-lg">
                    Rs. {parseFloat(String(selectedCollection.pendingAmount)).toFixed(2)}
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
