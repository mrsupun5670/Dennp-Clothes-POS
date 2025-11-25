import React, { useState, useMemo, useEffect } from "react";
import {
  updateProductStock,
  clearProductStock,
} from "../services/productService";
import { useQuery } from "../hooks/useQuery";
import { useShop } from "../context/ShopContext";
import { API_URL } from "../config/api";
import { printContent, saveAsPDF, generateProductsHTML } from "../utils/exportUtils";


/**
 * The main Products Page component.
 */
const ProductsPage: React.FC = () => {
  const { shopId } = useShop();

  // --- STATE DECLARATIONS ---
  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<string>("name");
  const [stockFilter, setStockFilter] = useState<string>("all");
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  // Default to a placeholder category ID (1)
  const [selectedCategory, setSelectedCategory] = useState<string>("1");
  const [stockRows, setStockRows] = useState<
    { id: number; size: string; color: string; qty: number }[]
  >([]);
  const [nextRowId, setNextRowId] = useState(1);
  const [customSizes, setCustomSizes] = useState<string[]>([]);
  const [customColors, setCustomColors] = useState<string[]>([]);
  const [showAddSizeModal, setShowAddSizeModal] = useState(false);
  const [showAddColorModal, setShowAddColorModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newSize, setNewSize] = useState("");
  const [newColor, setNewColor] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newCategorySizeType, setNewCategorySizeType] = useState("alphabetic");
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    costPrice: "",
    printCost: "",
    retailPrice: "",
    wholesalePrice: "",
  });

  // Backend state / Notifications
  const [isSaving, setIsSaving] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState<
    "error" | "success" | ""
  >("");

  // --- DATA FETCHING (useQuery Hooks) ---
  const { data: dbProducts, refetch: refetchProducts } = useQuery<any[]>(
    ["products", shopId],
    async () => {
      if (!shopId) {
        throw new Error("Shop ID is required");
      }
      const response = await fetch(`${API_URL}/products?shop_id=${shopId}`);
      const result = await response.json();
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error || "Failed to fetch products");
      }
    },
    { enabled: shopId !== null }
  );

  const { data: dbCategories, refetch: refetchCategories } = useQuery<any[]>(
    ["categories", shopId],
    async () => {
      if (!shopId) {
        throw new Error("Shop ID is required");
      }
      const response = await fetch(`${API_URL}/categories?shop_id=${shopId}`);
      const result = await response.json();
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error || "Failed to fetch categories");
      }
    },
    { enabled: shopId !== null }
  );

  const { data: dbColors, refetch: refetchColors } = useQuery<any[]>(
    ["colors", shopId],
    async () => {
      if (!shopId) {
        throw new Error("Shop ID is required");
      }
      const response = await fetch(`${API_URL}/colors?shop_id=${shopId}`);
      const result = await response.json();
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error || "Failed to fetch colors");
      }
    },
    { enabled: shopId !== null }
  );

  const { data: dbSizes, refetch: refetchSizes } = useQuery<any[]>(
    ["sizes", shopId],
    async () => {
      if (!shopId) {
        throw new Error("Shop ID is required");
      }
      const response = await fetch(`${API_URL}/sizes?shop_id=${shopId}`);
      const result = await response.json();
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error || "Failed to fetch sizes");
      }
    },
    { enabled: shopId !== null }
  );

  const { data: categorySizes, refetch: refetchCategorySizes } = useQuery<any[]>(
    ["categorySizes", selectedCategory, shopId],
    async () => {
      if (!shopId || !selectedCategory) {
        throw new Error("Shop ID and Category ID are required");
      }
      const response = await fetch(`${API_URL}/sizes/by-category/${selectedCategory}?shop_id=${shopId}`);
      const result = await response.json();
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error || "Failed to fetch category sizes");
      }
    },
    { enabled: shopId !== null && selectedCategory !== null }
  );

  // --- SIDE EFFECTS (useEffect) ---
  useEffect(() => {
    if (dbCategories && dbCategories.length > 0) {
      setSelectedCategory(dbCategories[0].category_id.toString());
    }
  }, [dbCategories]);

  // --- HELPER FUNCTIONS ---

  const handleResetFilters = () => {
    setSearchQuery("");
    setSortBy("name");
    setStockFilter("all");
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handleAddProductClick = () => {
    setShowAddProductModal(true);
    // Use the first category ID or default to '1'
    setSelectedCategory(dbCategories?.[0]?.category_id.toString() || "1");
    setStockRows([{ id: 1, size: "", color: "", qty: 0 }]);
    setNextRowId(2);
    setCustomSizes([]);
    setCustomColors([]);
    setIsEditMode(false);
    setSelectedProductId(null); // Clear selected ID for "Add"
    setFormData({
      code: "",
      name: "",
      costPrice: "",
      printCost: "",
      retailPrice: "",
      wholesalePrice: "",
    });
  };

  const handleCloseModal = () => {
    setShowAddProductModal(false);
    setIsEditMode(false);
    setSelectedProductId(null); // Clear selected ID on close
    setFormData({
      code: "",
      name: "",
      costPrice: "",
      printCost: "",
      retailPrice: "",
      wholesalePrice: "",
    });
    setStockRows([]);
    setCustomSizes([]);
    setCustomColors([]);
    setNotificationMessage("");
    setNotificationType("");
    setIsSaving(false);
  };

  /**
   * FIX: Now sets selectedProductId correctly and uses the category ID from the product.
   * NOTE: The stock logic remains heuristic as the full variant data is not provided
   * in the original `dbProducts` map structure (it only sums the total qty).
   */
  const handleEditProduct = (product: any) => {
    setIsEditMode(true);
    setSelectedProductId(product.id); // FIX: Set the selected ID here
    setShowAddProductModal(true);
    setSelectedCategory(
      product.category_id
        ? product.category_id.toString()
        : dbCategories?.[0]?.category_id.toString() || "1"
    );
    setFormData({
      code: product.code,
      name: product.name,
      costPrice: product.cost.toString(),
      printCost: product.printCost ? product.printCost.toString() : "",
      retailPrice: product.retailPrice.toString(),
      wholesalePrice: product.wholesalePrice
        ? product.wholesalePrice.toString()
        : "",
    });

    const sizes = (product.sizes || "")
      .split(",")
      .map((s: string) => s.trim())
      .filter((s) => s);
    const colors = (product.colors || "")
      .split(",")
      .map((c: string) => c.trim())
      .filter((c) => c);

    const newStockRows: {
      id: number;
      size: string;
      color: string;
      qty: number;
    }[] = [];
    let rowId = 1;

    // Distribute total quantity (product.qty) proportionally across all existing variants
    const totalVariants = sizes.length * colors.length;
    const qtyPerVariant =
      totalVariants > 0 ? Math.floor(product.qty / totalVariants) : 0;
    let remainder = totalVariants > 0 ? product.qty % totalVariants : 0;

    colors.forEach((color: string) => {
      sizes.forEach((size: string) => {
        const extraQty = remainder > 0 ? 1 : 0;
        newStockRows.push({
          id: rowId,
          size: size,
          color: color,
          qty: qtyPerVariant + extraQty,
        });
        if (remainder > 0) remainder--;
        rowId++;
      });
    });

    if (newStockRows.length === 0) {
      newStockRows.push({ id: 1, size: "", color: "", qty: 0 });
      rowId = 2;
    }

    setStockRows(newStockRows);
    setNextRowId(rowId);
    setCustomSizes([]);
    setCustomColors([]);
  };

  // Get all available sizes for the selected category (predefined + custom)
  const getAllSizes = () => [
    ...(categorySizes?.map((s) => s.size_name) || []),
    ...customSizes,
  ];

  // Get all available colors (predefined + custom)
  const getAllColors = () => [
    ...(dbColors?.map((c) => c.color_name) || []),
    ...customColors,
  ];

  const showNotification = (message: string, type: "error" | "success") => {
    setNotificationMessage(message);
    setNotificationType(type);
    setTimeout(() => {
      setNotificationMessage("");
      setNotificationType("");
    }, 3000);
  };

  /**
   * FIX: Improved API saving logic to get and use IDs of newly created colors/sizes
   * immediately without waiting for a re-fetch of the full lists.
   */
  const handleSaveProduct = async () => {
    // === SYNCHRONOUS VALIDATION ===
    if (!formData.code.trim()) {
      showNotification("Product Code is required", "error");
      return;
    }
    if (!formData.name.trim()) {
      showNotification("Product Name is required", "error");
      return;
    }
    const cost = parseFloat(formData.costPrice);
    const printCost = parseFloat(formData.printCost || "0");
    const retailPrice = parseFloat(formData.retailPrice);
    const wholesalePrice = parseFloat(formData.wholesalePrice || "0");

    if (isNaN(cost) || cost < 0) {
      showNotification("Valid Product Cost is required (>= 0)", "error");
      return;
    }
    if (isNaN(printCost) || printCost < 0) {
      showNotification("Valid Print Cost is required (>= 0)", "error");
      return;
    }
    if (isNaN(retailPrice) || retailPrice < 0) {
      showNotification("Valid Retail Price is required (>= 0)", "error");
      return;
    }
    if (stockRows.length === 0) {
      showNotification("Please add at least one stock entry.", "error");
      return;
    }
    const hasIncompleteRows = stockRows.some((row) => !row.size || !row.color);
    if (hasIncompleteRows) {
      showNotification(
        "Please fill all size/color combinations for stock entries.",
        "error"
      );
      return;
    }
    const totalQty = stockRows.reduce((sum, row) => sum + row.qty, 0);
    if (!isEditMode && totalQty <= 0) {
      showNotification(
        "A new product must have a total quantity greater than 0.",
        "error"
      );
      return;
    }
    // === END OF VALIDATION ===

    setIsSaving(true);

    try {
      // 1. Prepare Product Payload and Get/Update Product ID
      const basePayload = {
        shop_id: shopId,
        sku: formData.code,
        product_name: formData.name,
        category_id: parseInt(selectedCategory),
        description: "",
        product_cost: cost,
        print_cost: printCost,
        retail_price: retailPrice,
        wholesale_price: wholesalePrice || null,
        product_status: "active",
      };

      let productId: number;

      if (isEditMode && selectedProductId) {
        // Update existing product
        const updateResponse = await fetch(
          `${API_URL}/products/${selectedProductId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(basePayload),
          }
        );
        const updateResult = await updateResponse.json();
        if (!updateResult.success) {
          throw new Error(updateResult.error || "Failed to update product");
        }
        productId = selectedProductId;
      } else {
        // Create new product
        const createResponse = await fetch(
          `${API_URL}/products`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(basePayload),
          }
        );
        const createResult = await createResponse.json();
        if (!createResult.success || !createResult.data.product_id) {
          throw new Error(createResult.error || "Failed to create product");
        }
        productId = createResult.data.product_id;
      }

      // 2. Process Colors and Sizes (Ensure existence and retrieve IDs)
      const uniqueColors = stockRows
        .map((row) => row.color)
        .filter((c, i, a) => a.indexOf(c) === i);
      const uniqueSizes = stockRows
        .map((row) => row.size)
        .filter((s, i, a) => a.indexOf(s) === i);

      const colorIdMap = new Map<string, number>();
      const sizeIdMap = new Map<string, number>();

      dbColors?.forEach((c) => colorIdMap.set(c.color_name, c.color_id));
      dbSizes?.forEach((s) => sizeIdMap.set(s.size_name, s.size_id));

      for (const colorName of uniqueColors) {
        let colorId = colorIdMap.get(colorName);
        if (!colorId) {
          const colorResponse = await fetch(
            `${API_URL}/colors`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ shop_id: shopId, color_name: colorName }),
            }
          );
          const colorResult = await colorResponse.json();
          if (colorResult.success && colorResult.data.color_id) {
            colorId = colorResult.data.color_id;
            colorIdMap.set(colorName, colorId);
          }
        }
        if (colorId) {
          await fetch(
            `${API_URL}/products/${productId}/colors`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ color_id: colorId }),
            }
          );
        }
      }

      for (const sizeName of uniqueSizes) {
        let sizeId = sizeIdMap.get(sizeName);
        if (!sizeId) {
          const sizeResponse = await fetch(
            `${API_URL}/sizes`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ shop_id: shopId, size_name: sizeName, size_type_id: 1 }),
            }
          );
          const sizeResult = await sizeResponse.json();
          if (sizeResult.success && sizeResult.data.size_id) {
            sizeId = sizeResult.data.size_id;
            sizeIdMap.set(sizeName, sizeId);
          }
        }
        if (sizeId) {
          await fetch(
            `${API_URL}/products/${productId}/sizes`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ size_id: sizeId }),
            }
          );
        }
      }

      // 3. Clear existing stock and Update new stock
      if (isEditMode) {
        try {
          await clearProductStock(productId);
        } catch (error) {
          console.error("Failed to clear product stock:", error);
        }
      }

      for (const row of stockRows) {
        const sizeId = sizeIdMap.get(row.size);
        const colorId = colorIdMap.get(row.color);

        if (productId && sizeId && colorId && row.qty > 0) {
          try {
            await updateProductStock(productId, sizeId, colorId, row.qty);
          } catch (error) {
            console.error("Failed to update stock for a row:", {
              productId,
              sizeId,
              colorId,
              error,
            });
            showNotification("Some stock entries failed to save.", "error");
          }
        }
      }

      // 4. Success and Cleanup
      setIsSaving(false);
      showNotification(
        isEditMode
          ? "Product updated successfully!"
          : "Product created successfully!",
        "success"
      );

      // Refresh all dependent lists
      await Promise.all([refetchProducts(), refetchColors(), refetchSizes()]);

      handleCloseModal();
    } catch (error: any) {
      setIsSaving(false);
      showNotification(
        error.message || "An error occurred while saving the product",
        "error"
      );
    }
  };

  // Add new stock row - Fixed to ensure nextRowId is updated correctly
  const addStockRow = () => {
    setStockRows((currentRows) => {
      const newRowId = nextRowId;
      setNextRowId((currentId) => currentId + 1);
      return [...currentRows, { id: newRowId, size: "", color: "", qty: 0 }];
    });
  };

  // Update stock row - Functional update
  const updateStockRow = (id: number, field: string, value: any) => {
    setStockRows((currentRows) =>
      currentRows.map((row) =>
        row.id === id ? { ...row, [field]: value } : row
      )
    );
  };

  // Remove stock row - Functional update
  const removeStockRow = (id: number) => {
    setStockRows((currentRows) => {
      const filteredRows = currentRows.filter((row) => row.id !== id);
      return [...filteredRows];
    });
  };

  // Add custom size - Save to database with category's size type
  const handleAddSize = async () => {
    const trimmedSize = newSize.trim();
    if (!trimmedSize) {
      showNotification("Size name is required", "error");
      return;
    }

    if (getAllSizes().some((s) => s.toLowerCase() === trimmedSize.toLowerCase())) {
      showNotification(`Size "${trimmedSize}" already exists.`, "error");
      return;
    }

    try {
      // Get the size_type_id from the selected category
      const selectedCat = dbCategories?.find(
        (c) => c.category_id.toString() === selectedCategory
      );
      if (!selectedCat) {
        showNotification("Category not found", "error");
        return;
      }

      const response = await fetch(`${API_URL}/sizes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shop_id: shopId,
          size_name: trimmedSize,
          size_type_id: selectedCat.size_type_id,
        }),
      });
      const result = await response.json();
      if (result.success) {
        showNotification(`Size "${trimmedSize}" added successfully`, "success");
        setNewSize("");
        setShowAddSizeModal(false);
        await refetchCategorySizes();
      } else {
        showNotification(result.error || "Failed to add size", "error");
      }
    } catch (error) {
      showNotification("Error adding size", "error");
    }
  };

  // Add custom color
  const handleAddColor = () => {
    const trimmedColor = newColor.trim();
    if (
      trimmedColor &&
      !getAllColors().some(
        (c) => c.toLowerCase() === trimmedColor.toLowerCase()
      )
    ) {
      setCustomColors([...customColors, trimmedColor]);
      setNewColor("");
      setShowAddColorModal(false);
    } else if (trimmedColor) {
      showNotification(`Color "${trimmedColor}" already exists.`, "error");
    }
  };

  // Add custom category
  const handleAddCategory = async () => {
    const trimmedCategory = newCategory.trim();
    if (!trimmedCategory) {
      showNotification("Category name is required", "error");
      return;
    }

    try {
      const sizeTypeMap: { [key: string]: number } = {
        "alphabetic": 2,
        "numerical": 1,
        "other": 3,
      };

      const response = await fetch(`${API_URL}/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shop_id: shopId,
          category_name: trimmedCategory,
          size_type_id: sizeTypeMap[newCategorySizeType] || 1,
        }),
      });
      const result = await response.json();
      if (result.success) {
        showNotification(`Category "${trimmedCategory}" added successfully`, "success");
        setNewCategory("");
        setNewCategorySizeType("alphabetic");
        setShowAddCategoryModal(false);
        await refetchCategories();
      } else {
        showNotification(result.error || "Failed to add category", "error");
      }
    } catch (error) {
      showNotification("Error adding category", "error");
    }
  };

  // Filter and sort products (using total_stock property from API for qty)
  const filteredAndSortedProducts = useMemo(() => {
    const productsToFilter = (dbProducts || []).map((p: any) => ({
      id: p.product_id,
      code: p.sku,
      name: p.product_name,
      colors: p.colors?.map((c: any) => c.color_name).join(", ") || "N/A",
      sizes: p.sizes?.map((s: any) => s.size_name).join(", ") || "N/A",
      cost: parseFloat(p.product_cost) || 0,
      printCost: parseFloat(p.print_cost) || 0,
      qty: p.total_stock || 0, // Assuming API returns total stock as 'total_stock'
      retailPrice: parseFloat(p.retail_price) || 0,
      wholesalePrice: parseFloat(p.wholesale_price) || 0,
      category_id: p.category_id,
    }));

    let result = [...productsToFilter];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (product) =>
          product.code.toLowerCase().includes(query) ||
          product.name.toLowerCase().includes(query) ||
          product.colors.toLowerCase().includes(query)
      );
    }

    if (stockFilter === "low") {
      result = result.filter((p) => p.qty <= 3 && p.qty > 0);
    } else if (stockFilter === "out") {
      result = result.filter((p) => p.qty === 0);
    } else if (stockFilter === "in") {
      result = result.filter((p) => p.qty > 0);
    }

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
  }, [searchQuery, sortBy, stockFilter, dbProducts]);

  // --- RENDER (JSX) ---
  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-red-500">Product Catalog</h1>
            <span className="text-sm font-semibold text-red-400 bg-red-900/30 px-3 py-1 rounded-full">
              {filteredAndSortedProducts.length} products
            </span>
          </div>
          <p className="text-gray-400 mt-2">
            {shopId ? `Shop #${shopId} - Manage your products` : "Select a shop to view products"}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              const html = generateProductsHTML(filteredAndSortedProducts);
              printContent(html, 'Products Report');
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center gap-2"
            title="Print directly"
          >
            🖨️ Print
          </button>
          <button
            onClick={() => {
              const html = generateProductsHTML(filteredAndSortedProducts);
              saveAsPDF(html, 'products_report', 'products');
            }}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center gap-2"
            title="Save as PDF"
          >
            💾 Save PDF
          </button>
          <button
            onClick={handleAddProductClick}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors font-semibold"
          >
            + Add Product
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-red-400">
          Search Products
        </label>
        <input
          type="text"
          placeholder="Search by product code, name, or color..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 bg-gray-700 border-2 border-red-600/30 text-white placeholder-gray-500 rounded-lg focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 transition-colors"
        />
      </div>

      {/* Filters Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-2">
            Sort By
          </label>
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
          <label className="block text-xs font-semibold text-gray-400 mb-2">
            Stock Status
          </label>
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
          <label className="block text-xs font-semibold text-gray-400 mb-2">
            Action
          </label>
          <button
            onClick={handleResetFilters}
            className="w-full px-3 py-2 bg-red-600/20 border border-red-600 text-red-400 text-sm rounded-lg hover:bg-red-600/30 transition-colors font-semibold"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Products Table - Scrollable */}
      <div className="flex-1 overflow-hidden flex flex-col bg-gray-800/50 border border-gray-700 rounded-lg">
        {filteredAndSortedProducts.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-400 text-center">
              {dbProducts && dbProducts.length === 0
                ? "No products for this shop. Add one to get started!"
                : "No products match your search"}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto overflow-y-auto flex-1">
            <table className="w-full text-sm">
              {/* Sticky Table Header */}
              <thead className="sticky top-0 bg-gray-700/80 border-b-2 border-red-600 z-10">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-red-400">
                    Product Code
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-red-400">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-red-400">
                    Colors
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-red-400">
                    Sizes
                  </th>
                  <th className="px-6 py-3 text-right font-semibold text-red-400">
                    Product Cost (Rs.)
                  </th>
                  <th className="px-6 py-3 text-right font-semibold text-red-400">
                    Print Cost (Rs.)
                  </th>
                  <th className="px-6 py-3 text-right font-semibold text-red-400">
                    Retail Price (Rs.)
                  </th>
                  <th className="px-6 py-3 text-right font-semibold text-red-400">
                    Wholesale Price (Rs.)
                  </th>
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
                    <td className="px-6 py-4 text-gray-200 font-mono font-semibold">
                      {product.code}
                    </td>
                    <td className="px-6 py-4 text-gray-200 font-medium">
                      {product.name}
                    </td>
                    <td className="px-6 py-4 text-gray-300">{product.colors}</td>
                    <td className="px-6 py-4 text-gray-300 text-xs">
                      {product.sizes}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-300 font-semibold">
                      {product.cost.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-300 font-semibold">
                      {product.printCost ? product.printCost.toFixed(2) : "0.00"}
                    </td>
                    <td className="px-6 py-4 text-right text-red-400 font-semibold">
                      {product.retailPrice.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-300 font-semibold">
                      {product.wholesalePrice.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {showAddProductModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg shadow-2xl border-2 border-red-600 w-full max-w-4xl">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-red-700 to-red-900 text-white p-6 border-b border-red-600 flex justify-between items-center">
              <h2 className="text-2xl font-bold">
                {isEditMode ? "Edit Product" : "Add New Product"}
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
              {/* Notification Display */}
              {notificationMessage && (
                <div
                  className={`p-3 rounded-lg text-sm font-semibold ${
                    notificationType === "error"
                      ? "bg-red-900/30 border border-red-600/50 text-red-400"
                      : "bg-green-900/30 border border-green-600/50 text-green-400"
                  }`}
                >
                  {notificationMessage}
                </div>
              )}

              {/* Row 1: Product Code & Category */}
              <div className="grid grid-cols-2 gap-3">
                {/* Product Code */}
                <div>
                  <label className="block text-sm font-semibold text-red-400 mb-2">
                    Product Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., TSB-001"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value })
                    }
                    disabled={isEditMode}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const nameInput = document.querySelector(
                          'input[placeholder="e.g., Blue T-Shirt"]'
                        ) as HTMLInputElement;
                        if (nameInput) nameInput.focus();
                      }
                    }}
                    className="w-full px-4 py-2 bg-gray-700 border-2 border-red-600/30 text-white placeholder-gray-500 rounded-lg focus:border-red-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold text-red-400 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "add_category") {
                        setShowAddCategoryModal(true);
                      } else {
                        handleCategoryChange(value);
                      }
                    }}
                    className="w-full px-4 py-2 bg-gray-700 border-2 border-red-600/30 text-white rounded-lg focus:border-red-500 focus:outline-none"
                  >
                    {(dbCategories || []).map((cat) => (
                      <option key={cat.category_id} value={cat.category_id}>
                        {cat.category_name}
                      </option>
                    ))}
                    <option value="add_category">+ Add Category</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Product Name */}
              <div>
                <label className="block text-sm font-semibold text-red-400 mb-2">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Blue T-Shirt"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const costInput = document.querySelector(
                        'input[data-field="costPrice"]'
                      ) as HTMLInputElement;
                      if (costInput) costInput.focus();
                    }
                  }}
                  className="w-full px-4 py-2 bg-gray-700 border-2 border-red-600/30 text-white placeholder-gray-500 rounded-lg focus:border-red-500 focus:outline-none"
                />
              </div>

              {/* Row 3: Prices (4 columns) */}
              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-red-400 mb-2">
                    Product Cost (Rs.) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    data-field="costPrice"
                    value={formData.costPrice}
                    onChange={(e) => {
                      setFormData({ ...formData, costPrice: e.target.value });
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const printInput = document.querySelector(
                          'input[data-field="printCost"]'
                        ) as HTMLInputElement;
                        if (printInput) printInput.focus();
                      }
                    }}
                    className="w-full px-3 py-2 bg-gray-700 border-2 border-red-600/30 text-white placeholder-gray-500 rounded-lg focus:border-red-500 focus:outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-red-400 mb-2">
                    Print Cost (Rs.) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    data-field="printCost"
                    value={formData.printCost}
                    onChange={(e) => {
                      setFormData({ ...formData, printCost: e.target.value });
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const retailInput = document.querySelector(
                          'input[data-field="retailPrice"]'
                        ) as HTMLInputElement;
                        if (retailInput) retailInput.focus();
                      }
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
                    data-field="retailPrice"
                    value={formData.retailPrice}
                    onChange={(e) => {
                      setFormData({ ...formData, retailPrice: e.target.value });
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const wholesaleInput = document.querySelector(
                          'input[data-field="wholesalePrice"]'
                        ) as HTMLInputElement;
                        if (wholesaleInput) wholesaleInput.focus();
                      }
                    }}
                    className="w-full px-3 py-2 bg-gray-700 border-2 border-red-600/30 text-white placeholder-gray-500 rounded-lg focus:border-red-500 focus:outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-red-400 mb-2">
                    Wholesale Price (Rs.){" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    data-field="wholesalePrice"
                    value={formData.wholesalePrice}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        wholesalePrice: e.target.value,
                      });
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSaveProduct();
                      }
                    }}
                    className="w-full px-3 py-2 bg-gray-700 border-2 border-red-600/30 text-white placeholder-gray-500 rounded-lg focus:border-red-500 focus:outline-none text-sm"
                  />
                </div>
              </div>

              {/* Stock Entry Rows - Row-Based System */}
              <div>
                <label className="block text-sm font-semibold text-red-400 mb-3">
                  Stock Entries (Size, Color & Quantity){" "}
                  <span className="text-red-500">*</span>
                </label>

                {/* Stock Rows Table with Scroll */}
                <div className="mb-4 bg-gray-900/50 border border-gray-700 rounded-lg p-4 h-64 overflow-y-auto">
                  {stockRows.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-6">
                      No stock entries yet. Click "Add Row" to start adding
                      stock.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {stockRows.map((row) => (
                        <div
                          key={row.id}
                          className="flex gap-2 items-end bg-gray-800/50 border border-gray-700 rounded-lg p-3 hover:border-red-600/50 transition-colors"
                        >
                          {/* Size Dropdown */}
                          <div className="flex-1 min-w-[120px]">
                            <label className="block text-xs text-gray-400 font-semibold mb-1">
                              Size
                            </label>
                            <select
                              value={row.size}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (value === "add_size") {
                                  setShowAddSizeModal(true);
                                } else {
                                  updateStockRow(row.id, "size", value);
                                }
                              }}
                              className="w-full px-3 py-2 bg-gray-700 border border-red-600/30 text-white text-sm rounded-lg focus:border-red-500 focus:outline-none"
                            >
                              <option value="">Select Size</option>
                              {getAllSizes().map((size) => (
                                <option key={size} value={size}>
                                  {size}
                                </option>
                              ))}
                              <option value="add_size">+ Add Size</option>
                            </select>
                          </div>

                          {/* Color Dropdown */}
                          <div className="flex-1 min-w-[120px]">
                            <label className="block text-xs text-gray-400 font-semibold mb-1">
                              Color
                            </label>
                            <select
                              value={row.color}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (value === "add_color") {
                                  setShowAddColorModal(true);
                                } else {
                                  updateStockRow(row.id, "color", value);
                                }
                              }}
                              className="w-full px-3 py-2 bg-gray-700 border border-red-600/30 text-white text-sm rounded-lg focus:border-red-500 focus:outline-none"
                            >
                              <option value="">Select Color</option>
                              {getAllColors().map((color) => (
                                <option key={color} value={color}>
                                  {color}
                                </option>
                              ))}
                              <option value="add_color">+ Add Color</option>
                            </select>
                          </div>

                          {/* Quantity Input */}
                          <div className="flex-1 min-w-[100px]">
                            <label className="block text-xs text-gray-400 font-semibold mb-1">
                              Qty
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={row.qty === 0 ? "" : row.qty}
                              onChange={(e) => {
                                let value = e.target.value;
                                if (value.startsWith("0") && value.length > 1) {
                                  value = value.replace(/^0+/, "");
                                }
                                updateStockRow(
                                  row.id,
                                  "qty",
                                  parseInt(value) || 0
                                );
                              }}
                              placeholder="0"
                              className="w-full px-3 py-2 bg-gray-700 border border-red-600/30 text-white text-sm rounded-lg focus:border-red-500 focus:outline-none text-center"
                            />
                          </div>

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
                  className="w-full mt-4 px-4 py-2 bg-gray-700 border-2 border-dashed border-red-600/50 text-red-400 rounded-lg hover:border-red-500 hover:bg-gray-700/80 transition-colors font-semibold text-sm"
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

              {/* Mini-Modal for Adding Custom Category */}
              {showAddCategoryModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="bg-gray-800 rounded-lg shadow-2xl border-2 border-red-600 w-full max-w-sm">
                    <div className="bg-gradient-to-r from-red-700 to-red-900 text-white p-4 border-b border-red-600 flex justify-between items-center">
                      <h3 className="text-lg font-bold">Add New Category</h3>
                      <button
                        onClick={() => {
                          setShowAddCategoryModal(false);
                          setNewCategory("");
                          setNewCategorySizeType("alphabetic");
                        }}
                        className="text-white hover:text-red-200 transition-colors text-xl"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="p-4 space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-red-400 mb-2">
                          Category Name
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., T-Shirts, Pants, etc."
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value)}
                          className="w-full px-3 py-2 bg-gray-700 border border-red-600/30 text-white placeholder-gray-500 rounded-lg focus:border-red-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-red-400 mb-2">
                          Size Type
                        </label>
                        <select
                          value={newCategorySizeType}
                          onChange={(e) => setNewCategorySizeType(e.target.value)}
                          className="w-full px-3 py-2 bg-gray-700 border border-red-600/30 text-white rounded-lg focus:border-red-500 focus:outline-none"
                        >
                          <option value="alphabetic">Alphabetic (e.g., S, M, L, XL, ...)</option>
                          <option value="numerical">Numerical (e.g., 1, 2, 3, ...)</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={handleAddCategory}
                          className="flex-1 bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                        >
                          Add Category
                        </button>
                        <button
                          onClick={() => {
                            setShowAddCategoryModal(false);
                            setNewCategory("");
                            setNewCategorySizeType("alphabetic");
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
                <button
                  onClick={handleSaveProduct}
                  disabled={isSaving}
                  className="flex-1 bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving
                    ? "Saving..."
                    : isEditMode
                      ? "Update Product"
                      : "Add Product"}
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
