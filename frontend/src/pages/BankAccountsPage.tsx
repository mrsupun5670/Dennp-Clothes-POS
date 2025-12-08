import React, { useState, useMemo, useEffect } from "react";
import { useShop } from "../context/ShopContext";
import { useQuery } from "../hooks/useQuery";
import { API_URL } from "../config/api";
import { deleteBankAccount, BankAccount, getShopBankAccounts } from "../services/bankAccountService";
import { getAllCollections, createCollection, BankCollection } from "../services/bankCollectionService";
import { formatSriLankanDate, formatSriLankanDateTime, getCurrentSriLankanDate } from "../utils/timeUtils";

const BankAccountsPage: React.FC = () => {
  const { shopId: contextShopId } = useShop();
  const shopId = contextShopId || 1;

  const [selectedTab, setSelectedTab] = useState<
    "summary" | "collections"
  >("summary");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBank, setSelectedBank] = useState<string>("all");
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [selectedBankAccount, setSelectedBankAccount] = useState<BankAccount | null>(null);
  const [collectionAmount, setCollectionAmount] = useState("");
  const [collectionDate, setCollectionDate] = useState(getCurrentSriLankanDate());
  const [collectionNotes, setCollectionNotes] = useState("");
  const [bankAccountsData, setBankAccountsData] = useState<BankAccount[]>([]);
  const [collectionsData, setCollectionsData] = useState<BankCollection[]>([]);
  const [loading, setLoading] = useState(true);

  // Error state
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Collection modal status messages
  const [collectionStatus, setCollectionStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load bank accounts and collections from database
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setErrorMessage(null);

        // Load bank accounts
        try {
          const accounts = await getShopBankAccounts(shopId);
          setBankAccountsData(accounts || []);
        } catch (error: any) {
          console.error("Error loading bank accounts:", error);
          setErrorMessage(error?.message || "Failed to load bank accounts");
          setBankAccountsData([]);
        }

        // Load collections
        try {
          const collections = await getAllCollections();
          setCollectionsData(collections || []);
        } catch (error) {
          console.warn("Could not load collections:", error);
          setCollectionsData([]);
        }
      } catch (error: any) {
        console.error("Error loading data:", error);
        setErrorMessage(error?.message || "Failed to load bank account data");
        setBankAccountsData([]);
        setCollectionsData([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [shopId]);

  // Use real bank account data from database
  const bankAccounts = useMemo(() => {
    return bankAccountsData;
  }, [bankAccountsData]);

  // Filter collections based on search and bank
  const filteredCollections = useMemo(() => {
    let result = [...collectionsData];

    if (selectedBank !== "all") {
      result = result.filter((col) => col.bank_name === selectedBank);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (col) =>
          col.bank_name?.toLowerCase().includes(query) ||
          col.collection_id.toString().includes(query)
      );
    }

    return result;
  }, [selectedBank, searchQuery, collectionsData]);

  const totalBankBalance = useMemo(() => {
    return bankAccounts.reduce((sum, account) => sum + parseFloat(String(account.current_balance)), 0);
  }, [bankAccounts]);

  const totalCollected = useMemo(() => {
    return collectionsData.reduce((sum, col) => sum + parseFloat(String(col.collection_amount)), 0);
  }, [collectionsData]);

  const uniqueBanks = Array.from(
    new Set(collectionsData.map((col) => col.bank_name).filter(Boolean))
  ).sort();

  const handleOpenCollectionModal = (account: BankAccount) => {
    setSelectedBankAccount(account);
    setCollectionAmount("");
    setCollectionDate(getCurrentSriLankanDate());
    setCollectionNotes("");
    setCollectionStatus({ type: null, message: '' });
    setIsSubmitting(false);
    setShowCollectionModal(true);
  };

  const handleCloseCollectionModal = () => {
    setShowCollectionModal(false);
    setSelectedBankAccount(null);
    setCollectionAmount("");
    setCollectionNotes("");
    setCollectionStatus({ type: null, message: '' });
    setIsSubmitting(false);
  };

  const handleRecordCollection = async () => {
    if (!selectedBankAccount || !collectionAmount || parseFloat(collectionAmount) <= 0) {
      setCollectionStatus({
        type: 'error',
        message: 'Please enter a valid collection amount'
      });
      return;
    }

    setIsSubmitting(true);
    setCollectionStatus({ type: null, message: '' });

    try {
      await createCollection(
        selectedBankAccount.bank_account_id,
        parseFloat(collectionAmount),
        collectionDate,
        collectionNotes || undefined
      );

      // Show success message
      setCollectionStatus({
        type: 'success',
        message: 'Collection recorded successfully! Updating balances...'
      });

      // Reload data
      const accounts = await getShopBankAccounts(shopId);
      setBankAccountsData(accounts || []);
      const collections = await getAllCollections();
      setCollectionsData(collections || []);

      // Close modal after 1.5 seconds
      setTimeout(() => {
        handleCloseCollectionModal();
      }, 1500);
    } catch (error: any) {
      console.error("Error recording collection:", error);
      setCollectionStatus({
        type: 'error',
        message: error?.response?.data?.message || 'Failed to record collection. Please try again.'
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Error Message Display */}
      {errorMessage && (
        <div className="bg-red-900/30 border-2 border-red-600 text-red-300 p-4 rounded-lg flex items-start gap-3">
          <span className="text-2xl">⚠</span>
          <div className="flex-1">
            <p className="font-semibold text-lg">Error Loading Bank Accounts</p>
            <p className="text-sm mt-1">{errorMessage}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors"
            >
              Reload Page
            </button>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-red-300 hover:text-red-100 text-2xl"
          >
            ✕
          </button>
        </div>
      )}

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
            <p className="text-sm text-gray-400">Total Collected</p>
            <p className="text-2xl font-bold text-blue-400">
              Rs. {parseFloat(String(totalCollected)).toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-gray-700">
        {[
          { id: "summary", label: "Bank Summary", icon: "🏦" },
          { id: "collections", label: "Collections History", icon: "💰" },
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
                      <h3 className="text-xl font-bold text-red-400">
                        {account.bank_name}
                      </h3>
                      <p className="text-xs text-gray-400 mt-1">
                        Account ID: {account.bank_account_id}
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
                      <span className="text-gray-400">Initial Balance:</span>
                      <span className="text-gray-300">Rs. {parseFloat(String(account.initial_balance)).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Balance Change:</span>
                      <span className={`font-semibold ${
                        parseFloat(String(account.current_balance)) - parseFloat(String(account.initial_balance)) >= 0
                          ? 'text-green-400'
                          : 'text-red-400'
                      }`}>
                        {parseFloat(String(account.current_balance)) - parseFloat(String(account.initial_balance)) >= 0 ? '+' : ''}
                        Rs. {(parseFloat(String(account.current_balance)) - parseFloat(String(account.initial_balance))).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-gray-700 pt-3 space-y-2">
                    <p className="text-xs text-gray-400 mb-1">
                      Created: {formatSriLankanDate(account.created_at)}
                    </p>
                    <p className="text-xs text-gray-400">
                      Last Updated: {formatSriLankanDateTime(account.updated_at)}
                    </p>
                    <button
                      onClick={() => handleOpenCollectionModal(account)}
                      className="w-full bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors mt-3"
                    >
                      💰 Collect Money
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: COLLECTIONS HISTORY */}
      {selectedTab === "collections" && (
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
                  <th className="px-6 py-3 text-right font-semibold text-red-400">
                    Amount (Rs.)
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-red-400">
                    Collection Date
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-red-400">
                    Notes
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-red-400">
                    Recorded At
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredCollections.length > 0 ? (
                  filteredCollections.map((col) => (
                    <tr
                      key={col.collection_id}
                      className="hover:bg-gray-700/30 border-l-4 border-l-blue-600 transition-all"
                    >
                      <td className="px-6 py-4 text-gray-200 font-medium font-mono">
                        #{col.collection_id}
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {col.bank_name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-right text-blue-400 font-bold">
                        Rs. {parseFloat(String(col.collection_amount)).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {formatSriLankanDate(col.collection_date)}
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-xs">
                        {col.notes || '-'}
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-xs">
                        {formatSriLankanDateTime(col.created_at)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-8 text-center text-gray-400"
                    >
                      No collections found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Record Collection Modal */}
      {showCollectionModal && selectedBankAccount && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg shadow-2xl border-2 border-red-600 w-full max-w-lg">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-red-700 to-red-900 text-white p-6 border-b border-red-600 flex justify-between items-center">
              <h2 className="text-2xl font-bold">💰 Record Collection</h2>
              <button
                onClick={handleCloseCollectionModal}
                className="text-white hover:text-red-200 transition-colors text-2xl"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {/* Status Message */}
              {collectionStatus.type && (
                <div className={`p-4 rounded-lg border-2 ${
                  collectionStatus.type === 'success'
                    ? 'bg-green-900/30 border-green-600 text-green-300'
                    : 'bg-red-900/30 border-red-600 text-red-300'
                }`}>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">
                      {collectionStatus.type === 'success' ? '✓' : '⚠'}
                    </span>
                    <div className="flex-1">
                      <p className="font-semibold">
                        {collectionStatus.type === 'success' ? 'Success!' : 'Error'}
                      </p>
                      <p className="text-sm mt-1">{collectionStatus.message}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Bank Account Details */}
              <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Bank:</span>
                  <span className="text-gray-200 font-semibold">
                    {selectedBankAccount.bank_name}
                  </span>
                </div>
                <div className="border-t border-gray-600 pt-3 flex justify-between">
                  <span className="text-gray-300 font-semibold">
                    Current Balance:
                  </span>
                  <span className="text-green-400 font-bold text-lg">
                    Rs. {parseFloat(String(selectedBankAccount.current_balance)).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Collection Amount Input */}
              <div>
                <label className="block text-sm font-semibold text-red-400 mb-2">
                  Amount to Collect (Rs.) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={collectionAmount}
                  onChange={(e) => setCollectionAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full px-4 py-2 bg-gray-700 border-2 border-red-600/30 text-white placeholder-gray-500 rounded-lg focus:border-red-500 focus:outline-none"
                />
                {parseFloat(collectionAmount || "0") > parseFloat(String(selectedBankAccount.current_balance)) && (
                  <p className="text-xs text-red-400 mt-2">
                    ⚠ Amount exceeds current balance
                  </p>
                )}
              </div>

              {/* Collection Date */}
              <div>
                <label className="block text-sm font-semibold text-red-400 mb-2">
                  Collection Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={collectionDate}
                  onChange={(e) => setCollectionDate(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 border-2 border-red-600/30 text-white rounded-lg focus:border-red-500 focus:outline-none"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-red-400 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={collectionNotes}
                  onChange={(e) => setCollectionNotes(e.target.value)}
                  placeholder="Add any notes about this collection..."
                  rows={3}
                  className="w-full px-4 py-2 bg-gray-700 border-2 border-red-600/30 text-white placeholder-gray-500 rounded-lg focus:border-red-500 focus:outline-none resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-700">
                <button
                  onClick={handleRecordCollection}
                  disabled={isSubmitting || !collectionAmount || parseFloat(collectionAmount) <= 0 || parseFloat(collectionAmount) > parseFloat(String(selectedBankAccount.current_balance))}
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Recording...' : '✓ Record Collection'}
                </button>
                <button
                  onClick={handleCloseCollectionModal}
                  disabled={isSubmitting}
                  className="flex-1 bg-gray-700 text-gray-300 py-2 rounded-lg font-semibold hover:bg-gray-600 transition-colors disabled:cursor-not-allowed"
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
