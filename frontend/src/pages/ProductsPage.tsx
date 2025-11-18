import React, { useState, useMemo } from "react";

// Helper function to generate PDF-like table (using print)
const handlePrintProducts = (products: any[]) => {
  const printWindow = window.open("", "", "width=1000,height=600");
  if (printWindow) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Products Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #ef4444; text-align: center; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background-color: #374151; color: white; padding: 10px; text-align: left; border: 1px solid #1f2937; }
          td { padding: 8px; border: 1px solid #d1d5db; }
          tr:nth-child(even) { background-color: #f9fafb; }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
        </style>
      </head>
      <body>
        <h1>Products Report</h1>
        <p style="text-align: center; color: #666;">Generated on ${new Date().toLocaleString()}</p>
        <table>
          <thead>
            <tr>
              <th>Product Code</th>
              <th>Name</th>
              <th>Colors</th>
              <th>Sizes</th>
              <th class="text-right">Cost (Rs.)</th>
              <th class="text-right">Qty</th>
              <th class="text-right">Retail Price (Rs.)</th>
              <th class="text-right">Wholesale Price (Rs.)</th>
            </tr>
          </thead>
          <tbody>
            ${products.map(p => `
              <tr>
                <td>${p.code}</td>
                <td>${p.name}</td>
                <td>${p.colors}</td>
                <td>${p.sizes}</td>
                <td class="text-right">${p.cost.toFixed(2)}</td>
                <td class="text-right">${p.qty}</td>
                <td class="text-right">${p.retailPrice.toFixed(2)}</td>
                <td class="text-right">${p.wholesalePrice.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <p style="margin-top: 30px; color: #666; font-size: 12px;">Total Products: ${products.length}</p>
      </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 250);
  }
};

interface SizeOption {
  [key: string]: string[];
}

interface ColorOption {
  [key: string]: string[];
}

const ProductsPage: React.FC = () => {
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<string>("name");
  const [stockFilter, setStockFilter] = useState<string>("all");
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("tshirt");
  const [stockRows, setStockRows] = useState<{ id: number; size: string; color: string; qty: number }[]>([]);
  const [nextRowId, setNextRowId] = useState(1);
  const [customSizes, setCustomSizes] = useState<string[]>([]);
  const [customColors, setCustomColors] = useState<string[]>([]);
  const [showAddSizeModal, setShowAddSizeModal] = useState(false);
  const [showAddColorModal, setShowAddColorModal] = useState(false);
  const [newSize, setNewSize] = useState("");
  const [newColor, setNewColor] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    costPrice: "",
    retailPrice: "",
    wholesalePrice: "",
  });

  // Size options by category
  const sizesByCategory: SizeOption = {
    tshirt: ["XS", "S", "M", "L", "XL", "XXL"],
    shirt: ["15", "15.5", "16", "16.5", "17", "17.5"],
    trouser: ["28", "30", "32", "34", "36", "38"],
    croptop: ["XS", "S", "M", "L", "XL"],
    jacket: ["S", "M", "L", "XL", "XXL"],
    dress: ["XS", "S", "M", "L", "XL"],
  };

  // Color options by category
  const colorsByCategory: ColorOption = {
    tshirt: ["Black", "White", "Blue", "Red", "Green", "Yellow", "Gray"],
    shirt: ["White", "Blue", "Black", "Light Blue", "Cream"],
    trouser: ["Black", "Blue", "Gray", "Brown", "Khaki"],
    croptop: ["Black", "White", "Red", "Pink", "Purple"],
    jacket: ["Black", "Blue", "Brown", "Navy", "Gray"],
    dress: ["Black", "White", "Red", "Blue", "Maroon"],
  };

  const categories = [
    { value: "tshirt", label: "T-Shirt" },
    { value: "shirt", label: "Shirt" },
    { value: "trouser", label: "Trouser" },
    { value: "croptop", label: "Crop Top" },
    { value: "jacket", label: "Jacket" },
    { value: "dress", label: "Dress" },
  ];

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handleAddProductClick = () => {
    setShowAddProductModal(true);
    setSelectedCategory("tshirt");
    setStockRows([{ id: 1, size: "", color: "", qty: 0 }]);
    setNextRowId(2);
    setCustomSizes([]);
    setCustomColors([]);
  };

  const handleCloseModal = () => {
    setShowAddProductModal(false);
    setIsEditMode(false);
    setFormData({ code: "", name: "", costPrice: "", retailPrice: "", wholesalePrice: "" });
  };

  const handleEditProduct = (product: any) => {
    setIsEditMode(true);
    setShowAddProductModal(true);
    setSelectedCategory("tshirt");
    setFormData({
      code: product.code,
      name: product.name,
      costPrice: product.cost.toString(),
      retailPrice: product.retailPrice.toString(),
      wholesalePrice: product.wholesalePrice.toString(),
    });

    // Parse sizes and colors
    const sizes = product.sizes.split(",").map((s: string) => s.trim());
    const colors = product.colors.split(",").map((c: string) => c.trim());

    // Create stock rows for each size/color combination with proportional qty distribution
    const totalVariants = sizes.length * colors.length;
    const qtyPerVariant = totalVariants > 0 ? Math.floor(product.qty / totalVariants) : 0;
    const remainder = totalVariants > 0 ? product.qty % totalVariants : 0;

    const newStockRows: { id: number; size: string; color: string; qty: number }[] = [];
    let rowId = 1;
    let qtyAdded = 0;

    colors.forEach((color: string) => {
      sizes.forEach((size: string) => {
        // Distribute remainder qty to first few rows
        const extraQty = qtyAdded < remainder ? 1 : 0;
        newStockRows.push({
          id: rowId,
          size: size,
          color: color,
          qty: qtyPerVariant + extraQty,
        });
        qtyAdded++;
        rowId++;
      });
    });

    setStockRows(newStockRows);
    setNextRowId(rowId);
    setCustomSizes([]);
    setCustomColors([]);
  };

  // Get all available sizes (predefined + custom)
  const getAllSizes = () => [...sizesByCategory[selectedCategory], ...customSizes];

  // Get all available colors (predefined + custom)
  const getAllColors = () => [...colorsByCategory[selectedCategory], ...customColors];

  // Add new stock row
  const addStockRow = () => {
    setStockRows([...stockRows, { id: nextRowId, size: "", color: "", qty: 0 }]);
    setNextRowId(nextRowId + 1);
  };

  // Update stock row
  const updateStockRow = (id: number, field: string, value: any) => {
    setStockRows(
      stockRows.map((row) =>
        row.id === id ? { ...row, [field]: value } : row
      )
    );
  };

  // Remove stock row
  const removeStockRow = (id: number) => {
    setStockRows(stockRows.filter((row) => row.id !== id));
  };

  // Add custom size
  const handleAddSize = () => {
    if (newSize && !getAllSizes().includes(newSize)) {
      setCustomSizes([...customSizes, newSize]);
      setNewSize("");
      setShowAddSizeModal(false);
    }
  };

  // Add custom color
  const handleAddColor = () => {
    if (newColor && !getAllColors().includes(newColor)) {
      setCustomColors([...customColors, newColor]);
      setNewColor("");
      setShowAddColorModal(false);
    }
  };

  // Sample product data
  const allProducts = [
    {
      id: 1,
      code: "TSB-001",
      name: "T-Shirt Blue",
      colors: "Blue",
      sizes: "S, M, L, XL",
      cost: 12.50,
      qty: 45,
      retailPrice: 29.99,
      wholesalePrice: 18.99,
    },
    {
      id: 2,
      code: "JB-001",
      name: "Jeans Black",
      colors: "Black",
      sizes: "28, 30, 32, 34, 36",
      cost: 25.00,
      qty: 2,
      retailPrice: 59.99,
      wholesalePrice: 38.99,
    },
    {
      id: 3,
      code: "SR-001",
      name: "Shirt Red",
      colors: "Red, White",
      sizes: "XS, S, M, L",
      cost: 18.75,
      qty: 0,
      retailPrice: 49.99,
      wholesalePrice: 32.99,
    },
    {
      id: 4,
      code: "DW-001",
      name: "Dress White",
      colors: "White",
      sizes: "S, M, L",
      cost: 30.00,
      qty: 12,
      retailPrice: 79.99,
      wholesalePrice: 52.99,
    },
    {
      id: 5,
      code: "JN-002",
      name: "Jacket Navy",
      colors: "Navy Blue",
      sizes: "S, M, L, XL, XXL",
      cost: 35.00,
      qty: 8,
      retailPrice: 89.99,
      wholesalePrice: 65.99,
    },
  ];

  // Filter and sort products based on all criteria
  const filteredAndSortedProducts = useMemo(() => {
    let result = [...allProducts];

    // Search filter - by code, name, or color
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (product) =>
          product.code.toLowerCase().includes(query) ||
          product.name.toLowerCase().includes(query) ||
          product.colors.toLowerCase().includes(query)
      );
    }

    // Stock status filter
    if (stockFilter === "low") {
      result = result.filter((p) => p.qty <= 3 && p.qty > 0);
    } else if (stockFilter === "out") {
      result = result.filter((p) => p.qty === 0);
    } else if (stockFilter === "in") {
      result = result.filter((p) => p.qty > 0);
    }

    // Sort products
    if (sortBy === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "code") {
      result.sort((a, b) => a.code.localeCompare(b.code));
    } else if (sortBy === "price-high") {
      result.sort((a, b) => b.retailPrice - a.retailPrice);
    } else if (sortBy === "price-low") {
      result.sort((a, b) => a.retailPrice - b.retailPrice);
    } else if (sortBy === "qty-high") {
      result.sort((a, b) => b.qty - a.qty);
    } else if (sortBy === "cost-low") {
      result.sort((a, b) => a.cost - b.cost);
    } else if (sortBy === "cost-high") {
      result.sort((a, b) => b.cost - a.cost);
    }

    return result;
  }, [searchQuery, sortBy, stockFilter]);

  const totalProducts = filteredAndSortedProducts.length;

  const handleResetFilters = () => {
    setSearchQuery("");
    setSortBy("name");
    setStockFilter("all");
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-red-500">Products</h1>
            <span className="text-sm font-semibold text-red-400 bg-red-900/30 px-3 py-1 rounded-full">
              {totalProducts} items
            </span>
          </div>
          <p className="text-gray-400 mt-2">Manage your product catalog and inventory</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => handlePrintProducts(filteredAndSortedProducts)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center gap-2"
            title="Print/Export as PDF"
          >
            🖨️ Print/PDF
          </button>
          <button
            onClick={handleAddProductClick}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors font-semibold"
          >
            + Add Product
          </button>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="space-y-4 bg-gray-800/30 border border-gray-700 rounded-lg p-5">
        {/* Search Bar */}
        <div>
          <label className="block text-sm font-semibold text-red-400 mb-2">Search Products</label>
          <input
            type="text"
            placeholder="Search by product code, name, or color..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 bg-gray-700 border-2 border-red-600/30 text-white placeholder-gray-500 rounded-lg focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 transition-colors"
          />
        </div>

        {/* Sorting Options */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-red-600/30 text-white text-sm rounded-lg focus:border-red-500 focus:outline-none"
            >
              <option value="name">Name (A-Z)</option>
              <option value="code">Product Code</option>
              <option value="price-high">Retail Price (High to Low)</option>
              <option value="price-low">Retail Price (Low to High)</option>
              <option value="cost-high">Cost Price (High to Low)</option>
              <option value="cost-low">Cost Price (Low to High)</option>
              <option value="qty-high">Quantity (High to Low)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-2">Stock Status</label>
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-red-600/30 text-white text-sm rounded-lg focus:border-red-500 focus:outline-none"
            >
              <option value="all">All Products</option>
              <option value="low">Low Stock (≤ 3)</option>
              <option value="out">Out of Stock</option>
              <option value="in">In Stock</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-2">Action</label>
            <button
              onClick={handleResetFilters}
              className="w-full px-3 py-2 bg-red-600/20 border border-red-600 text-red-400 text-sm rounded-lg hover:bg-red-600/30 transition-colors font-semibold"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Products Table - Scrollable */}
      <div className="flex-1 overflow-hidden flex flex-col bg-gray-800/50 border border-gray-700 rounded-lg">
        <div className="overflow-x-auto overflow-y-auto flex-1">
          <table className="w-full text-sm">
            {/* Sticky Table Header */}
            <thead className="sticky top-0 bg-gray-700/80 border-b-2 border-red-600 z-10">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-red-400">Product Code</th>
                <th className="px-4 py-3 text-left font-semibold text-red-400">Name</th>
                <th className="px-4 py-3 text-left font-semibold text-red-400">Colors</th>
                <th className="px-4 py-3 text-left font-semibold text-red-400">Sizes</th>
                <th className="px-4 py-3 text-right font-semibold text-red-400">Cost (Rs.)</th>
                <th className="px-4 py-3 text-right font-semibold text-red-400">Qty</th>
                <th className="px-4 py-3 text-right font-semibold text-red-400">Retail Price (Rs.)</th>
                <th className="px-4 py-3 text-right font-semibold text-red-400">Wholesale Price (Rs.)</th>
              </tr>
            </thead>

            {/* Table Body - Scrollable Rows */}
            <tbody className="divide-y divide-gray-700">
              {filteredAndSortedProducts.map((product) => (
                <tr
                  key={product.id}
                  onClick={() => setSelectedProductId(product.id)}
                  onDoubleClick={() => handleEditProduct(product)}
                  className={`cursor-pointer transition-all duration-200 ${
                    selectedProductId === product.id
                      ? "bg-red-900/40 border-l-4 border-l-red-600"
                      : "hover:bg-gray-700/30 border-l-4 border-l-transparent"
                  }`}
                  title="Double-click to edit"
                >
                  <td className="px-4 py-3 text-gray-300 font-mono font-semibold">
                    {product.code}
                  </td>
                  <td className="px-4 py-3 text-gray-100 font-medium">{product.name}</td>
                  <td className="px-4 py-3 text-gray-400">{product.colors}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{product.sizes}</td>
                  <td className="px-4 py-3 text-right text-gray-300 font-semibold">
                    {product.cost.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`px-2 py-1 rounded font-semibold ${
                        product.qty === 0
                          ? "bg-red-900/50 text-red-400"
                          : product.qty <= 3
                          ? "bg-orange-900/50 text-orange-400"
                          : "bg-green-900/50 text-green-400"
                      }`}
                    >
                      {product.qty.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-red-400 font-semibold">
                    {product.retailPrice.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-300 font-semibold">
                    {product.wholesalePrice.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddProductModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg shadow-2xl border-2 border-red-600 w-full max-w-4xl">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-red-700 to-red-900 text-white p-6 border-b border-red-600 flex justify-between items-center">
              <h2 className="text-2xl font-bold">{isEditMode ? "Edit Product" : "Add New Product"}</h2>
              <button
                onClick={handleCloseModal}
                className="text-white hover:text-red-200 transition-colors text-2xl"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {/* Product Code */}
              <div>
                <label className="block text-sm font-semibold text-red-400 mb-2">
                  Product Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., TSB-001"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  disabled={isEditMode}
                  className="w-full px-4 py-2 bg-gray-700 border-2 border-red-600/30 text-white placeholder-gray-500 rounded-lg focus:border-red-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Product Name */}
              <div>
                <label className="block text-sm font-semibold text-red-400 mb-2">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Blue T-Shirt"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border-2 border-red-600/30 text-white placeholder-gray-500 rounded-lg focus:border-red-500 focus:outline-none"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-red-400 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 border-2 border-red-600/30 text-white rounded-lg focus:border-red-500 focus:outline-none"
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Prices */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-red-400 mb-2">
                    Cost Price (Rs.) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.costPrice}
                    onChange={(e) => {
                      setFormData({ ...formData, costPrice: e.target.value });
                    }}
                    className="w-full px-3 py-2 bg-gray-700 border-2 border-red-600/30 text-white placeholder-gray-500 rounded-lg focus:border-red-500 focus:outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-red-400 mb-2">
                    Retail Price (Rs.) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.retailPrice}
                    onChange={(e) => {
                      setFormData({ ...formData, retailPrice: e.target.value });
                    }}
                    className="w-full px-3 py-2 bg-gray-700 border-2 border-red-600/30 text-white placeholder-gray-500 rounded-lg focus:border-red-500 focus:outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-red-400 mb-2">
                    Wholesale Price (Rs.) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.wholesalePrice}
                    onChange={(e) => {
                      setFormData({ ...formData, wholesalePrice: e.target.value });
                    }}
                    className="w-full px-3 py-2 bg-gray-700 border-2 border-red-600/30 text-white placeholder-gray-500 rounded-lg focus:border-red-500 focus:outline-none text-sm"
                  />
                </div>
              </div>

              {/* Stock Summary by Size and Color */}
              {isEditMode && stockRows.length > 0 && (
                <div className="bg-gray-700/30 border border-gray-600 rounded-lg p-4 mb-4">
                  <label className="block text-sm font-semibold text-red-400 mb-3">Stock Breakdown by Size & Color</label>
                  <div className="grid grid-cols-1 gap-2 text-xs">
                    {/* Size Summary */}
                    <div>
                      <p className="text-gray-300 font-semibold mb-2">By Size:</p>
                      <div className="flex flex-wrap gap-2">
                        {[...new Set(stockRows.map(r => r.size))].filter(s => s).map((size) => (
                          <div key={size} className="bg-blue-900/40 border border-blue-600/50 text-blue-300 px-3 py-1 rounded">
                            {size}: <span className="font-bold">{stockRows.filter(r => r.size === size).reduce((sum, r) => sum + r.qty, 0)} units</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Color Summary */}
                    <div>
                      <p className="text-gray-300 font-semibold mb-2">By Color:</p>
                      <div className="flex flex-wrap gap-2">
                        {[...new Set(stockRows.map(r => r.color))].filter(c => c).map((color) => (
                          <div key={color} className="bg-purple-900/40 border border-purple-600/50 text-purple-300 px-3 py-1 rounded">
                            {color}: <span className="font-bold">{stockRows.filter(r => r.color === color).reduce((sum, r) => sum + r.qty, 0)} units</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Total */}
                    <div className="border-t border-gray-600 pt-2 mt-2">
                      <p className="text-gray-300">
                        <span className="font-semibold">Total Stock:</span> <span className="text-red-400 font-bold text-lg">{stockRows.reduce((sum, r) => sum + r.qty, 0)} units</span>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Stock Entry Rows - Row-Based System */}
              <div>
                <label className="block text-sm font-semibold text-red-400 mb-3">
                  Stock Entries (Size, Color & Quantity) <span className="text-red-500">*</span>
                </label>

                {/* Stock Rows Table with Scroll */}
                <div className="mb-4 bg-gray-900/50 border border-gray-700 rounded-lg p-4 h-64 overflow-y-auto">
                  {stockRows.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-6">No stock entries yet. Click "Add Row" to start adding stock.</p>
                  ) : (
                    <div className="space-y-3">
                      {stockRows.map((row) => (
                        <div
                          key={row.id}
                          className="flex gap-2 items-end bg-gray-800/50 border border-gray-700 rounded-lg p-3 hover:border-red-600/50 transition-colors"
                        >
                          {/* Size Dropdown */}
                          <div className="flex-1 min-w-[120px]">
                            <label className="block text-xs text-gray-400 font-semibold mb-1">Size</label>
                            <select
                              value={row.size}
                              onChange={(e) => updateStockRow(row.id, "size", e.target.value)}
                              className="w-full px-3 py-2 bg-gray-700 border border-red-600/30 text-white text-sm rounded-lg focus:border-red-500 focus:outline-none"
                            >
                              <option value="">Select Size</option>
                              {getAllSizes().map((size) => (
                                <option key={size} value={size}>
                                  {size}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Color Dropdown */}
                          <div className="flex-1 min-w-[120px]">
                            <label className="block text-xs text-gray-400 font-semibold mb-1">Color</label>
                            <select
                              value={row.color}
                              onChange={(e) => updateStockRow(row.id, "color", e.target.value)}
                              className="w-full px-3 py-2 bg-gray-700 border border-red-600/30 text-white text-sm rounded-lg focus:border-red-500 focus:outline-none"
                            >
                              <option value="">Select Color</option>
                              {getAllColors().map((color) => (
                                <option key={color} value={color}>
                                  {color}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Quantity Input */}
                          <div className="flex-1 min-w-[100px]">
                            <label className="block text-xs text-gray-400 font-semibold mb-1">Qty</label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={row.qty}
                              onChange={(e) => {
                                let value = e.target.value;
                                // Remove leading zero if user starts typing
                                if (value.startsWith("0") && value.length > 1 && value[1] !== ".") {
                                  value = value.replace(/^0+/, "");
                                }
                                updateStockRow(row.id, "qty", parseFloat(value) || 0);
                              }}
                              placeholder="0.00"
                              className="w-full px-3 py-2 bg-gray-700 border border-red-600/30 text-white text-sm rounded-lg focus:border-red-500 focus:outline-none text-center"
                            />
                          </div>

                          {/* Add Size Button */}
                          <button
                            onClick={() => setShowAddSizeModal(true)}
                            className="px-3 py-2 bg-gray-700 border border-gray-600 text-gray-300 text-sm rounded-lg hover:border-red-500 hover:text-red-400 transition-colors font-semibold"
                            title="Add custom size"
                          >
                            + Size
                          </button>

                          {/* Add Color Button */}
                          <button
                            onClick={() => setShowAddColorModal(true)}
                            className="px-3 py-2 bg-gray-700 border border-gray-600 text-gray-300 text-sm rounded-lg hover:border-red-500 hover:text-red-400 transition-colors font-semibold"
                            title="Add custom color"
                          >
                            + Color
                          </button>

                          {/* Delete Row Button */}
                          <button
                            onClick={() => removeStockRow(row.id)}
                            className="px-3 py-2 bg-red-900/30 border border-red-600/50 text-red-400 text-sm rounded-lg hover:bg-red-900/50 transition-colors font-semibold"
                            title="Delete this row"
                          >
                            Delete
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Add Row Button */}
                <button
                  onClick={addStockRow}
                  className="w-full px-4 py-2 bg-gray-700 border-2 border-dashed border-red-600/50 text-red-400 rounded-lg hover:border-red-500 hover:bg-gray-700/80 transition-colors font-semibold text-sm"
                >
                  + Add Row
                </button>
              </div>

              {/* Mini-Modal for Adding Custom Size */}
              {showAddSizeModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="bg-gray-800 rounded-lg shadow-2xl border-2 border-red-600 w-full max-w-sm">
                    <div className="bg-gradient-to-r from-red-700 to-red-900 text-white p-4 border-b border-red-600 flex justify-between items-center">
                      <h3 className="text-lg font-bold">Add Custom Size</h3>
                      <button
                        onClick={() => {
                          setShowAddSizeModal(false);
                          setNewSize("");
                        }}
                        className="text-white hover:text-red-200 transition-colors text-xl"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="p-4 space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-red-400 mb-2">
                          Enter Size
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., M, L, 40, etc."
                          value={newSize}
                          onChange={(e) => setNewSize(e.target.value)}
                          className="w-full px-3 py-2 bg-gray-700 border border-red-600/30 text-white placeholder-gray-500 rounded-lg focus:border-red-500 focus:outline-none"
                          onKeyPress={(e) => {
                            if (e.key === "Enter") handleAddSize();
                          }}
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={handleAddSize}
                          className="flex-1 bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                        >
                          Add Size
                        </button>
                        <button
                          onClick={() => {
                            setShowAddSizeModal(false);
                            setNewSize("");
                          }}
                          className="flex-1 bg-gray-700 text-gray-300 py-2 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Mini-Modal for Adding Custom Color */}
              {showAddColorModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="bg-gray-800 rounded-lg shadow-2xl border-2 border-red-600 w-full max-w-sm">
                    <div className="bg-gradient-to-r from-red-700 to-red-900 text-white p-4 border-b border-red-600 flex justify-between items-center">
                      <h3 className="text-lg font-bold">Add Custom Color</h3>
                      <button
                        onClick={() => {
                          setShowAddColorModal(false);
                          setNewColor("");
                        }}
                        className="text-white hover:text-red-200 transition-colors text-xl"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="p-4 space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-red-400 mb-2">
                          Enter Color
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., Black, Navy Blue, etc."
                          value={newColor}
                          onChange={(e) => setNewColor(e.target.value)}
                          className="w-full px-3 py-2 bg-gray-700 border border-red-600/30 text-white placeholder-gray-500 rounded-lg focus:border-red-500 focus:outline-none"
                          onKeyPress={(e) => {
                            if (e.key === "Enter") handleAddColor();
                          }}
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={handleAddColor}
                          className="flex-1 bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                        >
                          Add Color
                        </button>
                        <button
                          onClick={() => {
                            setShowAddColorModal(false);
                            setNewColor("");
                          }}
                          className="flex-1 bg-gray-700 text-gray-300 py-2 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-700">
                <button className="flex-1 bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors">
                  {isEditMode ? "Update Product" : "Add Product"}
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

export default ProductsPage;
