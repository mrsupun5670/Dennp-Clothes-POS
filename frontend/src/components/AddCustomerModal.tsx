import React, { useState } from "react";
import { useShop } from "../context/ShopContext";
import { API_URL } from "../config/api";

interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCustomerAdded?: (customer: any) => void;
}

const AddCustomerModal: React.FC<AddCustomerModalProps> = ({
  isOpen,
  onClose,
  onCustomerAdded,
}) => {
  const { shopId } = useShop();
  const [isLoading, setIsLoading] = useState(false);
  const [modalErrorMessage, setModalErrorMessage] = useState("");
  const [modalSuccessMessage, setModalSuccessMessage] = useState("");
  const [formData, setFormData] = useState({
    customer_id: "",
    mobile: "",
    email: "",
  });

  const handleCloseModal = () => {
    setFormData({
      customer_id: "",
      mobile: "",
      email: "",
    });
    setModalErrorMessage("");
    setModalSuccessMessage("");
    onClose();
  };

  const handleSaveCustomer = async () => {
    if (!shopId) {
      setModalErrorMessage("Shop ID is required");
      return;
    }

    if (!formData.customer_id || String(formData.customer_id).trim() === "") {
      setModalErrorMessage("Customer ID is required");
      return;
    }

    if (isNaN(parseInt(String(formData.customer_id)))) {
      setModalErrorMessage("Customer ID must be a valid number");
      return;
    }

    if (!formData.mobile || String(formData.mobile).trim() === "") {
      setModalErrorMessage("Mobile number is required");
      return;
    }

    // Email validation (optional but must be valid if provided)
    if (
      formData.email &&
      String(formData.email).trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    ) {
      setModalErrorMessage("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    setModalErrorMessage("");
    setModalSuccessMessage("");

    try {
      const response = await fetch(`${API_URL}/customers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_id: parseInt(formData.customer_id),
          shop_id: shopId,
          mobile: formData.mobile,
          email: formData.email || null,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setModalSuccessMessage("Customer created successfully!");

        const newCustomer = {
          customer_id: parseInt(formData.customer_id),
          id: formData.customer_id,
          mobile: formData.mobile,
          email: formData.email,
          total_spent: 0,
          totalSpent: 0,
          orders_count: 0,
          totalOrders: 0,
          created_at: new Date().toISOString(),
          joined: new Date().toISOString().split("T")[0],
        };

        if (onCustomerAdded) {
          onCustomerAdded(newCustomer);
        }

        setTimeout(() => {
          handleCloseModal();
        }, 1500);
      } else {
        // Check if it's a duplicate mobile number error
        const errorMessage = result.error || "Failed to create customer";
        if (
          errorMessage.includes("unique_mobile_per_shop") ||
          errorMessage.includes("Duplicate entry")
        ) {
          setModalErrorMessage(
            `This mobile number (${formData.mobile}) is already registered in this shop`
          );
        } else {
          setModalErrorMessage(errorMessage);
        }
      }
    } catch (error: any) {
      console.error("Error creating customer:", error);
      setModalErrorMessage(error.message || "Failed to create customer");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg shadow-2xl border-2 border-red-600 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-red-700 to-red-900 text-white p-6 border-b border-red-600 flex justify-between items-center sticky top-0">
          <h2 className="text-2xl font-bold">Add New Customer</h2>
          <button
            onClick={handleCloseModal}
            className="text-white hover:text-red-200 transition-colors text-2xl"
          >
            X
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Modal Error Message */}
          {modalErrorMessage && (
            <div className="bg-red-900/30 border-2 border-red-600 text-red-300 p-3 rounded-lg flex items-start gap-3">
              <span className="text-xl">✕</span>
              <div>
                <p className="font-semibold">{modalErrorMessage}</p>
              </div>
            </div>
          )}

          {/* Modal Success Message */}
          {modalSuccessMessage && (
            <div className="bg-green-900/30 border-2 border-green-600 text-green-300 p-3 rounded-lg flex items-start gap-3">
              <span className="text-xl">✓</span>
              <div>
                <p className="font-semibold">{modalSuccessMessage}</p>
              </div>
            </div>
          )}

          {/* Customer ID */}
          <div>
            <label className="block text-sm font-semibold text-red-400 mb-2">
              Customer ID <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              placeholder="e.g., 1001"
              value={formData.customer_id || ""}
              onChange={(e) =>
                setFormData({ ...formData, customer_id: e.target.value })
              }
              onKeyDown={(e) => {
                if (e.key === "Enter" && String(formData.customer_id || "").trim()) {
                  (document.querySelector('input[placeholder*="Mobile"]') as HTMLInputElement)?.focus();
                }
              }}
              className="w-full px-4 py-2 bg-gray-700 border-2 border-red-600/30 text-white placeholder-gray-500 rounded-lg focus:border-red-500 focus:outline-none"
            />
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block text-sm font-semibold text-red-400 mb-2">
              Mobile Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              placeholder="e.g., +94-71-1234567"
              value={formData.mobile || ""}
              onChange={(e) =>
                setFormData({ ...formData, mobile: e.target.value })
              }
              onKeyDown={(e) => {
                if (e.key === "Enter" && String(formData.mobile || "").trim()) {
                  (document.querySelector('input[placeholder*="customer@example.com"]') as HTMLInputElement)?.focus();
                }
              }}
              className="w-full px-4 py-2 bg-gray-700 border-2 border-red-600/30 text-white placeholder-gray-500 rounded-lg focus:border-red-500 focus:outline-none"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-red-400 mb-2">
              Email
            </label>
            <input
              type="email"
              placeholder="e.g., customer@example.com (optional)"
              value={formData.email || ""}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSaveCustomer();
                }
              }}
              className="w-full px-4 py-2 bg-gray-700 border-2 border-red-600/30 text-white placeholder-gray-500 rounded-lg focus:border-red-500 focus:outline-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-700">
            <button
              onClick={handleSaveCustomer}
              disabled={isLoading}
              className="flex-1 bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Saving..." : "Add Customer"}
            </button>
            <button
              onClick={handleCloseModal}
              disabled={isLoading}
              className="flex-1 bg-gray-700 text-gray-300 py-2 rounded-lg font-semibold hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCustomerModal;
