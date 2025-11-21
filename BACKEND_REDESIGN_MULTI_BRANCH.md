# Backend Redesign - Multi-Branch Shop System

**Complete backend architecture for shop isolation**

---

## 📋 Overview of Changes

Every backend model will be redesigned to:
1. **Accept shop_id parameter** in all methods
2. **Add WHERE shop_id = ? to all queries**
3. **Require shop_id for create/update operations**
4. **Add shop_id to interfaces**

---

## 🔄 Product Model Redesign

### Current Problems
```typescript
// ❌ Current - Missing shop_id
async getAllProducts(): Promise<Product[]> {
  const results = await query(
    "SELECT * FROM products ORDER BY created_at DESC"
  );
  // Returns ALL products from ALL shops mixed!
}

// ❌ Current - Can create product without specifying shop
async createProduct(productData): Promise<number> {
  // No shop_id anywhere!
}
```

### New Design

```typescript
/**
 * Product Model - Multi-Branch Enabled
 */

export interface Product {
  product_id: number;
  shop_id: number;           // ⭐ NEW
  sku: string;
  product_name: string;
  category_id: number;
  description?: string;
  product_cost: number;
  print_cost: number;
  retail_price: number;
  wholesale_price?: number;
  product_status: "active" | "inactive" | "discontinued";
  created_at: Date;
  updated_at: Date;
}

class ProductModel {

  /**
   * Get all products for specific shop
   */
  async getAllProductsByShop(shopId: number): Promise<Product[]> {
    try {
      const results = await query(
        "SELECT * FROM products WHERE shop_id = ? ORDER BY created_at DESC",
        [shopId]  // ⭐ Filter by shop_id
      );

      const products = await Promise.all(
        (results as any[]).map((p) => this.getProductWithDetails(p.product_id, shopId))
      );

      logger.info("Retrieved products for shop", {
        shopId,
        count: products.length,
      });
      return products as Product[];
    } catch (error) {
      logger.error("Error fetching products:", error);
      throw error;
    }
  }

  /**
   * Get product by ID (with shop_id validation)
   */
  async getProductById(productId: number, shopId: number): Promise<Product | null> {
    try {
      const results = await query(
        "SELECT * FROM products WHERE product_id = ? AND shop_id = ?",
        [productId, shopId]  // ⭐ Validate shop ownership
      );
      const product = (results as Product[])[0] || null;

      if (!product) {
        logger.warn("Product not found or doesn't belong to shop", {
          productId,
          shopId,
        });
        return null;
      }

      logger.debug("Retrieved product by ID", { productId, shopId });
      return product;
    } catch (error) {
      logger.error("Error fetching product by ID:", error);
      throw error;
    }
  }

  /**
   * Get product by SKU (per shop)
   */
  async getProductBySku(sku: string, shopId: number): Promise<Product | null> {
    try {
      const results = await query(
        "SELECT * FROM products WHERE sku = ? AND shop_id = ?",
        [sku, shopId]  // ⭐ SKU unique per shop
      );
      const product = (results as Product[])[0] || null;
      logger.debug("Retrieved product by SKU", { sku, shopId });
      return product;
    } catch (error) {
      logger.error("Error fetching product by SKU:", error);
      throw error;
    }
  }

  /**
   * Get products by category (for specific shop)
   */
  async getProductsByCategory(
    categoryId: number,
    shopId: number
  ): Promise<Product[]> {
    try {
      const results = await query(
        `SELECT * FROM products
         WHERE category_id = ? AND shop_id = ? AND product_status = "active"`,
        [categoryId, shopId]  // ⭐ Shop-specific categories
      );

      logger.debug("Retrieved products by category", {
        categoryId,
        shopId,
        count: (results as any[]).length,
      });
      return results as Product[];
    } catch (error) {
      logger.error("Error fetching products by category:", error);
      throw error;
    }
  }

  /**
   * Create new product for specific shop
   */
  async createProduct(
    shopId: number,  // ⭐ Required parameter
    productData: Omit<Product, "product_id" | "shop_id" | "created_at" | "updated_at">
  ): Promise<number> {
    try {
      const {
        sku,
        product_name,
        category_id,
        description,
        product_cost,
        print_cost,
        retail_price,
        wholesale_price,
        product_status,
      } = productData;

      // ⭐ Verify category belongs to this shop
      const categoryCheck = await query(
        "SELECT category_id FROM categories WHERE category_id = ? AND shop_id = ?",
        [category_id, shopId]
      );

      if ((categoryCheck as any[]).length === 0) {
        throw new Error(`Category ${category_id} does not exist for shop ${shopId}`);
      }

      const results = await query(
        `INSERT INTO products
         (shop_id, sku, product_name, category_id, description, product_cost, print_cost, retail_price, wholesale_price, product_status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          shopId,  // ⭐ Add shop_id
          sku,
          product_name,
          category_id,
          description || null,
          product_cost,
          print_cost,
          retail_price,
          wholesale_price || null,
          product_status,
        ]
      );

      const productId = (results as any).insertId;
      logger.info("Product created for shop", {
        shopId,
        productId,
        sku,
        product_name,
      });
      return productId;
    } catch (error) {
      logger.error("Error creating product:", error);
      throw error;
    }
  }

  /**
   * Update product (validate shop ownership)
   */
  async updateProduct(
    productId: number,
    shopId: number,  // ⭐ Required for validation
    updateData: Partial<Omit<Product, "product_id" | "shop_id" | "created_at" | "updated_at">>
  ): Promise<boolean> {
    try {
      // ⭐ Verify product belongs to this shop
      const productCheck = await query(
        "SELECT product_id FROM products WHERE product_id = ? AND shop_id = ?",
        [productId, shopId]
      );

      if ((productCheck as any[]).length === 0) {
        throw new Error(`Product ${productId} does not belong to shop ${shopId}`);
      }

      const fields: string[] = [];
      const values: any[] = [];

      Object.entries(updateData).forEach(([key, value]) => {
        fields.push(`${key} = ?`);
        values.push(value);
      });

      if (fields.length === 0) return true;

      values.push(productId, shopId);

      await query(
        `UPDATE products SET ${fields.join(", ")} WHERE product_id = ? AND shop_id = ?`,
        values
      );

      logger.info("Product updated", { productId, shopId });
      return true;
    } catch (error) {
      logger.error("Error updating product:", error);
      throw error;
    }
  }

  /**
   * Delete product (validate shop ownership)
   */
  async deleteProduct(productId: number, shopId: number): Promise<boolean> {
    try {
      const result = await query(
        "DELETE FROM products WHERE product_id = ? AND shop_id = ?",
        [productId, shopId]  // ⭐ Only delete if belongs to shop
      );

      if ((result as any).affectedRows === 0) {
        throw new Error(`Product ${productId} does not belong to shop ${shopId}`);
      }

      logger.info("Product deleted", { productId, shopId });
      return true;
    } catch (error) {
      logger.error("Error deleting product:", error);
      throw error;
    }
  }
}

export default new ProductModel();
```

---

## 🏪 Category Model Redesign

```typescript
export interface Category {
  category_id: number;
  shop_id: number;           // ⭐ NEW
  category_name: string;
  size_type_id: number;
}

class CategoryModel {

  async getAllCategoriesByShop(shopId: number): Promise<Category[]> {
    try {
      const results = await query(
        "SELECT * FROM categories WHERE shop_id = ? ORDER BY category_name",
        [shopId]  // ⭐ Filter by shop
      );
      logger.info("Retrieved categories for shop", {
        shopId,
        count: (results as any[]).length,
      });
      return results as Category[];
    } catch (error) {
      logger.error("Error fetching categories:", error);
      throw error;
    }
  }

  async getCategoryById(categoryId: number, shopId: number): Promise<Category | null> {
    try {
      const results = await query(
        "SELECT * FROM categories WHERE category_id = ? AND shop_id = ?",
        [categoryId, shopId]  // ⭐ Validate ownership
      );
      return (results as Category[])[0] || null;
    } catch (error) {
      logger.error("Error fetching category:", error);
      throw error;
    }
  }

  async createCategory(
    shopId: number,  // ⭐ Required
    categoryData: Omit<Category, "category_id" | "shop_id">
  ): Promise<number> {
    try {
      const { category_name, size_type_id } = categoryData;

      const results = await query(
        `INSERT INTO categories (shop_id, category_name, size_type_id)
         VALUES (?, ?, ?)`,
        [shopId, category_name, size_type_id]  // ⭐ Include shop_id
      );

      const categoryId = (results as any).insertId;
      logger.info("Category created for shop", { shopId, categoryId, category_name });
      return categoryId;
    } catch (error) {
      logger.error("Error creating category:", error);
      throw error;
    }
  }

  async updateCategory(
    categoryId: number,
    shopId: number,  // ⭐ Required
    updateData: Partial<Omit<Category, "category_id" | "shop_id">>
  ): Promise<boolean> {
    try {
      // ⭐ Verify ownership
      const check = await query(
        "SELECT category_id FROM categories WHERE category_id = ? AND shop_id = ?",
        [categoryId, shopId]
      );

      if ((check as any[]).length === 0) {
        throw new Error(`Category ${categoryId} does not belong to shop ${shopId}`);
      }

      const fields: string[] = [];
      const values: any[] = [];

      Object.entries(updateData).forEach(([key, value]) => {
        fields.push(`${key} = ?`);
        values.push(value);
      });

      values.push(categoryId, shopId);

      await query(
        `UPDATE categories SET ${fields.join(", ")} WHERE category_id = ? AND shop_id = ?`,
        values
      );

      logger.info("Category updated", { categoryId, shopId });
      return true;
    } catch (error) {
      logger.error("Error updating category:", error);
      throw error;
    }
  }

  async deleteCategory(categoryId: number, shopId: number): Promise<boolean> {
    try {
      const result = await query(
        "DELETE FROM categories WHERE category_id = ? AND shop_id = ?",
        [categoryId, shopId]  // ⭐ Only delete if belongs to shop
      );

      if ((result as any).affectedRows === 0) {
        throw new Error(`Category ${categoryId} does not belong to shop ${shopId}`);
      }

      logger.info("Category deleted", { categoryId, shopId });
      return true;
    } catch (error) {
      logger.error("Error deleting category:", error);
      throw error;
    }
  }
}

export default new CategoryModel();
```

---

## 🎨 Color Model Redesign

```typescript
export interface Color {
  color_id: number;
  shop_id: number;           // ⭐ NEW
  color_name: string;
  hex_code?: string;
}

class ColorModel {

  async getAllColorsByShop(shopId: number): Promise<Color[]> {
    try {
      const results = await query(
        "SELECT * FROM colors WHERE shop_id = ? ORDER BY color_name",
        [shopId]  // ⭐ Filter by shop
      );
      logger.info("Retrieved colors for shop", {
        shopId,
        count: (results as any[]).length,
      });
      return results as Color[];
    } catch (error) {
      logger.error("Error fetching colors:", error);
      throw error;
    }
  }

  async getColorById(colorId: number, shopId: number): Promise<Color | null> {
    try {
      const results = await query(
        "SELECT * FROM colors WHERE color_id = ? AND shop_id = ?",
        [colorId, shopId]  // ⭐ Validate ownership
      );
      return (results as Color[])[0] || null;
    } catch (error) {
      logger.error("Error fetching color:", error);
      throw error;
    }
  }

  async createColor(
    shopId: number,  // ⭐ Required
    colorData: Omit<Color, "color_id" | "shop_id">
  ): Promise<number> {
    try {
      const { color_name, hex_code } = colorData;

      const results = await query(
        `INSERT INTO colors (shop_id, color_name, hex_code)
         VALUES (?, ?, ?)`,
        [shopId, color_name, hex_code || null]  // ⭐ Include shop_id
      );

      const colorId = (results as any).insertId;
      logger.info("Color created for shop", { shopId, colorId, color_name });
      return colorId;
    } catch (error) {
      logger.error("Error creating color:", error);
      throw error;
    }
  }

  async updateColor(
    colorId: number,
    shopId: number,  // ⭐ Required
    updateData: Partial<Omit<Color, "color_id" | "shop_id">>
  ): Promise<boolean> {
    try {
      const check = await query(
        "SELECT color_id FROM colors WHERE color_id = ? AND shop_id = ?",
        [colorId, shopId]
      );

      if ((check as any[]).length === 0) {
        throw new Error(`Color ${colorId} does not belong to shop ${shopId}`);
      }

      const fields: string[] = [];
      const values: any[] = [];

      Object.entries(updateData).forEach(([key, value]) => {
        fields.push(`${key} = ?`);
        values.push(value);
      });

      values.push(colorId, shopId);

      await query(
        `UPDATE colors SET ${fields.join(", ")} WHERE color_id = ? AND shop_id = ?`,
        values
      );

      logger.info("Color updated", { colorId, shopId });
      return true;
    } catch (error) {
      logger.error("Error updating color:", error);
      throw error;
    }
  }

  async deleteColor(colorId: number, shopId: number): Promise<boolean> {
    try {
      const result = await query(
        "DELETE FROM colors WHERE color_id = ? AND shop_id = ?",
        [colorId, shopId]  // ⭐ Only delete if belongs to shop
      );

      if ((result as any).affectedRows === 0) {
        throw new Error(`Color ${colorId} does not belong to shop ${shopId}`);
      }

      logger.info("Color deleted", { colorId, shopId });
      return true;
    } catch (error) {
      logger.error("Error deleting color:", error);
      throw error;
    }
  }
}

export default new ColorModel();
```

---

## 📏 Size Model Redesign

```typescript
export interface Size {
  size_id: number;
  shop_id: number;           // ⭐ NEW
  size_name: string;
  size_type_id: number;
}

class SizeModel {

  async getAllSizesByShop(shopId: number): Promise<Size[]> {
    try {
      const results = await query(
        "SELECT * FROM sizes WHERE shop_id = ? ORDER BY size_name",
        [shopId]  // ⭐ Filter by shop
      );
      logger.info("Retrieved sizes for shop", {
        shopId,
        count: (results as any[]).length,
      });
      return results as Size[];
    } catch (error) {
      logger.error("Error fetching sizes:", error);
      throw error;
    }
  }

  async getSizeById(sizeId: number, shopId: number): Promise<Size | null> {
    try {
      const results = await query(
        "SELECT * FROM sizes WHERE size_id = ? AND shop_id = ?",
        [sizeId, shopId]  // ⭐ Validate ownership
      );
      return (results as Size[])[0] || null;
    } catch (error) {
      logger.error("Error fetching size:", error);
      throw error;
    }
  }

  async createSize(
    shopId: number,  // ⭐ Required
    sizeData: Omit<Size, "size_id" | "shop_id">
  ): Promise<number> {
    try {
      const { size_name, size_type_id } = sizeData;

      const results = await query(
        `INSERT INTO sizes (shop_id, size_name, size_type_id)
         VALUES (?, ?, ?)`,
        [shopId, size_name, size_type_id]  // ⭐ Include shop_id
      );

      const sizeId = (results as any).insertId;
      logger.info("Size created for shop", { shopId, sizeId, size_name });
      return sizeId;
    } catch (error) {
      logger.error("Error creating size:", error);
      throw error;
    }
  }

  async updateSize(
    sizeId: number,
    shopId: number,  // ⭐ Required
    updateData: Partial<Omit<Size, "size_id" | "shop_id">>
  ): Promise<boolean> {
    try {
      const check = await query(
        "SELECT size_id FROM sizes WHERE size_id = ? AND shop_id = ?",
        [sizeId, shopId]
      );

      if ((check as any[]).length === 0) {
        throw new Error(`Size ${sizeId} does not belong to shop ${shopId}`);
      }

      const fields: string[] = [];
      const values: any[] = [];

      Object.entries(updateData).forEach(([key, value]) => {
        fields.push(`${key} = ?`);
        values.push(value);
      });

      values.push(sizeId, shopId);

      await query(
        `UPDATE sizes SET ${fields.join(", ")} WHERE size_id = ? AND shop_id = ?`,
        values
      );

      logger.info("Size updated", { sizeId, shopId });
      return true;
    } catch (error) {
      logger.error("Error updating size:", error);
      throw error;
    }
  }

  async deleteSize(sizeId: number, shopId: number): Promise<boolean> {
    try {
      const result = await query(
        "DELETE FROM sizes WHERE size_id = ? AND shop_id = ?",
        [sizeId, shopId]  // ⭐ Only delete if belongs to shop
      );

      if ((result as any).affectedRows === 0) {
        throw new Error(`Size ${sizeId} does not belong to shop ${shopId}`);
      }

      logger.info("Size deleted", { sizeId, shopId });
      return true;
    } catch (error) {
      logger.error("Error deleting size:", error);
      throw error;
    }
  }
}

export default new SizeModel();
```

---

## 👥 Customer Model Redesign

```typescript
export interface Customer {
  customer_id: number;
  shop_id: number;           // ⭐ NEW
  first_name: string;
  last_name: string;
  mobile: string;
  email?: string;
  orders_count: number;
  customer_status: "active" | "inactive" | "blocked";
  total_spent: number;
  created_at: Date;
}

class CustomerModel {

  async getAllCustomersByShop(shopId: number): Promise<Customer[]> {
    try {
      const results = await query(
        "SELECT * FROM customers WHERE shop_id = ? ORDER BY created_at DESC",
        [shopId]  // ⭐ Filter by shop
      );
      logger.info("Retrieved customers for shop", {
        shopId,
        count: (results as any[]).length,
      });
      return results as Customer[];
    } catch (error) {
      logger.error("Error fetching customers:", error);
      throw error;
    }
  }

  async getCustomerById(customerId: number, shopId: number): Promise<Customer | null> {
    try {
      const results = await query(
        "SELECT * FROM customers WHERE customer_id = ? AND shop_id = ?",
        [customerId, shopId]  // ⭐ Validate ownership
      );
      return (results as Customer[])[0] || null;
    } catch (error) {
      logger.error("Error fetching customer:", error);
      throw error;
    }
  }

  async getCustomerByMobile(mobile: string, shopId: number): Promise<Customer | null> {
    try {
      const results = await query(
        "SELECT * FROM customers WHERE mobile = ? AND shop_id = ?",
        [mobile, shopId]  // ⭐ Mobile unique per shop
      );
      return (results as Customer[])[0] || null;
    } catch (error) {
      logger.error("Error fetching customer by mobile:", error);
      throw error;
    }
  }

  async createCustomer(
    shopId: number,  // ⭐ Required
    customerData: Omit<Customer, "customer_id" | "shop_id" | "created_at" | "orders_count" | "total_spent">
  ): Promise<number> {
    try {
      const { first_name, last_name, mobile, email, customer_status } = customerData;

      const results = await query(
        `INSERT INTO customers (shop_id, first_name, last_name, mobile, email, customer_status, orders_count, total_spent)
         VALUES (?, ?, ?, ?, ?, ?, 0, 0)`,
        [
          shopId,  // ⭐ Include shop_id
          first_name,
          last_name,
          mobile,
          email || null,
          customer_status,
        ]
      );

      const customerId = (results as any).insertId;
      logger.info("Customer created for shop", { shopId, customerId, mobile });
      return customerId;
    } catch (error) {
      logger.error("Error creating customer:", error);
      throw error;
    }
  }

  async updateCustomer(
    customerId: number,
    shopId: number,  // ⭐ Required
    updateData: Partial<Omit<Customer, "customer_id" | "shop_id" | "created_at">>
  ): Promise<boolean> {
    try {
      // ⭐ Verify ownership
      const check = await query(
        "SELECT customer_id FROM customers WHERE customer_id = ? AND shop_id = ?",
        [customerId, shopId]
      );

      if ((check as any[]).length === 0) {
        throw new Error(`Customer ${customerId} does not belong to shop ${shopId}`);
      }

      const fields: string[] = [];
      const values: any[] = [];

      Object.entries(updateData).forEach(([key, value]) => {
        fields.push(`${key} = ?`);
        values.push(value);
      });

      values.push(customerId, shopId);

      await query(
        `UPDATE customers SET ${fields.join(", ")} WHERE customer_id = ? AND shop_id = ?`,
        values
      );

      logger.info("Customer updated", { customerId, shopId });
      return true;
    } catch (error) {
      logger.error("Error updating customer:", error);
      throw error;
    }
  }

  async deleteCustomer(customerId: number, shopId: number): Promise<boolean> {
    try {
      const result = await query(
        "DELETE FROM customers WHERE customer_id = ? AND shop_id = ?",
        [customerId, shopId]  // ⭐ Only delete if belongs to shop
      );

      if ((result as any).affectedRows === 0) {
        throw new Error(`Customer ${customerId} does not belong to shop ${shopId}`);
      }

      logger.info("Customer deleted", { customerId, shopId });
      return true;
    } catch (error) {
      logger.error("Error deleting customer:", error);
      throw error;
    }
  }
}

export default new CustomerModel();
```

---

## 📦 Order Model Redesign

```typescript
export interface Order {
  order_id: number;
  order_number: string;
  shop_id: number;           // ⭐ Already exists, ensure used
  customer_id?: number;
  user_id?: number;
  total_items: number;
  total_amount: number;
  advance_paid: number;
  balance_paid: number;
  total_paid: number;
  payment_status: "unpaid" | "partial" | "fully_paid";
  remaining_amount: number;
  payment_method: "cash" | "card" | "online" | "other";
  order_status: "Pending" | "Processing" | "Shipped" | "Delivered";
  notes?: string;
  order_date: Date;
  delivery_address: {
    line1: string;
    line2: string;
    postal_code: string;
    city_name: string;
    district_name: string;
    province_name: string;
    recipient_name: string;
    recipient_phone: string;
  };
  created_at: Date;
  updated_at: Date;
}

class OrderModel {

  async getAllOrders(shopId: number): Promise<Order[]> {
    try {
      const results = await query(
        `SELECT * FROM orders WHERE shop_id = ? ORDER BY created_at DESC`,
        [shopId]  // ⭐ Always filter by shop
      );
      logger.info("Retrieved orders for shop", {
        shopId,
        count: (results as any[]).length,
      });
      return results as Order[];
    } catch (error) {
      logger.error("Error fetching orders:", error);
      throw error;
    }
  }

  async getOrderById(orderId: number, shopId: number): Promise<Order | null> {
    try {
      const results = await query(
        "SELECT * FROM orders WHERE order_id = ? AND shop_id = ?",
        [orderId, shopId]  // ⭐ Validate shop ownership
      );
      return (results as Order[])[0] || null;
    } catch (error) {
      logger.error("Error fetching order:", error);
      throw error;
    }
  }

  async getOrdersByCustomer(customerId: number, shopId: number): Promise<Order[]> {
    try {
      const results = await query(
        "SELECT * FROM orders WHERE customer_id = ? AND shop_id = ? ORDER BY created_at DESC",
        [customerId, shopId]  // ⭐ Filter by both customer and shop
      );
      logger.info("Retrieved customer orders", {
        customerId,
        shopId,
        count: (results as any[]).length,
      });
      return results as Order[];
    } catch (error) {
      logger.error("Error fetching customer orders:", error);
      throw error;
    }
  }

  async createOrder(
    shopId: number,  // ⭐ Required
    orderData: Omit<Order, "order_id" | "shop_id" | "created_at" | "updated_at">
  ): Promise<number> {
    try {
      // ⭐ Verify customer belongs to this shop (if provided)
      if (orderData.customer_id) {
        const customerCheck = await query(
          "SELECT customer_id FROM customers WHERE customer_id = ? AND shop_id = ?",
          [orderData.customer_id, shopId]
        );

        if ((customerCheck as any[]).length === 0) {
          throw new Error(`Customer ${orderData.customer_id} does not belong to shop ${shopId}`);
        }
      }

      const {
        order_number,
        customer_id,
        user_id,
        total_items,
        total_amount,
        advance_paid,
        balance_paid,
        total_paid,
        payment_status,
        remaining_amount,
        payment_method,
        order_status,
        notes,
        order_date,
        line1,
        line2,
        postal_code,
        city_name,
        district_name,
        province_name,
        recipient_name,
        recipient_phone,
      } = orderData;

      const results = await query(
        `INSERT INTO orders
         (shop_id, order_number, customer_id, user_id, total_items, total_amount, advance_paid, balance_paid, total_paid, payment_status, remaining_amount, payment_method, order_status, notes, order_date, line1, line2, postal_code, city_name, district_name, province_name, recipient_name, recipient_phone)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          shopId,  // ⭐ Include shop_id
          order_number,
          customer_id || null,
          user_id || null,
          total_items,
          total_amount,
          advance_paid || 0,
          balance_paid || 0,
          total_paid || 0,
          payment_status || "unpaid",
          remaining_amount,
          payment_method,
          order_status,
          notes || null,
          order_date,
          line1,
          line2,
          postal_code,
          city_name,
          district_name,
          province_name,
          recipient_name,
          recipient_phone,
        ]
      );

      const orderId = (results as any).insertId;
      logger.info("Order created for shop", { shopId, orderId, order_number });
      return orderId;
    } catch (error) {
      logger.error("Error creating order:", error);
      throw error;
    }
  }

  async updateOrder(
    orderId: number,
    shopId: number,  // ⭐ Required
    updateData: Partial<Omit<Order, "order_id" | "shop_id" | "created_at" | "updated_at">>
  ): Promise<boolean> {
    try {
      // ⭐ Verify ownership
      const check = await query(
        "SELECT order_id FROM orders WHERE order_id = ? AND shop_id = ?",
        [orderId, shopId]
      );

      if ((check as any[]).length === 0) {
        throw new Error(`Order ${orderId} does not belong to shop ${shopId}`);
      }

      const fields: string[] = [];
      const values: any[] = [];

      Object.entries(updateData).forEach(([key, value]) => {
        if (key !== "delivery_address") {  // Handle address separately if needed
          fields.push(`${key} = ?`);
          values.push(value);
        }
      });

      values.push(orderId, shopId);

      await query(
        `UPDATE orders SET ${fields.join(", ")} WHERE order_id = ? AND shop_id = ?`,
        values
      );

      logger.info("Order updated", { orderId, shopId });
      return true;
    } catch (error) {
      logger.error("Error updating order:", error);
      throw error;
    }
  }

  async recordPayment(
    orderId: number,
    shopId: number,  // ⭐ Required
    paymentAmount: number,
    paymentMethod: string,
    paymentType: "advance" | "balance"
  ): Promise<boolean> {
    try {
      // ⭐ Get order and verify ownership
      const orderResults = await query(
        "SELECT * FROM orders WHERE order_id = ? AND shop_id = ?",
        [orderId, shopId]
      );

      if ((orderResults as any[]).length === 0) {
        throw new Error(`Order ${orderId} does not belong to shop ${shopId}`);
      }

      const order = (orderResults as any[])[0];

      // Calculate new totals
      const newAdvancePaid = paymentType === "advance" ? order.advance_paid + paymentAmount : order.advance_paid;
      const newBalancePaid = paymentType === "balance" ? order.balance_paid + paymentAmount : order.balance_paid;
      const newTotalPaid = newAdvancePaid + newBalancePaid;
      const newRemainingAmount = Math.max(0, order.total_amount - newTotalPaid);

      // Determine payment status
      let paymentStatus = "unpaid";
      if (newTotalPaid >= order.total_amount) {
        paymentStatus = "fully_paid";
      } else if (newTotalPaid > 0) {
        paymentStatus = "partial";
      }

      // Update order
      await query(
        `UPDATE orders
         SET advance_paid = ?, balance_paid = ?, total_paid = ?, remaining_amount = ?, payment_status = ?, payment_method = ?
         WHERE order_id = ? AND shop_id = ?`,
        [
          newAdvancePaid,
          newBalancePaid,
          newTotalPaid,
          newRemainingAmount,
          paymentStatus,
          paymentMethod,
          orderId,
          shopId,  // ⭐ Always with shop validation
        ]
      );

      logger.info("Payment recorded", { orderId, shopId, paymentAmount, paymentType });
      return true;
    } catch (error) {
      logger.error("Error recording payment:", error);
      throw error;
    }
  }

  async getOrdersByStatus(status: string, shopId: number): Promise<Order[]> {
    try {
      const results = await query(
        "SELECT * FROM orders WHERE order_status = ? AND shop_id = ? ORDER BY created_at DESC",
        [status, shopId]  // ⭐ Filter by both status and shop
      );
      logger.info("Retrieved orders by status", {
        status,
        shopId,
        count: (results as any[]).length,
      });
      return results as Order[];
    } catch (error) {
      logger.error("Error fetching orders by status:", error);
      throw error;
    }
  }
}

export default new OrderModel();
```

---

## 🔗 Key Pattern Summary

**Every model now follows this pattern:**

```typescript
// ✅ Method signature
async getXxx(id: number, shopId: number): Promise<T> {

  // ✅ Query includes shop_id filter
  const results = await query(
    "SELECT * FROM table WHERE id = ? AND shop_id = ?",
    [id, shopId]
  );

  return results[0] || null;
}

// ✅ Create method
async createXxx(shopId: number, data: T): Promise<number> {
  const results = await query(
    "INSERT INTO table (shop_id, ...) VALUES (?, ...)",
    [shopId, ...]  // ⭐ Always include shop_id
  );
  return results.insertId;
}

// ✅ Update method
async updateXxx(id: number, shopId: number, data: Partial<T>): Promise<boolean> {
  // ⭐ Verify ownership before updating
  const check = await query(
    "SELECT id FROM table WHERE id = ? AND shop_id = ?",
    [id, shopId]
  );

  if (check.length === 0) throw new Error("Not found");

  // Update with shop validation
  await query(
    "UPDATE table SET ... WHERE id = ? AND shop_id = ?",
    [..., id, shopId]
  );

  return true;
}
```

---

## ✅ What Changes

- ✅ All methods accept `shopId` parameter
- ✅ All queries filter with `AND shop_id = ?`
- ✅ All create operations require `shopId`
- ✅ All update/delete operations verify shop ownership
- ✅ All interfaces include `shop_id` field
- ✅ Foreign key validations include shop checks

---

## ❌ What Doesn't Change

- ❌ OrderItem model (inherits shop_id through order FK)
- ❌ Payment model (inherits shop_id through order FK)
- ❌ ProductColors/ProductSizes models (inherit through product FK)
- ❌ ShopProductStock model (already has shop_id)
- ❌ ShopInventory model (already has shop_id)

---

