import React, { useState, useEffect } from "react";

interface BankPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (paymentData: BankPaymentData) => void;
  totalAmount: number;
}

export interface BankPaymentData {
  bank: string;
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
}) => {
  const [bank, setBank] = useState("");
  const [isOnlineTransfer, setIsOnlineTransfer] = useState(false);
  const [branch, setBranch] = useState("");
  const [receiptNumber, setReceiptNumber] = useState("");
  const [paymentDateTime, setPaymentDateTime] = useState("");
  const [paidAmount, setPaidAmount] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

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

    if (!bank.trim()) {
      newErrors.bank = "Bank is required";
    }

    if (!receiptNumber.trim()) {
      newErrors.receiptNumber = "Receipt number is required";
    }

    if (!isOnlineTransfer && !branch.trim()) {
      newErrors.branch = "Branch is required for bank transfer";
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
      onSave({
        bank,
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
            <p className="text-sm text-blue-300 mb-1">Total Order Amount</p>
            <p className="text-3xl font-bold text-blue-400">Rs. {totalAmount.toFixed(2)}</p>
          </div>

          {/* Bank Selection */}
          <div>
            <label className="block text-sm font-semibold text-blue-400 mb-2">
              Select Bank <span className="text-red-500">*</span>
            </label>
            <select
              value={bank}
              onChange={(e) => {
                setBank(e.target.value);
                setBranch("");
              }}
              className={`w-full px-4 py-2 bg-gray-700 border-2 text-white rounded-lg focus:outline-none transition-colors ${
                errors.bank
                  ? "border-red-500"
                  : "border-blue-600/30 focus:border-blue-500"
              }`}
            >
              <option value="">-- Select Bank --</option>
              <option value="boc">Bank of Ceylon (BOC)</option>
              <option value="commercial">Commercial Bank</option>
            </select>
            {errors.bank && (
              <p className="text-red-400 text-xs mt-1">{errors.bank}</p>
            )}
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

          {/* Branch Selection - Hidden if Online Transfer */}
          {!isOnlineTransfer && bank && (
            <div className="animate-slideDown">
              <label className="block text-sm font-semibold text-blue-400 mb-2">
                Select Branch <span className="text-red-500">*</span>
              </label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className={`w-full px-4 py-2 bg-gray-700 border-2 text-white rounded-lg focus:outline-none transition-colors ${
                  errors.branch
                    ? "border-red-500"
                    : "border-blue-600/30 focus:border-blue-500"
                }`}
              >
                <option value="">-- Select Branch --</option>
                {bankBranches[bank]?.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
              {errors.branch && (
                <p className="text-red-400 text-xs mt-1">{errors.branch}</p>
              )}
            </div>
          )}

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
