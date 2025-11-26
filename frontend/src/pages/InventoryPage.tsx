import React, { useState, useMemo, useEffect, useRef } from "react";
import { useShop } from "../context/ShopContext";
import {
  getShopInventory,
  addInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  InventoryItem,
} from "../services/inventoryService";
import { printContent, saveAsPDF, generateInventoryHTML } from "../utils/exportUtils";

const InventoryPage: React.FC = () => {
  const { shopId } = useShop();
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    inventory_id: "",
    name: "",
    qty: "",
    unitCost: "",
  });

  // Modal-specific error/success messages
  const [modalMessage, setModalMessage] = useState("");
  const [modalMessageType, setModalMessageType] = useState<"error" | "success" | "">("");

  // Page-level success/error notifications
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState<"error" | "success" | "">("");

  // Inventory items from API
  const [rawMaterials, setRawMaterials] = useState<InventoryItem[]>([]);

  // Use ref to prevent duplicate requests in strict mode
  const loadInventoryRef = useRef(false);

  // Load inventory data when component mounts or shopId changes
  useEffect(() => {
    // Prevent duplicate requests in React Strict Mode
    if (loadInventoryRef.current) return;
    loadInventoryRef.current = true;

    const loadInventory = async () => {
      if (!shopId) {
        setError("No shop selected");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const data = await getShopInventory(shopId);
        setRawMaterials(data);
      } catch (err) {
        console.error("Failed to load inventory:", err);
        setError("Failed to load inventory items");
        setRawMaterials([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadInventory();
  }, [shopId]);

  // Filter and sort materials based on search (newest first)
  const filteredMaterials = useMemo(() => {
    let result = [...rawMaterials];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((item) =>
        item.item_name.toLowerCase().includes(query)
      );
    }

    // Sort by updated_at (newest first)
    result.sort((a, b) => {
      const dateA = new Date(a.updated_at).getTime();
      const dateB = new Date(b.updated_at).getTime();
      return dateB - dateA; // Descending order (newest first)
    });

    return result;
  }, [searchQuery, rawMaterials]);

  const totalItems = filteredMaterials.length;
  const totalValue = filteredMaterials.reduce(
    (sum, item) => sum + item.quantity_in_stock * parseFloat(String(item.unit_cost)),
    0
  );

  const handleAddClick = () => {
    setIsEditMode(false);
    setFormData({ inventory_id: "", name: "", qty: "", unitCost: "" });
    setShowAddModal(true);
  };

  const handleEditItem = (item: InventoryItem) => {
    setIsEditMode(true);
    setSelectedItemId(item.inventory_id);
    setFormData({
      inventory_id: String(item.inventory_id),
      name: item.item_name,
      qty: String(item.quantity_in_stock),
      unitCost: String(item.unit_cost),
    });
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setIsEditMode(false);
    setSelectedItemId(null);
    setFormData({ inventory_id: "", name: "", qty: "", unitCost: "" });
    setModalMessage("");
    setModalMessageType("");
  };

  const handleSaveItem = async () => {
    const qty = parseFloat(formData.qty as string) || 0;
    const unitCost = parseFloat(formData.unitCost as string) || 0;

    // Clear previous messages
    setModalMessage("");
    setModalMessageType("");

    if (!formData.inventory_id.trim()) {
      setModalMessage("Please enter inventory ID");
      setModalMessageType("error");
      return;
    }

    if (isNaN(parseInt(formData.inventory_id))) {
      setModalMessage("Inventory ID must be a valid number");
      setModalMessageType("error");
      return;
    }

    if (!formData.name.trim()) {
      setModalMessage("Please enter item name");
      setModalMessageType("error");
      return;
    }

    if (qty < 0 || unitCost < 0) {
      setModalMessage("Quantity and unit cost must be positive");
      setModalMessageType("error");
      return;
    }

    try {
      if (isEditMode && selectedItemId !== null) {
        // Update existing item with correct field names (camelCase as expected by backend)
        await updateInventoryItem(selectedItemId, formData.name, qty, unitCost);
        setRawMaterials(
          rawMaterials.map((item) =>
            item.inventory_id === selectedItemId
              ? {
                  ...item,
                  item_name: formData.name,
                  quantity_in_stock: qty,
                  unit_cost: unitCost,
                  updated_at: new Date().toISOString(),
                }
              : item
          )
        );
        setModalMessage("Inventory item updated successfully!");
        setModalMessageType("success");

        // Close modal after 1.5 seconds
        setTimeout(() => {
          handleCloseModal();
          // Show notification on main page
          setNotificationMessage("Inventory item updated successfully!");
          setNotificationType("success");
          setTimeout(() => {
            setNotificationMessage("");
            setNotificationType("");
          }, 3000);
        }, 1500);
      } else {
        // Add new item
        if (!shopId) {
          setModalMessage("No shop selected");
          setModalMessageType("error");
          return;
        }
        const result = await addInventoryItem(shopId, parseInt(formData.inventory_id), formData.name, qty, unitCost);
        const newItem: InventoryItem = {
          inventory_id: result.inventory_id,
          shop_id: shopId,
          item_name: formData.name,
          quantity_in_stock: qty,
          unit_cost: unitCost,
          updated_at: new Date().toISOString(),
        };
        setRawMaterials([newItem, ...rawMaterials]);
        setModalMessage("Inventory item added successfully!");
        setModalMessageType("success");

        // Close modal after 1.5 seconds
        setTimeout(() => {
          handleCloseModal();
          // Show notification on main page
          setNotificationMessage("Inventory item added successfully!");
          setNotificationType("success");
          setTimeout(() => {
            setNotificationMessage("");
            setNotificationType("");
          }, 3000);
        }, 1500);
      }
    } catch (err) {
      console.error("Failed to save item:", err);
      setModalMessage("Failed to save inventory item");
      setModalMessageType("error");
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Error State */}
      {error && (
        <div className="bg-red-900/20 border border-red-600 text-red-400 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Notification Messages */}
      {notificationMessage && (
        <div
          className={`p-4 rounded-lg border-2 transition-all duration-300 ${
            notificationType === "success"
              ? "bg-green-900/20 border-green-600 text-green-400"
              : "bg-red-900/20 border-red-600 text-red-400"
          }`}
        >
          {notificationType === "success" ? "✓ " : "✕ "}
          {notificationMessage}
        </div>
      )}

      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-red-500">Shop Inventory</h1>
            <span className="text-sm font-semibold text-red-400 bg-red-900/30 px-3 py-1 rounded-full">
              {totalItems} items
            </span>
          </div>
          <p className="text-gray-400 mt-2">
            {shopId ? `Shop #${shopId} - Manage inventory items` : "Select a shop to view inventory"}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              const html = generateInventoryHTML(filteredMaterials);
              printContent(html, 'Inventory Report');
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center gap-2"
            title="Print directly"
          >
            🖨️ Print
          </button>
          <button
            onClick={() => {
              const html = generateInventoryHTML(filteredMaterials);
              saveAsPDF(html, 'inventory_report', 'inventory');
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
            + Add Inventory
          </button>
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
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-400">Loading inventory...</div>
          </div>
        ) : filteredMaterials.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-400 text-center">
              {rawMaterials.length === 0
                ? "No inventory items for this shop. Add one to get started!"
                : "No items match your search"}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto overflow-y-auto flex-1">
            <table className="w-full text-sm">
              {/* Sticky Table Header */}
              <thead className="sticky top-0 bg-gray-700/80 border-b-2 border-red-600 z-10">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-red-400">
                    Item Name
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
                    key={item.inventory_id}
                    onClick={() => setSelectedItemId(item.inventory_id)}
                    onDoubleClick={() => handleEditItem(item)}
                    className={`cursor-pointer transition-all duration-200 ${
                      selectedItemId === item.inventory_id
                        ? "bg-red-900/40 border-l-4 border-l-red-600"
                        : "hover:bg-gray-700/30 border-l-4 border-l-transparent"
                    }`}
                    title="Double-click to edit"
                  >
                    <td className="px-6 py-4 text-gray-200 font-medium">
                      {item.item_name}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-300 font-semibold">
                      {item.quantity_in_stock.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-300 font-semibold">
                      {parseFloat(String(item.unit_cost)).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right text-red-400 font-semibold">
                      {(item.quantity_in_stock * parseFloat(String(item.unit_cost))).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm">
                      {new Date(item.updated_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Inventory Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg shadow-2xl border-2 border-red-600 w-full max-w-2xl">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-red-700 to-red-900 text-white p-6 border-b border-red-600 flex justify-between items-center">
              <h2 className="text-2xl font-bold">
                {isEditMode ? "Edit Inventory Item" : "Add New Inventory Item"}
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
              {/* Modal Messages */}
              {modalMessage && (
                <div
                  className={`p-3 rounded-lg border-2 ${
                    modalMessageType === "success"
                      ? "bg-green-900/20 border-green-600 text-green-400"
                      : "bg-red-900/20 border-red-600 text-red-400"
                  }`}
                >
                  {modalMessageType === "success" ? "✓ " : "✕ "}
                  {modalMessage}
                </div>
              )}

              {/* Inventory ID */}
              <div>
                <label className="block text-sm font-semibold text-red-400 mb-2">
                  Inventory ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  placeholder="e.g., 1001"
                  value={formData.inventory_id}
                  onChange={(e) =>
                    setFormData({ ...formData, inventory_id: e.target.value })
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && formData.inventory_id.trim()) {
                      (document.querySelector('input[placeholder*="POS Thermal"]') as HTMLInputElement)?.focus();
                    }
                  }}
                  disabled={isEditMode}
                  className="w-full px-4 py-2 bg-gray-700 border-2 border-red-600/30 text-white placeholder-gray-500 rounded-lg focus:border-red-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Item Name */}
              <div>
                <label className="block text-sm font-semibold text-red-400 mb-2">
                  Item Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., POS Thermal Paper Roll"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && formData.name.trim()) {
                      (document.querySelector('input[type="number"][placeholder="0.00"]:first-of-type') as HTMLInputElement)?.focus();
                    }
                  }}
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
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && formData.qty.trim()) {
                        (document.querySelector('input[type="number"][placeholder="0.00"]:last-of-type') as HTMLInputElement)?.focus();
                      }
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
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSaveItem();
                      }
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
                  {isEditMode ? "Update Item" : "Add Item"}
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
