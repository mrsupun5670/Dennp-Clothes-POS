import React from "react";

interface PaymentMethodSelectorProps {
  paymentMethod: "cash" | "bank";
  onPaymentMethodChange: (method: "cash" | "bank") => void;
  onBankPaymentClick: () => void;
  paidAmount: string;
  totalAmount: number;
  bankPaymentDetails?: {
    bank: string;
    isOnlineTransfer: boolean;
    branch: string;
    receiptNumber: string;
    paymentDateTime: string;
    paidAmount: string;
  } | null;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  paymentMethod,
  onPaymentMethodChange,
  onBankPaymentClick,
  paidAmount,
  totalAmount,
  bankPaymentDetails,
}) => {
  const paidAmountNum = parseFloat(paidAmount) || 0;
  const balance = totalAmount - paidAmountNum;

  const getBalanceDisplay = () => {
    if (paidAmountNum === 0) return null;

    return (
      <div
        className={`text-sm font-semibold p-2 rounded text-center ${
          balance === 0
            ? "bg-green-900/40 text-green-400"
            : balance < 0
            ? "bg-blue-900/40 text-blue-400"
            : "bg-red-900/40 text-red-400"
        }`}
      >
        {balance === 0
          ? "✓ Full Payment"
          : balance < 0
          ? `Excess: Rs. ${Math.abs(balance).toFixed(2)}`
          : `Balance Due: Rs. ${balance.toFixed(2)}`}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Payment Method Selection */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-red-400">
          Payment Method <span className="text-red-500">*</span>
        </label>

        {/* Radio Buttons */}
        <div className="space-y-2">
          {/* Cash Option */}
          <div
            onClick={() => onPaymentMethodChange("cash")}
            className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
              paymentMethod === "cash"
                ? "bg-green-900/30 border-green-600/50"
                : "bg-gray-700/50 border-gray-600"
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                paymentMethod === "cash"
                  ? "border-green-600 bg-green-600"
                  : "border-gray-500"
              }`}
            >
              {paymentMethod === "cash" && (
                <div className="w-2 h-2 bg-white rounded-full" />
              )}
            </div>
            <label className="text-sm text-gray-200 cursor-pointer flex-1">
              💵 Cash Payment
            </label>
            <span className="text-xs text-gray-400">Immediate payment</span>
          </div>

          {/* Bank Option */}
          <div
            onClick={() => onPaymentMethodChange("bank")}
            className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
              paymentMethod === "bank"
                ? "bg-blue-900/30 border-blue-600/50"
                : "bg-gray-700/50 border-gray-600"
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                paymentMethod === "bank"
                  ? "border-blue-600 bg-blue-600"
                  : "border-gray-500"
              }`}
            >
              {paymentMethod === "bank" && (
                <div className="w-2 h-2 bg-white rounded-full" />
              )}
            </div>
            <label className="text-sm text-gray-200 cursor-pointer flex-1">
              🏦 Bank/Online Transfer
            </label>
            <span className="text-xs text-gray-400">Verify & add later</span>
          </div>
        </div>
      </div>

      {/* Amount to Pay Display */}
      <div className="bg-gray-700/30 border border-gray-600 rounded-lg p-3 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400">Amount to Collect:</span>
          <span className="text-lg font-bold text-gray-200">Rs. {totalAmount.toFixed(2)}</span>
        </div>

        {paidAmountNum > 0 && (
          <>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Amount Paid:</span>
              <span className="text-lg font-semibold text-gray-200">Rs. {paidAmountNum.toFixed(2)}</span>
            </div>
            {getBalanceDisplay()}
          </>
        )}
      </div>

      {/* Bank Section - Show Bank Details Button */}
      {paymentMethod === "bank" && (
        <div className="space-y-3 bg-blue-900/20 border border-blue-600/30 rounded-lg p-4 animate-fadeIn">
          <div className="space-y-2">
            <p className="text-sm text-blue-300">
              Bank transfer payment will be recorded separately once verified.
            </p>

            {!bankPaymentDetails ? (
              <button
                onClick={onBankPaymentClick}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <span>🏦</span> Add Bank Payment Details
              </button>
            ) : (
              <div className="bg-gray-700/50 rounded-lg p-4 space-y-3 animate-fadeIn">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-blue-300">Bank Payment Added</p>
                    <p className="text-sm font-semibold text-gray-200 mt-1">
                      {bankPaymentDetails.bank === "boc"
                        ? "Bank of Ceylon (BOC)"
                        : "Commercial Bank"}
                      {bankPaymentDetails.isOnlineTransfer && " • Online Transfer"}
                    </p>
                  </div>
                  <button
                    onClick={onBankPaymentClick}
                    className="text-blue-400 hover:text-blue-300 text-sm font-semibold"
                  >
                    Edit
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  {!bankPaymentDetails.isOnlineTransfer && (
                    <div className="text-gray-400">
                      <p className="text-blue-300 font-semibold mb-1">Branch</p>
                      <p>{bankPaymentDetails.branch}</p>
                    </div>
                  )}
                  <div className="text-gray-400">
                    <p className="text-blue-300 font-semibold mb-1">Receipt #</p>
                    <p>{bankPaymentDetails.receiptNumber}</p>
                  </div>
                  <div className="text-gray-400">
                    <p className="text-blue-300 font-semibold mb-1">Date & Time</p>
                    <p>{new Date(bankPaymentDetails.paymentDateTime).toLocaleString()}</p>
                  </div>
                  <div className="text-gray-400">
                    <p className="text-blue-300 font-semibold mb-1">Amount</p>
                    <p>Rs. {parseFloat(bankPaymentDetails.paidAmount).toFixed(2)}</p>
                  </div>
                </div>

                {/* Balance Display for Bank Payment */}
                <div className="pt-2 border-t border-gray-600">
                  {getBalanceDisplay()}
                </div>
              </div>
            )}
          </div>

          <p className="text-xs text-blue-300 pt-2">
            ℹ️ Bill can be saved without payment. Payment will be verified later.
          </p>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodSelector;
