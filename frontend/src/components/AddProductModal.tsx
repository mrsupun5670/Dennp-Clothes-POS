import React, { useState, useRef, useEffect, useMemo } from "react";
import { useQuery } from "../hooks/useQuery";
import { useShop } from "../context/ShopContext";
import { API_URL } from "../config/api";

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductAdded?: (product: any) => void;
}

const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  onProductAdded,
}) => {
  const { shopId } = useShop();

  // --- STATE DECLARATIONS ---
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

  // Modal-specific error/success messages
  const [sizeModalMessage, setSizeModalMessage] = useState("");
  const [sizeModalMessageType, setSizeModalMessageType] = useState<"error" | "success" | "">("");
  const [colorModalMessage, setColorModalMessage] = useState("");
  const [colorModalMessageType, setColorModalMessageType] = useState<"error" | "success" | "">("");
  const [categoryModalMessage, setCategoryModalMessage] = useState("");
  const [categoryModalMessageType, setCategoryModalMessageType] = useState<"error" | "success" | "">("");
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    costPrice: "",
    printCost: "",
    sewingCost: "",
    extraCost: "",
    retailPrice: "",
    wholesalePrice: "",
  });

  // Backend state / Notifications
  const [isSaving, setIsSaving] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState<"error" | "success" | "">("");

  // --- REFS FOR AUTO-FOCUS ---
  const sizeInputRef = useRef<HTMLInputElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);
  const categoryInputRef = useRef<HTMLInputElement>(null);

  // --- DATA FETCHING (useQuery Hooks) ---
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
    { enabled: isOpen && shopId !== null }
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
    { enabled: isOpen && shopId !== null }
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
    { enabled: isOpen && shopId !== null }
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
    { enabled: isOpen && shopId !== null && selectedCategory !== null }
  );

  // --- SIDE EFFECTS (useEffect) ---
  useEffect(() => {
    if (isOpen && dbCategories && dbCategories.length > 0) {
      setSelectedCategory(dbCategories[0].category_id.toString());
    }
  }, [isOpen, dbCategories]);

  // Auto-focus size input when modal opens
  useEffect(() => {
    if (showAddSizeModal && sizeInputRef.current) {
      setTimeout(() => sizeInputRef.current?.focus(), 0);
    }
  }, [showAddSizeModal]);

  // Auto-focus color input when modal opens
  useEffect(() => {
    if (showAddColorModal && colorInputRef.current) {
      setTimeout(() => colorInputRef.current?.focus(), 0);
    }
  }, [showAddColorModal]);

  // Auto-focus category input when modal opens
  useEffect(() => {
    if (showAddCategoryModal && categoryInputRef.current) {
      setTimeout(() => categoryInputRef.current?.focus(), 0);
    }
  }, [showAddCategoryModal]);

  // Reset modal state when opening
  useEffect(() => {
    if (isOpen) {
      setSelectedCategory(dbCategories?.[0]?.category_id.toString() || "1");
      setStockRows([{ id: 1, size: "", color: "", qty: 0 }]);
      setNextRowId(2);
      setCustomSizes([]);
      setCustomColors([]);
      setFormData({
        code: "",
        name: "",
        costPrice: "",
        printCost: "",
        sewingCost: "",
        extraCost: "",
        retailPrice: "",
        wholesalePrice: "",
      });
      setNotificationMessage("");
      setNotificationType("");
    }
  }, [isOpen]);

  // --- HELPER FUNCTIONS ---

  const handleCloseModal = () => {
    setFormData({
      code: "",
      name: "",
      costPrice: "",
      printCost: "",
      sewingCost: "",
      extraCost: "",
      retailPrice: "",
      wholesalePrice: "",
    });
    setStockRows([]);
    setCustomSizes([]);
    setCustomColors([]);
    setNotificationMessage("");
    setNotificationType("");
    setIsSaving(false);
    onClose();
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const showNotification = (message: string, type: "error" | "success") => {
    setNotificationMessage(message);
    setNotificationType(type);
    setTimeout(() => {
      setNotificationMessage("");
      setNotificationType("");
    }, 3000);
  };

  const handleSaveProduct = async () => {
    // === SYNCHRONOUS VALIDATION ===
    const productCode = String(formData.code).trim();
    if (!productCode) {
      showNotification("Product Code is required", "error");
      return;
    }

    // Validate product code length (max 25 characters for VARCHAR(25))
    if (productCode.length > 25) {
      showNotification("Product Code must be 25 characters or less", "error");
      return;
    }

    if (!formData.name.trim()) {
      showNotification("Product Name is required", "error");
      return;
    }

    const cost = parseFloat(formData.costPrice);
    const printCost = parseFloat(formData.printCost || "0");
    const sewingCost = parseFloat(formData.sewingCost || "0");
    const extraCost = parseFloat(formData.extraCost || "0");
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
    if (isNaN(sewingCost) || sewingCost < 0) {
      showNotification("Valid Sewing Cost is required (>= 0)", "error");
      return;
    }
    if (isNaN(extraCost) || extraCost < 0) {
      showNotification("Valid Extra Cost is required (>= 0)", "error");
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
    if (totalQty <= 0) {
      showNotification(
        "Product must have a total quantity greater than 0.",
        "error"
      );
      return;
    }
    // === END OF VALIDATION ===

    setIsSaving(true);

    try {
      // 0. Build color and size ID maps first
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

      // 1. Process Colors and Sizes FIRST
      for (const colorName of uniqueColors) {
        let colorId = colorIdMap.get(colorName);
        if (!colorId) {
          const colorResponse = await fetch(`${API_URL}/colors`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ shop_id: shopId, color_name: colorName }),
          });
          const colorResult = await colorResponse.json();
          if (colorResult.success && colorResult.data.color_id) {
            colorId = colorResult.data.color_id;
            colorIdMap.set(colorName, colorId);
          }
        }
      }

      for (const sizeName of uniqueSizes) {
        let sizeId = sizeIdMap.get(sizeName);
        if (!sizeId) {
          const sizeResponse = await fetch(`${API_URL}/sizes`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ shop_id: shopId, size_name: sizeName, size_type_id: 1 }),
          });
          const sizeResult = await sizeResponse.json();
          if (sizeResult.success && sizeResult.data.size_id) {
            sizeId = sizeResult.data.size_id;
            sizeIdMap.set(sizeName, sizeId);
          }
        }
      }

      // 2. Build stock payload with resolved color/size IDs
      const stockPayload: Array<{ sizeId: number; colorId: number; quantity: number }> = [];

      for (const row of stockRows) {
        if (row.size && row.color && row.qty > 0) {
          const colorId = colorIdMap.get(row.color);
          const sizeId = sizeIdMap.get(row.size);
          if (colorId && sizeId) {
            stockPayload.push({
              colorId,
              sizeId,
              quantity: row.qty,
            });
          }
        }
      }

      // 3. Create Product Payload with stock data
      const basePayload = {
        shop_id: shopId,
        product_name: formData.name,
        category_id: parseInt(selectedCategory),
        product_cost: cost,
        print_cost: printCost,
        retail_price: retailPrice,
        wholesale_price: wholesalePrice || null,
      };

      const createPayload = {
        ...basePayload,
        product_id: productCode,
        stock: stockPayload,
      };

      const createResponse = await fetch(`${API_URL}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createPayload),
      });

      const createResult = await createResponse.json();

      if (createResponse.status === 409) {
        throw new Error(createResult.error || "Product with this code or name already exists");
      }

      if (!createResult.success || !createResult.data.product_id) {
        throw new Error(createResult.error || "Failed to create product");
      }

      const productId = createResult.data.product_id;

      // 4. Link colors and sizes to product
      for (const colorName of uniqueColors) {
        const colorId = colorIdMap.get(colorName);
        if (colorId) {
          await fetch(`${API_URL}/products/${productId}/colors`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ color_id: colorId }),
          });
        }
      }

      for (const sizeName of uniqueSizes) {
        const sizeId = sizeIdMap.get(sizeName);
        if (sizeId) {
          await fetch(`${API_URL}/products/${productId}/sizes`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ size_id: sizeId }),
          });
        }
      }

      // 5. Success and Cleanup
      setIsSaving(false);
      showNotification("Product created successfully!", "success");

      // Refresh all dependent lists
      await Promise.all([refetchColors(), refetchSizes(), refetchCategories(), refetchCategorySizes()]);

      if (onProductAdded) {
        onProductAdded({ product_id: productId, product_name: formData.name });
      }

      setTimeout(() => {
        handleCloseModal();
      }, 1500);
    } catch (error: any) {
      setIsSaving(false);
      showNotification(
        error.message || "An error occurred while saving the product",
        "error"
      );
    }
  };

  // Add new stock row
  const addStockRow = () => {
    setStockRows((currentRows) => {
      const newRowId = nextRowId;
      setNextRowId((currentId) => currentId + 1);
      return [...currentRows, { id: newRowId, size: "", color: "", qty: 0 }];
    });
  };

  // Update stock row
  const updateStockRow = (id: number, field: string, value: any) => {
    setStockRows((currentRows) =>
      currentRows.map((row) =>
        row.id === id ? { ...row, [field]: value } : row
      )
    );
  };

  // Remove stock row
  const removeStockRow = (id: number) => {
    setStockRows((currentRows) => {
      const filteredRows = currentRows.filter((row) => row.id !== id);
      return [...filteredRows];
    });
  };

  // Add custom size
  const handleAddSize = async () => {
    const trimmedSize = newSize.trim();
    if (!trimmedSize) {
      setSizeModalMessage("Size name is required");
      setSizeModalMessageType("error");
      setTimeout(() => { setSizeModalMessage(""); setSizeModalMessageType(""); }, 3000);
      return;
    }

    if (getAllSizes().some((s) => s.toLowerCase() === trimmedSize.toLowerCase())) {
      setSizeModalMessage(`Size "${trimmedSize}" already exists`);
      setSizeModalMessageType("error");
      setTimeout(() => { setSizeModalMessage(""); setSizeModalMessageType(""); }, 3000);
      return;
    }

    try {
      const selectedCat = dbCategories?.find(
        (c) => c.category_id.toString() === selectedCategory
      );
      if (!selectedCat) {
        setSizeModalMessage("Category not found");
        setSizeModalMessageType("error");
        setTimeout(() => { setSizeModalMessage(""); setSizeModalMessageType(""); }, 3000);
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
        setSizeModalMessage(`Size "${trimmedSize}" added successfully`);
        setSizeModalMessageType("success");
        setTimeout(() => {
          setNewSize("");
          setShowAddSizeModal(false);
          setSizeModalMessage("");
          setSizeModalMessageType("");
        }, 1500);
        await refetchCategorySizes();
      } else {
        setSizeModalMessage(result.error || "Failed to add size");
        setSizeModalMessageType("error");
        setTimeout(() => { setSizeModalMessage(""); setSizeModalMessageType(""); }, 3000);
      }
    } catch (error) {
      setSizeModalMessage("Error adding size");
      setSizeModalMessageType("error");
      setTimeout(() => { setSizeModalMessage(""); setSizeModalMessageType(""); }, 3000);
    }
  };

  // Add custom color
  const handleAddColor = async () => {
    const trimmedColor = newColor.trim();
    if (!trimmedColor) {
      setColorModalMessage("Color name is required");
      setColorModalMessageType("error");
      setTimeout(() => { setColorModalMessage(""); setColorModalMessageType(""); }, 3000);
      return;
    }

    if (getAllColors().some((c) => c.toLowerCase() === trimmedColor.toLowerCase())) {
      setColorModalMessage(`Color "${trimmedColor}" already exists`);
      setColorModalMessageType("error");
      setTimeout(() => { setColorModalMessage(""); setColorModalMessageType(""); }, 3000);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/colors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shop_id: shopId,
          color_name: trimmedColor,
          hex_code: null,
        }),
      });
      const result = await response.json();
      if (result.success) {
        setColorModalMessage(`Color "${trimmedColor}" added successfully`);
        setColorModalMessageType("success");
        setTimeout(() => {
          setNewColor("");
          setShowAddColorModal(false);
          setColorModalMessage("");
          setColorModalMessageType("");
        }, 1500);
        await refetchColors();
      } else {
        setColorModalMessage(result.error || "Failed to add color");
        setColorModalMessageType("error");
        setTimeout(() => { setColorModalMessage(""); setColorModalMessageType(""); }, 3000);
      }
    } catch (error) {
      setColorModalMessage("Error adding color");
      setColorModalMessageType("error");
      setTimeout(() => { setColorModalMessage(""); setColorModalMessageType(""); }, 3000);
    }
  };

  // Add custom category
  const handleAddCategory = async () => {
    const trimmedCategory = newCategory.trim();
    if (!trimmedCategory) {
      setCategoryModalMessage("Category name is required");
      setCategoryModalMessageType("error");
      setTimeout(() => { setCategoryModalMessage(""); setCategoryModalMessageType(""); }, 3000);
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
        setCategoryModalMessage(`Category "${trimmedCategory}" added successfully`);
        setCategoryModalMessageType("success");
        setTimeout(() => {
          setNewCategory("");
          setNewCategorySizeType("alphabetic");
          setShowAddCategoryModal(false);
          setCategoryModalMessage("");
          setCategoryModalMessageType("");
        }, 1500);
        await refetchCategories();
      } else {
        setCategoryModalMessage(result.error || "Failed to add category");
        setCategoryModalMessageType("error");
        setTimeout(() => { setCategoryModalMessage(""); setCategoryModalMessageType(""); }, 3000);
      }
    } catch (error) {
      setCategoryModalMessage("Error adding category");
      setCategoryModalMessageType("error");
      setTimeout(() => { setCategoryModalMessage(""); setCategoryModalMessageType(""); }, 3000);
    }
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg shadow-2xl border-2 border-red-600 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-red-700 to-red-900 text-white p-6 border-b border-red-600 flex justify-between items-center sticky top-0">
          <h2 className="text-2xl font-bold">Add New Product</h2>
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
                placeholder="e.g., TSHIRT-001 or 1001"
                value={formData.code}
                onChange={(e) => {
                  setFormData({ ...formData, code: e.target.value });
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const nameInput = document.querySelector(
                      'input[placeholder="e.g., Blue T-Shirt"]'
                    ) as HTMLInputElement;
                    if (nameInput) nameInput.focus();
                  }
                }}
                className="w-full px-3 py-1.5 bg-gray-700 border-2 border-red-600/30 text-white placeholder-gray-500 rounded-lg focus:border-red-500 focus:outline-none text-sm"
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
                className="w-full px-3 py-1.5 bg-gray-700 border-2 border-red-600/30 text-white rounded-lg focus:border-red-500 focus:outline-none text-sm"
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
              className="w-full px-3 py-1.5 bg-gray-700 border-2 border-red-600/30 text-white placeholder-gray-500 rounded-lg focus:border-red-500 focus:outline-none text-sm"
            />
          </div>

          {/* Row 3: Cost Fields (3x2 Grid) */}
          <div>
            <label className="block text-sm font-semibold text-red-400 mb-2">
              Cost Breakdown
            </label>
            <div className="grid grid-cols-3 gap-2">
              {/* Product Cost */}
              <div>
                <label className="block text-[10px] font-semibold text-gray-400 mb-1">
                  Product Cost <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  data-field="costPrice"
                  value={formData.costPrice}
                  onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                  className="w-full px-2 py-1.5 bg-gray-700 border border-red-600/30 text-white placeholder-gray-500 rounded text-xs focus:border-red-500 focus:outline-none"
                />
              </div>

              {/* Print Cost */}
              <div>
                <label className="block text-[10px] font-semibold text-gray-400 mb-1">
                  Print Cost <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  data-field="printCost"
                  value={formData.printCost}
                  onChange={(e) => setFormData({ ...formData, printCost: e.target.value })}
                  className="w-full px-2 py-1.5 bg-gray-700 border border-red-600/30 text-white placeholder-gray-500 rounded text-xs focus:border-red-500 focus:outline-none"
                />
              </div>

              {/* Sewing Cost */}
              <div>
                <label className="block text-[10px] font-semibold text-gray-400 mb-1">
                  Sewing Cost
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  data-field="sewingCost"
                  value={formData.sewingCost}
                  onChange={(e) => setFormData({ ...formData, sewingCost: e.target.value })}
                  className="w-full px-2 py-1.5 bg-gray-700 border border-red-600/30 text-white placeholder-gray-500 rounded text-xs focus:border-red-500 focus:outline-none"
                />
              </div>

              {/* Extra Cost */}
              <div>
                <label className="block text-[10px] font-semibold text-gray-400 mb-1">
                  Extra Cost
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  data-field="extraCost"
                  value={formData.extraCost}
                  onChange={(e) => setFormData({ ...formData, extraCost: e.target.value })}
                  className="w-full px-2 py-1.5 bg-gray-700 border border-red-600/30 text-white placeholder-gray-500 rounded text-xs focus:border-red-500 focus:outline-none"
                />
              </div>

              {/* Retail Price */}
              <div>
                <label className="block text-[10px] font-semibold text-gray-400 mb-1">
                  Retail Price <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  data-field="retailPrice"
                  value={formData.retailPrice}
                  onChange={(e) => setFormData({ ...formData, retailPrice: e.target.value })}
                  className="w-full px-2 py-1.5 bg-gray-700 border border-red-600/30 text-white placeholder-gray-500 rounded text-xs focus:border-red-500 focus:outline-none"
                />
              </div>

              {/* Wholesale Price */}
              <div>
                <label className="block text-[10px] font-semibold text-gray-400 mb-1">
                  Wholesale Price <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  data-field="wholesalePrice"
                  value={formData.wholesalePrice}
                  onChange={(e) => setFormData({ ...formData, wholesalePrice: e.target.value })}
                  className="w-full px-2 py-1.5 bg-gray-700 border border-red-600/30 text-white placeholder-gray-500 rounded text-xs focus:border-red-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Total Cost Display */}
            <div className="mt-2 p-2 bg-gray-900/50 border border-gray-700 rounded">
              <p className="text-xs text-gray-400">
                Total Cost: <span className="text-yellow-400 font-semibold">Rs. {(
                  (parseFloat(formData.costPrice) || 0) +
                  (parseFloat(formData.printCost) || 0) +
                  (parseFloat(formData.sewingCost) || 0) +
                  (parseFloat(formData.extraCost) || 0)
                ).toFixed(2)}</span>
              </p>
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
                      ref={sizeInputRef}
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
                  {sizeModalMessage && (
                    <div className={`px-3 py-2 rounded-lg text-sm font-semibold border ${
                      sizeModalMessageType === "error"
                        ? "bg-red-600/20 text-red-300 border-red-600/50"
                        : "bg-green-600/20 text-green-300 border-green-600/50"
                    }`}>
                      {sizeModalMessage}
                    </div>
                  )}
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
                      ref={colorInputRef}
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
                  {colorModalMessage && (
                    <div className={`px-3 py-2 rounded-lg text-sm font-semibold border ${
                      colorModalMessageType === "error"
                        ? "bg-red-600/20 text-red-300 border-red-600/50"
                        : "bg-green-600/20 text-green-300 border-green-600/50"
                    }`}>
                      {colorModalMessage}
                    </div>
                  )}
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
                      ref={categoryInputRef}
                      type="text"
                      placeholder="e.g., T-Shirts, Pants, etc."
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-red-600/30 text-white placeholder-gray-500 rounded-lg focus:border-red-500 focus:outline-none"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") handleAddCategory();
                      }}
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
                  {categoryModalMessage && (
                    <div className={`px-3 py-2 rounded-lg text-sm font-semibold border ${
                      categoryModalMessageType === "error"
                        ? "bg-red-600/20 text-red-300 border-red-600/50"
                        : "bg-green-600/20 text-green-300 border-green-600/50"
                    }`}>
                      {categoryModalMessage}
                    </div>
                  )}
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
              {isSaving ? "Saving..." : "Add Product"}
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
  );
};

export default AddProductModal;
