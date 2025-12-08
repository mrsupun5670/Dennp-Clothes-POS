import React, { useState, useEffect } from "react";
import { useShop } from "../context/ShopContext";
import { API_URL } from "../config/api";

interface BankPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (paymentData: BankPaymentData) => void;
  totalAmount: number;
  isEditingOrder?: boolean;
}

interface BankAccount {
  bank_account_id: number;
  bank_name: string;
  current_balance: number;
}

export interface BankPaymentData {
  bank: string;
  bankAccountId: number;
  isOnlineTransfer: boolean;
  branch: string;
  receiptNumber: string;
  paymentDateTime: string;
  paidAmount: string;
}

const bankBranches: { [key: string]: string[] } = {
  boc: ["Colombo Main", "Gampaha Branch", "Kandy Branch", "Matara Branch", "Jaffna Branch"],
  commercial: ["Colombo Head Office", "Gampaha Branch", "Kandy Branch", "Negombo Branch", "Matara Branch"],
};

const BankPaymentModal: React.FC<BankPaymentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  totalAmount,
  isEditingOrder = false,
}) => {
  const { shopId } = useShop();
  const [bank, setBank] = useState("");
  const [bankAccountId, setBankAccountId] = useState<number>(0);
  const [isOnlineTransfer, setIsOnlineTransfer] = useState(false);
  const [branch, setBranch] = useState("");
  const [receiptNumber, setReceiptNumber] = useState("");
  const [paymentDateTime, setPaymentDateTime] = useState("");
  const [paidAmount, setPaidAmount] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [isLoadingBankAccounts, setIsLoadingBankAccounts] = useState(false);

  // Fetch bank accounts on mount
  useEffect(() => {
    const fetchBankAccounts = async () => {
      if (!shopId) {
        console.log("No shopId available");
        return;
      }

      setIsLoadingBankAccounts(true);
      try {
        console.log("Fetching bank accounts for shop:", shopId);
        const response = await fetch(`${API_URL}/bank-accounts/${shopId}`);
        const result = await response.json();
        console.log("Bank accounts API response:", result);

        if (result.success && result.data) {
          setBankAccounts(result.data);
          console.log("Bank accounts loaded:", result.data.length, "accounts");
        } else {
          console.error("Failed to fetch bank accounts:", result.error);
          setBankAccounts([]);
        }
      } catch (error) {
        console.error("Error fetching bank accounts:", error);
        setBankAccounts([]);
      } finally {
        setIsLoadingBankAccounts(false);
      }
    };

    if (isOpen) {
      fetchBankAccounts();
    }
  }, [isOpen, shopId]);

  // Get current date-time in ISO format for input
  useEffect(() => {
    if (isOpen && !paymentDateTime) {
      const now = new Date();
      const isoDateTime = now.toISOString().slice(0, 16);
      setPaymentDateTime(isoDateTime);
    }
  }, [isOpen]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!bankAccountId || bankAccountId === 0) {
      newErrors.bankAccount = "Please select a bank account";
    }

    if (!receiptNumber.trim()) {
      newErrors.receiptNumber = "Receipt number is required";
    }

    if (!isOnlineTransfer && !branch.trim()) {
      newErrors.branch = "Branch name is required for bank deposit";
    }

    if (!paymentDateTime) {
      newErrors.paymentDateTime = "Payment date/time is required";
    }

    if (!paidAmount.trim()) {
      newErrors.paidAmount = "Paid amount is required";
    } else {
      const amount = parseFloat(paidAmount);
      if (isNaN(amount) || amount <= 0) {
        newErrors.paidAmount = "Paid amount must be greater than 0";
      }
      if (amount > totalAmount) {
        newErrors.paidAmount = `Amount cannot exceed total (Rs. ${totalAmount.toFixed(2)})`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      // Find the selected bank account to get the bank name
      const selectedAccount = bankAccounts.find(acc => acc.bank_account_id === bankAccountId);

      onSave({
        bank: selectedAccount?.bank_name || "",
        bankAccountId,
        isOnlineTransfer,
        branch: isOnlineTransfer ? "" : branch,
        receiptNumber,
        paymentDateTime,
        paidAmount,
      });
      handleReset();
      onClose();
    }
  };

  const handleReset = () => {
    setBank("");
    setBankAccountId(0);
    setIsOnlineTransfer(false);
    setBranch("");
    setReceiptNumber("");
    setPaidAmount("");
    setErrors({});
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg shadow-2xl border-2 border-blue-600 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white p-6 border-b border-blue-600 flex justify-between items-center sticky top-0">
          <h2 className="text-2xl font-bold">Bank Payment Details</h2>
          <button
            onClick={handleClose}
            className="text-white hover:text-blue-200 transition-colors text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Total Amount Display */}
          <div className="bg-blue-900/30 border border-blue-600/50 rounded-lg p-4">
            <p className="text-sm text-blue-300 mb-1">
              {isEditingOrder ? "Balance Due" : "Total Order Amount"}
            </p>
            <p className="text-3xl font-bold text-blue-400">Rs. {totalAmount.toFixed(2)}</p>
          </div>

          {/* Bank Account and Branch Selection in Same Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Bank Account Selection */}
            <div>
              <label className="block text-sm font-semibold text-blue-400 mb-2">
                Bank Account <span className="text-red-500">*</span>
              </label>
              <select
                value={bankAccountId}
                onChange={(e) => {
                  const selectedId = parseInt(e.target.value);
                  setBankAccountId(selectedId);
                  // Set bank name from selected account
                  const selectedAccount = bankAccounts.find(acc => acc.bank_account_id === selectedId);
                  if (selectedAccount) {
                    setBank(selectedAccount.bank_name);
                  }
                }}
                disabled={isLoadingBankAccounts}
                className={`w-full px-4 py-2 bg-gray-700 border-2 text-white rounded-lg focus:outline-none transition-colors ${
                  errors.bankAccount
                    ? "border-red-500"
                    : "border-blue-600/30 focus:border-blue-500"
                } ${isLoadingBankAccounts ? "opacity-50 cursor-wait" : ""}`}
              >
                <option value={0}>
                  {isLoadingBankAccounts ? "Loading bank accounts..." : "Select Bank Account"}
                </option>
                {!isLoadingBankAccounts && bankAccounts.length === 0 && (
                  <option value={0} disabled>No bank accounts found</option>
                )}
                {bankAccounts.map((account) => (
                  <option key={account.bank_account_id} value={account.bank_account_id}>
                    {account.bank_name} (Balance: Rs. {Number(account.current_balance).toFixed(2)})
                  </option>
                ))}
              </select>
              {errors.bankAccount && (
                <p className="text-red-400 text-xs mt-1">{errors.bankAccount}</p>
              )}
            </div>

            {/* Branch Name Input - Hidden if Online Transfer */}
            <div>
              <label className="block text-sm font-semibold text-blue-400 mb-2">
                Branch {!isOnlineTransfer && <span className="text-red-500">*</span>}
              </label>
              <input
                type="text"
                placeholder={isOnlineTransfer ? "Not required for online transfer" : "Enter branch name"}
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                disabled={isOnlineTransfer}
                className={`w-full px-4 py-2 bg-gray-700 border-2 text-white placeholder-gray-500 rounded-lg focus:outline-none transition-colors ${
                  errors.branch
                    ? "border-red-500"
                    : "border-blue-600/30 focus:border-blue-500"
                } ${isOnlineTransfer ? "opacity-50 cursor-not-allowed" : ""}`}
              />
              {errors.branch && (
                <p className="text-red-400 text-xs mt-1">{errors.branch}</p>
              )}
            </div>
          </div>

          {/* Online Transfer Checkbox */}
          <div className="flex items-center gap-3 bg-gray-700/50 p-4 rounded-lg border border-gray-600">
            <input
              type="checkbox"
              id="onlineTransfer"
              checked={isOnlineTransfer}
              onChange={(e) => {
                setIsOnlineTransfer(e.target.checked);
                if (e.target.checked) {
                  setBranch("");
                }
              }}
              className="w-5 h-5 accent-blue-600 cursor-pointer"
            />
            <label
              htmlFor="onlineTransfer"
              className="text-sm text-gray-200 cursor-pointer flex-1"
            >
              Online Transfer (e-Banking/Mobile Banking)
            </label>
          </div>

          {/* Receipt Number */}
          <div>
            <label className="block text-sm font-semibold text-blue-400 mb-2">
              Receipt/Reference Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g., REC-2024-001234"
              value={receiptNumber}
              onChange={(e) => setReceiptNumber(e.target.value)}
              className={`w-full px-4 py-2 bg-gray-700 border-2 text-white placeholder-gray-500 rounded-lg focus:outline-none transition-colors ${
                errors.receiptNumber
                  ? "border-red-500"
                  : "border-blue-600/30 focus:border-blue-500"
              }`}
            />
            {errors.receiptNumber && (
              <p className="text-red-400 text-xs mt-1">{errors.receiptNumber}</p>
            )}
          </div>

          {/* Payment Date & Time */}
          <div>
            <label className="block text-sm font-semibold text-blue-400 mb-2">
              Payment Date & Time <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              value={paymentDateTime}
              onChange={(e) => setPaymentDateTime(e.target.value)}
              className={`w-full px-4 py-2 bg-gray-700 border-2 text-white rounded-lg focus:outline-none transition-colors ${
                errors.paymentDateTime
                  ? "border-red-500"
                  : "border-blue-600/30 focus:border-blue-500"
              }`}
            />
            {errors.paymentDateTime && (
              <p className="text-red-400 text-xs mt-1">{errors.paymentDateTime}</p>
            )}
          </div>

          {/* Paid Amount */}
          <div>
            <label className="block text-sm font-semibold text-blue-400 mb-2">
              Paid Amount (Rs.) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="Enter amount paid"
              value={paidAmount}
              onChange={(e) => setPaidAmount(e.target.value)}
              className={`w-full px-4 py-2 bg-gray-700 border-2 text-white placeholder-gray-500 rounded-lg focus:outline-none transition-colors ${
                errors.paidAmount
                  ? "border-red-500"
                  : "border-blue-600/30 focus:border-blue-500"
              }`}
            />
            {errors.paidAmount && (
              <p className="text-red-400 text-xs mt-1">{errors.paidAmount}</p>
            )}
            {paidAmount && !errors.paidAmount && (
              <div className="mt-2 text-xs text-blue-300">
                <p>Amount to be collected: Rs. {Math.max(0, totalAmount - parseFloat(paidAmount)).toFixed(2)}</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 border-t border-gray-700">
            <button
              onClick={handleSave}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Save Payment Details
            </button>
            <button
              onClick={handleClose}
              className="flex-1 bg-gray-700 text-gray-300 py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BankPaymentModal;
