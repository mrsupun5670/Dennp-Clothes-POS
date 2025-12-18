import React, { useState, useMemo, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { Command } from "@tauri-apps/api/shell";
import { writeTextFile, createDir, writeBinaryFile, BaseDirectory } from "@tauri-apps/api/fs";
import { join, documentDir } from "@tauri-apps/api/path";
import html2canvas from 'html2canvas';
import BankPaymentModal, {
  BankPaymentData,
} from "../components/BankPaymentModal";
import PaymentMethodSelector from "../components/PaymentMethodSelector";
import { parsePaymentAmount } from "../utils/paymentUtils";
import AddProductModal from "../components/AddProductModal";
import {
  printContent,
  saveAsPDF,
  generateOrderBillHTML,
} from "../utils/exportUtils";
import { useShop } from "../context/ShopContext";
import { API_URL } from "../config/api";
import InvoicePrint from "../components/InvoicePrint";

// Utility function to get Sri Lankan timezone datetime
const getSriLankanDateTime = () => {
  const date = new Date();
  const sriLankanDate = new Date(
    date.toLocaleString("en-US", { timeZone: "Asia/Colombo" })
  );
  const year = sriLankanDate.getFullYear();
  const month = String(sriLankanDate.getMonth() + 1).padStart(2, "0");
  const day = String(sriLankanDate.getDate()).padStart(2, "0");
  const hours = String(sriLankanDate.getHours()).padStart(2, "0");
  const minutes = String(sriLankanDate.getMinutes()).padStart(2, "0");
  const seconds = String(sriLankanDate.getSeconds()).padStart(2, "0");
  return {
    dateString: `${year}-${month}-${day}`,
    timeString: `${hours}:${minutes}:${seconds}`,
    fullDateTime: `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`,
  };
};

// Interfaces
interface Customer {
  customer_id?: number;
  id?: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  email?: string;
  mobile: string;
  totalSpent?: number;
  total_spent?: number;
  totalOrders?: number;
  orders_count?: number;
  joined?: string;
  created_at?: string;
}

interface Product {
  id?: string;
  product_id?: number;
  code?: string;
  sku?: string | null;
  name?: string;
  product_name?: string;
  retailPrice?: number;
  retail_price?: number | string;
  wholesalePrice?: number;
  wholesale_price?: number | string;
  costPrice?: number;
  cost_price?: number | string;
  product_cost?: number | string;
  printPrice?: number;
  print_cost?: number | string;
  sizesByCategory?: { [key: string]: string[] };
  colorsByCategory?: { [key: string]: string[] };
  category?: string;
  product_category?: string;
  colors?: Array<{ color_id: number; color_name: string; hex_code: string }>;
  sizes?: Array<{ size_id: number; size_name: string; size_type: string }>;
  stock?: string | number;
}

interface CartItem {
  id: string;
  productId: number | string;
  productCode: string;
  productName: string;
  size: string;
  color: string;
  sizeId: number;
  colorId: number;
  quantity: number;
  price: number;
  productCost?: number;
  printCost?: number;
}

interface NewCustomer {
  name: string;
  email: string;
  mobile: string;
}

interface SizeOption {
  [key: string]: string[];
}

interface ColorOption {
  [key: string]: string[];
}

const SalesPage: React.FC = () => {
  // Shop context
  const { shopId, shopName } = useShop();

  // State Management
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [paidAmount, setPaidAmount] = useState("");
  const [orderNotes, setOrderNotes] = useState("");
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [deliveryCharge, setDeliveryCharge] = useState(0);

  // Track previously paid amount when editing order
  const [previouslyPaidAmount, setPreviouslyPaidAmount] = useState(0);

  // Track current order number for invoice generation
  const [currentOrderNumber, setCurrentOrderNumber] = useState<string | null>(
    null
  );

  // New payment system states
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "bank">("cash");
  const [bankPaymentDetails, setBankPaymentDetails] =
    useState<BankPaymentData | null>(null);
  const [showBankPaymentModal, setShowBankPaymentModal] = useState(false);

  // Loading states for customers and products
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  // Loading state for saving orders (prevent double-click)
  const [isSavingOrder, setIsSavingOrder] = useState(false);

  // Stock data interface
  interface StockData {
    stock_id: number;
    product_id: number;
    size_id: number;
    color_id: number;
    stock_qty: number;
    color_name: string;
    size_name: string;
  }

  // Stock management states
  const [productStock, setProductStock] = useState<StockData[]>([]);
  const [availableSizes, setAvailableSizes] = useState<
    { size_id: number; size_name: string }[]
  >([]);
  const [availableColors, setAvailableColors] = useState<
    { color_id: number; color_name: string }[]
  >([]);

  // Customer type filter (wholesale/retail)
  const [customerTypeFilter, setCustomerTypeFilter] = useState<
    "wholesale" | "retail"
  >("wholesale");


  // Restore draft data from sessionStorage on component mount
  React.useEffect(() => {
    // First check if there's an order to edit - this takes priority
    const orderData = sessionStorage.getItem("orderToEdit");
    if (orderData) {
      try {
        const order = JSON.parse(orderData);
        setEditingOrderId(order.orderId);
        setCurrentOrderNumber(order.orderNumber || null);

        // Store the amount already paid (advance payment) for balance calculation
        setPreviouslyPaidAmount(Number(order.totalPaid) || 0);

        // Set customer
        const customer: Customer = {
          id: order.customerId,
          name: order.customerName,
          email: "",
          mobile: order.customerMobile,
          totalSpent: 0,
          totalOrders: 0,
          joined: "",
        };
        setSelectedCustomer(customer);

        // Load cart items with full details
        const newCartItems: CartItem[] = order.items.map(
          (item: any, idx: number) => ({
            id: `edit-${idx}-${item.product_id}-${Date.now()}`,
            productId: item.productId || item.product_id,
            productCode: `PROD-${item.productId || item.product_id}`,
            productName: item.productName,
            size: item.size || "N/A",
            sizeId: item.sizeId,
            color: item.color || "N/A",
            colorId: item.colorId,
            quantity: Number(item.quantity) || 0,
            price: Number(item.soldPrice || item.price || 0),
            productCost: Number(item.productCost || 0),
            printCost: Number(item.printCost || 0),
          })
        );
        setCartItems(newCartItems);

        // Set payment information
        if (
          order.deliveryCharge !== undefined &&
          Number(order.deliveryCharge) > 0
        ) {
          setDeliveryCharge(Number(order.deliveryCharge));
        }
        if (order.paymentMethod) {
          setPaymentMethod(order.paymentMethod);
        }
        if (order.orderNotes) {
          setOrderNotes(order.orderNotes);
        }

        // Clear the sessionStorage after loading
        sessionStorage.removeItem("orderToEdit");
      } catch (error) {
        console.error("Error loading order data:", error);
      }
    } else {
      // If not editing an order, restore any draft data
      const draftData = sessionStorage.getItem("salesPageDraft");
      if (draftData) {
        try {
          const draft = JSON.parse(draftData);
          
          if (draft.selectedCustomer) {
            setSelectedCustomer(draft.selectedCustomer);
          }
          if (draft.cartItems && Array.isArray(draft.cartItems)) {
            setCartItems(draft.cartItems);
          }
          if (draft.paidAmount !== undefined) {
            setPaidAmount(draft.paidAmount);
          }
          if (draft.orderNotes) {
            setOrderNotes(draft.orderNotes);
          }
          if (draft.deliveryCharge !== undefined) {
            setDeliveryCharge(draft.deliveryCharge);
          }
          if (draft.paymentMethod) {
            setPaymentMethod(draft.paymentMethod);
          }
          if (draft.bankPaymentDetails) {
            setBankPaymentDetails(draft.bankPaymentDetails);
          }
          if (draft.customerTypeFilter) {
            setCustomerTypeFilter(draft.customerTypeFilter);
          }
        } catch (error) {
          console.error("Error loading draft data:", error);
        }
      }
    }

    // Clear navigation flag
    if (sessionStorage.getItem("navigateToSales") === "true") {
      sessionStorage.removeItem("navigateToSales");
    }
  }, []);

  // Save draft data to sessionStorage whenever key data changes
  React.useEffect(() => {
    // Don't save draft if we're editing an existing order
    if (editingOrderId) {
      return;
    }

    // Only save if there's actual data to persist
    if (
      selectedCustomer ||
      cartItems.length > 0 ||
      paidAmount ||
      orderNotes ||
      deliveryCharge > 0 ||
      bankPaymentDetails
    ) {
      const draftData = {
        selectedCustomer,
        cartItems,
        paidAmount,
        orderNotes,
        deliveryCharge,
        paymentMethod,
        bankPaymentDetails,
        customerTypeFilter,
        timestamp: new Date().toISOString(),
      };
      sessionStorage.setItem("salesPageDraft", JSON.stringify(draftData));
    }
  }, [
    selectedCustomer,
    cartItems,
    paidAmount,
    orderNotes,
    deliveryCharge,
    paymentMethod,
    bankPaymentDetails,
    customerTypeFilter,
    editingOrderId,
  ]);

  // Modal States
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showProductSearch, setShowProductSearch] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showAddSizeModal, setShowAddSizeModal] = useState(false);
  const [showAddColorModal, setShowAddColorModal] = useState(false);

  // New Product Form States
  const [selectedCategory, setSelectedCategory] = useState<string>("tshirt");
  const [stockRows, setStockRows] = useState<
    { id: number; size: string; color: string; qty: number }[]
  >([]);
  const [nextRowId, setNextRowId] = useState(1);
  const [customSizes, setCustomSizes] = useState<string[]>([]);
  const [customColors, setCustomColors] = useState<string[]>([]);
  const [newSize, setNewSize] = useState("");
  const [newColor, setNewColor] = useState("");
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    costPrice: "",
    retailPrice: "",
    wholesalePrice: "",
  });

  const updateStockRow = (
    rowId: number,
    field: "size" | "color" | "qty",
    value: any
  ) => {
    setStockRows(
      stockRows.map((row) =>
        row.id === rowId ? { ...row, [field]: value } : row
      )
    );
  };

  const addStockRow = () => {
    setStockRows([
      ...stockRows,
      { id: nextRowId, size: "", color: "", qty: 0 },
    ]);
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
  };

  const handleCloseProductModal = () => {
    setShowAddProductModal(false);
  };

  const handleProductAdded = async () => {
    // Reload products after adding a new one
    try {
      const response = await fetch(`${API_URL}/products?shop_id=${shopId}`);
      const result = await response.json();
      if (result.success) {
        const data = result.data || [];
        setAllProducts(data);
        setProducts(data);
      }
    } catch (error) {
      console.error("Error reloading products:", error);
    }
  };

  // Search and Filter States
  const [customerSearch, setCustomerSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [newCustomer, setNewCustomer] = useState<NewCustomer>({
    name: "",
    email: "",
    mobile: "",
  });


  // Customer modal state
  const [customerFormData, setCustomerFormData] = useState({
    customer_id: "",
    mobile: "",
    email: "",
  });
  const [customerModalError, setCustomerModalError] = useState("");
  const [customerModalSuccess, setCustomerModalSuccess] = useState("");
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);

  // Product modal state
  const [productModalError, setProductModalError] = useState("");
  const [productModalSuccess, setProductModalSuccess] = useState("");
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);

  // Database categories, sizes, colors for product creation
  const [dbCategories, setDbCategories] = useState<any[]>([]);
  const [dbSizes, setDbSizes] = useState<any[]>([]);
  const [dbColors, setDbColors] = useState<any[]>([]);

  // Product Selection States
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedQty, setSelectedQty] = useState("");
  const [selectedPrice, setSelectedPrice] = useState<string>(""); // Editable price

  // UI Message state
  const [message, setMessage] = useState<{
    type: "error" | "success" | "info";
    text: string;
  } | null>(null);

  // Auto-dismiss message after 4 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Store all customers for local filtering
  const [allCustomers, setAllCustomers] = useState<Customer[]>([]);

  // Load all customers on component mount
  useEffect(() => {
    if (!shopId) return;

    const loadCustomers = async () => {
      try {
        const response = await fetch(`${API_URL}/customers?shop_id=${shopId}`);
        const result = await response.json();
        if (result.success) {
          const data = result.data || [];
          setAllCustomers(data);
          setCustomers(data);
        }
      } catch (error) {
        console.error("Error loading customers:", error);
      }
    };

    loadCustomers();
  }, [shopId]);

  // Search customers on key up - with instant local filtering
  useEffect(() => {
    if (!customerSearch.trim()) {
      // Show all customers if search is cleared
      setCustomers(allCustomers);
      return;
    }

    if (!shopId) return;

    // Instant local filtering for faster UX
    const query = customerSearch.toLowerCase();
    const localFiltered = allCustomers.filter(
      (customer) =>
        String(customer.customer_id || customer.id || "")
          .toLowerCase()
          .includes(query) ||
        (customer.mobile && customer.mobile.toLowerCase().includes(query)) ||
        (customer.name && customer.name.toLowerCase().includes(query)) ||
        (customer.first_name &&
          customer.first_name.toLowerCase().includes(query)) ||
        (customer.last_name && customer.last_name.toLowerCase().includes(query))
    );

    setCustomers(localFiltered);

    const searchTimer = setTimeout(async () => {
      setIsLoadingCustomers(true);
      try {
        const response = await fetch(
          `${API_URL}/customers/search?shop_id=${shopId}&q=${encodeURIComponent(customerSearch)}`
        );
        const result = await response.json();
        if (result.success) {
          setCustomers(result.data || []);
        }
      } catch (error) {
        console.error("Error searching customers:", error);
      } finally {
        setIsLoadingCustomers(false);
      }
    }, 50);

    return () => clearTimeout(searchTimer);
  }, [customerSearch, shopId, allCustomers]);

  useEffect(() => {
    if (!shopId) return;

    const loadProducts = async () => {
      try {
        const response = await fetch(`${API_URL}/products?shop_id=${shopId}`);
        const result = await response.json();
        if (result.success) {
          const data = result.data || [];
          setAllProducts(data);
          setProducts(data);
        }
      } catch (error) {
        console.error("Error loading products:", error);
      }
    };

    loadProducts();
  }, [shopId]);

  useEffect(() => {
    if (!shopId) return;

    const loadProductMetadata = async () => {
      try {
        const categoriesResponse = await fetch(
          `${API_URL}/categories?shop_id=${shopId}`
        );
        const categoriesResult = await categoriesResponse.json();
        if (categoriesResult.success) {
          setDbCategories(categoriesResult.data || []);
        }

        const sizesResponse = await fetch(`${API_URL}/sizes?shop_id=${shopId}`);
        const sizesResult = await sizesResponse.json();
        if (sizesResult.success) {
          setDbSizes(sizesResult.data || []);
        }

        const colorsResponse = await fetch(
          `${API_URL}/colors?shop_id=${shopId}`
        );
        const colorsResult = await colorsResponse.json();
        if (colorsResult.success) {
          setDbColors(colorsResult.data || []);
        }
      } catch (error) {
        console.error("Error loading product metadata:", error);
      }
    };

    loadProductMetadata();
  }, [shopId]);

  useEffect(() => {
    if (!productSearch.trim()) {
      setProducts(allProducts);
      return;
    }

    if (!shopId) return;

    const query = productSearch.toLowerCase();
    const localFiltered = allProducts.filter(
      (product) =>
        ((product.name || product.product_name) &&
          (product.name || product.product_name)!
            .toLowerCase()
            .includes(query)) ||
        ((product.code || product.sku) &&
          (product.code || product.sku)!.toLowerCase().includes(query)) ||
        ((product.id || product.product_id) &&
          String(product.id || product.product_id)
            .toLowerCase()
            .includes(query))
    );

    setProducts(localFiltered);

    const searchTimer = setTimeout(async () => {
      setIsLoadingProducts(true);
      try {
        const response = await fetch(
          `${API_URL}/products/search?shop_id=${shopId}&q=${encodeURIComponent(productSearch)}`
        );
        const result = await response.json();
        if (result.success) {
          setProducts(result.data || []);
        }
      } catch (error) {
        console.error("Error searching products:", error);
      } finally {
        setIsLoadingProducts(false);
      }
    }, 50);

    return () => clearTimeout(searchTimer);
  }, [productSearch, shopId, allProducts]);

  useEffect(() => {
    if (!selectedProduct || !shopId) {
      setProductStock([]);
      setAvailableSizes([]);
      setAvailableColors([]);
      setSelectedSize("");
      setSelectedColor("");
      return;
    }

    const loadProductStock = async () => {
      try {
        const productId = selectedProduct.id || selectedProduct.product_id;
        const response = await fetch(
          `${API_URL}/products/${productId}/stock?shop_id=${shopId}`
        );
        const result = await response.json();

        if (result.success && result.data) {
          setProductStock(result.data);

          const sizesMap = new Map();
          result.data.forEach((stock: StockData) => {
            if (!sizesMap.has(stock.size_id)) {
              sizesMap.set(stock.size_id, stock.size_name);
            }
          });
          const sizes = Array.from(sizesMap.entries()).map(([id, name]) => ({
            size_id: id,
            size_name: name,
          }));
          setAvailableSizes(sizes);
          setAvailableColors([]);
          setSelectedSize("");
          setSelectedColor("");
        }
      } catch (error) {
        console.error("Error loading product stock:", error);
        setProductStock([]);
        setAvailableSizes([]);
        setAvailableColors([]);
      }
    };

    loadProductStock();
  }, [selectedProduct, shopId]);

  useEffect(() => {
    if (!selectedSize || productStock.length === 0) {
      setAvailableColors([]);
      setSelectedColor("");
      return;
    }

    const colorsForSize = productStock
      .filter(
        (stock) => stock.size_name === selectedSize && stock.stock_qty > 0
      )
      .reduce((acc: Map<number, string>, stock) => {
        if (!acc.has(stock.color_id)) {
          acc.set(stock.color_id, stock.color_name);
        }
        return acc;
      }, new Map());

    const colors = Array.from(colorsForSize.entries()).map(([id, name]) => ({
      color_id: id,
      color_name: name,
    }));
    setAvailableColors(colors);
    setSelectedColor("");
  }, [selectedSize, productStock]);

  const parsePrice = (price: any): number => {
    if (typeof price === "number") return price;
    if (typeof price === "string") return parseFloat(price) || 0;
    return 0;
  };

  const getProductPrice = (product: Product): number => {
    if (!product) return 0;

    let price = 0;
    if (customerTypeFilter === "wholesale") {
      price =
        parsePrice(product.wholesale_price) ||
        parsePrice(product.wholesalePrice) ||
        0;
    } else {
      price =
        parsePrice(product.retail_price) ||
        parsePrice(product.retailPrice) ||
        0;
    }

    return typeof price === "number" && !isNaN(price) ? price : 0;
  };

  const getWholesalePrice = (product: Product): number => {
    if (!product) return 0;
    const price =
      parsePrice(product.wholesale_price) ||
      parsePrice(product.wholesalePrice) ||
      0;
    return typeof price === "number" && !isNaN(price) ? price : 0;
  };

  useEffect(() => {
    if (selectedProduct) {
      const newPrice = getProductPrice(selectedProduct);
      setSelectedPrice(String(newPrice));
    }
  }, [customerTypeFilter]);

  useEffect(() => {
    if (cartItems.length === 0 || allProducts.length === 0) return;

    const updatedCartItems = cartItems.map((item) => {
      const product = allProducts.find(
        (p) => (p.id || p.product_id) === item.productId
      );

      if (product) {
        const newPrice = getProductPrice(product);
        if (item.price !== newPrice) {
          return {
            ...item,
            price: newPrice,
          };
        }
      }

      return item;
    });

    const hasChanges = updatedCartItems.some(
      (item, idx) => item.price !== cartItems[idx].price
    );
    if (hasChanges) {
      setCartItems(updatedCartItems);
    }
  }, [customerTypeFilter]);

  const filteredCustomers = useMemo(() => {
    return customers;
  }, [customers]);

  const filteredProducts = useMemo(() => {
    return products;
  }, [products]);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const total = subtotal;

  const balanceDue = editingOrderId
    ? Math.max(0, total + deliveryCharge - previouslyPaidAmount)
    : 0;

  const handleAddCustomer = async () => {
    setIsCreatingCustomer(true);
    setCustomerModalError("");
    setCustomerModalSuccess("");

    try {
      if (
        !customerFormData.customer_id ||
        String(customerFormData.customer_id).trim() === ""
      ) {
        setCustomerModalError("Customer ID is required");
        setIsCreatingCustomer(false);
        return;
      }

      if (isNaN(Number(customerFormData.customer_id))) {
        setCustomerModalError("Customer ID must be a valid number");
        setIsCreatingCustomer(false);
        return;
      }

      if (
        !customerFormData.mobile ||
        String(customerFormData.mobile).trim() === ""
      ) {
        setCustomerModalError("Mobile number is required");
        setIsCreatingCustomer(false);
        return;
      }

      const response = await fetch(`${API_URL}/customers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_id: parseInt(customerFormData.customer_id),
          shop_id: shopId,
          mobile: customerFormData.mobile,
          email: customerFormData.email || null,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setCustomerModalSuccess("Customer created successfully!");

        const customersResponse = await fetch(
          `${API_URL}/customers?shop_id=${shopId}`
        );
        const customersResult = await customersResponse.json();
        if (customersResult.success) {
          const data = customersResult.data || [];
          setAllCustomers(data);
          setCustomers(data);

          const newCustomer = data.find(
            (c: any) => c.customer_id === parseInt(customerFormData.customer_id)
          );
          if (newCustomer) {
            setSelectedCustomer(newCustomer);
          }
        }

        setTimeout(() => {
          setShowAddCustomerModal(false);
          setCustomerFormData({ customer_id: "", mobile: "", email: "" });
          setCustomerModalError("");
          setCustomerModalSuccess("");
          setIsCreatingCustomer(false);
        }, 1000);
      } else {
        const errorMessage = result.error || "Failed to create customer";
        if (
          errorMessage.includes("unique_mobile_per_shop") ||
          errorMessage.includes("Duplicate entry")
        ) {
          setCustomerModalError(
            `This mobile number (${customerFormData.mobile}) is already registered in this shop`
          );
        } else if (
          errorMessage.includes("Duplicate") &&
          errorMessage.includes("customer_id")
        ) {
          setCustomerModalError(
            `Customer ID ${customerFormData.customer_id} is already used in this shop`
          );
        } else {
          setCustomerModalError(errorMessage);
        }
        setIsCreatingCustomer(false);
      }
    } catch (error: any) {
      console.error("Error creating customer:", error);
      setCustomerModalError(
        error.message || "Failed to create customer. Please try again."
      );
      setIsCreatingCustomer(false);
    }
  };

  const handleSaveProduct = async () => {
    setIsCreatingProduct(true);
    setProductModalError("");
    setProductModalSuccess("");

    try {
      const productCode = String(formData.code).trim();
      if (!productCode) {
        setProductModalError("Product Code is required");
        setIsCreatingProduct(false);
        return;
      }

      if (!/^\d+$/.test(productCode)) {
        setProductModalError("Product Code must be numeric only");
        setIsCreatingProduct(false);
        return;
      }

      if (!formData.name.trim()) {
        setProductModalError("Product Name is required");
        setIsCreatingProduct(false);
        return;
      }

      const cost = parseFloat(formData.costPrice);
      const retailPrice = parseFloat(formData.retailPrice);
      const wholesalePrice = parseFloat(formData.wholesalePrice || "0");

      if (isNaN(cost) || cost < 0) {
        setProductModalError("Valid Product Cost is required (>= 0)");
        setIsCreatingProduct(false);
        return;
      }

      if (isNaN(retailPrice) || retailPrice < 0) {
        setProductModalError("Valid Retail Price is required (>= 0)");
        setIsCreatingProduct(false);
        return;
      }

      if (stockRows.length === 0) {
        setProductModalError("Please add at least one stock entry");
        setIsCreatingProduct(false);
        return;
      }

      const hasIncompleteRows = stockRows.some(
        (row) => !row.size || !row.color
      );
      if (hasIncompleteRows) {
        setProductModalError(
          "Please fill all size/color combinations for stock entries"
        );
        setIsCreatingProduct(false);
        return;
      }

      const totalQty = stockRows.reduce((sum, row) => sum + row.qty, 0);
      if (totalQty <= 0) {
        setProductModalError(
          "Product must have a total quantity greater than 0"
        );
        setIsCreatingProduct(false);
        return;
      }

      const category = dbCategories.find(
        (cat: any) =>
          cat.category_name.toLowerCase() === selectedCategory.toLowerCase()
      );

      if (!category) {
        setProductModalError(`Category "${selectedCategory}" not found`);
        setIsCreatingProduct(false);
        return;
      }

      const uniqueColors = stockRows
        .map((row) => row.color)
        .filter((c, i, a) => a.indexOf(c) === i);
      const uniqueSizes = stockRows
        .map((row) => row.size)
        .filter((s, i, a) => a.indexOf(s) === i);

      const colorIdMap = new Map<string, number>();
      const sizeIdMap = new Map<string, number>();

      dbColors?.forEach((c: any) => colorIdMap.set(c.color_name, c.color_id));
      dbSizes?.forEach((s: any) => sizeIdMap.set(s.size_name, s.size_id));

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
            body: JSON.stringify({
              shop_id: shopId,
              size_name: sizeName,
              size_type_id: category.category_id,
            }),
          });
          const sizeResult = await sizeResponse.json();
          if (sizeResult.success && sizeResult.data.size_id) {
            sizeId = sizeResult.data.size_id;
            sizeIdMap.set(sizeName, sizeId);
          }
        }
      }

      const stockPayload: Array<{
        sizeId: number;
        colorId: number;
        quantity: number;
      }> = [];

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

      const response = await fetch(`${API_URL}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shop_id: shopId,
          product_id: parseInt(productCode),
          product_name: formData.name.trim(),
          category_id: category.category_id,
          product_cost: cost,
          print_cost: 0,
          retail_price: retailPrice,
          wholesale_price: wholesalePrice,
          stock: stockPayload,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setProductModalSuccess("Product created successfully!");

        const productsResponse = await fetch(
          `${API_URL}/products?shop_id=${shopId}`
        );
        const productsResult = await productsResponse.json();
        if (productsResult.success) {
          const data = productsResult.data || [];
          setAllProducts(data);
          setProducts(data);
        }

        const categoriesResponse = await fetch(
          `${API_URL}/categories?shop_id=${shopId}`
        );
        const categoriesResult = await categoriesResponse.json();
        if (categoriesResult.success) {
          setDbCategories(categoriesResult.data || []);
        }

        const sizesResponse = await fetch(`${API_URL}/sizes?shop_id=${shopId}`);
        const sizesResult = await sizesResponse.json();
        if (sizesResult.success) {
          setDbSizes(sizesResult.data || []);
        }

        const colorsResponse = await fetch(
          `${API_URL}/colors?shop_id=${shopId}`
        );
        const colorsResult = await colorsResponse.json();
        if (colorsResult.success) {
          setDbColors(colorsResult.data || []);
        }

        setTimeout(() => {
          handleCloseProductModal();
          setIsCreatingProduct(false);
        }, 1500);
      } else {
        const errorMessage = result.error || "Failed to create product";
        if (
          errorMessage.includes("Duplicate entry") &&
          errorMessage.includes("product_id")
        ) {
          setProductModalError(
            `Product code ${productCode} is already used in this shop`
          );
        } else {
          setProductModalError(errorMessage);
        }
        setIsCreatingProduct(false);
      }
    } catch (error: any) {
      console.error("Error creating product:", error);
      setProductModalError(
        error.message || "Failed to create product. Please try again."
      );
      setIsCreatingProduct(false);
    }
  };

  const handleAddProductToCart = () => {
    if (
      !selectedProduct ||
      !selectedSize ||
      !selectedColor ||
      !selectedQty ||
      !selectedPrice
    ) {
      setMessage({
        type: "error",
        text: "Please fill all fields including price",
      });
      return;
    }

    const availableQty =
      productStock.find(
        (stock) =>
          stock.size_name === selectedSize && stock.color_name === selectedColor
      )?.stock_qty || 0;

    const requestedQty = parseInt(selectedQty);

    if (requestedQty > availableQty) {
      setMessage({
        type: "error",
        text: `Only ${availableQty} units available for this size and color`,
      });
      return;
    }

    const cartQuantityForProduct = cartItems
      .filter((item) => {
        const isSameProduct =
          item.productCode === (selectedProduct.code || selectedProduct.sku) ||
          item.productName ===
            (selectedProduct.name || selectedProduct.product_name);
        return isSameProduct;
      })
      .reduce((sum, item) => sum + item.quantity, 0);

    const totalRequestedQty = cartQuantityForProduct + requestedQty;
    if (totalRequestedQty > availableQty) {
      const remaining = availableQty - cartQuantityForProduct;
      setMessage({
        type: "error",
        text: `Only ${remaining} more units can be added to cart (${cartQuantityForProduct} already in cart)`,
      });
      return;
    }

    const price = parseFloat(selectedPrice) || getProductPrice(selectedProduct);
    const productId = selectedProduct.id || selectedProduct.product_id;
    const roundedPrice = Math.round(price * 100) / 100;
    const uniqueId = `${productId}-${selectedSize}-${selectedColor}-${roundedPrice}`;

    const productCost =
      parsePrice(
        selectedProduct.product_cost ||
          selectedProduct.cost_price ||
          selectedProduct.costPrice
      ) || 0;
    const printCost = parsePrice(selectedProduct.print_cost || 0) || 0;

    // Get the correct size_id and color_id from the productStock data
    // This ensures we use the same IDs that exist in the shop_product_stock table
    let colorId = 1;
    let sizeId = 1;

    // Find the stock entry that matches the selected size and color
    const stockEntry = productStock.find(
      (stock) => stock.size_name === selectedSize && stock.color_name === selectedColor
    );

    if (stockEntry) {
      colorId = stockEntry.color_id;
      sizeId = stockEntry.size_id;
    } else {
      // Fallback: try to get from product's colors/sizes arrays
      if (selectedProduct.colors && selectedProduct.colors.length > 0) {
        const colorMatch = selectedProduct.colors.find(
          (c) => c.color_name === selectedColor
        );
        if (colorMatch) {
          colorId = colorMatch.color_id;
        }
      }

      if (selectedProduct.sizes && selectedProduct.sizes.length > 0) {
        const sizeMatch = selectedProduct.sizes.find(
          (s) => s.size_name === selectedSize
        );
        if (sizeMatch) {
          sizeId = sizeMatch.size_id;
        }
      }
    }


    const existingItemIndex = cartItems.findIndex((item) => {
      const itemRoundedPrice = Math.round(item.price * 100) / 100;
      return (
        item.productId === productId &&
        item.size === selectedSize &&
        item.color === selectedColor &&
        itemRoundedPrice === roundedPrice
      );
    });

    if (existingItemIndex >= 0) {
      const updatedItems = [...cartItems];
      updatedItems[existingItemIndex].quantity += requestedQty;
      setCartItems(updatedItems);
      setMessage({
        type: "success",
        text: `✓ Qty updated: ${selectedProduct.name || selectedProduct.product_name} (${selectedSize}, ${selectedColor}) @ Rs. ${price.toFixed(2)}`,
      });
    } else {
      const cartItem: CartItem = {
        id: uniqueId,
        productId: productId,
        productCode: selectedProduct.code || selectedProduct.sku || "",
        productName: selectedProduct.name || selectedProduct.product_name || "",
        size: selectedSize,
        color: selectedColor,
        sizeId: sizeId,
        colorId: colorId,
        quantity: requestedQty,
        price: roundedPrice,
        productCost: productCost,
        printCost: printCost,
      };
      setCartItems([...cartItems, cartItem]);
      setMessage({
        type: "success",
        text: `✓ Added to cart: ${selectedProduct.name || selectedProduct.product_name} (${selectedSize}, ${selectedColor}) @ Rs. ${roundedPrice.toFixed(2)}`,
      });
    }

    setSelectedProduct(null);
    setSelectedSize("");
    setSelectedColor("");
    setSelectedQty("");
    setSelectedPrice("");
    setProductSearch("");
    setShowProductSearch(false);
  };

  const handleRemoveFromCart = (id: string) => {
    setCartItems(cartItems.filter((item) => item.id !== id));
  };
  const resetSalesState = () => {
    setCartItems([]);
    setPaidAmount("");
    setOrderNotes("");
    setSelectedCustomer(null);
    setPaymentMethod("cash");
    setBankPaymentDetails(null);
    setEditingOrderId(null);
    setPreviouslyPaidAmount(0);
    setCurrentOrderNumber(null);
    setDeliveryCharge(0);
    
    // Clear the draft data from sessionStorage
    sessionStorage.removeItem("salesPageDraft");
  };

  const saveOrderInternal = async (): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> => {
    if (!selectedCustomer) {
      return { success: false, error: "Please select a customer" };
    }
    if (cartItems.length === 0) {
      return { success: false, error: "Please add items to cart" };
    }

    // Payment validation - ONLY required for NEW orders, not when editing
    if (!editingOrderId) {
      if (paymentMethod === "cash") {
        if (!paidAmount) {
          return {
            success: false,
            error: "Cash payment selected: Please enter paid amount to continue",
          };
        }
      } else if (paymentMethod === "bank") {
        if (!bankPaymentDetails) {
          return { success: false, error: "Please add bank payment details" };
        }
      }
    }

    try {
      let newPayment = 0;
      if (paymentMethod === "cash") {
        newPayment = parsePaymentAmount(paidAmount);
      } else if (paymentMethod === "bank") {
        newPayment = parsePaymentAmount(bankPaymentDetails?.paidAmount || "0");
      }

      const sriLankanDateTime = getSriLankanDateTime();

      let savedOrderId: number | undefined;
      let orderNumber: string;
      let finalTotal = 0;
      let finalPaid = 0;
      let finalBalance = 0;
      let finalStatus = "";

      if (editingOrderId) {
        savedOrderId = parseInt(editingOrderId);
        orderNumber = currentOrderNumber || editingOrderId;

        const grandTotal = total + deliveryCharge;

        // For repayment: final_amount increases, balance_due decreases, advance_paid stays same
        const newFinalAmount = previouslyPaidAmount + newPayment;
        const newBalance = Math.max(0, grandTotal - newFinalAmount);

        let paymentStatus = "unpaid";
        if (newFinalAmount >= grandTotal) {
          paymentStatus = "fully_paid";
        } else if (newFinalAmount > 0) {
          paymentStatus = "partial";
        }

        finalTotal = grandTotal;
        finalPaid = newFinalAmount;  // This is what will be shown to user
        finalBalance = newBalance;
        finalStatus = paymentStatus;

        const updateOrderPayload = {
          shop_id: shopId,
          total_items: cartItems.length,
          total_amount: total,
          delivery_charge: deliveryCharge,
          final_amount: newFinalAmount,  // Updated: old final + new payment
          advance_paid: previouslyPaidAmount,  // Stays the same (original advance)
          balance_due: newBalance,
          payment_status: paymentStatus,
          payment_method:
            paymentMethod === "cash"
              ? "cash"
              : bankPaymentDetails?.bank || "bank",
          notes: orderNotes || null,
        };

        const updateResponse = await fetch(
          `${API_URL}/orders/${savedOrderId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updateOrderPayload),
          }
        );

        const updateResult = await updateResponse.json();
        if (!updateResult.success) {
          return {
            success: false,
            error: `Failed to update order: ${updateResult.error}`,
          };
        }

        const itemsPayload = {
          shop_id: shopId,
          order_id: savedOrderId,
          items: cartItems.map((item) => ({
            product_id: item.productId,
            color_id: item.colorId,
            size_id: item.sizeId,
            quantity: item.quantity,
            sold_price: item.price,
            total_price: item.price * item.quantity,
          })),
        };

        const itemsResponse = await fetch(
          `${API_URL}/orders/${savedOrderId}/items`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(itemsPayload),
          }
        );

        const itemsResult = await itemsResponse.json();
        if (!itemsResult.success) {
          return {
            success: false,
            error: `Failed to update order items: ${itemsResult.error}`,
          };
        }

        if (newPayment > 0) {
          const grandTotal = total + deliveryCharge;
          const remainingBalance = Math.max(
            0,
            grandTotal - previouslyPaidAmount
          );
          const actualPaymentToRecord = Math.min(newPayment, remainingBalance);

          if (actualPaymentToRecord > 0) {
            if (paymentMethod === "cash") {
              const paymentPayload = {
                shop_id: shopId,
                order_id: savedOrderId,
                customer_id: selectedCustomer.customer_id,
                payment_amount: actualPaymentToRecord,
                payment_date: sriLankanDateTime.dateString,
                payment_time: sriLankanDateTime.timeString,
                payment_method: "cash",
                payment_status: "completed",
                notes: null,
              };

              await fetch(`${API_URL}/payments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(paymentPayload),
              });
            } else if (paymentMethod === "bank" && bankPaymentDetails) {
              const bankPayMethod = bankPaymentDetails.isOnlineTransfer
                ? "online_transfer"
                : "bank_deposit";
              const notesText = bankPaymentDetails.isOnlineTransfer
                ? `Bank: ${bankPaymentDetails.bank}, Online Transfer, Receipt: ${bankPaymentDetails.receiptNumber}`
                : `Bank: ${bankPaymentDetails.bank}, Branch: ${bankPaymentDetails.branch}, Receipt: ${bankPaymentDetails.receiptNumber}`;

              const paymentPayload = {
                shop_id: shopId,
                order_id: savedOrderId,
                customer_id: selectedCustomer.customer_id,
                payment_amount: actualPaymentToRecord,
                payment_date: sriLankanDateTime.dateString,
                payment_time: sriLankanDateTime.timeString,
                payment_method: bankPayMethod,
                bank_name: bankPaymentDetails.bank,
                branch_name: bankPaymentDetails.branch || null,
                bank_account_id: bankPaymentDetails.bankAccountId,
                transaction_id: bankPaymentDetails.receiptNumber,
                payment_status: "completed",
                notes: notesText,
              };

              await fetch(`${API_URL}/payments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(paymentPayload),
              });
            }
          }
        }
      } else {
        let paymentStatus = "";
        let advancePaid = 0;
        let balanceDue = 0;
        let finalAmount = 0;

        if (newPayment > 0) {
          if (newPayment >= total) {
            // Full payment or overpayment
            paymentStatus = "fully_paid";
            advancePaid = 0;  // No advance when fully paid
            balanceDue = 0;
            finalAmount = newPayment;  // final_amount = what was paid
            // Note: If overpayment, excess should be returned to customer
          } else {
            // Partial payment
            paymentStatus = "partial";
            advancePaid = newPayment;  // advance_paid = what was paid
            balanceDue = total - newPayment;
            finalAmount = newPayment;  // final_amount = what was paid
          }
        } else {
          // No payment
          paymentStatus = "unpaid";
          advancePaid = 0;
          balanceDue = total;
          finalAmount = 0;
        }

        finalTotal = finalAmount;
        finalPaid = advancePaid;
        finalBalance = balanceDue;
        finalStatus = paymentStatus;

        const orderNumberResponse = await fetch(
          `${API_URL}/orders/generate-number?shop_id=${shopId}`
        );
        const orderNumberData = await orderNumberResponse.json();
        orderNumber =
          orderNumberData.orderNumber || `${String(Date.now()).slice(-9)}`;

        const orderPayload = {
          shop_id: shopId,
          order_number: orderNumber,
          customer_id: selectedCustomer.customer_id,
          user_id: null,
          total_items: cartItems.length,
          order_status: "pending",
          total_amount: total,
          delivery_charge: deliveryCharge,
          final_amount: finalAmount,
          advance_paid: advancePaid,
          balance_due: balanceDue,
          payment_status: paymentStatus,
          payment_method:
            paymentMethod === "cash"
              ? "cash"
              : bankPaymentDetails?.bank || "bank",
          recipient_phone: selectedCustomer.mobile || null,
          notes: orderNotes || null,
          order_date: sriLankanDateTime.dateString,
          items: cartItems.map((item) => ({
            product_id: item.productId,
            color_id: item.colorId,
            size_id: item.sizeId,
            quantity: item.quantity,
            sold_price: item.price,
            total_price: item.price * item.quantity,
          })),
        };

        const orderResponse = await fetch(`${API_URL}/orders`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderPayload),
        });

        const orderResult = await orderResponse.json();
        if (!orderResult.success) {
          return {
            success: false,
            error: `Failed to save order: ${orderResult.error}`,
          };
        }

        savedOrderId = orderResult.data?.order_id;

        setCurrentOrderNumber(orderNumber);

        if (newPayment > 0) {
          const actualPaymentToRecord = Math.min(newPayment, total);

          if (paymentMethod === "cash") {
            const paymentPayload = {
              shop_id: shopId,
              order_id: savedOrderId,
              customer_id: selectedCustomer.customer_id,
              payment_amount: actualPaymentToRecord,
              payment_date: sriLankanDateTime.dateString,
              payment_time: sriLankanDateTime.timeString,
              payment_method: "cash",
              payment_status: "completed",
              notes: null,
            };

            await fetch(`${API_URL}/payments`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(paymentPayload),
            });
          } else if (paymentMethod === "bank" && bankPaymentDetails) {
            const bankPayMethod = bankPaymentDetails.isOnlineTransfer
              ? "online_transfer"
              : "bank_deposit";
            const notesText = bankPaymentDetails.isOnlineTransfer
              ? `Bank: ${bankPaymentDetails.bank}, Online Transfer, Receipt: ${bankPaymentDetails.receiptNumber}`
              : `Bank: ${bankPaymentDetails.bank}, Branch: ${bankPaymentDetails.branch}, Receipt: ${bankPaymentDetails.receiptNumber}`;

            const paymentPayload = {
              shop_id: shopId,
              order_id: savedOrderId,
              customer_id: selectedCustomer.customer_id,
              payment_amount: actualPaymentToRecord,
              payment_date: sriLankanDateTime.dateString,
              payment_time: sriLankanDateTime.timeString,
              payment_method: bankPayMethod,
              bank_name: bankPaymentDetails.bank,
              branch_name: bankPaymentDetails.branch || null,
              bank_account_id: bankPaymentDetails.bankAccountId,
              transaction_id: bankPaymentDetails.receiptNumber,
              payment_status: "completed",
              notes: notesText,
            };

            await fetch(`${API_URL}/payments`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(paymentPayload),
            });
          }
        }
      }

      return {
        success: true,
        data: {
          orderNumber,
          total: finalTotal,
          paid: finalPaid,
          status: finalStatus,
          balance: finalBalance,
        },
      };
    } catch (error: any) {
      console.error("Save order error:", error);
      return { success: false, error: error.message };
    }
  };

  const handleSaveOrder = async () => {
    const result = await saveOrderInternal();
    if (result.success && result.data) {
      const { orderNumber, total, paid, status, balance } = result.data;
      const paymentStatusText =
        status === "fully_paid"
          ? "✓ Fully Paid"
          : status === "partial"
          ? "⚠ Partially Paid"
          : "⏳ Unpaid";
      const displayMessage = `✓ Order ${orderNumber} created! Total: Rs. ${total.toFixed(
        2
      )} | Paid: Rs. ${paid.toFixed(
        2
      )} | Status: ${paymentStatusText}${balance > 0 ? ` | Balance Due: Rs. ${balance.toFixed(2)}` : ""}`;
      setMessage({ type: "success", text: displayMessage });
      resetSalesState();
    } else if (result.error) {
      setMessage({ type: "error", text: result.error });
    }
  };

  const handleSaveAndExport = async () => {
    if (isSavingOrder) return; // Prevent double-click
    
    setIsSavingOrder(true);
    try {
      const result = await saveOrderInternal();
    if (result.success && result.data) {
      const { orderNumber, total, paid, balance } = result.data;
      const displayMessage = `✓ Order ${orderNumber} saved and exported as image!`;
      setMessage({ type: "success", text: displayMessage });

      try {
        // Prepare invoice data for InvoicePrint component
        const invoiceData = {
          order_id: 0,
          order_number: orderNumber,
          customer_id: selectedCustomer?.customer_id || 0,
          total_items: cartItems.length,
          total_amount: subtotal,
          final_amount: total,
          advance_paid: paid,
          balance_due: balance || 0,
          payment_status: (balance > 0 ? (paid > 0 ? "partial" : "unpaid") : "fully_paid") as "unpaid" | "partial" | "fully_paid",
          payment_method: paymentMethod as "cash" | "card" | "online" | "bank" | "other",
          order_status: "pending" as const,
          notes: orderNotes || null,
          order_date: new Date().toISOString(),
          recipient_name: selectedCustomer?.first_name || selectedCustomer?.last_name || "",
          customer_mobile: selectedCustomer?.mobile || "",
          recipient_phone: selectedCustomer?.mobile || "",
          delivery_charge: deliveryCharge,
          delivery_line1: null,
          delivery_line2: null,
          delivery_city: null,
          items: cartItems.map(item => ({
            product_name: item.productName,
            size_name: item.size,
            color_name: item.color,
            quantity: item.quantity,
            sold_price: item.price,
            total_price: item.price * item.quantity,
          })),
        };

        // Create a temporary container for rendering
        const printContainer = document.createElement("div");
        printContainer.style.position = "fixed";
        printContainer.style.left = "-9999px";
        printContainer.style.width = "210mm"; // A4 width
        printContainer.style.background = "white";
        document.body.appendChild(printContainer);

        const root = ReactDOM.createRoot(printContainer);
        root.render(React.createElement(InvoicePrint, { order: invoiceData }));

        // Wait for rendering to complete
        setTimeout(async () => {
          try {
            // Convert to canvas
            const canvas = await html2canvas(printContainer, {
              scale: 2,
              useCORS: true,
              allowTaint: true,
              backgroundColor: "#ffffff",
              width: 794, // A4 width in pixels at 96 DPI
              windowWidth: 794,
            });

            // Convert canvas to blob
            canvas.toBlob(async (blob) => {
              if (!blob) {
                setMessage({ type: "error", text: "Failed to generate image" });
                document.body.removeChild(printContainer);
                return;
              }

              try {
                // Save to Documents folder
                const { documentDir } = await import("@tauri-apps/api/path");
                const { createDir, writeBinaryFile } = await import("@tauri-apps/api/fs");
                const { join } = await import("@tauri-apps/api/path");

                const documentDirPath = await documentDir();
                const invoicesPath = await join(documentDirPath, "Dennep Pos Documents", "Invoices");
                await createDir(invoicesPath, { recursive: true });

                const timestamp = new Date().toISOString().replace(/[:.]/g, "-").split("T")[0];
                const time = new Date().toTimeString().split(" ")[0].replace(/:/g, "-");
                const fileName = `invoice-${orderNumber}-${timestamp}_${time}.png`;
                const filePath = await join(invoicesPath, fileName);

                // Convert blob to array buffer
                const arrayBuffer = await blob.arrayBuffer();
                const uint8Array = new Uint8Array(arrayBuffer);

                // Write file using Tauri API
                await writeBinaryFile(filePath, uint8Array);

                setMessage({ 
                  type: "success", 
                  text: `✅ Invoice saved as image!\nLocation: Dennep Pos Invoices\\${fileName}` 
                });
              } catch (error) {
                console.error("Error saving image:", error);
                setMessage({ type: "error", text: "Failed to save invoice as image." });
              } finally {
                document.body.removeChild(printContainer);
              }
            }, "image/png");
          } catch (error) {
            console.error("Error generating image:", error);
            setMessage({ type: "error", text: "Failed to generate invoice image." });
            document.body.removeChild(printContainer);
          }
        }, 1000);
      } catch (error) {
        console.error("Error preparing invoice for export:", error);
        setMessage({ type: "error", text: "Failed to prepare invoice for export." });
      }

      resetSalesState();
    } else if (result.error) {
      setMessage({ type: "error", text: result.error });
    }
    } finally {
      setIsSavingOrder(false);
    }
  };

  const handleSimplePrint = async () => {
    const result = await saveOrderInternal();
    if (result.success && result.data) {
      const { orderNumber, total, paid, balance } = result.data;
      setMessage({
        type: "success",
        text: `✓ Order ${orderNumber} saved and ready to print`,
      });

      // Prepare invoice data for InvoicePrint component
      const invoiceData = {
        order_id: 0,
        order_number: orderNumber,
        customer_id: selectedCustomer?.customer_id || 0,
        total_items: cartItems.length,
        total_amount: subtotal,
        final_amount: total,
        advance_paid: paid,
        balance_due: balance || 0,
        payment_status: (balance > 0 ? (paid > 0 ? "partial" : "unpaid") : "fully_paid") as "unpaid" | "partial" | "fully_paid",
        payment_method: paymentMethod as "cash" | "card" | "online" | "bank" | "other",
        order_status: "pending" as const,
        notes: orderNotes || null,
        order_date: new Date().toISOString(),
        recipient_name: selectedCustomer?.first_name || selectedCustomer?.last_name || "",
        customer_mobile: selectedCustomer?.mobile || "",
        recipient_phone: selectedCustomer?.mobile || "",
        delivery_charge: deliveryCharge,
        delivery_line1: null,
        delivery_line2: null,
        delivery_city: null,
        items: cartItems.map(item => ({
          product_name: item.productName,
          size_name: item.size,
          color_name: item.color,
          quantity: item.quantity,
          sold_price: item.price,
          total_price: item.price * item.quantity,
        })),
      };

      // Create a temporary container for rendering
      const printContainer = document.createElement("div");
      printContainer.style.position = "fixed";
      printContainer.style.left = "-9999px";
      printContainer.style.width = "210mm";
      printContainer.style.background = "white";
      document.body.appendChild(printContainer);

      const root = ReactDOM.createRoot(printContainer);
      root.render(React.createElement(InvoicePrint, { order: invoiceData }));

      // Wait for rendering then save as image and print
      setTimeout(async () => {
        try {
          // Convert to canvas
          const canvas = await html2canvas(printContainer, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: "#ffffff",
            width: 794,
            windowWidth: 794,
          });

          // Save to Documents folder
          const { documentDir } = await import("@tauri-apps/api/path");
          const { createDir, writeBinaryFile } = await import("@tauri-apps/api/fs");
          const { join } = await import("@tauri-apps/api/path");
          const { Command } = await import("@tauri-apps/api/shell");

          const documentDirPath = await documentDir();
          const invoicesPath = await join(documentDirPath, "Dennep Pos Documents", "Invoices");
          await createDir(invoicesPath, { recursive: true });

          const timestamp = new Date().toISOString().replace(/[:.]/g, "-").split("T")[0];
          const time = new Date().toTimeString().split(" ")[0].replace(/:/g, "-");
          const fileName = `invoice-${orderNumber}-${timestamp}_${time}.png`;
          const filePath = await join(invoicesPath, fileName);

          // Rotate canvas 90 degrees clockwise to fix printer orientation
          const rotatedCanvas = document.createElement('canvas');
          rotatedCanvas.width = canvas.height;
          rotatedCanvas.height = canvas.width;
          const ctx = rotatedCanvas.getContext('2d');
          if (ctx) {
            ctx.translate(rotatedCanvas.width / 2, rotatedCanvas.height / 2);
            ctx.rotate(90 * Math.PI / 180);
            ctx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);
          }

          // Convert rotated canvas to blob and save
          await new Promise<void>((resolve, reject) => {
            rotatedCanvas.toBlob(async (blob) => {
              if (!blob) {
                reject(new Error("Failed to generate image"));
                return;
              }

              try {
                const arrayBuffer = await blob.arrayBuffer();
                const uint8Array = new Uint8Array(arrayBuffer);
                await writeBinaryFile(filePath, uint8Array);
                console.log(`✅ Invoice saved: ${fileName}`);
                resolve();
              } catch (error) {
                console.error("Error saving image:", error);
                reject(error);
              }
            }, "image/png");
          });

          // Silent print to default printer using mspaint
          console.log('🖨️ Printing to default printer...');
          console.log('📁 File:', filePath);
          
          const command = new Command('cmd', [
            '/c',
            'mspaint',
            '/pt',
            filePath
          ]);
          
          await command.execute();
          console.log('✅ Print command sent to default printer');

          setMessage({
            type: "success",
            text: `✅ Invoice ${orderNumber} saved and sent to printer!`
          });
        } catch (error) {
          console.error('Print error:', error);
          setMessage({
            type: "error",
            text: `Failed to print: ${error}`
          });
        } finally {
          document.body.removeChild(printContainer);
        }
      }, 1000);

      resetSalesState();
    } else if (result.error) {
      setMessage({ type: "error", text: result.error });
    }
  };

  // Combined function: Export as image AND print
  const handlePrintAndExport = async () => {
    if (isSavingOrder) return; // Prevent double-click
    
    setIsSavingOrder(true);
    try {
      const result = await saveOrderInternal();
    if (result.success && result.data) {
      const { orderNumber, total, paid, balance } = result.data;
      
      // Prepare invoice data
      const invoiceData = {
        order_id: 0,
        order_number: orderNumber,
        customer_id: selectedCustomer?.customer_id || 0,
        total_items: cartItems.length,
        total_amount: subtotal,
        final_amount: total,
        advance_paid: paid,
        balance_due: balance || 0,
        payment_status: (balance > 0 ? (paid > 0 ? "partial" : "unpaid") : "fully_paid") as "unpaid" | "partial" | "fully_paid",
        payment_method: paymentMethod as "cash" | "card" | "online" | "bank" | "other",
        order_status: "pending" as const,
        notes: orderNotes || null,
        order_date: new Date().toISOString(),
        recipient_name: selectedCustomer?.first_name || selectedCustomer?.last_name || "",
        customer_mobile: selectedCustomer?.mobile || "",
        recipient_phone: selectedCustomer?.mobile || "",
        delivery_charge: deliveryCharge,
        delivery_line1: null,
        delivery_line2: null,
        delivery_city: null,
        items: cartItems.map(item => ({
          product_name: item.productName,
          size_name: item.size,
          color_name: item.color,
          quantity: item.quantity,
          sold_price: item.price,
          total_price: item.price * item.quantity,
        })),
      };

      // Create a temporary container for rendering
      const printContainer = document.createElement("div");
      printContainer.style.position = "fixed";
      printContainer.style.left = "-9999px";
      printContainer.style.width = "210mm"; // A4 width
      printContainer.style.background = "white";
      document.body.appendChild(printContainer);

      const root = ReactDOM.createRoot(printContainer);
      root.render(React.createElement(InvoicePrint, { order: invoiceData }));

      // Wait for rendering to complete
      setTimeout(async () => {
        try {
          // Step 1: Export as image and get the file path
          const canvas = await html2canvas(printContainer, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: "#ffffff",
            width: 794, // A4 width in pixels at 96 DPI
            windowWidth: 794,
          });

          // Save image to Documents folder
          const { documentDir } = await import("@tauri-apps/api/path");
          const { createDir, writeBinaryFile } = await import("@tauri-apps/api/fs");
          const { join } = await import("@tauri-apps/api/path");

          const documentDirPath = await documentDir();
          const invoicesPath = await join(documentDirPath, "Dennep Pos Documents", "Invoices");
          await createDir(invoicesPath, { recursive: true });

          const timestamp = new Date().toISOString().replace(/[:.]/g, "-").split("T")[0];
          const time = new Date().toTimeString().split(" ")[0].replace(/:/g, "-");
          const fileName = `invoice-${orderNumber}-${timestamp}_${time}.png`;
          const filePath = await join(invoicesPath, fileName);

          // Rotate canvas 90 degrees clockwise to fix printer orientation
          const rotatedCanvas = document.createElement('canvas');
          rotatedCanvas.width = canvas.height;
          rotatedCanvas.height = canvas.width;
          const ctx = rotatedCanvas.getContext('2d');
          if (ctx) {
            ctx.translate(rotatedCanvas.width / 2, rotatedCanvas.height / 2);
            ctx.rotate(90 * Math.PI / 180);
            ctx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);
          }

          // Convert rotated canvas to blob and save
          await new Promise<void>((resolve, reject) => {
            rotatedCanvas.toBlob(async (blob) => {
              if (!blob) {
                reject(new Error("Failed to generate image"));
                return;
              }

              try {
                const arrayBuffer = await blob.arrayBuffer();
                const uint8Array = new Uint8Array(arrayBuffer);
                await writeBinaryFile(filePath, uint8Array);
                console.log(`✅ Invoice saved as image: ${fileName}`);
                resolve();
              } catch (error) {
                console.error("Error saving image:", error);
                reject(error);
              }
            }, "image/png");
          });

          // Step 2: Silent print to default printer using mspaint
          const command = new Command('cmd', [
            '/c',
            'mspaint',
            '/pt',
            filePath
          ]);
          await command.execute();

          setMessage({
            type: "success",
            text: `✅ Invoice ${orderNumber} saved as image and sent to printer!`
          });
        } catch (error) {
          console.error('Export error:', error);
          setMessage({
            type: "error",
            text: `Failed to export: ${error}`
          });
        } finally {
          document.body.removeChild(printContainer);
        }
      }, 1000);

      resetSalesState();
    } else if (result.error) {
      setMessage({ type: "error", text: result.error });
    }
    } finally {
      setIsSavingOrder(false);
    }
  };



  const handleCancelOrder = () => {
    setCartItems([]);
    setPaidAmount("");
    setOrderNotes("");
    setSelectedCustomer(null);
    setPaymentMethod("cash");
    setBankPaymentDetails(null);
    setEditingOrderId(null);
    setPreviouslyPaidAmount(0);
  };

  const handlePaymentMethodChange = (method: "cash" | "bank") => {
    setPaymentMethod(method);
    if (method === "cash") {
      setBankPaymentDetails(null);
      setPaidAmount("");
    } else {
      setPaidAmount("");
    }
  };

  const handleSaveBankPayment = (paymentData: BankPaymentData) => {
    setBankPaymentDetails(paymentData);
    setPaidAmount(paymentData.paidAmount);
  };

  const sizeOptions = selectedProduct
    ? selectedProduct.sizesByCategory?.[selectedProduct.category || ""] ||
      selectedProduct.sizes?.map((s) => s.size_name) ||
      []
    : [];
  const colorOptions = selectedProduct
    ? selectedProduct.colorsByCategory?.[selectedProduct.category || ""] ||
      selectedProduct.colors?.map((c) => c.color_name) ||
      []
    : [];

  return (
    <div className="space-y-2 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-red-500">
            {editingOrderId
              ? `Edit Order: ${currentOrderNumber || editingOrderId}`
              : "Sales & Orders"}
          </h1>
          <span className="text-xs font-semibold text-red-400 bg-red-900/30 px-2 py-0.5 rounded-full">
            {cartItems.length} items
          </span>
        </div>
        <p className="text-gray-400 text-xs">
          {editingOrderId
            ? "Update order items and details"
            : "Create orders from online or WhatsApp enquiries"}
        </p>
      </div>

      {/* Message Display */}
      {message && (
        <div
          className={`p-3 rounded-lg border-2 flex items-start gap-2 animate-in fade-in ${
            message.type === "error"
              ? "bg-red-900/40 border-red-600 text-red-300"
              : message.type === "success"
                ? "bg-green-900/40 border-green-600 text-green-300"
                : "bg-blue-900/40 border-blue-600 text-blue-300"
          }`}
        >
          <span className="text-lg font-bold mt-0.5">
            {message.type === "error"
              ? "✕"
              : message.type === "success"
                ? "✓"
                : "ℹ"}
          </span>
          <p className="flex-1 text-sm">{message.text}</p>
        </div>
      )}

      {/* Main Content - Two Columns */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-3 min-h-0">
        {/* Left Side - Customer & Products */}
        <div className="lg:col-span-2 space-y-2 flex flex-col min-h-0">
          {/* Customer Selection */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3">
            {/* Single Row: Customer Type + Search + Add Button */}
            <div className="flex items-center gap-2 mb-2">
              {/* Customer Type Radio Buttons */}
              {!editingOrderId && (
                <div className="flex gap-2 flex-shrink-0">
                  <label className="flex items-center gap-1.5 cursor-pointer group">
                    <input
                      type="radio"
                      name="customerType"
                      value="wholesale"
                      checked={customerTypeFilter === "wholesale"}
                      onChange={(e) =>
                        setCustomerTypeFilter(
                          e.target.value as "wholesale" | "retail"
                        )
                      }
                      className="w-4 h-4 cursor-pointer"
                    />
                    <span className="text-xs text-gray-300 group-hover:text-white transition-colors whitespace-nowrap">
                      🏢 Wholesale
                    </span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer group">
                    <input
                      type="radio"
                      name="customerType"
                      value="retail"
                      checked={customerTypeFilter === "retail"}
                      onChange={(e) =>
                        setCustomerTypeFilter(
                          e.target.value as "wholesale" | "retail"
                        )
                      }
                      className="w-4 h-4 cursor-pointer"
                    />
                    <span className="text-xs text-gray-300 group-hover:text-white transition-colors whitespace-nowrap">
                      👤 Retail
                    </span>
                  </label>
                </div>
              )}

              {/* Search Input */}
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="🔍 Search customer by name, ID, or mobile..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="w-full px-3 py-1.5 bg-gray-700 border-2 border-red-600/30 text-white placeholder-gray-500 rounded-lg focus:border-red-500 focus:outline-none text-sm"
                />

                {customerSearch && filteredCustomers.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-gray-700 border border-red-600/50 rounded-lg max-h-40 overflow-y-auto z-50 mt-1">
                    {isLoadingCustomers ? (
                      <div className="px-4 py-3 text-gray-400 text-sm">
                        Searching...
                      </div>
                    ) : (
                      filteredCustomers.map((customer) => (
                        <button
                          key={customer.customer_id || customer.id}
                          onClick={() => {
                            setSelectedCustomer(customer);
                            setCustomerSearch("");
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-red-900/40 border-b border-gray-600/50 text-sm"
                        >
                          <div className="font-medium text-gray-100">
                            ID: {customer.customer_id || customer.id}
                          </div>
                          <div className="text-xs text-gray-400">
                            {customer.mobile}
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}

                {customerSearch && filteredCustomers.length === 0 && (
                  <button
                    onClick={() => setShowAddCustomerModal(true)}
                    className="absolute top-full left-0 right-0 w-full px-4 py-2 border-2 border-dashed border-red-600 text-red-400 rounded-lg hover:bg-red-900/20 text-sm font-medium transition-colors mt-1 bg-gray-800"
                  >
                    + Add New Customer
                  </button>
                )}
              </div>

              {/* Add Customer Button */}
              {!editingOrderId && (
                <button
                  onClick={() => setShowAddCustomerModal(true)}
                  className="px-3 py-1.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors text-sm whitespace-nowrap flex-shrink-0"
                  title="Add new customer"
                >
                  + Add
                </button>
              )}
            </div>

            {/* Selected Customer Display */}
            {selectedCustomer && (
              <div className="bg-gray-700/50 border border-red-600/30 rounded p-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-100 text-sm">
                      ID: {selectedCustomer.customer_id || selectedCustomer.id}
                    </p>
                    <p className="text-xs text-gray-400">
                      {selectedCustomer.mobile}
                    </p>
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
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3 flex-1 flex flex-col min-h-0 overflow-hidden">
            <div className="space-y-2 flex flex-col min-h-0">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-red-400">
                    Add Products
                  </label>
                  {!editingOrderId && (
                    <button
                      onClick={handleAddProductClick}
                      className="text-red-400 hover:text-red-300 font-bold text-lg transition-colors"
                      title="Add new product"
                    >
                      +
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search product by code or name..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    onFocus={() => setShowProductSearch(true)}
                    className="w-full px-3 py-1.5 bg-gray-700 border-2 border-red-600/30 text-white placeholder-gray-500 rounded-lg focus:border-red-500 focus:outline-none text-sm"
                  />

                  {showProductSearch &&
                    productSearch &&
                    filteredProducts.length > 0 && (
                      <div className="absolute top-full left-0 right-0 bg-gray-700 border border-red-600/50 rounded-lg max-h-48 overflow-y-auto z-50 mt-1">
                        {isLoadingProducts ? (
                          <div className="px-4 py-3 text-gray-400 text-sm">
                            Searching...
                          </div>
                        ) : (
                          filteredProducts.map((product) => (
                            <button
                              key={product.id || product.product_id}
                              onClick={() => {
                                setSelectedProduct(product);
                                setShowProductSearch(false);
                                setSelectedPrice(
                                  String(getProductPrice(product))
                                );
                              }}
                              className="w-full text-left px-4 py-2 hover:bg-red-900/40 border-b border-gray-600/50 text-sm"
                            >
                              <div className="font-medium text-gray-100">
                                {product.name || product.product_name}
                              </div>
                              <div className="text-xs text-gray-400">
                                ID: {product.id || product.product_id} •{" "}
                                {customerTypeFilter === "wholesale"
                                  ? "Wholesale"
                                  : "Retail"}
                                : Rs. {getProductPrice(product).toFixed(2)}
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                </div>
              </div>

              {selectedProduct && (
                <div className="flex-1 overflow-y-auto min-h-0">
                  <div className="bg-gray-700/50 border border-red-600/30 rounded-lg p-3 space-y-2">
                    <div>
                      <p className="font-semibold text-gray-100">
                        {selectedProduct.name || selectedProduct.product_name}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {selectedProduct.code || selectedProduct.sku}
                      </p>
                    </div>

                    <div className="space-y-2">
                      {/* Row 1: Size, Color, Qty, Price - All in one row */}
                      {selectedSize && selectedColor && (() => {
                        const availableQty =
                          productStock.find(
                            (stock) =>
                              stock.size_name === selectedSize &&
                              stock.color_name === selectedColor
                          )?.stock_qty || 0;

                        const cartQtyForProduct = cartItems
                          .filter((item) => {
                            const isSameProduct =
                              item.productCode ===
                                (selectedProduct?.code ||
                                  selectedProduct?.sku) ||
                              item.productName ===
                                (selectedProduct?.name ||
                                  selectedProduct?.product_name);
                            return isSameProduct;
                          })
                          .reduce((sum, item) => sum + item.quantity, 0);

                        const remainingQty = availableQty - cartQtyForProduct;
                        const productCostVal =
                          parsePrice(
                            selectedProduct.product_cost ||
                              selectedProduct.cost_price ||
                              selectedProduct.costPrice
                          ) || 0;
                        const printCostVal =
                          parsePrice(
                            selectedProduct.print_cost || 0
                          ) || 0;
                        const totalCost = productCostVal + printCostVal;
                        const currentPrice = parseFloat(selectedPrice) || 0;
                        const isBelowCost = selectedPrice && currentPrice < totalCost;

                        return (
                          <div className="grid grid-cols-4 gap-2">
                            <div>
                              <label className="block text-xs font-semibold text-red-400 mb-1">
                                Size
                              </label>
                              <select
                                value={selectedSize}
                                onChange={(e) => setSelectedSize(e.target.value)}
                                className="w-full px-2 py-1.5 bg-gray-600 border border-gray-500 text-white rounded text-sm focus:border-red-500 focus:outline-none"
                              >
                                <option value="">-- Size --</option>
                                {availableSizes.length > 0 ? (
                                  availableSizes.map((size) => (
                                    <option key={size.size_id} value={size.size_name}>
                                      {size.size_name}
                                    </option>
                                  ))
                                ) : (
                                  <option disabled>No sizes</option>
                                )}
                              </select>
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-red-400 mb-1">
                                Color
                              </label>
                              <select
                                value={selectedColor}
                                onChange={(e) => setSelectedColor(e.target.value)}
                                className="w-full px-2 py-1.5 bg-gray-600 border border-gray-500 text-white rounded text-sm focus:border-red-500 focus:outline-none"
                              >
                                <option value="">-- Color --</option>
                                {availableColors.length > 0 ? (
                                  availableColors.map((color) => (
                                    <option
                                      key={color.color_id}
                                      value={color.color_name}
                                    >
                                      {color.color_name}
                                    </option>
                                  ))
                                ) : (
                                  <option disabled>No colors</option>
                                )}
                              </select>
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-red-400 mb-1">
                                Qty (Avl: {availableQty})
                              </label>
                              <input
                                type="number"
                                min="1"
                                max={remainingQty}
                                value={selectedQty}
                                onChange={(e) => setSelectedQty(e.target.value)}
                                placeholder="Qty"
                                className="w-full px-2 py-1.5 bg-gray-600 border border-gray-500 text-white rounded text-sm focus:border-red-500 focus:outline-none"
                              />
                              {remainingQty <= 0 && (
                                <p className="text-[10px] text-red-400 mt-0.5">
                                  ⚠️ Out of stock
                                </p>
                              )}
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-red-400 mb-1">
                                Price (Rs.) {isBelowCost && <span className="text-red-400">⚠️</span>}
                              </label>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={selectedPrice}
                                onChange={(e) =>
                                  setSelectedPrice(e.target.value)
                                }
                                placeholder="Price"
                                className="w-full px-2 py-1.5 bg-gray-600 border border-gray-500 text-white rounded text-sm focus:border-red-500 focus:outline-none"
                              />
                              <p className="text-[10px] text-gray-400 mt-0.5">
                                Default: Rs. {selectedProduct ? getProductPrice(selectedProduct).toFixed(2) : "0.00"}
                              </p>
                            </div>
                          </div>
                        );
                      })()}

                      {!selectedSize || !selectedColor ? (
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs font-semibold text-red-400 mb-1">
                              Size
                            </label>
                            <select
                              value={selectedSize}
                              onChange={(e) => setSelectedSize(e.target.value)}
                              className="w-full px-2 py-1.5 bg-gray-600 border border-gray-500 text-white rounded text-sm focus:border-red-500 focus:outline-none"
                            >
                              <option value="">-- Size --</option>
                              {availableSizes.length > 0 ? (
                                availableSizes.map((size) => (
                                  <option key={size.size_id} value={size.size_name}>
                                    {size.size_name}
                                  </option>
                                ))
                              ) : (
                                <option disabled>No sizes</option>
                              )}
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-red-400 mb-1">
                              Color
                            </label>
                            <select
                              value={selectedColor}
                              onChange={(e) => setSelectedColor(e.target.value)}
                              disabled={!selectedSize}
                              className="w-full px-2 py-1.5 bg-gray-600 border border-gray-500 text-white rounded text-sm focus:border-red-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <option value="">-- Color --</option>
                              {availableColors.length > 0 ? (
                                availableColors.map((color) => (
                                  <option
                                    key={color.color_id}
                                    value={color.color_name}
                                  >
                                    {color.color_name}
                                  </option>
                                ))
                              ) : (
                                <option disabled>No colors</option>
                              )}
                            </select>
                          </div>
                        </div>
                      ) : null}
                    </div>

                    {selectedSize && selectedColor && selectedQty && (
                      <button
                        onClick={handleAddProductToCart}
                        className="w-full bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                      >
                        + Add to Cart
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setSelectedProduct(null);
                        setSelectedSize("");
                        setSelectedColor("");
                        setSelectedQty("");
                        setSelectedPrice("");
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
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3 flex flex-col min-h-0">
          <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-700">
            <div>
              <h2 className="text-lg font-bold text-red-500">Order Summary</h2>
              <span className="text-xs bg-red-900/30 text-red-400 px-2 py-0.5 rounded inline-block mt-1">
                {cartItems.length} items
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowNotesModal(true)}
                className="px-3 py-2 border border-gray-600 text-gray-300 rounded-lg font-semibold hover:bg-gray-700/50 transition-colors text-sm"
                title="Add order notes"
              >
                📝 Notes
              </button>
              <button
                onClick={handleCancelOrder}
                className="px-3 py-2 border border-gray-600 text-gray-400 rounded-lg text-sm hover:bg-gray-700/50 transition-colors"
                title={
                  editingOrderId
                    ? "Cancel editing and return to sales"
                    : "Clear cart and reset"
                }
              >
                {editingOrderId ? "✕ Cancel" : "🔄 Clear"}
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5 mb-2">
            {cartItems.length > 0 ? (
              cartItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-gray-700/50 p-2 rounded border border-gray-600 hover:border-red-600/50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-100">
                        {item.productName}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        ID: {item.productId} • {item.size} • {item.color}
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
                    <div className="text-gray-400">
                      <span>Qty: {item.quantity}</span>
                      <span className="ml-3">
                        @ Rs. {item.price.toFixed(2)}
                      </span>
                    </div>
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

            {selectedProduct &&
              selectedSize &&
              selectedColor &&
              selectedQty &&
              selectedPrice && (
                <div className="bg-blue-900/30 border border-blue-600/50 p-3 rounded mt-2 animate-fadeIn">
                  <p className="text-xs text-blue-300 font-semibold mb-2">
                    Preview - Will add:
                  </p>
                  <div className="space-y-1 text-xs">
                    <p className="text-gray-300">
                      <span className="font-medium">
                        {selectedProduct.name || selectedProduct.product_name}
                      </span>
                    </p>
                    <p className="text-gray-400">
                      ID: {selectedProduct.id || selectedProduct.product_id} •{" "}
                      {selectedSize} • {selectedColor}
                    </p>
                    <div className="flex justify-between items-center pt-1 border-t border-blue-600/30">
                      <div className="text-gray-400">
                        <span>Qty: {selectedQty}</span>
                        <span className="ml-3">
                          @ Rs. {parseFloat(selectedPrice).toFixed(2)}
                        </span>
                      </div>
                      <span className="font-semibold text-blue-400">
                        Rs.{" "}
                        {(
                          parseFloat(selectedPrice) * parseInt(selectedQty)
                        ).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
          </div>

          <div className="space-y-1 border-t border-gray-700 pt-2 mb-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Subtotal:</span>
              <span className="font-semibold text-gray-100">
                Rs. {subtotal.toFixed(2)}
              </span>
            </div>
            {editingOrderId && deliveryCharge > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Delivery:</span>
                <span className="font-semibold text-gray-100">
                  Rs. {deliveryCharge.toFixed(2)}
                </span>
              </div>
            )}
            <div className="flex justify-between text-base pt-1 border-t border-red-600">
              <span className="font-bold text-gray-100">
                {editingOrderId && deliveryCharge > 0
                  ? "Grand Total:"
                  : "Total:"}
              </span>
              <span className="font-bold text-red-500">
                Rs.{" "}
                {editingOrderId
                  ? (total + deliveryCharge).toFixed(2)
                  : total.toFixed(2)}
              </span>
            </div>

            {editingOrderId && previouslyPaidAmount !== undefined && (
              <div className="mt-2 pt-2 border-t border-gray-700 grid grid-cols-2 gap-2 text-xs">
                {previouslyPaidAmount > 0 && (
                  <div className="bg-yellow-900/30 border border-yellow-600/40 rounded px-2 py-1">
                    <div className="text-yellow-400/80">Paid</div>
                    <div className="font-bold text-yellow-300">
                      Rs. {previouslyPaidAmount.toFixed(2)}
                    </div>
                  </div>
                )}
                {balanceDue > 0 ? (
                  <div className="bg-orange-900/30 border border-orange-600/40 rounded px-2 py-1">
                    <div className="text-orange-400/80">Due</div>
                    <div className="font-bold text-orange-300">
                      Rs. {balanceDue.toFixed(2)}
                    </div>
                  </div>
                ) : previouslyPaidAmount > 0 ? (
                  <div className="bg-green-900/30 border border-green-600/40 rounded px-2 py-1">
                    <div className="text-green-400/80">Status</div>
                    <div className="font-bold text-green-300">✓ Paid</div>
                  </div>
                ) : null}
              </div>
            )}
          </div>

          <div className="mb-2 pb-2 border-b border-gray-700">
            <PaymentMethodSelector
              paymentMethod={paymentMethod}
              onPaymentMethodChange={handlePaymentMethodChange}
              onBankPaymentClick={() => setShowBankPaymentModal(true)}
              paidAmount={
                paymentMethod === "cash"
                  ? paidAmount
                  : bankPaymentDetails?.paidAmount || ""
              }
              totalAmount={editingOrderId ? balanceDue : total}
              previouslyPaidAmount={previouslyPaidAmount}
              bankPaymentDetails={
                paymentMethod === "bank" ? bankPaymentDetails : null
              }
              isEditingOrder={!!editingOrderId}
            />

            {paymentMethod === "cash" && (
              <div className="space-y-1 mt-2">
                <label className="block text-xs font-semibold text-green-400">
                  Cash Amount (Rs.) <span className="text-red-500">*</span>
                  {editingOrderId && balanceDue > 0 && (
                    <span className="ml-1 text-orange-400 font-normal text-[10px]">
                      (Suggested: {balanceDue.toFixed(2)})
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(e.target.value)}
                  placeholder={
                    editingOrderId && balanceDue > 0
                      ? `Due: ${balanceDue.toFixed(2)}`
                      : "Enter amount"
                  }
                  className="w-full px-3 py-1.5 bg-gray-700 border-2 border-green-600/30 text-white rounded focus:border-green-500 focus:outline-none text-sm"
                />
                {paidAmount &&
                  (() => {
                    const paidAmt = parseFloat(paidAmount) || 0;
                    const amountToCompare = editingOrderId ? balanceDue : total;
                    const balance = amountToCompare - paidAmt;
                    const isFullyPaid = balance <= 0;

                    return (
                      <div className="mt-1 px-2 py-1 rounded text-[10px] font-semibold">
                        {isFullyPaid ? (
                          <div className="bg-green-900/40 text-green-400">
                            ✓ Fully Paid{" "}
                            {paidAmt > amountToCompare
                              ? `(Excess: ${(paidAmt - amountToCompare).toFixed(2)})`
                              : ""}
                          </div>
                        ) : (
                          <div className="bg-orange-900/40 text-orange-400">
                            ⚠️ Partial: Due Rs. {balance.toFixed(2)}
                          </div>
                        )}
                      </div>
                    );
                  })()}
              </div>
            )}
          </div>

          <BankPaymentModal
            isOpen={showBankPaymentModal}
            onClose={() => setShowBankPaymentModal(false)}
            onSave={handleSaveBankPayment}
            totalAmount={editingOrderId ? balanceDue : total}
            isEditingOrder={!!editingOrderId}
          />

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleSaveAndExport}
              disabled={!selectedCustomer || cartItems.length === 0 || isSavingOrder}
              className="bg-purple-600 text-white py-1.5 rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors text-sm"
            >
              {isSavingOrder ? "⏳ Saving..." : "📥 Export"}
            </button>

            <button
              onClick={handlePrintAndExport}
              disabled={!selectedCustomer || cartItems.length === 0 || isSavingOrder}
              className="bg-blue-600 text-white py-1.5 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors text-sm"
            >
              {isSavingOrder ? "⏳ Saving..." : "🖨️ Print"}
            </button>
          </div>
        </div>
      </div>

      {showAddCustomerModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg shadow-2xl border-2 border-red-600 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-red-700 to-red-900 text-white p-4 border-b border-red-600 flex justify-between items-center sticky top-0">
              <h2 className="text-lg font-bold">Add New Customer</h2>
              <button
                onClick={() => {
                  setShowAddCustomerModal(false);
                  setCustomerFormData({
                    customer_id: "",
                    mobile: "",
                    email: "",
                  });
                  setCustomerModalError("");
                  setCustomerModalSuccess("");
                }}
                className="text-white hover:text-red-200 transition-colors text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-3">
              {customerModalError && (
                <div className="bg-red-900/30 border-2 border-red-600 text-red-300 p-3 rounded-lg flex items-start gap-3">
                  <span className="text-xl">✕</span>
                  <div>
                    <p className="font-semibold">{customerModalError}</p>
                  </div>
                </div>
              )}

              {customerModalSuccess && (
                <div className="bg-green-900/30 border-2 border-green-600 text-green-300 p-3 rounded-lg flex items-start gap-3">
                  <span className="text-xl">✓</span>
                  <div>
                    <p className="font-semibold">{customerModalSuccess}</p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-red-400 mb-2">
                  Customer ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  placeholder="e.g., 1001"
                  value={customerFormData.customer_id || ""}
                  onChange={(e) =>
                    setCustomerFormData({
                      ...customerFormData,
                      customer_id: e.target.value,
                    })
                  }
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter" &&
                      String(customerFormData.customer_id || "").trim()
                    ) {
                      (
                        document.querySelector(
                          'input[placeholder*="Mobile"]'
                        ) as HTMLInputElement
                      )?.focus();
                    }
                  }}
                  className="w-full px-4 py-2 bg-gray-700 border-2 border-red-600/30 text-white placeholder-gray-500 rounded-lg focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-red-400 mb-2">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="e.g., +94-71-1234567"
                  value={customerFormData.mobile || ""}
                  onChange={(e) =>
                    setCustomerFormData({
                      ...customerFormData,
                      mobile: e.target.value,
                    })
                  }
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter" &&
                      String(customerFormData.mobile || "").trim()
                    ) {
                      (
                        document.querySelector(
                          'input[type="email"]'
                        ) as HTMLInputElement
                      )?.focus();
                    }
                  }}
                  className="w-full px-4 py-2 bg-gray-700 border-2 border-red-600/30 text-white placeholder-gray-500 rounded-lg focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-red-400 mb-2">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  placeholder="e.g., customer@example.com"
                  value={customerFormData.email || ""}
                  onChange={(e) =>
                    setCustomerFormData({
                      ...customerFormData,
                      email: e.target.value,
                    })
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleAddCustomer();
                    }
                  }}
                  className="w-full px-4 py-2 bg-gray-700 border-2 border-red-600/30 text-white placeholder-gray-500 rounded-lg focus:border-red-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-gray-700">
                <button
                  onClick={handleAddCustomer}
                  disabled={isCreatingCustomer}
                  className="flex-1 bg-red-600 text-white py-1.5 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {isCreatingCustomer ? "Creating..." : "Add Customer"}
                </button>
                <button
                  onClick={() => {
                    setShowAddCustomerModal(false);
                    setCustomerFormData({
                      customer_id: "",
                      mobile: "",
                      email: "",
                    });
                    setCustomerModalError("");
                    setCustomerModalSuccess("");
                  }}
                  disabled={isCreatingCustomer}
                  className="flex-1 bg-gray-700 text-gray-300 py-1.5 rounded-lg font-semibold hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showNotesModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-md w-full p-4 border border-gray-700 space-y-3">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-red-500">Order Notes</h2>
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
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded text-sm placeholder-gray-500 focus:border-red-500 focus:outline-none min-h-[100px] resize-none"
            />

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowNotesModal(false)}
                className="flex-1 bg-red-600 text-white py-1.5 rounded font-semibold hover:bg-red-700 transition-colors text-sm"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      <AddProductModal
        isOpen={showAddProductModal}
        onClose={handleCloseProductModal}
        onProductAdded={handleProductAdded}
      />
    </div>
  );
};

export default SalesPage;