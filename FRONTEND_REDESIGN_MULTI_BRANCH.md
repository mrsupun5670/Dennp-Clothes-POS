# Frontend Redesign - Multi-Branch Shop System

**Frontend context and page updates for shop isolation**

---

## 🎯 Overview

**Frontend changes:**
1. Create `ShopContext` to store shop_id globally
2. Create `useShop()` hook for easy access
3. Update all pages to pass `shop_id` to API calls
4. Update all API services to include `shop_id`

---

## 📦 New Files To Create

### 1. ShopContext.tsx

```typescript
// frontend/src/contexts/ShopContext.tsx

import React, { createContext, useContext, useEffect, useState } from 'react';

interface ShopContextType {
  shopId: number;
  shopName: string;
  loading: boolean;
  error: string | null;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [shopId, setShopId] = useState<number>(1);  // Default to Shop 1
  const [shopName, setShopName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load shop config from environment or config file
    const loadShopConfig = async () => {
      try {
        // Option 1: From environment variable
        const envShopId = process.env.REACT_APP_SHOP_ID;
        if (envShopId) {
          setShopId(Number(envShopId));
          setShopName(process.env.REACT_APP_SHOP_NAME || `Shop ${envShopId}`);
          setLoading(false);
          return;
        }

        // Option 2: From sessionStorage (set by app initialization)
        const storedShopId = sessionStorage.getItem('shop_id');
        if (storedShopId) {
          setShopId(Number(storedShopId));
          setShopName(sessionStorage.getItem('shop_name') || `Shop ${storedShopId}`);
          setLoading(false);
          return;
        }

        // Option 3: From config file (if using Tauri or similar)
        // This would be set during app initialization
        setLoading(false);
      } catch (err) {
        setError('Failed to load shop configuration');
        setLoading(false);
      }
    };

    loadShopConfig();
  }, []);

  return (
    <ShopContext.Provider value={{ shopId, shopName, loading, error }}>
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = (): ShopContextType => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within ShopProvider');
  }
  return context;
};
```

---

### 2. Update App.tsx

```typescript
// frontend/src/App.tsx

import { useState, useEffect } from "react";
import "./App.css";
import { ShopProvider } from "./contexts/ShopContext";  // ⭐ Import
import POSLayout from "./components/layout/POSLayout";
import SalesPage from "./pages/SalesPage";
import ProductsPage from "./pages/ProductsPage";
import InventoryPage from "./pages/InventoryPage";
import CustomersPage from "./pages/CustomersPage";
import OrdersPage from "./pages/OrdersPage";
// ... other imports

type PageType = "sales" | "products" | "inventory" | "customers" | "orders" | ...;

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>("sales");

  // ... navigation logic

  const renderPage = () => {
    switch (currentPage) {
      case "sales":
        return <SalesPage />;
      case "products":
        return <ProductsPage />;
      // ... other pages
      default:
        return <SalesPage />;
    }
  };

  return (
    <ShopProvider>  {/* ⭐ Wrap entire app */}
      <POSLayout currentPage={currentPage} onPageChange={setCurrentPage}>
        {renderPage()}
      </POSLayout>
    </ShopProvider>
  );
}

export default App;
```

---

## 📋 Updated API Service

### ProductService.ts (Example)

```typescript
// frontend/src/services/productService.ts

import { useShop } from "../contexts/ShopContext";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:3000/api/v1";

class ProductService {
  /**
   * Get all products for current shop
   */
  async getProductsByShop(shopId: number): Promise<any[]> {
    try {
      // ⭐ Include shop_id in query
      const response = await fetch(`${API_BASE}/products?shop_id=${shopId}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  }

  /**
   * Get product by ID
   */
  async getProductById(productId: number, shopId: number): Promise<any> {
    try {
      // ⭐ Include shop_id in query
      const response = await fetch(
        `${API_BASE}/products/${productId}?shop_id=${shopId}`
      );

      if (!response.ok) {
        throw new Error("Product not found");
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error("Error fetching product:", error);
      throw error;
    }
  }

  /**
   * Get products by category
   */
  async getProductsByCategory(
    categoryId: number,
    shopId: number
  ): Promise<any[]> {
    try {
      // ⭐ Include shop_id in query
      const response = await fetch(
        `${API_BASE}/products/category/${categoryId}?shop_id=${shopId}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error("Error fetching products by category:", error);
      throw error;
    }
  }

  /**
   * Create new product
   */
  async createProduct(shopId: number, productData: any): Promise<number> {
    try {
      // ⭐ Include shop_id in body
      const response = await fetch(`${API_BASE}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...productData,
          shop_id: shopId,  // ⭐ Add shop_id
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create product");
      }

      const data = await response.json();
      return data.data.product_id;
    } catch (error) {
      console.error("Error creating product:", error);
      throw error;
    }
  }

  /**
   * Update product
   */
  async updateProduct(
    productId: number,
    shopId: number,
    updateData: any
  ): Promise<void> {
    try {
      // ⭐ Include shop_id in body
      const response = await fetch(`${API_BASE}/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...updateData,
          shop_id: shopId,  // ⭐ Add shop_id
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update product");
      }
    } catch (error) {
      console.error("Error updating product:", error);
      throw error;
    }
  }

  /**
   * Delete product
   */
  async deleteProduct(productId: number, shopId: number): Promise<void> {
    try {
      // ⭐ Include shop_id in query
      const response = await fetch(
        `${API_BASE}/products/${productId}?shop_id=${shopId}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        throw new Error("Failed to delete product");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      throw error;
    }
  }
}

export default new ProductService();
```

---

## 🛍️ Updated ProductsPage Example

```typescript
// frontend/src/pages/ProductsPage.tsx

import React, { useState, useEffect } from "react";
import { useShop } from "../hooks/useShop";  // ⭐ Use hook
import ProductService from "../services/productService";

export const ProductsPage = () => {
  const { shopId, shopName } = useShop();  // ⭐ Get shop context

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load products when component mounts or shopId changes
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        // ⭐ Pass shopId to service
        const data = await ProductService.getProductsByShop(shopId);
        setProducts(data);
        setError(null);
      } catch (err) {
        setError("Failed to load products");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [shopId]);  // ⭐ Reload when shopId changes

  const handleCreateProduct = async (productData: any) => {
    try {
      // ⭐ Pass shopId to service
      const productId = await ProductService.createProduct(shopId, productData);
      // Reload products
      const data = await ProductService.getProductsByShop(shopId);
      setProducts(data);
      alert(`Product created with ID: ${productId}`);
    } catch (err) {
      alert("Failed to create product");
    }
  };

  const handleUpdateProduct = async (productId: number, updateData: any) => {
    try {
      // ⭐ Pass shopId to service
      await ProductService.updateProduct(productId, shopId, updateData);
      // Reload products
      const data = await ProductService.getProductsByShop(shopId);
      setProducts(data);
      alert("Product updated successfully");
    } catch (err) {
      alert("Failed to update product");
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!confirm("Are you sure?")) return;

    try {
      // ⭐ Pass shopId to service
      await ProductService.deleteProduct(productId, shopId);
      // Reload products
      const data = await ProductService.getProductsByShop(shopId);
      setProducts(data);
      alert("Product deleted successfully");
    } catch (err) {
      alert("Failed to delete product");
    }
  };

  if (loading) return <div>Loading products for {shopName}...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Products - {shopName}</h1>  {/* ⭐ Show shop name */}
      <div>Total products: {products.length}</div>

      {/* Product list, create, update, delete operations */}
      {/* Use handleCreateProduct, handleUpdateProduct, handleDeleteProduct */}
    </div>
  );
};

export default ProductsPage;
```

---

## 👥 Updated CustomersPage

```typescript
// frontend/src/pages/CustomersPage.tsx

import React, { useState, useEffect } from "react";
import { useShop } from "../hooks/useShop";  // ⭐ Use hook
import CustomerService from "../services/customerService";

export const CustomersPage = () => {
  const { shopId, shopName } = useShop();  // ⭐ Get shop context

  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        setLoading(true);
        // ⭐ Pass shopId to service
        const data = await CustomerService.getCustomersByShop(shopId);
        setCustomers(data);
      } catch (err) {
        console.error("Failed to load customers:", err);
      } finally {
        setLoading(false);
      }
    };

    loadCustomers();
  }, [shopId]);  // ⭐ Reload when shopId changes

  const handleAddCustomer = async (customerData: any) => {
    try {
      // ⭐ Pass shopId
      await CustomerService.createCustomer(shopId, customerData);
      // Reload
      const data = await CustomerService.getCustomersByShop(shopId);
      setCustomers(data);
    } catch (err) {
      console.error("Failed to add customer:", err);
    }
  };

  if (loading) return <div>Loading customers for {shopName}...</div>;

  return (
    <div>
      <h1>Customers - {shopName}</h1>  {/* ⭐ Show shop name */}
      <div>Total customers: {customers.length}</div>
      {/* Rest of component */}
    </div>
  );
};

export default CustomersPage;
```

---

## 📦 Updated OrdersPage

```typescript
// frontend/src/pages/OrdersPage.tsx

import React, { useState, useEffect } from "react";
import { useShop } from "../hooks/useShop";  // ⭐ Use hook
import OrderService from "../services/orderService";

export const OrdersPage = () => {
  const { shopId, shopName } = useShop();  // ⭐ Get shop context

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("all");

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        // ⭐ Pass shopId to service
        let data = await OrderService.getOrdersByShop(shopId);

        // Filter by status if needed
        if (selectedStatus !== "all") {
          data = data.filter((order) => order.order_status === selectedStatus);
        }

        setOrders(data);
      } catch (err) {
        console.error("Failed to load orders:", err);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [shopId, selectedStatus]);  // ⭐ Reload on shop or status change

  const handleRecordPayment = async (
    orderId: number,
    paymentData: any
  ) => {
    try {
      // ⭐ Pass shopId
      await OrderService.recordPayment(orderId, shopId, paymentData);
      // Reload orders
      const data = await OrderService.getOrdersByShop(shopId);
      setOrders(data);
    } catch (err) {
      console.error("Failed to record payment:", err);
    }
  };

  if (loading) return <div>Loading orders for {shopName}...</div>;

  return (
    <div>
      <h1>Orders - {shopName}</h1>  {/* ⭐ Show shop name */}
      <div>Total orders: {orders.length}</div>
      {/* Rest of component */}
    </div>
  );
};

export default OrdersPage;
```

---

## 🎯 SalesPage / Create Order

```typescript
// frontend/src/pages/SalesPage.tsx

import React, { useState } from "react";
import { useShop } from "../hooks/useShop";  // ⭐ Use hook
import OrderService from "../services/orderService";

export const SalesPage = () => {
  const { shopId, shopName } = useShop();  // ⭐ Get shop context

  const [orderData, setOrderData] = useState<any>({
    // ... order form fields
  });

  const handleCreateOrder = async () => {
    try {
      // ⭐ Pass shopId when creating order
      const orderId = await OrderService.createOrder(shopId, {
        ...orderData,
        shop_id: shopId,  // ⭐ Ensure shop_id included
      });

      alert(`Order created: ${orderId}`);
      // Reset form
      setOrderData({});
    } catch (err) {
      alert("Failed to create order");
      console.error(err);
    }
  };

  return (
    <div>
      <h1>Create Order - {shopName}</h1>  {/* ⭐ Show shop name */}
      {/* Order form */}
      <button onClick={handleCreateOrder}>Create Order</button>
    </div>
  );
};

export default SalesPage;
```

---

## 🔑 Service Template Pattern

Every service should follow this pattern:

```typescript
class SomeService {

  // ✅ Every method takes shopId
  async getSomething(shopId: number): Promise<any> {
    // ⭐ Include shop_id in query
    const response = await fetch(
      `${API_BASE}/endpoint?shop_id=${shopId}`
    );
    return response.json();
  }

  // ✅ Create operations
  async createSomething(shopId: number, data: any): Promise<any> {
    // ⭐ Include shop_id in body
    const response = await fetch(`${API_BASE}/endpoint`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        shop_id: shopId,  // ⭐ Always include
      }),
    });
    return response.json();
  }

  // ✅ Update operations
  async updateSomething(id: number, shopId: number, data: any): Promise<any> {
    // ⭐ Include shop_id in body
    const response = await fetch(`${API_BASE}/endpoint/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        shop_id: shopId,  // ⭐ Always include
      }),
    });
    return response.json();
  }

  // ✅ Delete operations
  async deleteSomething(id: number, shopId: number): Promise<void> {
    // ⭐ Include shop_id in query
    const response = await fetch(
      `${API_BASE}/endpoint/${id}?shop_id=${shopId}`,
      { method: "DELETE" }
    );
    return response.json();
  }
}
```

---

## ✅ Page Update Checklist

- [ ] ProductsPage: Use useShop, pass shopId to service calls
- [ ] CustomersPage: Use useShop, pass shopId to service calls
- [ ] OrdersPage: Use useShop, pass shopId to service calls
- [ ] SalesPage: Use useShop, pass shopId when creating orders
- [ ] InventoryPage: Use useShop, pass shopId to service calls
- [ ] PaymentsPage: Use useShop, pass shopId to service calls
- [ ] CategoriesPage: Use useShop, pass shopId to service calls
- [ ] ColorsPage: Use useShop, pass shopId to service calls
- [ ] SizesPage: Use useShop, pass shopId to service calls

---

## 📝 Summary

**What each page needs:**

```typescript
// 1. Import hook
import { useShop } from "../contexts/ShopContext";

// 2. Use in component
const { shopId, shopName } = useShop();

// 3. Pass to all API calls
await ServiceName.getMethod(shopId);
await ServiceName.createMethod(shopId, data);
await ServiceName.updateMethod(id, shopId, data);
await ServiceName.deleteMethod(id, shopId);

// 4. Show shop context in UI
<h1>{shopName}</h1>
<p>Shop ID: {shopId}</p>
```

---

