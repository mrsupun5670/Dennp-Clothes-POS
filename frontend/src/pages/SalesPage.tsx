import React, { useState, useMemo } from "react";

// Interfaces
interface Customer {
  id: string;
  name: string;
  email: string;
  mobile: string;
  totalSpent: number;
  totalOrders: number;
  joined: string;
}

interface Product {
  id: string;
  code: string;
  name: string;
  retailPrice: number;
  sizesByCategory: { [key: string]: string[] };
  colorsByCategory: { [key: string]: string[] };
  category: string;
}

interface CartItem {
  id: string;
  productCode: string;
  productName: string;
  size: string;
  color: string;
  quantity: number;
  price: number;
}

interface NewCustomer {
  name: string;
  email: string;
  mobile: string;
}

// Sample data
const SAMPLE_CUSTOMERS: Customer[] = [
  {
    id: "C001",
    name: "Roshan Perera",
    email: "roshan.perera@email.com",
    mobile: "+94 71 234 5678",
    totalSpent: 45000,
    totalOrders: 12,
    joined: "2024-01-15",
  },
  {
    id: "C002",
    name: "Priya Jayasooriya",
    email: "priya.j@email.com",
    mobile: "+94 76 234 5679",
    totalSpent: 32500,
    totalOrders: 8,
    joined: "2024-02-20",
  },
  {
    id: "C003",
    name: "Kamal Silva",
    email: "kamal.silva@email.com",
    mobile: "+94 77 234 5680",
    totalSpent: 28750,
    totalOrders: 6,
    joined: "2024-03-10",
  },
  {
    id: "C004",
    name: "Lakshmi Fernando",
    email: "lakshmi.f@email.com",
    mobile: "+94 70 890 1234",
    totalSpent: 52000,
    totalOrders: 14,
    joined: "2023-11-05",
  },
  {
    id: "C005",
    name: "Arjun Wickramasinghe",
    email: "arjun.w@email.com",
    mobile: "+94 75 567 8901",
    totalSpent: 38500,
    totalOrders: 9,
    joined: "2024-01-28",
  },
];

const SAMPLE_PRODUCTS: Product[] = [
  {
    id: "P001",
    code: "TSH-KN01",
    name: "Cotton Crew Neck T-Shirt",
    retailPrice: 1250,
    category: "tshirt",
    sizesByCategory: { tshirt: ["XS", "S", "M", "L", "XL", "XXL"] },
    colorsByCategory: { tshirt: ["Black", "White", "Navy", "Maroon", "Green"] },
  },
  {
    id: "P002",
    code: "SHT-OX01",
    name: "Oxford Formal Shirt",
    retailPrice: 2800,
    category: "shirt",
    sizesByCategory: { shirt: ["14", "14.5", "15", "15.5", "16", "16.5", "17"] },
    colorsByCategory: { shirt: ["White", "Light Blue", "Sky Blue", "Cream"] },
  },
  {
    id: "P003",
    code: "TRS-FR01",
    name: "Formal Trousers",
    retailPrice: 3500,
    category: "trouser",
    sizesByCategory: { trouser: ["28", "30", "32", "34", "36", "38"] },
    colorsByCategory: { trouser: ["Black", "Navy", "Gray", "Khaki"] },
  },
  {
    id: "P004",
    code: "CRP-SU01",
    name: "Summer Crop Top",
    retailPrice: 1650,
    category: "croptop",
    sizesByCategory: { croptop: ["XS", "S", "M", "L", "XL"] },
    colorsByCategory: { croptop: ["Black", "White", "Pink", "Peach", "Yellow"] },
  },
  {
    id: "P005",
    code: "DRS-EV01",
    name: "Evening Saree Blouse",
    retailPrice: 2200,
    category: "dress",
    sizesByCategory: { dress: ["XS", "S", "M", "L", "XL"] },
    colorsByCategory: { dress: ["Red", "Maroon", "Gold", "Purple", "Blue"] },
  },
  {
    id: "P006",
    code: "JKT-CB01",
    name: "Casual Blazer",
    retailPrice: 4200,
    category: "shirt",
    sizesByCategory: { shirt: ["S", "M", "L", "XL"] },
    colorsByCategory: { shirt: ["Black", "Navy", "Gray", "Brown"] },
  },
];

interface SizeOption {
  [key: string]: string[];
}

interface ColorOption {
  [key: string]: string[];
}

const SalesPage: React.FC = () => {
  // State Management
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [paidAmount, setPaidAmount] = useState("");
  const [orderNotes, setOrderNotes] = useState("");

  // Modal States
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showProductSearch, setShowProductSearch] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showAddSizeModal, setShowAddSizeModal] = useState(false);
  const [showAddColorModal, setShowAddColorModal] = useState(false);

  // New Product Form States
  const [selectedCategory, setSelectedCategory] = useState<string>("tshirt");
  const [stockRows, setStockRows] = useState<{ id: number; size: string; color: string; qty: number }[]>([]);
  const [nextRowId, setNextRowId] = useState(1);
  const [customSizes, setCustomSizes] = useState<string[]>([]);
  const [customColors, setCustomColors] = useState<string[]>([]);
  const [newSize, setNewSize] = useState("");
  const [newColor, setNewColor] = useState("");
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    costPrice: 0,
    retailPrice: 0,
    wholesalePrice: 0,
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

  // Helper function to get all sizes including custom ones
  const getAllSizes = () => {
    const categoryKey = selectedCategory as keyof typeof sizesByCategory;
    const baseSizes = sizesByCategory[categoryKey] || [];
    return [...baseSizes, ...customSizes];
  };

  // Helper function to get all colors including custom ones
  const getAllColors = () => {
    const categoryKey = selectedCategory as keyof typeof colorsByCategory;
    const baseColors = colorsByCategory[categoryKey] || [];
    return [...baseColors, ...customColors];
  };

  const updateStockRow = (rowId: number, field: "size" | "color" | "qty", value: any) => {
    setStockRows(
      stockRows.map((row) =>
        row.id === rowId ? { ...row, [field]: value } : row
      )
    );
  };

  const addStockRow = () => {
    setStockRows([...stockRows, { id: nextRowId, size: "", color: "", qty: 0 }]);
    setNextRowId(nextRowId + 1);
  };

  const removeStockRow = (rowId: number) => {
    setStockRows(stockRows.filter((row) => row.id !== rowId));
  };

  const handleAddSize = () => {
    if (newSize.trim()) {
      setCustomSizes([...customSizes, newSize.trim()]);
      setNewSize("");
      setShowAddSizeModal(false);
    }
  };

  const handleAddColor = () => {
    if (newColor.trim()) {
      setCustomColors([...customColors, newColor.trim()]);
      setNewColor("");
      setShowAddColorModal(false);
    }
  };

  const handleAddProductClick = () => {
    setShowAddProductModal(true);
    setSelectedCategory("tshirt");
    setStockRows([{ id: 1, size: "", color: "", qty: 0 }]);
    setNextRowId(2);
    setCustomSizes([]);
    setCustomColors([]);
    setFormData({ code: "", name: "", costPrice: 0, retailPrice: 0, wholesalePrice: 0 });
  };

  const handleCloseProductModal = () => {
    setShowAddProductModal(false);
    setFormData({ code: "", name: "", costPrice: 0, retailPrice: 0, wholesalePrice: 0 });
    setStockRows([]);
    setCustomSizes([]);
    setCustomColors([]);
  };

  // Search and Filter States
  const [customerSearch, setCustomerSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [customers, setCustomers] = useState<Customer[]>(SAMPLE_CUSTOMERS);
  const [newCustomer, setNewCustomer] = useState<NewCustomer>({
    name: "",
    email: "",
    mobile: "",
  });

  // Product Selection States
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedQty, setSelectedQty] = useState("");

  // Filtered data
  const filteredCustomers = useMemo(() => {
    if (!customerSearch.trim()) return customers;
    const query = customerSearch.toLowerCase();
    return customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(query) ||
        customer.id.toLowerCase().includes(query) ||
        customer.mobile.includes(query)
    );
  }, [customerSearch, customers]);

  const filteredProducts = useMemo(() => {
    if (!productSearch.trim()) return SAMPLE_PRODUCTS;
    const query = productSearch.toLowerCase();
    return SAMPLE_PRODUCTS.filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        product.code.toLowerCase().includes(query)
    );
  }, [productSearch]);

  // Calculations
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal;
  const paid = parseFloat(paidAmount) || 0;
  const balance = total - paid;
  const isAdvance = paid > 0 && paid < total;

  // Handlers
  const handleAddCustomer = () => {
    if (!newCustomer.name || !newCustomer.mobile) {
      alert("Please fill in required fields");
      return;
    }

    const customer: Customer = {
      id: `C${Date.now()}`,
      name: newCustomer.name,
      email: newCustomer.email,
      mobile: newCustomer.mobile,
      totalSpent: 0,
      totalOrders: 0,
      joined: new Date().toISOString().split("T")[0],
    };

    setCustomers([...customers, customer]);
    setSelectedCustomer(customer);
    setNewCustomer({ name: "", email: "", mobile: "" });
    setShowAddCustomerModal(false);
  };

  const handleAddProductToCart = () => {
    if (!selectedProduct || !selectedSize || !selectedColor || !selectedQty) {
      alert("Please select size, color, and quantity");
      return;
    }

    const cartItem: CartItem = {
      id: `${selectedProduct.id}-${selectedSize}-${selectedColor}-${Date.now()}`,
      productCode: selectedProduct.code,
      productName: selectedProduct.name,
      size: selectedSize,
      color: selectedColor,
      quantity: parseInt(selectedQty),
      price: selectedProduct.retailPrice,
    };

    setCartItems([...cartItems, cartItem]);
    setSelectedProduct(null);
    setSelectedSize("");
    setSelectedColor("");
    setSelectedQty("");
    setProductSearch("");
    setShowProductSearch(false);
  };

  const handleRemoveFromCart = (id: string) => {
    setCartItems(cartItems.filter((item) => item.id !== id));
  };

  const handleSaveOrder = () => {
    if (!selectedCustomer) {
      alert("Please select a customer");
      return;
    }
    if (cartItems.length === 0) {
      alert("Please add items to cart");
      return;
    }

    const orderId = `ORD-${Date.now()}`;
    const orderStatus = paid >= total ? "Paid" : isAdvance ? "Advance" : "Pending";

    console.log({
      orderId,
      customer: selectedCustomer,
      items: cartItems,
      total,
      paidAmount: paid,
      balance,
      orderStatus,
      notes: orderNotes,
      date: new Date().toISOString(),
    });

    alert(`Order ${orderId} saved successfully!`);
    // Reset form
    setCartItems([]);
    setPaidAmount("");
    setOrderNotes("");
    setSelectedCustomer(null);
  };

  const handlePrintBill = () => {
    if (!selectedCustomer || cartItems.length === 0) {
      alert("Please select customer and add items");
      return;
    }
    alert("Bill print functionality will be implemented");
  };

  const handleCancelOrder = () => {
    setCartItems([]);
    setPaidAmount("");
    setOrderNotes("");
    setSelectedCustomer(null);
  };

  const sizeOptions = selectedProduct
    ? selectedProduct.sizesByCategory[selectedProduct.category] || []
    : [];
  const colorOptions = selectedProduct
    ? selectedProduct.colorsByCategory[selectedProduct.category] || []
    : [];

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-red-500">Sales & Orders</h1>
          <span className="text-sm font-semibold text-red-400 bg-red-900/30 px-3 py-1 rounded-full">
            {cartItems.length} items
          </span>
        </div>
        <p className="text-gray-400 mt-2">Create orders from online or WhatsApp enquiries</p>
      </div>

      {/* Main Content - Two Columns */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
        {/* Left Side - Customer & Products */}
        <div className="lg:col-span-2 space-y-6 flex flex-col min-h-0">
          {/* Customer Selection */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-red-400">
                  Select Customer
                </label>
                <button
                  onClick={() => setShowAddCustomerModal(true)}
                  className="text-red-400 hover:text-red-300 font-bold text-lg transition-colors"
                  title="Add new customer"
                >
                  +
                </button>
              </div>
              <div className="relative space-y-2">
                <input
                  type="text"
                  placeholder="Search customer by name, ID, or mobile..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 border-2 border-red-600/30 text-white placeholder-gray-500 rounded-lg focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30"
                />

                {/* Customer Dropdown */}
                {customerSearch && filteredCustomers.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-gray-700 border border-red-600/50 rounded-lg max-h-40 overflow-y-auto z-50 mt-1">
                    {filteredCustomers.map((customer) => (
                      <button
                        key={customer.id}
                        onClick={() => {
                          setSelectedCustomer(customer);
                          setCustomerSearch("");
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-red-900/40 border-b border-gray-600/50 text-sm"
                      >
                        <div className="font-medium text-gray-100">{customer.name}</div>
                        <div className="text-xs text-gray-400">{customer.mobile}</div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Add New Customer Button */}
                {customerSearch && filteredCustomers.length === 0 && (
                  <button
                    onClick={() => setShowAddCustomerModal(true)}
                    className="w-full px-4 py-2 border-2 border-dashed border-red-600 text-red-400 rounded-lg hover:bg-red-900/20 text-sm font-medium transition-colors"
                  >
                    + Add New Customer
                  </button>
                )}
              </div>
            </div>

            {/* Selected Customer Display */}
            {selectedCustomer && (
              <div className="bg-gray-700/50 border border-red-600/30 rounded p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-100">{selectedCustomer.name}</p>
                    <p className="text-xs text-gray-400">{selectedCustomer.mobile}</p>
                  </div>
                  <button
                    onClick={() => setSelectedCustomer(null)}
                    className="text-gray-400 hover:text-red-400 text-lg"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Product Selection */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 flex-1 flex flex-col min-h-0 overflow-hidden">
            <div className="space-y-4 flex flex-col min-h-0">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-red-400">
                    Add Products
                  </label>
                  <button
                    onClick={handleAddProductClick}
                    className="text-red-400 hover:text-red-300 font-bold text-lg transition-colors"
                    title="Add new product"
                  >
                    +
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search product by code or name..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    onFocus={() => setShowProductSearch(true)}
                    className="w-full px-4 py-2 bg-gray-700 border-2 border-red-600/30 text-white placeholder-gray-500 rounded-lg focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30"
                  />

                {/* Product Dropdown */}
                {showProductSearch && productSearch && filteredProducts.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-gray-700 border border-red-600/50 rounded-lg max-h-48 overflow-y-auto z-50 mt-1">
                    {filteredProducts.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => {
                          setSelectedProduct(product);
                          setShowProductSearch(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-red-900/40 border-b border-gray-600/50 text-sm"
                      >
                        <div className="font-medium text-gray-100">{product.name}</div>
                        <div className="text-xs text-gray-400">
                          {product.code} • Rs. {product.retailPrice.toFixed(2)}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                </div>
              </div>

              {/* Product Selection Panel - Sequential Dropdowns */}
              {selectedProduct && (
                <div className="flex-1 overflow-y-auto min-h-0">
                  <div className="bg-gray-700/50 border border-red-600/30 rounded-lg p-4 space-y-3">
                    <div>
                      <p className="font-semibold text-gray-100">{selectedProduct.name}</p>
                      <p className="text-xs text-gray-400 mt-1">{selectedProduct.code}</p>
                    </div>

                    {/* Size Selection Dropdown */}
                    <div>
                      <label className="block text-xs font-semibold text-red-400 mb-2">
                        Select Size
                      </label>
                      <select
                        value={selectedSize}
                        onChange={(e) => setSelectedSize(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-600 border border-gray-500 text-white rounded text-sm focus:border-red-500 focus:outline-none"
                      >
                        <option value="">-- Choose Size --</option>
                        {sizeOptions.map((size) => (
                          <option key={size} value={size}>
                            {size}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Color Selection Dropdown - Only show after size selected */}
                    {selectedSize && (
                      <div>
                        <label className="block text-xs font-semibold text-red-400 mb-2">
                          Select Color
                        </label>
                        <select
                          value={selectedColor}
                          onChange={(e) => setSelectedColor(e.target.value)}
                          className="w-full px-3 py-2 bg-gray-600 border border-gray-500 text-white rounded text-sm focus:border-red-500 focus:outline-none"
                        >
                          <option value="">-- Choose Color --</option>
                          {colorOptions.map((color) => (
                            <option key={color} value={color}>
                              {color}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Quantity Input - Only show after color selected */}
                    {selectedSize && selectedColor && (
                      <div>
                        <label className="block text-xs font-semibold text-red-400 mb-2">
                          Quantity
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={selectedQty}
                          onChange={(e) => {
                            let value = e.target.value;
                            // Remove leading zero if user starts typing
                            if (value.startsWith("0") && value.length > 1 && value[1] !== ".") {
                              value = value.replace(/^0+/, "");
                            }
                            setSelectedQty(value);
                          }}
                          placeholder="Enter quantity"
                          className="w-full px-3 py-2 bg-gray-600 border border-gray-500 text-white rounded text-sm focus:border-red-500 focus:outline-none"
                        />
                      </div>
                    )}

                    {/* Add to Cart Button - Only show when all fields filled */}
                    {selectedSize && selectedColor && selectedQty && (
                      <button
                        onClick={handleAddProductToCart}
                        className="w-full bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                      >
                        + Add to Cart
                      </button>
                    )}

                    {/* Cancel Selection */}
                    <button
                      onClick={() => {
                        setSelectedProduct(null);
                        setSelectedSize("");
                        setSelectedColor("");
                        setSelectedQty("");
                      }}
                      className="w-full border border-gray-500 text-gray-400 py-2 rounded-lg text-sm hover:bg-gray-700/50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side - Cart & Billing */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 flex flex-col min-h-0">
          <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-700">
            <h2 className="text-xl font-bold text-red-500">Order Summary</h2>
            <span className="text-sm bg-red-900/30 text-red-400 px-2 py-1 rounded">
              {cartItems.length} items
            </span>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto space-y-2 mb-4">
            {cartItems.length > 0 ? (
              cartItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-gray-700/50 p-3 rounded border border-gray-600 hover:border-red-600/50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-100">{item.productName}</p>
                      <p className="text-xs text-gray-400">
                        {item.size} • {item.color}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveFromCart(item.id)}
                      className="text-gray-400 hover:text-red-400 ml-2"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400">Qty: {item.quantity}</span>
                    <span className="font-semibold text-red-400">
                      Rs. {(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-400 text-sm py-8">
                No items in cart
              </div>
            )}
          </div>

          {/* Totals */}
          <div className="space-y-3 border-t border-gray-700 pt-4 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Subtotal:</span>
              <span className="font-semibold text-gray-100">Rs. {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg pt-2 border-t border-red-600">
              <span className="font-bold text-gray-100">Total:</span>
              <span className="font-bold text-red-500">Rs. {total.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Input */}
          <div className="space-y-2 mb-4 pb-4 border-b border-gray-700">
            <label className="block text-xs font-semibold text-red-400">Paid Amount</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={paidAmount}
              onChange={(e) => {
                let value = e.target.value;
                // Remove leading zero if user starts typing
                if (value.startsWith("0") && value.length > 1 && value[1] !== ".") {
                  value = value.replace(/^0+/, "");
                }
                setPaidAmount(value);
              }}
              placeholder="Enter paid amount"
              className="w-full px-3 py-2 bg-gray-700 border-2 border-red-600/30 text-white rounded focus:border-red-500 focus:outline-none text-sm"
            />

            {/* Balance Display */}
            {paidAmount && (
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
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <button
              onClick={handleSaveOrder}
              disabled={!selectedCustomer || cartItems.length === 0}
              className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
            >
              Save Order
            </button>
            <button
              onClick={handlePrintBill}
              disabled={!selectedCustomer || cartItems.length === 0}
              className="w-full border-2 border-red-600 text-red-400 py-2 rounded-lg font-semibold hover:bg-red-900/20 disabled:border-gray-600 disabled:text-gray-600 disabled:cursor-not-allowed transition-colors"
            >
              Print Bill
            </button>
            <button
              onClick={() => setShowNotesModal(true)}
              className="w-full border border-gray-600 text-gray-300 py-2 rounded-lg font-semibold hover:bg-gray-700/50 transition-colors"
            >
              📝 Add Notes
            </button>
            <button
              onClick={handleCancelOrder}
              className="w-full border border-gray-600 text-gray-400 py-2 rounded-lg text-sm hover:bg-gray-700/50 transition-colors"
            >
              Clear Cart
            </button>
          </div>
        </div>
      </div>

      {/* Add Customer Modal */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-md w-full p-6 border border-gray-700 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-red-500">Add New Customer</h2>
              <button
                onClick={() => setShowAddCustomerModal(false)}
                className="text-gray-400 hover:text-red-400 text-xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Customer Name *"
                value={newCustomer.name}
                onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded text-sm placeholder-gray-500 focus:border-red-500 focus:outline-none"
              />
              <input
                type="email"
                placeholder="Email"
                value={newCustomer.email}
                onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded text-sm placeholder-gray-500 focus:border-red-500 focus:outline-none"
              />
              <input
                type="tel"
                placeholder="Mobile Number *"
                value={newCustomer.mobile}
                onChange={(e) => setNewCustomer({ ...newCustomer, mobile: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded text-sm placeholder-gray-500 focus:border-red-500 focus:outline-none"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleAddCustomer}
                className="flex-1 bg-red-600 text-white py-2 rounded font-semibold hover:bg-red-700 transition-colors"
              >
                Add Customer
              </button>
              <button
                onClick={() => setShowAddCustomerModal(false)}
                className="flex-1 border border-gray-600 text-gray-400 py-2 rounded font-semibold hover:bg-gray-700/50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Notes Modal */}
      {showNotesModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-md w-full p-6 border border-gray-700 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-red-500">Order Notes</h2>
              <button
                onClick={() => setShowNotesModal(false)}
                className="text-gray-400 hover:text-red-400 text-xl"
              >
                ✕
              </button>
            </div>

            <textarea
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              placeholder="Add notes about this order... e.g., specific alterations, rush order, special requests, etc."
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded text-sm placeholder-gray-500 focus:border-red-500 focus:outline-none min-h-[150px] resize-none"
            />

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setShowNotesModal(false)}
                className="flex-1 bg-red-600 text-white py-2 rounded font-semibold hover:bg-red-700 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddProductModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg shadow-2xl border-2 border-red-600 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-red-700 to-red-900 text-white p-6 border-b border-red-600 flex justify-between items-center sticky top-0">
              <h2 className="text-2xl font-bold">Add New Product</h2>
              <button
                onClick={handleCloseProductModal}
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
                  placeholder="e.g., TSH-001"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border-2 border-red-600/30 text-white placeholder-gray-500 rounded-lg focus:border-red-500 focus:outline-none"
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
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setStockRows([]);
                  }}
                  className="w-full px-4 py-2 bg-gray-700 border-2 border-red-600/30 text-white rounded-lg focus:border-red-500 focus:outline-none"
                >
                  <option value="tshirt">T-Shirt</option>
                  <option value="shirt">Shirt</option>
                  <option value="trouser">Trouser</option>
                  <option value="croptop">Crop Top</option>
                  <option value="jacket">Jacket</option>
                  <option value="dress">Dress</option>
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
                      let value = e.target.value;
                      // Remove leading zero if user starts typing
                      if (value.startsWith("0") && value.length > 1 && value[1] !== ".") {
                        value = value.replace(/^0+/, "");
                      }
                      setFormData({ ...formData, costPrice: parseFloat(value) || 0 });
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
                      let value = e.target.value;
                      // Remove leading zero if user starts typing
                      if (value.startsWith("0") && value.length > 1 && value[1] !== ".") {
                        value = value.replace(/^0+/, "");
                      }
                      setFormData({ ...formData, retailPrice: parseFloat(value) || 0 });
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
                      let value = e.target.value;
                      // Remove leading zero if user starts typing
                      if (value.startsWith("0") && value.length > 1 && value[1] !== ".") {
                        value = value.replace(/^0+/, "");
                      }
                      setFormData({ ...formData, wholesalePrice: parseFloat(value) || 0 });
                    }}
                    className="w-full px-3 py-2 bg-gray-700 border-2 border-red-600/30 text-white placeholder-gray-500 rounded-lg focus:border-red-500 focus:outline-none text-sm"
                  />
                </div>
              </div>

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
                              value={row.qty}
                              onChange={(e) => {
                                let value = e.target.value;
                                // Remove leading zero if user starts typing
                                if (value.startsWith("0") && value.length > 1 && value[1] !== ".") {
                                  value = value.replace(/^0+/, "");
                                }
                                updateStockRow(row.id, "qty", parseInt(value) || 0);
                              }}
                              placeholder="0"
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
                <button
                  onClick={() => {
                    alert("Product added successfully! Note: This is a demo. In production, this would save to database.");
                    handleCloseProductModal();
                  }}
                  className="flex-1 bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                >
                  Add Product
                </button>
                <button
                  onClick={handleCloseProductModal}
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

export default SalesPage;
