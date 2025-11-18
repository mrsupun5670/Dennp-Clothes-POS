import React, { useState, useMemo } from "react";

// Helper function to print inventory
const handlePrintInventory = (materials: any[]) => {
  const printWindow = window.open("", "", "width=1000,height=600");
  if (printWindow) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Raw Materials Inventory Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #ef4444; text-align: center; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background-color: #374151; color: white; padding: 10px; text-align: left; border: 1px solid #1f2937; }
          td { padding: 8px; border: 1px solid #d1d5db; }
          tr:nth-child(even) { background-color: #f9fafb; }
          .text-right { text-align: right; }
          .summary { margin-top: 30px; padding: 15px; background-color: #f3f4f6; border: 1px solid #d1d5db; border-radius: 5px; }
          .summary p { margin: 5px 0; }
        </style>
      </head>
      <body>
        <h1>Raw Materials Inventory Report</h1>
        <p style="text-align: center; color: #666;">Generated on ${new Date().toLocaleString()}</p>
        <table>
          <thead>
            <tr>
              <th>Material Name</th>
              <th class="text-right">Quantity</th>
              <th class="text-right">Unit Cost (Rs.)</th>
              <th class="text-right">Total Value (Rs.)</th>
              <th>Last Updated</th>
            </tr>
          </thead>
          <tbody>
            ${materials.map(m => `
              <tr>
                <td>${m.name}</td>
                <td class="text-right">${m.qty}</td>
                <td class="text-right">${m.unitCost.toFixed(2)}</td>
                <td class="text-right">${(m.qty * m.unitCost).toFixed(2)}</td>
                <td>${m.lastUpdated}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="summary">
          <p><strong>Total Items Count:</strong> ${materials.reduce((sum, m) => sum + m.qty, 0)}</p>
          <p><strong>Total Inventory Value:</strong> Rs. ${materials.reduce((sum, m) => sum + (m.qty * m.unitCost), 0).toFixed(2)}</p>
          <p><strong>Items Listed:</strong> ${materials.length}</p>
        </div>
      </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 250);
  }
};

interface RawMaterial {
  id: number;
  name: string;
  qty: number;
  lastUpdated: string;
  unitCost: number;
}

const InventoryPage: React.FC = () => {
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    qty: "",
    unitCost: "",
  });

  // Sample raw materials data
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([
    {
      id: 1,
      name: "Cotton Cloth Roll",
      qty: 25,
      lastUpdated: "2024-11-15",
      unitCost: 450.50,
    },
    {
      id: 2,
      name: "Polyester Thread",
      qty: 150,
      lastUpdated: "2024-11-14",
      unitCost: 12.75,
    },
    {
      id: 3,
      name: "Printing Paper",
      qty: 500,
      lastUpdated: "2024-11-13",
      unitCost: 5.25,
    },
    {
      id: 4,
      name: "Buttons (Large)",
      qty: 2500,
      lastUpdated: "2024-11-12",
      unitCost: 2.50,
    },
    {
      id: 5,
      name: "Zippers",
      qty: 180,
      lastUpdated: "2024-11-11",
      unitCost: 8.99,
    },
  ]);

  // Filter materials based on search
  const filteredMaterials = useMemo(() => {
    let result = [...rawMaterials];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((item) =>
        item.name.toLowerCase().includes(query)
      );
    }

    return result;
  }, [searchQuery, rawMaterials]);

  const totalItems = filteredMaterials.length;
  const totalValue = filteredMaterials.reduce(
    (sum, item) => sum + item.qty * item.unitCost,
    0
  );

  const handleAddClick = () => {
    setIsEditMode(false);
    setFormData({ name: "", qty: "", unitCost: "" });
    setShowAddModal(true);
  };

  const handleEditItem = (item: RawMaterial) => {
    setIsEditMode(true);
    setSelectedItemId(item.id);
    setFormData({
      name: item.name,
      qty: item.qty.toString(),
      unitCost: item.unitCost.toString(),
    });
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setIsEditMode(false);
    setSelectedItemId(null);
    setFormData({ name: "", qty: "", unitCost: "" });
  };

  const handleSaveItem = () => {
    const qty = parseFloat(formData.qty as string) || 0;
    const unitCost = parseFloat(formData.unitCost as string) || 0;

    if (isEditMode && selectedItemId !== null) {
      // Update existing item
      setRawMaterials(
        rawMaterials.map((item) =>
          item.id === selectedItemId
            ? {
                ...item,
                name: formData.name,
                qty: qty,
                unitCost: unitCost,
                lastUpdated: new Date().toISOString().split("T")[0],
              }
            : item
        )
      );
    } else {
      // Add new item
      const newItem: RawMaterial = {
        id: Math.max(...rawMaterials.map((item) => item.id), 0) + 1,
        name: formData.name,
        qty: qty,
        unitCost: unitCost,
        lastUpdated: new Date().toISOString().split("T")[0],
      };
      setRawMaterials([...rawMaterials, newItem]);
    }
    handleCloseModal();
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-red-500">Raw Materials</h1>
            <span className="text-sm font-semibold text-red-400 bg-red-900/30 px-3 py-1 rounded-full">
              {totalItems} items
            </span>
          </div>
          <p className="text-gray-400 mt-2">
            Manage raw materials and ingredients inventory
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => handlePrintInventory(filteredMaterials)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center gap-2"
            title="Print/Export as PDF"
          >
            🖨️ Print/PDF
          </button>
          <button
            onClick={handleAddClick}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors font-semibold"
          >
            + Add Inventory
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg shadow p-6">
          <p className="text-gray-400 text-sm">Total Items Count</p>
          <p className="text-3xl font-bold text-white mt-2">
            {filteredMaterials.reduce((sum, item) => sum + item.qty, 0)}
          </p>
        </div>
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg shadow p-6">
          <p className="text-gray-400 text-sm">Total Inventory Value</p>
          <p className="text-3xl font-bold text-red-400 mt-2">
            Rs. {totalValue.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-red-400">
          Search Materials
        </label>
        <input
          type="text"
          placeholder="Search by material name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 bg-gray-700 border-2 border-red-600/30 text-white placeholder-gray-500 rounded-lg focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 transition-colors"
        />
      </div>

      {/* Materials Table - Scrollable */}
      <div className="flex-1 overflow-hidden flex flex-col bg-gray-800/50 border border-gray-700 rounded-lg">
        <div className="overflow-x-auto overflow-y-auto flex-1">
          <table className="w-full text-sm">
            {/* Sticky Table Header */}
            <thead className="sticky top-0 bg-gray-700/80 border-b-2 border-red-600 z-10">
              <tr>
                <th className="px-6 py-3 text-left font-semibold text-red-400">
                  Material Name
                </th>
                <th className="px-6 py-3 text-right font-semibold text-red-400">
                  Quantity
                </th>
                <th className="px-6 py-3 text-right font-semibold text-red-400">
                  Unit Cost (Rs.)
                </th>
                <th className="px-6 py-3 text-right font-semibold text-red-400">
                  Total Value (Rs.)
                </th>
                <th className="px-6 py-3 text-left font-semibold text-red-400">
                  Last Updated
                </th>
              </tr>
            </thead>

            {/* Table Body - Scrollable Rows */}
            <tbody className="divide-y divide-gray-700">
              {filteredMaterials.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => setSelectedItemId(item.id)}
                  onDoubleClick={() => handleEditItem(item)}
                  className={`cursor-pointer transition-all duration-200 ${
                    selectedItemId === item.id
                      ? "bg-red-900/40 border-l-4 border-l-red-600"
                      : "hover:bg-gray-700/30 border-l-4 border-l-transparent"
                  }`}
                  title="Double-click to edit"
                >
                  <td className="px-6 py-4 text-gray-200 font-medium">
                    {item.name}
                  </td>
                  <td className="px-6 py-4 text-right text-gray-300 font-semibold">
                    {item.qty.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-right text-gray-300 font-semibold">
                    {item.unitCost.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-right text-red-400 font-semibold">
                    {(item.qty * item.unitCost).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-sm">
                    {item.lastUpdated}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Inventory Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg shadow-2xl border-2 border-red-600 w-full max-w-2xl">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-red-700 to-red-900 text-white p-6 border-b border-red-600 flex justify-between items-center">
              <h2 className="text-2xl font-bold">
                {isEditMode ? "Edit Material" : "Add New Material"}
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
              {/* Material Name */}
              <div>
                <label className="block text-sm font-semibold text-red-400 mb-2">
                  Material Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Cotton Cloth Roll"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-gray-700 border-2 border-red-600/30 text-white placeholder-gray-500 rounded-lg focus:border-red-500 focus:outline-none"
                />
              </div>

              {/* Quantity and Unit Cost */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-red-400 mb-2">
                    Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.qty}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        qty: e.target.value,
                      });
                    }}
                    className="w-full px-4 py-2 bg-gray-700 border-2 border-red-600/30 text-white placeholder-gray-500 rounded-lg focus:border-red-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-red-400 mb-2">
                    Unit Cost (Rs.) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.unitCost}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        unitCost: e.target.value,
                      });
                    }}
                    className="w-full px-4 py-2 bg-gray-700 border-2 border-red-600/30 text-white placeholder-gray-500 rounded-lg focus:border-red-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Total Value Display */}
              <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-1">Total Value</p>
                <p className="text-2xl font-bold text-red-400">
                  Rs. {((parseFloat(formData.qty as string) || 0) * (parseFloat(formData.unitCost as string) || 0)).toFixed(2)}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-700">
                <button
                  onClick={handleSaveItem}
                  className="flex-1 bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                >
                  {isEditMode ? "Update Material" : "Add Material"}
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

export default InventoryPage;
