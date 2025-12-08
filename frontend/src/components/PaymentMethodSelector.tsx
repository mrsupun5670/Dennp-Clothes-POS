import React from "react";

interface PaymentMethodSelectorProps {
  paymentMethod: "cash" | "bank";
  onPaymentMethodChange: (method: "cash" | "bank") => void;
  onBankPaymentClick: () => void;
  paidAmount: string;
  totalAmount: number;
  previouslyPaidAmount?: number;
  isEditingOrder?: boolean;
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
  previouslyPaidAmount = 0,
  isEditingOrder = false,
  bankPaymentDetails,
}) => {
  const paidAmountNum = parseFloat(paidAmount) || 0;

  // For edit mode: calculate new balance payable based on total - previously paid - new payment
  // For new order: calculate balance based on total - new payment
  const balancePayable = isEditingOrder
    ? Math.max(0, totalAmount - previouslyPaidAmount - paidAmountNum)
    : totalAmount - paidAmountNum;

  const getBalanceDisplay = () => {
    if (paidAmountNum === 0) return null;

    return (
      <div
        className={`text-[10px] font-semibold px-2 py-1 rounded text-center ${
          balancePayable === 0
            ? "bg-green-900/40 text-green-400"
            : balancePayable < 0
            ? "bg-blue-900/40 text-blue-400"
            : "bg-red-900/40 text-red-400"
        }`}
      >
        {balancePayable === 0
          ? "✓ Full Payment"
          : balancePayable < 0
          ? `Excess: Rs. ${Math.abs(balancePayable).toFixed(2)}`
          : `Due: Rs. ${balancePayable.toFixed(2)}`}
      </div>
    );
  };

  return (
    <div className="space-y-2">
      {/* Payment Method Selection - Horizontal Layout */}
      <div className="space-y-1">
        <label className="block text-xs font-semibold text-red-400">
          Payment Method <span className="text-red-500">*</span>
        </label>

        {/* Radio Buttons - Side by Side */}
        <div className="grid grid-cols-2 gap-2">
          {/* Cash Option */}
          <div
            onClick={() => onPaymentMethodChange("cash")}
            className={`flex items-center gap-2 px-2 py-1.5 rounded-lg border-2 cursor-pointer transition-all ${
              paymentMethod === "cash"
                ? "bg-green-900/30 border-green-600/50"
                : "bg-gray-700/50 border-gray-600"
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                paymentMethod === "cash"
                  ? "border-green-600 bg-green-600"
                  : "border-gray-500"
              }`}
            >
              {paymentMethod === "cash" && (
                <div className="w-1.5 h-1.5 bg-white rounded-full" />
              )}
            </div>
            <label className="text-xs text-gray-200 cursor-pointer">
              💵 Cash
            </label>
          </div>

          {/* Bank Option */}
          <div
            onClick={() => onPaymentMethodChange("bank")}
            className={`flex items-center gap-2 px-2 py-1.5 rounded-lg border-2 cursor-pointer transition-all ${
              paymentMethod === "bank"
                ? "bg-blue-900/30 border-blue-600/50"
                : "bg-gray-700/50 border-gray-600"
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                paymentMethod === "bank"
                  ? "border-blue-600 bg-blue-600"
                  : "border-gray-500"
              }`}
            >
              {paymentMethod === "bank" && (
                <div className="w-1.5 h-1.5 bg-white rounded-full" />
              )}
            </div>
            <label className="text-xs text-gray-200 cursor-pointer">
              🏦 Bank
            </label>
          </div>
        </div>
      </div>

      {/* Bank Section - Show Bank Details Button */}
      {paymentMethod === "bank" && (
        <div className="space-y-2 bg-blue-900/20 border border-blue-600/30 rounded-lg p-2 animate-fadeIn">
          <p className="text-[10px] text-blue-300">
            Bank transfer payment will be recorded separately.
          </p>

          {!bankPaymentDetails ? (
            <button
              onClick={onBankPaymentClick}
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-xs"
            >
              <span>🏦</span> Add Bank Details
            </button>
          ) : (
            <div className="bg-gray-700/50 rounded-lg p-2 space-y-2 animate-fadeIn">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] text-blue-300">Bank Payment Added</p>
                  <p className="text-xs font-semibold text-gray-200 mt-0.5">
                    {bankPaymentDetails.bank === "boc" ? "BOC" : "Commercial"}
                    {bankPaymentDetails.isOnlineTransfer && " • Online"}
                  </p>
                </div>
                <button
                  onClick={onBankPaymentClick}
                  className="text-blue-400 hover:text-blue-300 text-[10px] font-semibold"
                >
                  Edit
                </button>
              </div>

              <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                {!bankPaymentDetails.isOnlineTransfer && (
                  <div className="text-gray-400">
                    <p className="text-blue-300 font-semibold">Branch</p>
                    <p className="truncate">{bankPaymentDetails.branch}</p>
                  </div>
                )}
                <div className="text-gray-400">
                  <p className="text-blue-300 font-semibold">Receipt #</p>
                  <p className="truncate">{bankPaymentDetails.receiptNumber}</p>
                </div>
                <div className="text-gray-400">
                  <p className="text-blue-300 font-semibold">Date & Time</p>
                  <p className="truncate">{new Date(bankPaymentDetails.paymentDateTime).toLocaleString()}</p>
                </div>
                <div className="text-gray-400">
                  <p className="text-blue-300 font-semibold">Amount</p>
                  <p>Rs. {parseFloat(bankPaymentDetails.paidAmount).toFixed(2)}</p>
                </div>
              </div>

              {/* Balance Display for Bank Payment */}
              <div className="pt-1 border-t border-gray-600">
                {getBalanceDisplay()}
              </div>
            </div>
          )}

          <p className="text-[10px] text-blue-300">
            ℹ️ Bill can be saved without payment.
          </p>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodSelector;
