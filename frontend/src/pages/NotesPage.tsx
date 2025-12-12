import React, { useState, useMemo, useEffect, useRef } from "react";
import { useShop } from "../context/ShopContext";
import { getShopNotes, Note } from "../services/notesService";
import {
  getPaymentNotes,
  createPaymentNote,
  deletePaymentNote,
  PaymentNote,
} from "../services/paymentNotesService";
import { getShopBankAccounts, BankAccount } from "../services/bankAccountService";
import { parsePaymentAmount } from "../utils/paymentUtils";

interface Notification {
  type: "success" | "error";
  message: string;
}

const NotesPage: React.FC = () => {
  const { shopId: contextShopId } = useShop();
  const shopId = contextShopId || 1;

  const [paymentNotes, setPaymentNotes] = useState<PaymentNote[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<Notification | null>(null);
  
  // Payment note modal states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentFormData, setPaymentFormData] = useState({
    amount: "",
    payment_method: "Cash" as 'Cash' | 'Bank Transfer' | 'Bank Deposit',
    bank_name: "",
    bank_branch_name: "",
    payment_date: new Date().toISOString().split('T')[0],
    payment_time: new Date().toTimeString().slice(0, 5),
  });

  // Refs for Enter key navigation
  const amountRef = useRef<HTMLInputElement>(null);
  const paymentMethodRef = useRef<HTMLSelectElement>(null);
  const bankRef = useRef<HTMLSelectElement>(null);
  const branchRef = useRef<HTMLInputElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);
  const timeRef = useRef<HTMLInputElement>(null);

  // Use ref to prevent duplicate requests in strict mode
  const loadDataRef = useRef(false);

  // Load notes
  useEffect(() => {
    // Prevent duplicate requests in React Strict Mode
    if (loadDataRef.current) return;
    loadDataRef.current = true;

    const loadData = async () => {
      try {
        setLoading(true);
        const [paymentNotesData, bankAccountsData] = await Promise.all([
          getPaymentNotes(shopId),
          getShopBankAccounts(shopId),
        ]);
        setPaymentNotes(paymentNotesData || []);
        setBankAccounts(bankAccountsData || []);
      } catch (error) {
        showNotification("error", "Failed to load data");
        console.error("Error loading data:", error);
        setPaymentNotes([]);
        setBankAccounts([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [shopId]);

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAddPaymentNote = async () => {
    try {
      if (!paymentFormData.amount) {
        showNotification("error", "Please enter amount");
        return;
      }

      if (paymentFormData.payment_method === 'Bank Transfer' && !paymentFormData.bank_name) {
        showNotification("error", "Please select a bank for Bank Transfer");
        return;
      }

      if (paymentFormData.payment_method === 'Bank Deposit' && (!paymentFormData.bank_name || !paymentFormData.bank_branch_name)) {
        showNotification("error", "Please select bank and enter branch name for Bank Deposit");
        return;
      }

      await createPaymentNote({
        shop_id: shopId,
        amount: parsePaymentAmount(paymentFormData.amount),
        payment_method: paymentFormData.payment_method,
        bank_name: paymentFormData.bank_name || undefined,
        bank_branch_name: paymentFormData.bank_branch_name || undefined,
        payment_date: paymentFormData.payment_date,
        payment_time: paymentFormData.payment_time,
      });

      showNotification("success", "Payment note added successfully");
      setShowPaymentModal(false);
      setPaymentFormData({
        amount: "",
        payment_method: "Cash",
        bank_name: "",
        bank_branch_name: "",
        payment_date: new Date().toISOString().split('T')[0],
        payment_time: new Date().toTimeString().slice(0, 5),
      });

      // Reload payment notes
      const paymentNotesData = await getPaymentNotes(shopId);
      setPaymentNotes(paymentNotesData || []);
    } catch (error) {
      showNotification("error", "Failed to add payment note");
      console.error("Error adding payment note:", error);
    }
  };

  const handleDeletePaymentNote = async (paymentNoteId: number) => {
    if (!confirm("Are you sure you want to delete this payment note?")) {
      return;
    }

    try {
      await deletePaymentNote(paymentNoteId, shopId);
      showNotification("success", "Payment note deleted successfully");

      // Reload payment notes
      const paymentNotesData = await getPaymentNotes(shopId);
      setPaymentNotes(paymentNotesData || []);
    } catch (error) {
      showNotification("error", "Failed to delete payment note");
      console.error("Error deleting payment note:", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, nextRef: React.RefObject<any>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      nextRef.current?.focus();
    }
  };

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

      {/* Compact Header - Single Row */}
      <div className="flex items-center gap-4">
        {/* Title and Count */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <h1 className="text-2xl font-bold text-red-500">Payment Notes</h1>
          <span className="text-sm font-semibold text-red-400 bg-red-900/30 px-3 py-1 rounded-full">
            {paymentNotes.length}
          </span>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Add Payment Button */}
        <button
          onClick={() => setShowPaymentModal(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 text-sm"
        >
          ➕ Add Payment
        </button>
      </div>

      {/* Payment Notes Table */}
      <div className="flex-1 overflow-hidden flex flex-col bg-gray-800/50 border border-gray-700 rounded-lg">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-400">Loading payment notes...</p>
          </div>
        ) : paymentNotes.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-400 text-lg">No payment notes yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto overflow-y-auto flex-1">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-gray-700/80 border-b-2 border-red-600 z-10">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-red-400">ID</th>
                  <th className="px-6 py-3 text-left font-semibold text-red-400">Amount</th>
                  <th className="px-6 py-3 text-left font-semibold text-red-400">Payment Method</th>
                  <th className="px-6 py-3 text-left font-semibold text-red-400">Bank</th>
                  <th className="px-6 py-3 text-left font-semibold text-red-400">Branch</th>
                  <th className="px-6 py-3 text-left font-semibold text-red-400">Date</th>
                  <th className="px-6 py-3 text-left font-semibold text-red-400">Time</th>
                  <th className="px-6 py-3 text-left font-semibold text-red-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {paymentNotes.map((note) => (
                  <tr key={note.payment_note_id} className="hover:bg-gray-700/30 transition-all">
                    <td className="px-6 py-4 text-gray-200 font-mono font-semibold">#{note.payment_note_id}</td>
                    <td className="px-6 py-4 text-green-400 font-semibold">Rs. {parseFloat(String(note.amount)).toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        note.payment_method === 'Cash' ? 'bg-green-900/30 text-green-400' :
                        note.payment_method === 'Bank Transfer' ? 'bg-blue-900/30 text-blue-400' :
                        'bg-purple-900/30 text-purple-400'
                      }`}>
                        {note.payment_method}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-300">{note.bank_name || '-'}</td>
                    <td className="px-6 py-4 text-gray-300">{note.bank_branch_name || '-'}</td>
                    <td className="px-6 py-4 text-gray-300">{new Date(note.payment_date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-gray-300">{note.payment_time}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDeletePaymentNote(note.payment_note_id)}
                        className="text-red-400 hover:text-red-300 font-semibold text-xs"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>



      {/* Payment Note Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 border-2 border-red-600 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-red-500 mb-4">Add Payment Note</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-red-400 mb-2">Amount *</label>
                <input
                  ref={amountRef}
                  type="number"
                  step="0.01"
                  placeholder="Enter amount"
                  value={paymentFormData.amount}
                  onChange={(e) => setPaymentFormData({ ...paymentFormData, amount: e.target.value })}
                  onKeyPress={(e) => handleKeyPress(e, paymentMethodRef)}
                  className="w-full px-4 py-2 bg-gray-700 border-2 border-red-600/30 text-white placeholder-gray-500 rounded-lg focus:border-red-500 focus:outline-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-red-400 mb-2">Payment Method *</label>
                <select
                  ref={paymentMethodRef}
                  value={paymentFormData.payment_method}
                  onChange={(e) => setPaymentFormData({ ...paymentFormData, payment_method: e.target.value as any })}
                  onKeyPress={(e) => {
                    if (paymentFormData.payment_method === 'Cash') {
                      handleKeyPress(e, dateRef);
                    } else {
                      handleKeyPress(e, bankRef);
                    }
                  }}
                  className="w-full px-4 py-2 bg-gray-700 border-2 border-red-600/30 text-white rounded-lg focus:border-red-500 focus:outline-none"
                >
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Bank Deposit">Bank Deposit</option>
                </select>
              </div>

              {/* Show bank selector for Bank Transfer and Bank Deposit */}
              {(paymentFormData.payment_method === 'Bank Transfer' || paymentFormData.payment_method === 'Bank Deposit') && (
                <div>
                  <label className="block text-sm font-semibold text-red-400 mb-2">Bank Name *</label>
                  <select
                    ref={bankRef}
                    value={paymentFormData.bank_name}
                    onChange={(e) => setPaymentFormData({ ...paymentFormData, bank_name: e.target.value })}
                    onKeyPress={(e) => {
                      if (paymentFormData.payment_method === 'Bank Deposit') {
                        handleKeyPress(e, branchRef);
                      } else {
                        handleKeyPress(e, dateRef);
                      }
                    }}
                    className="w-full px-4 py-2 bg-gray-700 border-2 border-red-600/30 text-white rounded-lg focus:border-red-500 focus:outline-none"
                  >
                    <option value="">Select bank account</option>
                    {bankAccounts.map((account) => (
                      <option key={account.bank_account_id} value={account.bank_name}>
                        {account.bank_name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Show branch name input only for Bank Deposit */}
              {paymentFormData.payment_method === 'Bank Deposit' && (
                <div>
                  <label className="block text-sm font-semibold text-red-400 mb-2">Bank Branch Name *</label>
                  <input
                    ref={branchRef}
                    type="text"
                    placeholder="Enter branch name"
                    value={paymentFormData.bank_branch_name}
                    onChange={(e) => setPaymentFormData({ ...paymentFormData, bank_branch_name: e.target.value })}
                    onKeyPress={(e) => handleKeyPress(e, dateRef)}
                    className="w-full px-4 py-2 bg-gray-700 border-2 border-red-600/30 text-white placeholder-gray-500 rounded-lg focus:border-red-500 focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-red-400 mb-2">Date</label>
                <input
                  ref={dateRef}
                  type="date"
                  value={paymentFormData.payment_date}
                  onChange={(e) => setPaymentFormData({ ...paymentFormData, payment_date: e.target.value })}
                  onKeyPress={(e) => handleKeyPress(e, timeRef)}
                  className="w-full px-4 py-2 bg-gray-700 border-2 border-red-600/30 text-white rounded-lg focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-red-400 mb-2">Time</label>
                <input
                  ref={timeRef}
                  type="time"
                  value={paymentFormData.payment_time}
                  onChange={(e) => setPaymentFormData({ ...paymentFormData, payment_time: e.target.value })}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddPaymentNote();
                    }
                  }}
                  className="w-full px-4 py-2 bg-gray-700 border-2 border-red-600/30 text-white rounded-lg focus:border-red-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPaymentNote}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-semibold transition-colors"
              >
                Add Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotesPage;