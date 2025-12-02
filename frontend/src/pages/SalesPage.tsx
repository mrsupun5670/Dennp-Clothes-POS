import React, { useState, useMemo, useEffect } from "react";
import BankPaymentModal, {
  BankPaymentData,
} from "../components/BankPaymentModal";
import PaymentMethodSelector from "../components/PaymentMethodSelector";
import {
  printContent,
  saveAsPDF,
  generateOrderBillHTML,
} from "../utils/exportUtils";
import { useShop } from "../context/ShopContext";
import { API_URL } from "../config/api";

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

// Sample data
const SAMPLE_CUSTOMERS: Customer[] = [
  {
    id: "C001",
    name: "John Doe",
    email: "john.doe@email.com",
    mobile: "+92 300 1234567",
    totalSpent: 65000,
    totalOrders: 18,
    joined: "2023-12-01",
  },
  {
    id: "C002",
    name: "Sarah Smith",
    email: "sarah.smith@email.com",
    mobile: "+92 300 5678901",
    totalSpent: 48500,
    totalOrders: 14,
    joined: "2024-01-15",
  },
  {
    id: "C003",
    name: "Ahmed Khan",
    email: "ahmed.khan@email.com",
    mobile: "+92 300 9876543",
    totalSpent: 35000,
    totalOrders: 9,
    joined: "2024-02-10",
  },
  {
    id: "C004",
    name: "Priya Jayasooriya",
    email: "priya.j@email.com",
    mobile: "+94 77 1234567",
    totalSpent: 42000,
    totalOrders: 11,
    joined: "2024-02-20",
  },
  {
    id: "C005",
    name: "Lakshmi Fernando",
    email: "lakshmi.f@email.com",
    mobile: "+94 71 9876543",
    totalSpent: 52000,
    totalOrders: 15,
    joined: "2023-11-05",
  },
  {
    id: "C006",
    name: "Michael Brown",
    email: "michael.brown@email.com",
    mobile: "+92 300 1111111",
    totalSpent: 28500,
    totalOrders: 7,
    joined: "2024-03-05",
  },
  {
    id: "C007",
    name: "Jessica White",
    email: "jessica.white@email.com",
    mobile: "+92 300 2222222",
    totalSpent: 19500,
    totalOrders: 5,
    joined: "2024-03-20",
  },
  {
    id: "C008",
    name: "David Lee",
    email: "david.lee@email.com",
    mobile: "+92 300 3333333",
    totalSpent: 31000,
    totalOrders: 8,
    joined: "2024-04-01",
  },
  {
    id: "C009",
    name: "Emily Davis",
    email: "emily.davis@email.com",
    mobile: "+92 300 4444444",
    totalSpent: 55500,
    totalOrders: 16,
    joined: "2024-01-10",
  },
  {
    id: "C010",
    name: "Christopher Wilson",
    email: "christopher.w@email.com",
    mobile: "+92 300 5555555",
    totalSpent: 38000,
    totalOrders: 10,
    joined: "2024-02-14",
  },
  {
    id: "C011",
    name: "Michelle Taylor",
    email: "michelle.t@email.com",
    mobile: "+92 300 6666666",
    totalSpent: 44500,
    totalOrders: 12,
    joined: "2024-03-15",
  },
  {
    id: "C012",
    name: "Daniel Martinez",
    email: "daniel.m@email.com",
    mobile: "+92 300 7777777",
    totalSpent: 35000,
    totalOrders: 9,
    joined: "2024-04-05",
  },
  {
    id: "C013",
    name: "Amanda Garcia",
    email: "amanda.g@email.com",
    mobile: "+92 300 8888888",
    totalSpent: 22000,
    totalOrders: 6,
    joined: "2024-04-20",
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
    colorsByCategory: {
      tshirt: ["Black", "White", "Navy", "Maroon", "Green", "Blue", "Gray"],
    },
  },
  {
    id: "P002",
    code: "PLO-POL01",
    name: "Cotton Polo Shirt",
    retailPrice: 1600,
    category: "shirt",
    sizesByCategory: { shirt: ["S", "M", "L", "XL", "XXL"] },
    colorsByCategory: {
      shirt: ["White", "Navy", "Red", "Green", "Black", "Maroon"],
    },
  },
  {
    id: "P003",
    code: "FRM-SHT01",
    name: "Formal Shirt",
    retailPrice: 1800,
    category: "shirt",
    sizesByCategory: {
      shirt: ["14", "14.5", "15", "15.5", "16", "16.5", "17"],
    },
    colorsByCategory: {
      shirt: ["White", "Light Blue", "Sky Blue", "Cream", "Pink"],
    },
  },
  {
    id: "P004",
    code: "JNS-PRM01",
    name: "Jeans Premium",
    retailPrice: 2500,
    category: "trouser",
    sizesByCategory: { trouser: ["28", "30", "32", "34", "36", "38"] },
    colorsByCategory: { trouser: ["Blue", "Black", "Dark Blue", "Light Blue"] },
  },
  {
    id: "P005",
    code: "CRG-PNT01",
    name: "Cargo Pants",
    retailPrice: 2200,
    category: "trouser",
    sizesByCategory: { trouser: ["28", "30", "32", "34", "36", "38"] },
    colorsByCategory: { trouser: ["Khaki", "Black", "Green", "Gray"] },
  },
  {
    id: "P006",
    code: "CRP-TOP01",
    name: "Summer Crop Top",
    retailPrice: 950,
    category: "tshirt",
    sizesByCategory: { tshirt: ["XS", "S", "M", "L", "XL"] },
    colorsByCategory: {
      tshirt: ["Black", "White", "Pink", "Peach", "Yellow", "Red"],
    },
  },
  {
    id: "P007",
    code: "DRS-CAS01",
    name: "Casual Dress",
    retailPrice: 3500,
    category: "dress",
    sizesByCategory: { dress: ["XS", "S", "M", "L", "XL"] },
    colorsByCategory: { dress: ["Red", "Green", "Purple", "Blue", "Black"] },
  },
  {
    id: "P008",
    code: "JKT-WIN01",
    name: "Winter Jacket",
    retailPrice: 4500,
    category: "jacket",
    sizesByCategory: { jacket: ["S", "M", "L", "XL", "XXL"] },
    colorsByCategory: { jacket: ["Black", "Navy", "Gray", "Brown", "Maroon"] },
  },
];

interface SizeOption {
  [key: string]: string[];
}

interface ColorOption {
  [key: string]: string[];
}

const SalesPage: React.FC = () => {
  // Shop context
  const { shopId } = useShop();

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

  // Load order from sessionStorage on component mount
  React.useEffect(() => {
    const orderData = sessionStorage.getItem("orderToEdit");
    if (orderData) {
      try {
        const order = JSON.parse(orderData);
        setEditingOrderId(order.orderId);

        // Store the amount already paid (advance payment) for balance calculation
        setPreviouslyPaidAmount(order.totalPaid || 0);

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
            id: `edit-${idx}-${Date.now()}`,
            productId: item.product_id,
            productCode: `CODE-${idx}`,
            productName: item.productName,
            size: item.size || "N/A",
            sizeId: item.sizeId,
            color: item.color || "N/A",
            colorId: item.colorId,
            quantity: item.quantity,
            price: item.soldPrice || item.price,
            productCost: item.productCost || 0,
            printCost: item.printCost || 0,
          })
        );
        setCartItems(newCartItems);

        // Set payment information
        if (order.deliveryCharge !== undefined && order.deliveryCharge > 0) {
          setDeliveryCharge(order.deliveryCharge);
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
    }

    // Clear navigation flag
    if (sessionStorage.getItem("navigateToSales") === "true") {
      sessionStorage.removeItem("navigateToSales");
    }
  }, []);

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
    setSelectedCategory("tshirt");
    setStockRows([{ id: 1, size: "", color: "", qty: 0 }]);
    setNextRowId(2);
    setCustomSizes([]);
    setCustomColors([]);
    setFormData({
      code: "",
      name: "",
      costPrice: "",
      retailPrice: "",
      wholesalePrice: "",
    });
  };

  const handleCloseProductModal = () => {
    setShowAddProductModal(false);
    setFormData({
      code: "",
      name: "",
      costPrice: "",
      retailPrice: "",
      wholesalePrice: "",
    });
    setStockRows([]);
    setCustomSizes([]);
    setCustomColors([]);
  };

  // Search and Filter States
  const [customerSearch, setCustomerSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerTypeFilter, setCustomerTypeFilter] = useState<
    "wholesale" | "retail"
  >("wholesale");
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

    // Show local results immediately
    setCustomers(localFiltered);

    // Fetch from API for more accurate results
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
    }, 50); // Very fast debounce for API call

    return () => clearTimeout(searchTimer);
  }, [customerSearch, shopId, allCustomers]);

  // Load all products on component mount
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

  // Search products on key up - with instant local filtering
  useEffect(() => {
    if (!productSearch.trim()) {
      setProducts(allProducts);
      return;
    }

    if (!shopId) return;

    // Instant local filtering
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

    // Fetch from API for more accurate results
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

  // Load stock data when product is selected
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

          // Get unique sizes from stock data
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

  // Update available colors when size is selected
  useEffect(() => {
    if (!selectedSize || productStock.length === 0) {
      setAvailableColors([]);
      setSelectedColor("");
      return;
    }

    // Get colors available for the selected size
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

  // Helper function to safely convert price to number
  const parsePrice = (price: any): number => {
    if (typeof price === "number") return price;
    if (typeof price === "string") return parseFloat(price) || 0;
    return 0;
  };

  // Helper function to get price based on customer type
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

  // Helper function to safely get wholesale price for display
  const getWholesalePrice = (product: Product): number => {
    if (!product) return 0;
    const price =
      parsePrice(product.wholesale_price) ||
      parsePrice(product.wholesalePrice) ||
      0;
    return typeof price === "number" && !isNaN(price) ? price : 0;
  };

  // Filtered data
  const filteredCustomers = useMemo(() => {
    return customers;
  }, [customers]);

  const filteredProducts = useMemo(() => {
    return products;
  }, [products]);

  // Calculations
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const total = subtotal;

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

    // Get available quantity for this product/size/color combination
    const availableQty =
      productStock.find(
        (stock) =>
          stock.size_name === selectedSize && stock.color_name === selectedColor
      )?.stock_qty || 0;

    const requestedQty = parseInt(selectedQty);

    // Validate quantity against available stock
    if (requestedQty > availableQty) {
      setMessage({
        type: "error",
        text: `Only ${availableQty} units available for this size and color`,
      });
      return;
    }

    // Calculate total quantity already in cart for this product
    const cartQuantityForProduct = cartItems
      .filter((item) => {
        const isSameProduct =
          item.productCode === (selectedProduct.code || selectedProduct.sku) ||
          item.productName ===
            (selectedProduct.name || selectedProduct.product_name);
        return isSameProduct;
      })
      .reduce((sum, item) => sum + item.quantity, 0);

    // Total would be: currently available - already in cart - requested
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
    // Round price to 2 decimal places for consistent comparison
    const roundedPrice = Math.round(price * 100) / 100;
    const uniqueId = `${productId}-${selectedSize}-${selectedColor}-${roundedPrice}`;

    // Get product costs
    const productCost =
      parsePrice(
        selectedProduct.product_cost ||
          selectedProduct.cost_price ||
          selectedProduct.costPrice
      ) || 0;
    const printCost = parsePrice(selectedProduct.print_cost || 0) || 0;

    // Get color_id and size_id from product
    let colorId = 1;
    let sizeId = 1;

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

    // Check if this exact product/size/color/price combination already exists in cart
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
      // Item already exists - increase quantity
      const updatedItems = [...cartItems];
      updatedItems[existingItemIndex].quantity += requestedQty;
      setCartItems(updatedItems);
      setMessage({
        type: "success",
        text: `✓ Qty updated: ${selectedProduct.name || selectedProduct.product_name} (${selectedSize}, ${selectedColor}) @ Rs. ${price.toFixed(2)}`,
      });
    } else {
      // New item - add to cart
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

  const handleSaveOrder = async () => {
    // Validation
    if (!selectedCustomer) {
      setMessage({ type: "error", text: "Please select a customer" });
      return;
    }
    if (cartItems.length === 0) {
      setMessage({ type: "error", text: "Please add items to cart" });
      return;
    }

    // Validation based on payment method
    if (paymentMethod === "cash") {
      if (!paidAmount) {
        setMessage({
          type: "error",
          text: "Cash payment selected: Please enter paid amount to continue",
        });
        return;
      }
    } else if (paymentMethod === "bank") {
      if (!bankPaymentDetails) {
        setMessage({ type: "error", text: "Please add bank payment details" });
        return;
      }
    }

    try {
      // Get paid amount based on payment method
      let newPayment = 0;
      if (paymentMethod === "cash") {
        newPayment = parseFloat(paidAmount) || 0;
      } else if (paymentMethod === "bank") {
        newPayment = parseFloat(bankPaymentDetails?.paidAmount || "0") || 0;
      }

      const totalPaidNow = editingOrderId
        ? previouslyPaidAmount + newPayment
        : newPayment;
      const balance = total - totalPaidNow;

      // Determine payment status and amounts based on whether paid amount is less than total
      let paymentStatus = "";
      let advancePaid = 0;
      let balanceDue = 0;
      let finalAmount = 0;

      if (newPayment > 0) {
        if (newPayment < total) {
          // Partial payment: paid amount goes to advance_paid, difference goes to balance_due, and final_amount equals paid amount
          paymentStatus = "partial";
          advancePaid = newPayment;
          balanceDue = total - newPayment;
          finalAmount = newPayment;
        } else {
          // Full payment: only final_amount is set, advance_paid and balance_due are 0
          paymentStatus = "fully_paid";
          advancePaid = 0;
          balanceDue = 0;
          finalAmount = newPayment;
        }
      } else {
        // No payment made
        paymentStatus = "";
        advancePaid = 0;
        balanceDue = total;
        finalAmount = 0;
      }

      // Generate order number (000001000 format)
      const orderNumberResponse = await fetch(
        `${API_URL}/orders/generate-number?shop_id=${shopId}`
      );
      const orderNumberData = await orderNumberResponse.json();
      const orderNumber =
        orderNumberData.orderNumber || `${String(Date.now()).slice(-9)}`;

      // Get Sri Lankan datetime
      const sriLankanDateTime = getSriLankanDateTime();

      // Create order object (minimal data - delivery address will be added later in Orders page)
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
        payment_method: paymentMethod === "cash" ? "cash" : (bankPaymentDetails?.bank || "bank"),
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

      // Save order to database
      const orderResponse = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const orderResult = await orderResponse.json();
      if (!orderResult.success) {
        setMessage({
          type: "error",
          text: `Failed to save order: ${orderResult.error}`,
        });
        return;
      }

      const savedOrderId = orderResult.data?.order_id;

      // Save payment if amount is paid
      if (newPayment > 0) {
        if (paymentMethod === "cash") {
          const paymentPayload = {
            shop_id: shopId,
            order_id: savedOrderId,
            customer_id: selectedCustomer.customer_id,
            payment_amount: newPayment,
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
          const paymentPayload = {
            shop_id: shopId,
            order_id: savedOrderId,
            customer_id: selectedCustomer.customer_id,
            payment_amount: newPayment,
            payment_date: sriLankanDateTime.dateString,
            payment_time: sriLankanDateTime.timeString,
            payment_method: bankPaymentDetails.bank || "bank",
            payment_status: "completed",
            notes: `Bank: ${bankPaymentDetails.bank}, Receipt: ${bankPaymentDetails.receiptNumber}`,
          };

          await fetch(`${API_URL}/payments`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(paymentPayload),
          });
        }
      }

      // Success message with payment status
      const paymentStatusText =
        paymentStatus === "fully_paid"
          ? "✓ Fully Paid"
          : paymentStatus === "partial"
            ? "⚠ Partially Paid"
            : "⏳ Unpaid";
      const displayMessage = `✓ Order ${orderNumber} created! Total: Rs. ${total.toFixed(2)} | Paid: Rs. ${finalAmount.toFixed(2)} | Status: ${paymentStatusText}${balanceDue > 0 ? ` | Balance Due: Rs. ${balanceDue.toFixed(2)}` : ""}`;
      setMessage({ type: "success", text: displayMessage });

      // Reset form
      setCartItems([]);
      setPaidAmount("");
      setOrderNotes("");
      setSelectedCustomer(null);
      setPaymentMethod("cash");
      setBankPaymentDetails(null);
      setEditingOrderId(null);
      setPreviouslyPaidAmount(0);
    } catch (error: any) {
      setMessage({
        type: "error",
        text: `Error saving order: ${error.message}`,
      });
      console.error("Save order error:", error);
    }
  };

  const handlePrintBill = () => {
    if (!selectedCustomer || cartItems.length === 0) {
      setMessage({
        type: "error",
        text: "Please select customer and add items",
      });
      return;
    }

    // Calculate if payment is fully paid
    const paidAmt = parseFloat(paidAmount) || 0;
    const balance = total - paidAmt;

    // Only allow printing if payment is fully paid or more
    if (paymentMethod === "cash") {
      if (!paidAmount) {
        setMessage({
          type: "error",
          text: "Please enter cash amount to print bill",
        });
        return;
      }
      if (balance > 0) {
        setMessage({
          type: "error",
          text: `Cannot print bill. Balance due: Rs. ${balance.toFixed(2)}. Full or more payment required to print.`,
        });
        return;
      }
    } else if (paymentMethod === "bank") {
      if (!bankPaymentDetails) {
        setMessage({ type: "error", text: "Please add bank payment details" });
        return;
      }
      const bankPaidAmt = parseFloat(bankPaymentDetails.paidAmount) || 0;
      const bankBalance = total - bankPaidAmt;
      if (bankBalance > 0) {
        setMessage({
          type: "error",
          text: `Cannot print bill. Balance due: Rs. ${bankBalance.toFixed(2)}. Full or more payment required to print.`,
        });
        return;
      }
    }

    const html = generateOrderBillHTML({
      selectedCustomer,
      cartItems,
      subtotal,
      total,
      paidAmount,
    });

    printContent(html, "Order Bill");
  };

  const handleSaveBillAsImage = () => {
    if (!selectedCustomer || cartItems.length === 0) {
      setMessage({
        type: "error",
        text: "Please select customer and add items",
      });
      return;
    }

    // Only allow saving if cash payment is complete
    if (paymentMethod === "cash") {
      if (!paidAmount) {
        setMessage({
          type: "error",
          text: "Please enter cash amount to save bill",
        });
        return;
      }
    } else if (paymentMethod === "bank") {
      setMessage({
        type: "info",
        text: "Bank payments cannot be saved immediately. Bill will be generated once payment is verified.",
      });
      return;
    }

    const html = generateOrderBillHTML({
      selectedCustomer,
      cartItems,
      subtotal,
      total,
      paidAmount,
    });

    // Use Sri Lankan datetime for PDF filename
    const sriLankanDateTime = getSriLankanDateTime();
    const timestamp = sriLankanDateTime.dateString.replace(/[-.]/g, "");
    saveAsPDF(
      html,
      `order_bill_${selectedCustomer.name.replace(/\s+/g, "_")}_${timestamp}`,
      "orders"
    );
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

  // New payment system handlers
  const handlePaymentMethodChange = (method: "cash" | "bank") => {
    setPaymentMethod(method);
    if (method === "cash") {
      // Clear bank details when switching to cash
      setBankPaymentDetails(null);
      setPaidAmount("");
    } else {
      // Clear paid amount when switching to bank
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
    <div className="space-y-6 h-full flex flex-col">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-red-500">
            {editingOrderId
              ? `Edit Order: ${editingOrderId}`
              : "Sales & Orders"}
          </h1>
          <span className="text-sm font-semibold text-red-400 bg-red-900/30 px-3 py-1 rounded-full">
            {cartItems.length} items
          </span>
        </div>
        <p className="text-gray-400 mt-2">
          {editingOrderId
            ? "Update order items and details"
            : "Create orders from online or WhatsApp enquiries"}
        </p>
      </div>

      {/* Message Display */}
      {message && (
        <div
          className={`p-4 rounded-lg border-2 flex items-start gap-3 animate-in fade-in ${
            message.type === "error"
              ? "bg-red-900/40 border-red-600 text-red-300"
              : message.type === "success"
                ? "bg-green-900/40 border-green-600 text-green-300"
                : "bg-blue-900/40 border-blue-600 text-blue-300"
          }`}
        >
          <span className="text-xl font-bold mt-0.5">
            {message.type === "error"
              ? "✕"
              : message.type === "success"
                ? "✓"
                : "ℹ"}
          </span>
          <p className="flex-1">{message.text}</p>
        </div>
      )}

      {/* Main Content - Two Columns */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
        {/* Left Side - Customer & Products */}
        <div className="lg:col-span-2 space-y-6 flex flex-col min-h-0">
          {/* Customer Selection */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 space-y-4">
            {/* Customer Type Filter - Radio Buttons */}
            <div className="flex-shrink-0">
              <label className="block text-sm font-semibold text-red-400 mb-2">
                Customer Type
              </label>
              <div className="flex gap-3">
                <label className="flex items-center gap-2 cursor-pointer group">
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
                  <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                    🏢 Wholesale
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
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
                  <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                    👤 Retail
                  </span>
                </label>
              </div>
            </div>

            {/* Search Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-red-400">
                  Search Customer
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
                    <p className="font-semibold text-gray-100">
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

              {/* Product Selection Panel - Sequential Dropdowns */}
              {selectedProduct && (
                <div className="flex-1 overflow-y-auto min-h-0">
                  <div className="bg-gray-700/50 border border-red-600/30 rounded-lg p-4 space-y-3">
                    <div>
                      <p className="font-semibold text-gray-100">
                        {selectedProduct.name || selectedProduct.product_name}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {selectedProduct.code || selectedProduct.sku}
                      </p>
                    </div>

                    {/* Row 1: Size and Color in same row */}
                    <div className="grid grid-cols-2 gap-3">
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
                          {availableSizes.length > 0 ? (
                            availableSizes.map((size) => (
                              <option key={size.size_id} value={size.size_name}>
                                {size.size_name}
                              </option>
                            ))
                          ) : (
                            <option disabled>No sizes available</option>
                          )}
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
                              <option disabled>No colors available</option>
                            )}
                          </select>
                        </div>
                      )}
                    </div>

                    {/* Row 2: Quantity and Price in same row */}
                    {selectedSize &&
                      selectedColor &&
                      (() => {
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

                        return (
                          <div className="grid grid-cols-2 gap-3">
                            {/* Quantity Input */}
                            <div>
                              <label className="block text-xs font-semibold text-red-400 mb-2">
                                Qty (Avl: {availableQty}, Cart:{" "}
                                {cartQtyForProduct})
                              </label>
                              <input
                                type="number"
                                min="1"
                                max={remainingQty}
                                value={selectedQty}
                                onChange={(e) => setSelectedQty(e.target.value)}
                                placeholder="Qty"
                                className="w-full px-3 py-2 bg-gray-600 border border-gray-500 text-white rounded text-sm focus:border-red-500 focus:outline-none"
                              />
                              {remainingQty <= 0 && (
                                <p className="text-xs text-red-400 mt-1">
                                  ⚠️ Out of stock
                                </p>
                              )}
                            </div>

                            {/* Price Input */}
                            <div>
                              <label className="block text-xs font-semibold text-red-400 mb-2">
                                Price (Rs.)
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
                                className="w-full px-3 py-2 bg-gray-600 border border-gray-500 text-white rounded text-sm focus:border-red-500 focus:outline-none"
                              />
                              <div className="mt-1 space-y-1 text-xs">
                                <p className="text-gray-400">
                                  Default: Rs.{" "}
                                  {selectedProduct
                                    ? getProductPrice(selectedProduct).toFixed(
                                        2
                                      )
                                    : "0.00"}
                                </p>
                                {selectedProduct &&
                                  (() => {
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
                                    const totalCost =
                                      productCostVal + printCostVal;
                                    const currentPrice =
                                      parseFloat(selectedPrice) || 0;
                                    const isBelowCost =
                                      selectedPrice && currentPrice < totalCost;

                                    return (
                                      <>
                                        <p className="text-yellow-400 font-semibold">
                                          Cost = Rs. {productCostVal.toFixed(2)}{" "}
                                          + Rs. {printCostVal.toFixed(2)} = Rs.{" "}
                                          {totalCost.toFixed(2)}
                                        </p>
                                        {isBelowCost && (
                                          <p className="text-red-400 font-semibold flex items-center gap-1">
                                            ⚠️ Price is below cost!
                                          </p>
                                        )}
                                      </>
                                    );
                                  })()}
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                    {/* Row 3: Add to Cart Button - Full width */}
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
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 flex flex-col min-h-0">
          <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-700">
            <div>
              <h2 className="text-xl font-bold text-red-500">Order Summary</h2>
              <span className="text-sm bg-red-900/30 text-red-400 px-2 py-1 rounded inline-block mt-2">
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
                      <p className="text-sm font-medium text-gray-100">
                        {item.productName}
                      </p>
                      <p className="text-xs text-gray-400">
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

            {/* Price Preview - Show what will be added when price is entered */}
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

          {/* Totals */}
          <div className="space-y-3 border-t border-gray-700 pt-4 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Subtotal:</span>
              <span className="font-semibold text-gray-100">
                Rs. {subtotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-lg pt-2 border-t border-red-600">
              <span className="font-bold text-gray-100">Total:</span>
              <span className="font-bold text-red-500">
                Rs. {total.toFixed(2)}
              </span>
            </div>
          </div>

          {/* New Payment System */}
          <div className="mb-4 pb-4 border-b border-gray-700">
            <PaymentMethodSelector
              paymentMethod={paymentMethod}
              onPaymentMethodChange={handlePaymentMethodChange}
              onBankPaymentClick={() => setShowBankPaymentModal(true)}
              paidAmount={
                paymentMethod === "cash"
                  ? paidAmount
                  : bankPaymentDetails?.paidAmount || ""
              }
              totalAmount={total}
              previouslyPaidAmount={previouslyPaidAmount}
              bankPaymentDetails={
                paymentMethod === "bank" ? bankPaymentDetails : null
              }
              isEditingOrder={!!editingOrderId}
            />

            {/* Cash Amount Input - Only for Cash Payment */}
            {paymentMethod === "cash" && (
              <div className="space-y-2 mt-4">
                <label className="block text-xs font-semibold text-green-400">
                  Cash Amount (Rs.) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(e.target.value)}
                  placeholder="Enter cash amount received"
                  className="w-full px-3 py-2 bg-gray-700 border-2 border-green-600/30 text-white rounded focus:border-green-500 focus:outline-none text-sm"
                />
                {paidAmount &&
                  (() => {
                    const paidAmt = parseFloat(paidAmount) || 0;
                    const balance = total - paidAmt;
                    const isFullyPaid = balance <= 0;

                    return (
                      <div className="mt-2 p-2 rounded text-xs font-semibold">
                        {isFullyPaid ? (
                          <div className="bg-green-900/40 text-green-400">
                            ✓ Fully Paid{" "}
                            {paidAmt > total
                              ? `(Excess: Rs. ${(paidAmt - total).toFixed(2)})`
                              : ""}
                          </div>
                        ) : (
                          <div className="bg-orange-900/40 text-orange-400">
                            ⚠️ Advance/Partial: Balance Due Rs.{" "}
                            {balance.toFixed(2)}
                          </div>
                        )}
                      </div>
                    );
                  })()}
              </div>
            )}
          </div>

          {/* Bank Payment Modal */}
          <BankPaymentModal
            isOpen={showBankPaymentModal}
            onClose={() => setShowBankPaymentModal(false)}
            onSave={handleSaveBankPayment}
            totalAmount={total}
          />

          {/* Action Buttons */}
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleSaveOrder}
                disabled={!selectedCustomer || cartItems.length === 0}
                className="bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
              >
                {editingOrderId ? "📝 Update" : "✓ Save"}
              </button>
              <button
                onClick={handlePrintBill}
                disabled={
                  !selectedCustomer ||
                  cartItems.length === 0 ||
                  (() => {
                    // Check if payment allows printing (only for full payment)
                    if (paymentMethod === "cash") {
                      const paidAmt = parseFloat(paidAmount) || 0;
                      return paidAmt === 0 || paidAmt < total; // Disable if not paid or partial
                    } else if (paymentMethod === "bank") {
                      if (!bankPaymentDetails) return true; // Disable if no bank details
                      const bankPaidAmt =
                        parseFloat(bankPaymentDetails.paidAmount) || 0;
                      return bankPaidAmt < total; // Disable if not full payment
                    }
                    return true; // Disable if no payment method selected
                  })()
                }
                className="border-2 border-blue-600 text-blue-400 py-2 rounded-lg font-semibold hover:bg-blue-900/20 disabled:border-gray-600 disabled:text-gray-600 disabled:cursor-not-allowed transition-colors"
              >
                🖨️ Print
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add Customer Modal */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-md w-full p-6 border border-gray-700 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-red-500">
                Add New Customer
              </h2>
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
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, name: e.target.value })
                }
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded text-sm placeholder-gray-500 focus:border-red-500 focus:outline-none"
              />
              <input
                type="email"
                placeholder="Email"
                value={newCustomer.email}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, email: e.target.value })
                }
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded text-sm placeholder-gray-500 focus:border-red-500 focus:outline-none"
              />
              <input
                type="tel"
                placeholder="Mobile Number *"
                value={newCustomer.mobile}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, mobile: e.target.value })
                }
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
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
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
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
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
                    onChange={(e) =>
                      setFormData({ ...formData, costPrice: e.target.value })
                    }
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
                    onChange={(e) =>
                      setFormData({ ...formData, retailPrice: e.target.value })
                    }
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
                    value={formData.wholesalePrice}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        wholesalePrice: e.target.value,
                      })
                    }
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
                              onChange={(e) =>
                                updateStockRow(row.id, "size", e.target.value)
                              }
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
                            <label className="block text-xs text-gray-400 font-semibold mb-1">
                              Color
                            </label>
                            <select
                              value={row.color}
                              onChange={(e) =>
                                updateStockRow(row.id, "color", e.target.value)
                              }
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
                            <label className="block text-xs text-gray-400 font-semibold mb-1">
                              Qty
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={row.qty}
                              onChange={(e) =>
                                updateStockRow(
                                  row.id,
                                  "qty",
                                  parseInt(e.target.value) || 0
                                )
                              }
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
                    alert(
                      "Product added successfully! Note: This is a demo. In production, this would save to database."
                    );
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
