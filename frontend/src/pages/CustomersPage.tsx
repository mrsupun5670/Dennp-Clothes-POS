import React, { useState, useMemo, useEffect } from "react";
import { useQuery } from "../hooks/useQuery";
import { useShop } from "../context/ShopContext";
import { API_URL } from "../config/api";
import { printContent, saveAsPDF, generateCustomersHTML } from "../utils/exportUtils";

interface Customer {
  customer_id: number;
  first_name: string;
  last_name: string;
  email?: string;
  mobile: string;
  total_spent: number;
  orders_count: number;
  created_at: string;
  customer_status: "active" | "inactive" | "blocked";
}

const CustomersPage: React.FC = () => {
  const { shopId } = useShop();

  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    customer_id: "",
    first_name: "",
    last_name: "",
    mobile: "",
    email: "",
  });
  // Backend state
  const [isLoading, setIsLoading] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState<
    "error" | "success" | ""
  >("");

  // Modal error/success message state
  const [modalErrorMessage, setModalErrorMessage] = useState("");
  const [modalSuccessMessage, setModalSuccessMessage] = useState("");

  const {
    data: customers,
    isLoading: isLoadingCustomers,
    refetch: refetchCustomers,
  } = useQuery<Customer[]>(["customers", shopId], async () => {
    if (!shopId) {
      throw new Error("Shop ID is required");
    }
    const response = await fetch(`${API_URL}/customers?shop_id=${shopId}`);
    const result = await response.json();
    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.error || "Failed to fetch customers");
    }
  }, { enabled: shopId !== null });

  // ===================== BACKEND API FUNCTIONS =====================

  const showNotification = (message: string, type: "error" | "success") => {
    setNotificationMessage(message);
    setNotificationType(type);
    setTimeout(() => {
      setNotificationMessage("");
      setNotificationType("");
    }, 3000);
  };

  /**
   * Search customers by name/mobile
   */
  const searchCustomers = async (query: string) => {
    if (!query.trim()) {
      refetchCustomers();
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/customers/search?q=${encodeURIComponent(query)}`
      );
      const result = await response.json();
      if (result.success) {
        // This is a temporary solution for search. Ideally, the search results
        // should be handled by the useQuery hook as well, but for now, we'll
        // just update the state directly.
        // setCustomers(result.data);
      } else {
        showNotification(result.error || "Failed to search customers", "error");
      }
    } catch (error: any) {
      console.error("Error searching customers:", error);
      showNotification(error.message || "Failed to search customers", "error");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Create new customer
   */
  const createCustomer = async () => {
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
        await refetchCustomers();
        setTimeout(() => {
          handleCloseModal();
          setIsLoading(false);
        }, 500);
      } else {
        // Check if it's a duplicate mobile number error
        const errorMessage = result.error || "Failed to create customer";
        if (errorMessage.includes("unique_mobile_per_shop") || errorMessage.includes("Duplicate entry")) {
          setModalErrorMessage(`This mobile number (${formData.mobile}) is already registered in this shop`);
        } else {
          setModalErrorMessage(errorMessage);
        }
        setIsLoading(false);
      }
    } catch (error: any) {
      console.error("Error creating customer:", error);
      setModalErrorMessage(error.message || "Failed to create customer");
      setIsLoading(false);
    }
  };

  /**
   * Update existing customer
   */
  const updateCustomer = async () => {
    if (!selectedCustomerId) return;

    setIsLoading(true);
    setModalErrorMessage("");
    setModalSuccessMessage("");

    try {
      const response = await fetch(
        `${API_URL}/customers/${selectedCustomerId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            shop_id: shopId,
            mobile: formData.mobile,
            email: formData.email || null,
          }),
        }
      );

      const result = await response.json();
      if (result.success) {
        setModalSuccessMessage("Customer updated successfully!");
        await refetchCustomers();
        setTimeout(() => {
          handleCloseModal();
          setIsLoading(false);
        }, 500);
      } else {
        // Check if it's a duplicate mobile number error
        const errorMessage = result.error || "Failed to update customer";
        if (errorMessage.includes("unique_mobile_per_shop") || errorMessage.includes("Duplicate entry")) {
          setModalErrorMessage(`This mobile number (${formData.mobile}) is already registered in this shop`);
        } else {
          setModalErrorMessage(errorMessage);
        }
        setIsLoading(false);
      }
    } catch (error: any) {
      console.error("Error updating customer:", error);
      setModalErrorMessage(error.message || "Failed to update customer");
      setIsLoading(false);
    }
  };

  // Handle search with debounce
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchQuery.trim()) {
        searchCustomers(searchQuery);
      } else {
        refetchCustomers();
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, refetchCustomers]);

  // Filter customers based on status
  const filteredCustomers = useMemo(() => {
    let result = [...(customers || [])];

    // Filter by status
    if (statusFilter !== "all") {
      result = result.filter(
        (customer) => customer.customer_status === statusFilter
      );
    }

    return result;
  }, [customers, statusFilter]);

  const handleAddClick = () => {
    setIsEditMode(false);
    setSelectedCustomerId(null);
    setFormData({ customer_id: "", first_name: "", last_name: "", mobile: "", email: "" });
    setModalErrorMessage("");
    setModalSuccessMessage("");
    setShowAddModal(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setIsEditMode(true);
    setSelectedCustomerId(customer.customer_id);
    setFormData({
      customer_id: customer.customer_id.toString(),
      first_name: customer.first_name,
      last_name: customer.last_name,
      email: customer.email || "",
      mobile: customer.mobile,
    });
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setIsEditMode(false);
    setSelectedCustomerId(null);
    setFormData({ customer_id: "", first_name: "", last_name: "", mobile: "", email: "" });
    setModalErrorMessage("");
    setModalSuccessMessage("");
  };

  const handleSaveCustomer = () => {
    setModalErrorMessage("");

    // Only validate customer_id when creating new customer
    if (!isEditMode) {
      if (!formData.customer_id || String(formData.customer_id).trim() === "") {
        setModalErrorMessage("Customer ID is required");
        return;
      }

      if (isNaN(parseInt(String(formData.customer_id)))) {
        setModalErrorMessage("Customer ID must be a valid number");
        return;
      }
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

    if (isEditMode) {
      updateCustomer();
    } else {
      createCustomer();
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-900/50 text-green-400 border border-green-600/50";
      case "inactive":
        return "bg-yellow-900/50 text-yellow-400 border border-yellow-600/50";
      case "blocked":
        return "bg-red-900/50 text-red-400 border border-red-600/50";
      default:
        return "bg-gray-700/50 text-gray-400";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Active";
      case "inactive":
        return "Inactive";
      case "blocked":
        return "Blocked";
      default:
        return "Unknown";
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Notification Display */}
      {notificationMessage && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg border-2 ${
            notificationType === "error"
              ? "bg-red-900/90 border-red-600/50 text-red-200"
              : "bg-green-900/90 border-green-600/50 text-green-200"
          }`}
        >
          <p className="font-semibold">{notificationMessage}</p>
        </div>
      )}

      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-red-500">Customers</h1>
            <span className="text-sm font-semibold text-red-400 bg-red-900/30 px-3 py-1 rounded-full">
              {filteredCustomers.length} customers
            </span>
          </div>
          <p className="text-gray-400 mt-2">
            Manage customer information and profiles
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              const html = generateCustomersHTML(filteredCustomers);
              printContent(html, 'Customers Report');
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center gap-2"
            title="Print directly"
          >
            🖨️ Print
          </button>
          <button
            onClick={() => {
              const html = generateCustomersHTML(filteredCustomers);
              saveAsPDF(html, 'customers_report', 'customers');
            }}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center gap-2"
            title="Save as image"
          >
            💾 Save Image
          </button>
          <button
            onClick={handleAddClick}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors font-semibold"
          >
            + Add Customer
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-red-400">
          Search Customers
        </label>
        <input
          type="text"
          placeholder="Search by name or mobile..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 bg-gray-700 border-2 border-red-600/30 text-white placeholder-gray-500 rounded-lg focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 transition-colors"
        />
      </div>

      {/* Status Filter */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-red-400">
          Filter by Status
        </label>
        <div className="flex gap-2 flex-wrap">
          {[
            {
              value: "all",
              label: "All Customers",
              color: "bg-gray-600 hover:bg-gray-700",
              count: customers?.length || 0,
            },
            {
              value: "active",
              label: "Active",
              color: "bg-green-600 hover:bg-green-700",
              count: customers?.filter((c) => c.customer_status === "active")
                .length || 0,
            },
            {
              value: "inactive",
              label: "Inactive",
              color: "bg-yellow-600 hover:bg-yellow-700",
              count: customers?.filter((c) => c.customer_status === "inactive")
                .length || 0,
            },
          ].map((filter) => (
            <button
              key={filter.value}
              onClick={() =>
                setStatusFilter(filter.value as "all" | "active" | "inactive")
              }
              className={`px-4 py-2 rounded-full font-semibold text-white transition-all ${
                statusFilter === filter.value
                  ? `${filter.color} ring-2 ring-offset-2 ring-offset-gray-800`
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              {filter.label}
              <span className="ml-2 bg-black/30 px-2 py-0.5 rounded-full text-xs">
                {filter.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Customers Table - Scrollable */}
      <div className="flex-1 overflow-hidden flex flex-col bg-gray-800/50 border border-gray-700 rounded-lg">
        <div className="overflow-x-auto overflow-y-auto flex-1">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-400 text-lg">Loading customers...</p>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-400 text-lg">No customers found</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              {/* Sticky Table Header */}
              <thead className="sticky top-0 bg-gray-700/80 border-b-2 border-red-600 z-10">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-red-400">
                    Customer ID
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-red-400">
                    Mobile
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-red-400">
                    Email
                  </th>
                  <th className="px-6 py-3 text-right font-semibold text-red-400">
                    Total Orders
                  </th>
                  <th className="px-6 py-3 text-right font-semibold text-red-400">
                    Total Spent (Rs.)
                  </th>
                </tr>
              </thead>

              {/* Table Body - Scrollable Rows */}
              <tbody className="divide-y divide-gray-700">
                {filteredCustomers.map((customer) => (
                  <tr
                    key={customer.customer_id}
                    onClick={() => setSelectedCustomerId(customer.customer_id)}
                    onDoubleClick={() => handleEditCustomer(customer)}
                    className={`cursor-pointer transition-all duration-200 ${
                      selectedCustomerId === customer.customer_id
                        ? "bg-red-900/40 border-l-4 border-l-red-600"
                        : "hover:bg-gray-700/30 border-l-4 border-l-transparent"
                    }`}
                    title="Double-click to edit"
                  >
                    <td className="px-6 py-4 text-gray-200 font-medium font-mono">
                      C{String(customer.customer_id).padStart(3, "0")}
                    </td>
                    <td className="px-6 py-4 text-gray-400">
                      {customer.mobile}
                    </td>
                    <td className="px-6 py-4 text-gray-400">
                      {customer.email || "-"}
                    </td>
                    <td className="px-6 py-4 text-right text-white font-semibold">
                      {customer.orders_count || 0}
                    </td>
                    <td className="px-6 py-4 text-right text-red-400 font-semibold">
                      Rs.{" "}
                      {customer.total_spent
                        ? parseFloat(customer.total_spent.toString()).toFixed(2)
                        : "0.00"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Address View Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg shadow-2xl border-2 border-red-600 w-full max-w-2xl">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-red-700 to-red-900 text-white p-6 border-b border-red-600 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">
                  {formData.first_name} {formData.last_name}
                </h2>
                <p className="text-red-200 text-sm mt-1">
                  Mobile: {formData.mobile}
                </p>
              </div>
              <button
                onClick={() => setShowAddressModal(false)}
                className="text-white hover:text-red-200 transition-colors text-2xl"
              >
                X
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Contact Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4">
                  <p className="text-xs text-gray-400 font-semibold mb-1">
                    Email
                  </p>
                  <p className="text-gray-200 font-medium">
                    {formData.email || "N/A"}
                  </p>
                </div>
                <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4">
                  <p className="text-xs text-gray-400 font-semibold mb-1">
                    Mobile
                  </p>
                  <p className="text-gray-200 font-medium">{formData.mobile}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-700">
                <button
                  onClick={() => setShowAddressModal(false)}
                  className="flex-1 bg-gray-700 text-gray-300 py-2 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg shadow-2xl border-2 border-red-600 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-red-700 to-red-900 text-white p-6 border-b border-red-600 flex justify-between items-center sticky top-0">
              <h2 className="text-2xl font-bold">
                {isEditMode ? "Edit Customer" : "Add New Customer"}
              </h2>
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
                    if (e.key === 'Enter' && String(formData.customer_id || "").trim()) {
                      (document.querySelector('input[placeholder*="Mobile"]') as HTMLInputElement)?.focus();
                    }
                  }}
                  disabled={isEditMode}
                  className="w-full px-4 py-2 bg-gray-700 border-2 border-red-600/30 text-white placeholder-gray-500 rounded-lg focus:border-red-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
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
                    if (e.key === 'Enter' && String(formData.mobile || "").trim()) {
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
                    if (e.key === 'Enter') {
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
                  {isLoading
                    ? "Saving..."
                    : isEditMode
                      ? "Update Customer"
                      : "Add Customer"}
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
      )}
    </div>
  );
};

export default CustomersPage;
