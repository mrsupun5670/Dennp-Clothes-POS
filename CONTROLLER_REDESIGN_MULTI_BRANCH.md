# Controller Redesign - Multi-Branch Shop System

**All controllers updated to pass shopId through the request**

---

## 🔑 Key Principle

**Every controller method:**
1. **Extracts shopId** from request (query param or context)
2. **Passes shopId** to model methods
3. **Never allows** data access without shop validation

---

## 🛍️ Product Controller Redesign

```typescript
/**
 * Product Controller - Multi-Branch Enabled
 */

import { Request, Response } from 'express';
import ProductModel from '../models/Product';
import { logger } from '../utils/logger';

class ProductController {

  /**
   * GET /api/products?shop_id=1
   * Get all products for a specific shop
   */
  async getAllProducts(req: Request, res: Response): Promise<void> {
    try {
      const shopId = Number(req.query.shop_id);  // ⭐ Extract shop_id

      if (!shopId) {
        res.status(400).json({
          success: false,
          error: "shop_id is required",
        });
        return;
      }

      const products = await ProductModel.getAllProductsByShop(shopId);  // ⭐ Pass shop_id

      res.json({
        success: true,
        data: products,
        message: `Retrieved ${products.length} products for shop ${shopId}`,
      });
    } catch (error: any) {
      logger.error("Error fetching products:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch products",
        details: error.message,
      });
    }
  }

  /**
   * GET /api/products/:id?shop_id=1
   * Get product by ID (with shop validation)
   */
  async getProductById(req: Request, res: Response): Promise<void> {
    try {
      const productId = Number(req.params.id);
      const shopId = Number(req.query.shop_id);  // ⭐ Extract shop_id

      if (!shopId) {
        res.status(400).json({
          success: false,
          error: "shop_id is required",
        });
        return;
      }

      const product = await ProductModel.getProductById(productId, shopId);  // ⭐ Pass shop_id

      if (!product) {
        res.status(404).json({
          success: false,
          error: "Product not found or does not belong to this shop",
        });
        return;
      }

      res.json({
        success: true,
        data: product,
      });
    } catch (error: any) {
      logger.error("Error fetching product:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch product",
        details: error.message,
      });
    }
  }

  /**
   * GET /api/products/category/:categoryId?shop_id=1
   * Get products by category
   */
  async getProductsByCategory(req: Request, res: Response): Promise<void> {
    try {
      const categoryId = Number(req.params.categoryId);
      const shopId = Number(req.query.shop_id);  // ⭐ Extract shop_id

      if (!shopId) {
        res.status(400).json({
          success: false,
          error: "shop_id is required",
        });
        return;
      }

      const products = await ProductModel.getProductsByCategory(categoryId, shopId);  // ⭐ Pass shop_id

      res.json({
        success: true,
        data: products,
        count: products.length,
      });
    } catch (error: any) {
      logger.error("Error fetching products by category:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch products",
        details: error.message,
      });
    }
  }

  /**
   * POST /api/products
   * Create new product
   * Body: { shop_id: 1, sku: "...", product_name: "...", ... }
   */
  async createProduct(req: Request, res: Response): Promise<void> {
    try {
      const shopId = Number(req.body.shop_id);  // ⭐ Extract from body

      if (!shopId) {
        res.status(400).json({
          success: false,
          error: "shop_id is required",
        });
        return;
      }

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
      } = req.body;

      // Validate required fields
      if (!sku || !product_name || !category_id || !retail_price) {
        res.status(400).json({
          success: false,
          error: "Missing required fields: sku, product_name, category_id, retail_price",
        });
        return;
      }

      const productId = await ProductModel.createProduct(
        shopId,  // ⭐ Pass shop_id
        {
          sku,
          product_name,
          category_id,
          description,
          product_cost,
          print_cost,
          retail_price,
          wholesale_price,
          product_status,
        }
      );

      res.status(201).json({
        success: true,
        data: { product_id: productId },
        message: "Product created successfully",
      });
    } catch (error: any) {
      logger.error("Error creating product:", error);
      res.status(500).json({
        success: false,
        error: "Failed to create product",
        details: error.message,
      });
    }
  }

  /**
   * PUT /api/products/:id
   * Update product
   * Body: { shop_id: 1, product_name: "...", ... }
   */
  async updateProduct(req: Request, res: Response): Promise<void> {
    try {
      const productId = Number(req.params.id);
      const shopId = Number(req.body.shop_id);  // ⭐ Extract from body

      if (!shopId) {
        res.status(400).json({
          success: false,
          error: "shop_id is required",
        });
        return;
      }

      await ProductModel.updateProduct(
        productId,
        shopId,  // ⭐ Pass shop_id for validation
        req.body
      );

      res.json({
        success: true,
        message: "Product updated successfully",
      });
    } catch (error: any) {
      logger.error("Error updating product:", error);
      res.status(500).json({
        success: false,
        error: "Failed to update product",
        details: error.message,
      });
    }
  }

  /**
   * DELETE /api/products/:id?shop_id=1
   * Delete product
   */
  async deleteProduct(req: Request, res: Response): Promise<void> {
    try {
      const productId = Number(req.params.id);
      const shopId = Number(req.query.shop_id);  // ⭐ Extract from query

      if (!shopId) {
        res.status(400).json({
          success: false,
          error: "shop_id is required",
        });
        return;
      }

      await ProductModel.deleteProduct(productId, shopId);  // ⭐ Pass shop_id

      res.json({
        success: true,
        message: "Product deleted successfully",
      });
    } catch (error: any) {
      logger.error("Error deleting product:", error);
      res.status(500).json({
        success: false,
        error: "Failed to delete product",
        details: error.message,
      });
    }
  }
}

export default new ProductController();
```

---

## 🏪 Category Controller Redesign

```typescript
import { Request, Response } from 'express';
import CategoryModel from '../models/Category';
import { logger } from '../utils/logger';

class CategoryController {

  async getAllCategories(req: Request, res: Response): Promise<void> {
    try {
      const shopId = Number(req.query.shop_id);  // ⭐ Extract shop_id

      if (!shopId) {
        res.status(400).json({
          success: false,
          error: "shop_id is required",
        });
        return;
      }

      const categories = await CategoryModel.getAllCategoriesByShop(shopId);

      res.json({
        success: true,
        data: categories,
        count: categories.length,
      });
    } catch (error: any) {
      logger.error("Error fetching categories:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch categories",
        details: error.message,
      });
    }
  }

  async getCategoryById(req: Request, res: Response): Promise<void> {
    try {
      const categoryId = Number(req.params.id);
      const shopId = Number(req.query.shop_id);  // ⭐ Extract shop_id

      if (!shopId) {
        res.status(400).json({
          success: false,
          error: "shop_id is required",
        });
        return;
      }

      const category = await CategoryModel.getCategoryById(categoryId, shopId);

      if (!category) {
        res.status(404).json({
          success: false,
          error: "Category not found",
        });
        return;
      }

      res.json({
        success: true,
        data: category,
      });
    } catch (error: any) {
      logger.error("Error fetching category:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch category",
        details: error.message,
      });
    }
  }

  async createCategory(req: Request, res: Response): Promise<void> {
    try {
      const shopId = Number(req.body.shop_id);  // ⭐ Extract shop_id

      if (!shopId) {
        res.status(400).json({
          success: false,
          error: "shop_id is required",
        });
        return;
      }

      const { category_name, size_type_id } = req.body;

      if (!category_name || !size_type_id) {
        res.status(400).json({
          success: false,
          error: "Missing required fields: category_name, size_type_id",
        });
        return;
      }

      const categoryId = await CategoryModel.createCategory(
        shopId,  // ⭐ Pass shop_id
        { category_name, size_type_id }
      );

      res.status(201).json({
        success: true,
        data: { category_id: categoryId },
        message: "Category created successfully",
      });
    } catch (error: any) {
      logger.error("Error creating category:", error);
      res.status(500).json({
        success: false,
        error: "Failed to create category",
        details: error.message,
      });
    }
  }

  async updateCategory(req: Request, res: Response): Promise<void> {
    try {
      const categoryId = Number(req.params.id);
      const shopId = Number(req.body.shop_id);  // ⭐ Extract shop_id

      if (!shopId) {
        res.status(400).json({
          success: false,
          error: "shop_id is required",
        });
        return;
      }

      await CategoryModel.updateCategory(categoryId, shopId, req.body);

      res.json({
        success: true,
        message: "Category updated successfully",
      });
    } catch (error: any) {
      logger.error("Error updating category:", error);
      res.status(500).json({
        success: false,
        error: "Failed to update category",
        details: error.message,
      });
    }
  }

  async deleteCategory(req: Request, res: Response): Promise<void> {
    try {
      const categoryId = Number(req.params.id);
      const shopId = Number(req.query.shop_id);  // ⭐ Extract shop_id

      if (!shopId) {
        res.status(400).json({
          success: false,
          error: "shop_id is required",
        });
        return;
      }

      await CategoryModel.deleteCategory(categoryId, shopId);

      res.json({
        success: true,
        message: "Category deleted successfully",
      });
    } catch (error: any) {
      logger.error("Error deleting category:", error);
      res.status(500).json({
        success: false,
        error: "Failed to delete category",
        details: error.message,
      });
    }
  }
}

export default new CategoryController();
```

---

## 🎨 Color & Size Controllers - Same Pattern

```typescript
// Color Controller
class ColorController {
  async getAllColors(req: Request, res: Response): Promise<void> {
    const shopId = Number(req.query.shop_id);  // ⭐ Extract
    if (!shopId) { /* error */ return; }

    const colors = await ColorModel.getAllColorsByShop(shopId);  // ⭐ Pass shop_id

    res.json({ success: true, data: colors });
  }

  async createColor(req: Request, res: Response): Promise<void> {
    const shopId = Number(req.body.shop_id);  // ⭐ Extract
    if (!shopId) { /* error */ return; }

    const colorId = await ColorModel.createColor(shopId, req.body);  // ⭐ Pass shop_id

    res.status(201).json({
      success: true,
      data: { color_id: colorId },
    });
  }
  // ... update, delete, etc.
}

// Size Controller - Same Pattern
class SizeController {
  async getAllSizes(req: Request, res: Response): Promise<void> {
    const shopId = Number(req.query.shop_id);
    const sizes = await SizeModel.getAllSizesByShop(shopId);
    res.json({ success: true, data: sizes });
  }

  async createSize(req: Request, res: Response): Promise<void> {
    const shopId = Number(req.body.shop_id);
    const sizeId = await SizeModel.createSize(shopId, req.body);
    res.status(201).json({
      success: true,
      data: { size_id: sizeId },
    });
  }
}
```

---

## 👥 Customer Controller Redesign

```typescript
import { Request, Response } from 'express';
import CustomerModel from '../models/Customer';
import { logger } from '../utils/logger';

class CustomerController {

  async getAllCustomers(req: Request, res: Response): Promise<void> {
    try {
      const shopId = Number(req.query.shop_id);  // ⭐ Extract shop_id

      if (!shopId) {
        res.status(400).json({
          success: false,
          error: "shop_id is required",
        });
        return;
      }

      const customers = await CustomerModel.getAllCustomersByShop(shopId);

      res.json({
        success: true,
        data: customers,
        count: customers.length,
      });
    } catch (error: any) {
      logger.error("Error fetching customers:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch customers",
        details: error.message,
      });
    }
  }

  async getCustomerById(req: Request, res: Response): Promise<void> {
    try {
      const customerId = Number(req.params.id);
      const shopId = Number(req.query.shop_id);  // ⭐ Extract shop_id

      if (!shopId) {
        res.status(400).json({
          success: false,
          error: "shop_id is required",
        });
        return;
      }

      const customer = await CustomerModel.getCustomerById(customerId, shopId);

      if (!customer) {
        res.status(404).json({
          success: false,
          error: "Customer not found",
        });
        return;
      }

      res.json({
        success: true,
        data: customer,
      });
    } catch (error: any) {
      logger.error("Error fetching customer:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch customer",
        details: error.message,
      });
    }
  }

  async getCustomerByMobile(req: Request, res: Response): Promise<void> {
    try {
      const mobile = req.query.mobile as string;
      const shopId = Number(req.query.shop_id);  // ⭐ Extract shop_id

      if (!shopId) {
        res.status(400).json({
          success: false,
          error: "shop_id is required",
        });
        return;
      }

      const customer = await CustomerModel.getCustomerByMobile(mobile, shopId);

      if (!customer) {
        res.status(404).json({
          success: false,
          error: "Customer not found",
        });
        return;
      }

      res.json({
        success: true,
        data: customer,
      });
    } catch (error: any) {
      logger.error("Error fetching customer by mobile:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch customer",
        details: error.message,
      });
    }
  }

  async createCustomer(req: Request, res: Response): Promise<void> {
    try {
      const shopId = Number(req.body.shop_id);  // ⭐ Extract from body

      if (!shopId) {
        res.status(400).json({
          success: false,
          error: "shop_id is required",
        });
        return;
      }

      const { first_name, last_name, mobile, email, customer_status } = req.body;

      if (!first_name || !last_name || !mobile) {
        res.status(400).json({
          success: false,
          error: "Missing required fields: first_name, last_name, mobile",
        });
        return;
      }

      const customerId = await CustomerModel.createCustomer(
        shopId,  // ⭐ Pass shop_id
        {
          first_name,
          last_name,
          mobile,
          email,
          customer_status: customer_status || "active",
          orders_count: 0,
          total_spent: 0,
        }
      );

      res.status(201).json({
        success: true,
        data: { customer_id: customerId },
        message: "Customer created successfully",
      });
    } catch (error: any) {
      logger.error("Error creating customer:", error);
      res.status(500).json({
        success: false,
        error: "Failed to create customer",
        details: error.message,
      });
    }
  }

  async updateCustomer(req: Request, res: Response): Promise<void> {
    try {
      const customerId = Number(req.params.id);
      const shopId = Number(req.body.shop_id);  // ⭐ Extract shop_id

      if (!shopId) {
        res.status(400).json({
          success: false,
          error: "shop_id is required",
        });
        return;
      }

      await CustomerModel.updateCustomer(customerId, shopId, req.body);

      res.json({
        success: true,
        message: "Customer updated successfully",
      });
    } catch (error: any) {
      logger.error("Error updating customer:", error);
      res.status(500).json({
        success: false,
        error: "Failed to update customer",
        details: error.message,
      });
    }
  }

  async deleteCustomer(req: Request, res: Response): Promise<void> {
    try {
      const customerId = Number(req.params.id);
      const shopId = Number(req.query.shop_id);  // ⭐ Extract shop_id

      if (!shopId) {
        res.status(400).json({
          success: false,
          error: "shop_id is required",
        });
        return;
      }

      await CustomerModel.deleteCustomer(customerId, shopId);

      res.json({
        success: true,
        message: "Customer deleted successfully",
      });
    } catch (error: any) {
      logger.error("Error deleting customer:", error);
      res.status(500).json({
        success: false,
        error: "Failed to delete customer",
        details: error.message,
      });
    }
  }
}

export default new CustomerController();
```

---

## 📦 Order Controller Redesign

```typescript
import { Request, Response } from 'express';
import OrderModel from '../models/Order';
import { logger } from '../utils/logger';

class OrderController {

  async getAllOrders(req: Request, res: Response): Promise<void> {
    try {
      const shopId = Number(req.query.shop_id);  // ⭐ Extract shop_id

      if (!shopId) {
        res.status(400).json({
          success: false,
          error: "shop_id is required",
        });
        return;
      }

      const status = req.query.status ? String(req.query.status) : undefined;

      let orders = await OrderModel.getAllOrders(shopId);  // ⭐ Pass shop_id

      // Filter by status if provided
      if (status && status !== 'all') {
        const statusMap: { [key: string]: string } = {
          'pending': 'Pending',
          'processing': 'Processing',
          'shipped': 'Shipped',
          'delivered': 'Delivered'
        };
        const dbStatus = statusMap[status.toLowerCase()];
        if (dbStatus) {
          orders = orders.filter(order => order.order_status === dbStatus);
        }
      }

      res.json({
        success: true,
        data: orders,
        message: `Retrieved ${orders.length} orders for shop ${shopId}`,
      });
    } catch (error: any) {
      logger.error('Error fetching orders:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch orders',
        details: error.message,
      });
    }
  }

  async getOrderById(req: Request, res: Response): Promise<void> {
    try {
      const orderId = Number(req.params.id);
      const shopId = Number(req.query.shop_id);  // ⭐ Extract shop_id

      if (!shopId) {
        res.status(400).json({
          success: false,
          error: "shop_id is required",
        });
        return;
      }

      const order = await OrderModel.getOrderById(orderId, shopId);  // ⭐ Pass shop_id

      if (!order) {
        res.status(404).json({
          success: false,
          error: 'Order not found',
        });
        return;
      }

      res.json({
        success: true,
        data: order,
      });
    } catch (error: any) {
      logger.error('Error fetching order:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch order',
        details: error.message,
      });
    }
  }

  async createOrder(req: Request, res: Response): Promise<void> {
    try {
      const shopId = Number(req.body.shop_id);  // ⭐ Extract shop_id

      if (!shopId) {
        res.status(400).json({
          success: false,
          error: "shop_id is required",
        });
        return;
      }

      const orderId = await OrderModel.createOrder(shopId, req.body);  // ⭐ Pass shop_id

      res.status(201).json({
        success: true,
        data: { order_id: orderId },
        message: "Order created successfully",
      });
    } catch (error: any) {
      logger.error('Error creating order:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create order',
        details: error.message,
      });
    }
  }

  async updateOrder(req: Request, res: Response): Promise<void> {
    try {
      const orderId = Number(req.params.id);
      const shopId = Number(req.body.shop_id);  // ⭐ Extract shop_id

      if (!shopId) {
        res.status(400).json({
          success: false,
          error: "shop_id is required",
        });
        return;
      }

      await OrderModel.updateOrder(orderId, shopId, req.body);  // ⭐ Pass shop_id

      res.json({
        success: true,
        message: "Order updated successfully",
      });
    } catch (error: any) {
      logger.error('Error updating order:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update order',
        details: error.message,
      });
    }
  }

  async recordPayment(req: Request, res: Response): Promise<void> {
    try {
      const orderId = Number(req.params.id);
      const { shopId, payment_amount, payment_method, payment_type } = req.body;  // ⭐ Include shop_id in body

      if (!shopId) {
        res.status(400).json({
          success: false,
          error: "shop_id is required",
        });
        return;
      }

      await OrderModel.recordPayment(
        orderId,
        shopId,  // ⭐ Pass shop_id
        payment_amount,
        payment_method,
        payment_type
      );

      res.json({
        success: true,
        message: "Payment recorded successfully",
      });
    } catch (error: any) {
      logger.error('Error recording payment:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to record payment',
        details: error.message,
      });
    }
  }

  async getOrdersByStatus(req: Request, res: Response): Promise<void> {
    try {
      const status = String(req.query.status);
      const shopId = Number(req.query.shop_id);  // ⭐ Extract shop_id

      if (!shopId) {
        res.status(400).json({
          success: false,
          error: "shop_id is required",
        });
        return;
      }

      const orders = await OrderModel.getOrdersByStatus(status, shopId);  // ⭐ Pass shop_id

      res.json({
        success: true,
        data: orders,
        count: orders.length,
      });
    } catch (error: any) {
      logger.error('Error fetching orders by status:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch orders',
        details: error.message,
      });
    }
  }

  async getOrderReceipt(req: Request, res: Response): Promise<void> {
    try {
      const orderId = Number(req.params.id);
      const shopId = Number(req.query.shop_id);  // ⭐ Extract shop_id

      if (!shopId) {
        res.status(400).json({
          success: false,
          error: "shop_id is required",
        });
        return;
      }

      // (Receipt generation method - already implemented)
      // Just add shop_id validation
      const order = await OrderModel.getOrderById(orderId, shopId);  // ⭐ Validate shop

      if (!order) {
        res.status(404).json({
          success: false,
          error: 'Order not found',
        });
        return;
      }

      // Generate and return receipt...
      res.json({
        success: true,
        data: { /* receipt HTML */ },
      });
    } catch (error: any) {
      logger.error('Error generating receipt:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate receipt',
        details: error.message,
      });
    }
  }
}

export default new OrderController();
```

---

## 🔗 API Endpoint Examples

### Products API
```
GET /api/products?shop_id=1
GET /api/products/1?shop_id=1
POST /api/products (body: { shop_id: 1, ... })
PUT /api/products/1 (body: { shop_id: 1, ... })
DELETE /api/products/1?shop_id=1
```

### Categories API
```
GET /api/categories?shop_id=1
GET /api/categories/5?shop_id=1
POST /api/categories (body: { shop_id: 1, ... })
PUT /api/categories/5 (body: { shop_id: 1, ... })
DELETE /api/categories/5?shop_id=1
```

### Customers API
```
GET /api/customers?shop_id=1
GET /api/customers/1001?shop_id=1
GET /api/customers?mobile=0771234567&shop_id=1
POST /api/customers (body: { shop_id: 1, ... })
PUT /api/customers/1001 (body: { shop_id: 1, ... })
DELETE /api/customers/1001?shop_id=1
```

### Orders API
```
GET /api/orders?shop_id=1
GET /api/orders/1?shop_id=1
POST /api/orders (body: { shop_id: 1, ... })
PUT /api/orders/1 (body: { shop_id: 1, ... })
POST /api/orders/1/payment (body: { shopId: 1, payment_amount: ..., ... })
GET /api/orders/1/receipt?shop_id=1
```

---

## ✅ Key Validation Pattern

Every controller should:
1. Extract `shop_id` from request
2. Validate `shop_id` exists
3. Pass `shop_id` to model method
4. Model validates shop ownership
5. Return appropriate error if shop mismatch

```typescript
// ✅ Standard pattern
async someMethod(req: Request, res: Response): Promise<void> {
  try {
    // 1. Extract shop_id
    const shopId = Number(req.query.shop_id || req.body.shop_id);

    // 2. Validate exists
    if (!shopId) {
      res.status(400).json({
        success: false,
        error: "shop_id is required",
      });
      return;
    }

    // 3. Pass to model with shop_id
    const data = await Model.someMethod(id, shopId);

    // 4. Return result
    res.json({ success: true, data });

  } catch (error: any) {
    // 5. Handle errors
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
```

---

