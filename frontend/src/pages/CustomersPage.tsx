import React, { useState, useMemo } from "react";

// Helper function to print customers
const handlePrintCustomers = (customers: any[]) => {
  const printWindow = window.open("", "", "width=1000,height=600");
  if (printWindow) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Customers Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #ef4444; text-align: center; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background-color: #374151; color: white; padding: 10px; text-align: left; border: 1px solid #1f2937; }
          td { padding: 8px; border: 1px solid #d1d5db; }
          tr:nth-child(even) { background-color: #f9fafb; }
          .text-right { text-align: right; }
        </style>
      </head>
      <body>
        <h1>Customers Report</h1>
        <p style="text-align: center; color: #666;">Generated on ${new Date().toLocaleString()}</p>
        <table>
          <thead>
            <tr>
              <th>Customer ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Mobile</th>
              <th class="text-right">Total Spent (Rs.)</th>
              <th class="text-right">Total Orders</th>
              <th>Joined Date</th>
            </tr>
          </thead>
          <tbody>
            ${customers.map(c => `
              <tr>
                <td>${c.id}</td>
                <td>${c.name}</td>
                <td>${c.email}</td>
                <td>${c.mobile}</td>
                <td class="text-right">Rs. ${c.totalSpent.toFixed(2)}</td>
                <td class="text-right">${c.totalOrders}</td>
                <td>${c.joined}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <p style="margin-top: 30px; color: #666; font-size: 12px;">Total Customers: ${customers.length}</p>
      </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 250);
  }
};

interface Address {
  province: string;
  district: string;
  city: string;
  line1: string;
  line2: string;
  postalCode: string;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  mobile: string;
  totalSpent: number;
  totalOrders: number;
  joined: string;
  address: Address;

  // Payment tracking
  totalPaymentDue: number; // Total outstanding payments
  pendingPaymentOrders: string[]; // Array of order IDs with pending payments
  paymentStatus: "no_dues" | "pending" | "overdue"; // Payment status
  lastOrderDate?: string;
  notes?: string;
  isActive: boolean;
}

const CustomersPage: React.FC = () => {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    email: "",
    mobile: "",
  });
  const [addressData, setAddressData] = useState<Address>({
    province: "",
    district: "",
    city: "",
    line1: "",
    line2: "",
    postalCode: "",
  });

  // Sample customers data
  const [customers, setCustomers] = useState<Customer[]>([
    {
      id: "C001",
      name: "John Doe",
      email: "john@example.com",
      mobile: "+92-300-1234567",
      totalSpent: 12750.50,
      totalOrders: 3,
      joined: "2023-06-15",
      address: {
        province: "Western",
        district: "Colombo",
        city: "Colombo City",
        line1: "123 Main Street",
        line2: "Apartment 4B",
        postalCode: "00100",
      },
      totalPaymentDue: 3750.50,
      pendingPaymentOrders: ["ORD001"],
      paymentStatus: "pending",
      lastOrderDate: "2024-11-15",
      notes: "Reliable customer",
      isActive: true,
    },
    {
      id: "C002",
      name: "Sarah Smith",
      email: "sarah@example.com",
      mobile: "+92-300-5678901",
      totalSpent: 6000.75,
      totalOrders: 2,
      joined: "2023-08-20",
      address: {
        province: "Central",
        district: "Kandy",
        city: "Kandy City",
        line1: "456 Oak Avenue",
        line2: "",
        postalCode: "20000",
      },
      totalPaymentDue: 1200.00,
      pendingPaymentOrders: ["ORD005"],
      paymentStatus: "pending",
      lastOrderDate: "2024-11-05",
      notes: "New customer",
      isActive: true,
    },
    {
      id: "C003",
      name: "Ahmed Khan",
      email: "ahmed@example.com",
      mobile: "+92-300-9876543",
      totalSpent: 4250.00,
      totalOrders: 1,
      joined: "2023-03-10",
      address: {
        province: "Southern",
        district: "Galle",
        city: "Galle City",
        line1: "789 Pine Road",
        line2: "House 42",
        postalCode: "80000",
      },
      totalPaymentDue: 0,
      pendingPaymentOrders: [],
      paymentStatus: "no_dues",
      lastOrderDate: "2024-11-08",
      notes: "Paid in full",
      isActive: true,
    },
  ]);

  // Sri Lankan address hierarchy (sample data)
  const addressHierarchy = {
    provinces: [
      "Western",
      "Central",
      "Southern",
      "Northern",
      "Eastern",
      "North-Western",
      "North-Central",
      "Sabaragamuwa",
      "Uva",
    ],
    districts: {
      Western: ["Colombo", "Gampaha", "Kalutara"],
      Central: ["Kandy", "Matara", "Nuwara Eliya"],
      Southern: ["Galle", "Matara", "Hambantota"],
      Northern: ["Jaffna", "Mullaitivu", "Vavuniya"],
      Eastern: ["Batticaloa", "Trincomalee", "Ampara"],
      "North-Western": ["Kurunegala", "Puttalam"],
      "North-Central": ["Polonnaruwa", "Matale"],
      Sabaragamuwa: ["Ratnapura", "Kegalle"],
      Uva: ["Badulla", "Monaragala"],
    },
    cities: {
      Colombo: ["Colombo City", "Colombo South", "Colombo North"],
      Gampaha: ["Gampaha City", "Negombo"],
      Kalutara: ["Kalutara City", "Panadura"],
      Kandy: ["Kandy City", "Peradeniya"],
      Matara: ["Matara City", "Weligama"],
      "Nuwara Eliya": ["Nuwara Eliya City", "Hatton"],
      Galle: ["Galle City", "Unawatuna"],
      Hambantota: ["Hambantota City", "Mirissa"],
      Jaffna: ["Jaffna City", "Jaffna North"],
      Mullaitivu: ["Mullaitivu City", "Batticaloa"],
      Vavuniya: ["Vavuniya City", "Vavuniya South"],
      Batticaloa: ["Batticaloa City", "Kattankudi"],
      Trincomalee: ["Trincomalee City", "China Bay"],
      Ampara: ["Ampara City", "Akkaraipattu"],
      Kurunegala: ["Kurunegala City", "Kuliyapitiya"],
      Puttalam: ["Puttalam City", "Chilaw"],
      Polonnaruwa: ["Polonnaruwa City", "Habarana"],
      Matale: ["Matale City", "Dambulla"],
      Ratnapura: ["Ratnapura City", "Eheliyagoda"],
      Kegalle: ["Kegalle City", "Mawanella"],
      Badulla: ["Badulla City", "Bandarawela"],
      Monaragala: ["Monaragala City", "Bibile"],
    },
  };

  // Filter customers based on search
  const filteredCustomers = useMemo(() => {
    let result = [...customers];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (customer) =>
          customer.name.toLowerCase().includes(query) ||
          customer.email.toLowerCase().includes(query) ||
          customer.mobile.includes(query)
      );
    }

    return result;
  }, [searchQuery, customers]);

  const handleAddClick = () => {
    setIsEditMode(false);
    setFormData({ id: "", name: "", email: "", mobile: "" });
    setAddressData({
      province: "",
      district: "",
      city: "",
      line1: "",
      line2: "",
      postalCode: "",
    });
    setShowAddModal(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setIsEditMode(true);
    setSelectedCustomerId(customer.id);
    setFormData({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      mobile: customer.mobile,
    });
    setAddressData(customer.address);
    setShowAddModal(true);
  };

  const handleViewAddress = (customer: Customer) => {
    setFormData({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      mobile: customer.mobile,
    });
    setAddressData(customer.address);
    setShowAddressModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setIsEditMode(false);
    setSelectedCustomerId(null);
    setFormData({ id: "", name: "", email: "", mobile: "" });
    setAddressData({
      province: "",
      district: "",
      city: "",
      line1: "",
      line2: "",
      postalCode: "",
    });
  };

  const handleSaveCustomer = () => {
    if (isEditMode && selectedCustomerId) {
      // Update existing customer
      setCustomers(
        customers.map((customer) =>
          customer.id === selectedCustomerId
            ? {
                ...customer,
                name: formData.name,
                email: formData.email,
                mobile: formData.mobile,
                address: addressData,
              }
            : customer
        )
      );
    } else {
      // Add new customer - generate ID
      const newId = `C${String(
        Math.max(
          ...customers
            .map((c) => parseInt(c.id.substring(1)) || 0)
        )
      ).padStart(3, "0")}`;

      const newCustomer: Customer = {
        id: newId,
        name: formData.name,
        email: formData.email,
        mobile: formData.mobile,
        totalSpent: 0,
        totalOrders: 0,
        joined: new Date().toISOString().split("T")[0],
        address: addressData,
        totalPaymentDue: 0,
        pendingPaymentOrders: [],
        paymentStatus: "no_dues",
        lastOrderDate: undefined,
        notes: "",
        isActive: true,
      };
      setCustomers([...customers, newCustomer]);
    }
    handleCloseModal();
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-red-500">Customers</h1>
            <span className="text-sm font-semibold text-red-400 bg-red-900/30 px-3 py-1 rounded-full">
              {filteredCustomers.length} customers
            </span>
          </div>
          <p className="text-gray-400 mt-2">Manage customer information and profiles</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => handlePrintCustomers(filteredCustomers)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center gap-2"
            title="Print/Export as PDF"
          >
            🖨️ Print/PDF
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
          placeholder="Search by name, email, or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 bg-gray-700 border-2 border-red-600/30 text-white placeholder-gray-500 rounded-lg focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 transition-colors"
        />
      </div>

      {/* Customers Table - Scrollable */}
      <div className="flex-1 overflow-hidden flex flex-col bg-gray-800/50 border border-gray-700 rounded-lg">
        <div className="overflow-x-auto overflow-y-auto flex-1">
          <table className="w-full text-sm">
            {/* Sticky Table Header */}
            <thead className="sticky top-0 bg-gray-700/80 border-b-2 border-red-600 z-10">
              <tr>
                <th className="px-6 py-3 text-left font-semibold text-red-400">Name</th>
                <th className="px-6 py-3 text-left font-semibold text-red-400">Email</th>
                <th className="px-6 py-3 text-left font-semibold text-red-400">Mobile</th>
                <th className="px-6 py-3 text-right font-semibold text-red-400">Total Orders</th>
                <th className="px-6 py-3 text-right font-semibold text-red-400">Total Spent (Rs.)</th>
                <th className="px-6 py-3 text-left font-semibold text-red-400">Joined</th>
              </tr>
            </thead>

            {/* Table Body - Scrollable Rows */}
            <tbody className="divide-y divide-gray-700">
              {filteredCustomers.map((customer) => (
                <tr
                  key={customer.id}
                  onClick={() => setSelectedCustomerId(customer.id)}
                  onDoubleClick={() => handleViewAddress(customer)}
                  className={`cursor-pointer transition-all duration-200 ${
                    selectedCustomerId === customer.id
                      ? "bg-red-900/40 border-l-4 border-l-red-600"
                      : "hover:bg-gray-700/30 border-l-4 border-l-transparent"
                  }`}
                  title="Double-click to view address and edit"
                >
                  <td className="px-6 py-4 text-gray-200 font-medium">{customer.name}</td>
                  <td className="px-6 py-4 text-gray-400">{customer.email}</td>
                  <td className="px-6 py-4 text-gray-400">{customer.mobile}</td>
                  <td className="px-6 py-4 text-right text-white font-semibold">
                    {customer.totalOrders}
                  </td>
                  <td className="px-6 py-4 text-right text-red-400 font-semibold">
                    {customer.totalSpent.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-sm">{customer.joined}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Address View Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg shadow-2xl border-2 border-red-600 w-full max-w-2xl">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-red-700 to-red-900 text-white p-6 border-b border-red-600 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">{formData.name}</h2>
                <p className="text-red-200 text-sm mt-1">Customer ID: {formData.id}</p>
              </div>
              <button
                onClick={() => setShowAddressModal(false)}
                className="text-white hover:text-red-200 transition-colors text-2xl"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Contact Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4">
                  <p className="text-xs text-gray-400 font-semibold mb-1">Email</p>
                  <p className="text-gray-200 font-medium">{formData.email}</p>
                </div>
                <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4">
                  <p className="text-xs text-gray-400 font-semibold mb-1">Mobile</p>
                  <p className="text-gray-200 font-medium">{formData.mobile}</p>
                </div>
              </div>

              {/* Address Information */}
              <div>
                <h3 className="text-lg font-bold text-red-400 mb-4">Address</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-3">
                    <p className="text-xs text-gray-400 font-semibold mb-1">Province</p>
                    <p className="text-gray-200">{addressData.province}</p>
                  </div>
                  <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-3">
                    <p className="text-xs text-gray-400 font-semibold mb-1">District</p>
                    <p className="text-gray-200">{addressData.district}</p>
                  </div>
                  <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-3">
                    <p className="text-xs text-gray-400 font-semibold mb-1">City</p>
                    <p className="text-gray-200">{addressData.city}</p>
                  </div>
                  <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-3">
                    <p className="text-xs text-gray-400 font-semibold mb-1">Postal Code</p>
                    <p className="text-gray-200">{addressData.postalCode}</p>
                  </div>
                  <div className="col-span-2 bg-gray-700/50 border border-gray-600 rounded-lg p-3">
                    <p className="text-xs text-gray-400 font-semibold mb-1">Address Line 1</p>
                    <p className="text-gray-200">{addressData.line1}</p>
                  </div>
                  {addressData.line2 && (
                    <div className="col-span-2 bg-gray-700/50 border border-gray-600 rounded-lg p-3">
                      <p className="text-xs text-gray-400 font-semibold mb-1">Address Line 2</p>
                      <p className="text-gray-200">{addressData.line2}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-700">
                <button
                  onClick={() => {
                    setShowAddressModal(false);
                    handleEditCustomer(customers.find((c) => c.id === formData.id)!);
                  }}
                  className="flex-1 bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                >
                  Edit Customer
                </button>
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
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {/* Customer ID */}
              <div>
                <label className="block text-sm font-semibold text-red-400 mb-2">
                  Customer ID {!isEditMode && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="text"
                  placeholder="e.g., C001"
                  value={formData.id}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                  disabled={isEditMode}
                  className="w-full px-4 py-2 bg-gray-700 border-2 border-red-600/30 text-white placeholder-gray-500 rounded-lg focus:border-red-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Name and Email */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-red-400 mb-2">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border-2 border-red-600/30 text-white placeholder-gray-500 rounded-lg focus:border-red-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-red-400 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="e.g., john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border-2 border-red-600/30 text-white placeholder-gray-500 rounded-lg focus:border-red-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Mobile */}
              <div>
                <label className="block text-sm font-semibold text-red-400 mb-2">
                  Mobile <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="e.g., +1 234 567 8900"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border-2 border-red-600/30 text-white placeholder-gray-500 rounded-lg focus:border-red-500 focus:outline-none"
                />
              </div>

              {/* Address Section */}
              <div className="border-t border-gray-700 pt-5">
                <h3 className="text-lg font-bold text-red-400 mb-4">Address</h3>

                {/* Province and District */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-semibold text-red-400 mb-2">
                      Province <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={addressData.province}
                      onChange={(e) => {
                        const province = e.target.value;
                        setAddressData({
                          ...addressData,
                          province,
                          district: "",
                          city: "",
                        });
                      }}
                      className="w-full px-4 py-2 bg-gray-700 border-2 border-red-600/30 text-white rounded-lg focus:border-red-500 focus:outline-none"
                    >
                      <option value="">Select Province</option>
                      {addressHierarchy.provinces.map((prov) => (
                        <option key={prov} value={prov}>
                          {prov}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-red-400 mb-2">
                      District <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={addressData.district}
                      onChange={(e) => {
                        const district = e.target.value;
                        setAddressData({
                          ...addressData,
                          district,
                          city: "",
                        });
                      }}
                      disabled={!addressData.province}
                      className="w-full px-4 py-2 bg-gray-700 border-2 border-red-600/30 text-white rounded-lg focus:border-red-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">Select District</option>
                      {addressData.province &&
                        addressHierarchy.districts[
                          addressData.province as keyof typeof addressHierarchy.districts
                        ]?.map((dist) => (
                          <option key={dist} value={dist}>
                            {dist}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                {/* City */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-red-400 mb-2">
                    City <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={addressData.city}
                    onChange={(e) =>
                      setAddressData({ ...addressData, city: e.target.value })
                    }
                    disabled={!addressData.district}
                    className="w-full px-4 py-2 bg-gray-700 border-2 border-red-600/30 text-white rounded-lg focus:border-red-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Select City</option>
                    {addressData.district &&
                      addressHierarchy.cities[
                        addressData.district as keyof typeof addressHierarchy.cities
                      ]?.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Address Line 1 and Line 2 */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-semibold text-red-400 mb-2">
                      Address Line 1 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., 123 Main Street"
                      value={addressData.line1}
                      onChange={(e) =>
                        setAddressData({ ...addressData, line1: e.target.value })
                      }
                      className="w-full px-4 py-2 bg-gray-700 border-2 border-red-600/30 text-white placeholder-gray-500 rounded-lg focus:border-red-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-red-400 mb-2">
                      Address Line 2
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Apartment 4B"
                      value={addressData.line2}
                      onChange={(e) =>
                        setAddressData({ ...addressData, line2: e.target.value })
                      }
                      className="w-full px-4 py-2 bg-gray-700 border-2 border-red-600/30 text-white placeholder-gray-500 rounded-lg focus:border-red-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Postal Code */}
                <div>
                  <label className="block text-sm font-semibold text-red-400 mb-2">
                    Postal Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 54000"
                    value={addressData.postalCode}
                    onChange={(e) =>
                      setAddressData({ ...addressData, postalCode: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-gray-700 border-2 border-red-600/30 text-white placeholder-gray-500 rounded-lg focus:border-red-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-700">
                <button
                  onClick={handleSaveCustomer}
                  className="flex-1 bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                >
                  {isEditMode ? "Update Customer" : "Add Customer"}
                </button>
                <button
                  onClick={handleCloseModal}
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

export default CustomersPage;
