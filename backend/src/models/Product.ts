/**
 * Product Model
 * Handles all database queries and operations for products table
 */

import { query } from "../config/database";
import { logger } from "../utils/logger";

export interface Product {
  product_id: number;
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
   * Get all products
   */
  async getAllProducts(): Promise<Product[]> {
    try {
      const results = await query(
        "SELECT * FROM products ORDER BY created_at DESC"
      );
      // TODO: This is inefficient (N+1 problem). Refactor to use a single query with JOINs.
      const products = await Promise.all(
        (results as any[]).map((p) => this.getProductWithDetails(p.product_id))
      );
      logger.info("Retrieved all products", {
        count: products.length,
      });
      return products as Product[];
    } catch (error) {
      logger.error("Error fetching all products:", error);
      throw error;
    }
  }

  /**
   * Get product by ID
   */
  async getProductById(productId: number): Promise<Product | null> {
    try {
      const results = await query(
        "SELECT * FROM products WHERE product_id = ?",
        [productId]
      );
      const product = (results as Product[])[0] || null;
      logger.debug("Retrieved product by ID", { productId });
      return product;
    } catch (error) {
      logger.error("Error fetching product by ID:", error);
      throw error;
    }
  }

  /**
   * Get product by SKU
   */
  async getProductBySku(sku: string): Promise<Product | null> {
    try {
      const results = await query("SELECT * FROM products WHERE sku = ?", [
        sku,
      ]);
      const product = (results as Product[])[0] || null;
      logger.debug("Retrieved product by SKU", { sku });
      return product;
    } catch (error) {
      logger.error("Error fetching product by SKU:", error);
      throw error;
    }
  }

  /**
   * Get products by category
   */
  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    try {
      const results = await query(
        'SELECT * FROM products WHERE category_id = ? AND product_status = "active"',
        [categoryId]
      );
      logger.debug("Retrieved products by category", {
        categoryId,
        count: (results as any[]).length,
      });
      return results as Product[];
    } catch (error) {
      logger.error("Error fetching products by category:", error);
      throw error;
    }
  }

  /**
   * Create new product
   */
  async createProduct(
    productData: Omit<Product, "product_id" | "created_at" | "updated_at">
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

      const results = await query(
        `INSERT INTO products (sku, product_name, category_id, description, product_cost, print_cost, retail_price, wholesale_price, product_status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
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
      logger.info("Product created successfully", {
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
   * Update product
   */
  async updateProduct(
    productId: number,
    productData: Partial<
      Omit<Product, "product_id" | "created_at" | "updated_at">
    >
  ): Promise<boolean> {
    try {
      const fields: string[] = [];
      const values: any[] = [];

      const updateableFields: (keyof Omit<
        Product,
        "product_id" | "created_at" | "updated_at"
      >)[] = [
        "sku",
        "product_name",
        "category_id",
        "description",
        "product_cost",
        "print_cost",
        "retail_price",
        "wholesale_price",
        "product_status",
      ];

      for (const field of updateableFields) {
        if (field in productData) {
          fields.push(`${field} = ?`);
          values.push(productData[field]);
        }
      }

      if (fields.length === 0) return false;

      fields.push("updated_at = NOW()");
      values.push(productId);

      const results = await query(
        `UPDATE products SET ${fields.join(", ")} WHERE product_id = ?`,
        values
      );
      const affectedRows = (results as any).affectedRows;

      logger.info("Product updated successfully", { productId, affectedRows });
      return affectedRows > 0;
    } catch (error) {
      logger.error("Error updating product:", error);
      throw error;
    }
  }

  /**
   * Delete product (soft delete by changing status)
   */
  async deleteProduct(productId: number): Promise<boolean> {
    try {
      const results = await query(
        'UPDATE products SET product_status = "discontinued", updated_at = NOW() WHERE product_id = ?',
        [productId]
      );
      const affectedRows = (results as any).affectedRows;

      logger.info("Product deleted (soft delete)", { productId });
      return affectedRows > 0;
    } catch (error) {
      logger.error("Error deleting product:", error);
      throw error;
    }
  }

  /**
   * Get active products with pagination
   */
  async getActiveProducts(
    page: number = 1,
    limit: number = 10
  ): Promise<{ products: Product[]; total: number }> {
    try {
      const offset = (page - 1) * limit;

      const products = await query(
        'SELECT * FROM products WHERE product_status = "active" ORDER BY created_at DESC LIMIT ?, ?',
        [offset, limit]
      );

      const countResults = await query(
        'SELECT COUNT(*) as total FROM products WHERE product_status = "active"'
      );
      const total = (countResults as any)[0].total;

      logger.debug("Retrieved active products", {
        page,
        limit,
        count: (products as any[]).length,
        total,
      });
      return { products: products as Product[], total };
    } catch (error) {
      logger.error("Error fetching active products:", error);
      throw error;
    }
  }

  /**
   * Search products by name or SKU
   */
  async searchProducts(searchTerm: string): Promise<Product[]> {
    try {
      const searchPattern = `%${searchTerm}%`;
      const results = await query(
        'SELECT * FROM products WHERE (product_name LIKE ? OR sku LIKE ?) AND product_status = "active" ORDER BY product_name ASC',
        [searchPattern, searchPattern]
      );

      logger.debug("Searched products", {
        searchTerm,
        count: (results as any[]).length,
      });
      return results as Product[];
    } catch (error) {
      logger.error("Error searching products:", error);
      throw error;
    }
  }

  /**
   * Get product prices for pricing
   */
  async getProductPrices(
    productId: number
  ): Promise<{
    product_cost: number;
    print_cost: number;
    retail_price: number;
    wholesale_price?: number;
  } | null> {
    try {
      const results = await query(
        "SELECT product_cost, print_cost, retail_price, wholesale_price FROM products WHERE product_id = ?",
        [productId]
      );

      const prices = (results as any[])[0] || null;
      logger.debug("Retrieved product prices", { productId });
      return prices;
    } catch (error) {
      logger.error("Error fetching product prices:", error);
      throw error;
    }
  }

  /**
   * Add color to product
   */
  async addProductColor(productId: number, colorId: number): Promise<number> {
    try {
      const results = await query(
        "INSERT INTO product_colors (product_id, color_id) VALUES (?, ?)",
        [productId, colorId]
      );

      const productColorId = (results as any).insertId;
      logger.debug("Color added to product", {
        productId,
        colorId,
        productColorId,
      });
      return productColorId;
    } catch (error) {
      logger.error("Error adding color to product:", error);
      throw error;
    }
  }

  /**
   * Remove color from product
   */
  async removeProductColor(
    productId: number,
    colorId: number
  ): Promise<boolean> {
    try {
      const results = await query(
        "DELETE FROM product_colors WHERE product_id = ? AND color_id = ?",
        [productId, colorId]
      );
      const affectedRows = (results as any).affectedRows;

      logger.debug("Color removed from product", { productId, colorId });
      return affectedRows > 0;
    } catch (error) {
      logger.error("Error removing color from product:", error);
      throw error;
    }
  }

  /**
   * Get all colors for a product
   */
  async getProductColors(productId: number): Promise<any[]> {
    try {
      const results = await query(
        `SELECT c.color_id, c.color_name, c.hex_code
         FROM product_colors pc
         JOIN colors c ON pc.color_id = c.color_id
         WHERE pc.product_id = ?
         ORDER BY c.color_name ASC`,
        [productId]
      );

      logger.debug("Retrieved product colors", {
        productId,
        count: (results as any[]).length,
      });
      return results as any[];
    } catch (error) {
      logger.error("Error fetching product colors:", error);
      throw error;
    }
  }

  /**
   * Add size to product
   */
  async addProductSize(productId: number, sizeId: number): Promise<number> {
    try {
      const results = await query(
        "INSERT INTO product_sizes (product_id, size_id) VALUES (?, ?)",
        [productId, sizeId]
      );

      const productSizeId = (results as any).insertId;
      logger.debug("Size added to product", {
        productId,
        sizeId,
        productSizeId,
      });
      return productSizeId;
    } catch (error) {
      logger.error("Error adding size to product:", error);
      throw error;
    }
  }

  /**
   * Remove size from product
   */
  async removeProductSize(productId: number, sizeId: number): Promise<boolean> {
    try {
      const results = await query(
        "DELETE FROM product_sizes WHERE product_id = ? AND size_id = ?",
        [productId, sizeId]
      );
      const affectedRows = (results as any).affectedRows;

      logger.debug("Size removed from product", { productId, sizeId });
      return affectedRows > 0;
    } catch (error) {
      logger.error("Error removing size from product:", error);
      throw error;
    }
  }

  /**
   * Get all sizes for a product
   */
  async getProductSizes(productId: number): Promise<any[]> {
    try {
      const results = await query(
        `SELECT s.size_id, s.size_name, st.Size_type_name as size_type
         FROM product_sizes ps
         JOIN sizes s ON ps.size_id = s.size_id
         JOIN size_type st ON s.size_type_id = st.size_type_id
         WHERE ps.product_id = ?
         ORDER BY s.size_name ASC`,
        [productId]
      );

      logger.debug("Retrieved product sizes", {
        productId,
        count: (results as any[]).length,
      });
      return results as any[];
    } catch (error) {
      logger.error("Error fetching product sizes:", error);
      throw error;
    }
  }

  /**
   * Get total stock quantity for a product
   */
  async getProductStock(productId: number): Promise<number> {
    try {
      const results = await query(
        "SELECT SUM(stock_qty) as total_stock FROM shop_product_stock WHERE product_id = ?",
        [productId]
      );
      const totalStock = (results as any)[0].total_stock || 0;
      logger.debug("Retrieved product stock", { productId, totalStock });
      return totalStock;
    } catch (error) {
      logger.error("Error fetching product stock:", error);
      throw error;
    }
  }

  /**
   * Update stock quantity for a product variant
   */
  async updateProductStock(
    productId: number,
    sizeId: number,
    colorId: number,
    quantity: number
  ): Promise<boolean> {
    try {
      // For now, we assume a single shop with ID 1
      const shopId = 1;

      const results = await query(
        `INSERT INTO shop_product_stock (shop_id, product_id, size_id, color_id, stock_qty, created_at)
         VALUES (?, ?, ?, ?, ?, NOW())
         ON DUPLICATE KEY UPDATE stock_qty = ?, updated_at = NOW()`,
        [shopId, productId, sizeId, colorId, quantity, quantity]
      );

      const affectedRows = (results as any).affectedRows;
      logger.info("Product stock updated successfully", {
        productId,
        sizeId,
        colorId,
        quantity,
        affectedRows,
      });
      return affectedRows > 0;
    } catch (error) {
      logger.error("Error updating product stock:", error);
      throw error;
    }
  }

  /**
   * Clear all stock entries for a product
   */
  async clearProductStock(productId: number): Promise<boolean> {
    try {
      const results = await query(
        "DELETE FROM shop_product_stock WHERE product_id = ?",
        [productId]
      );

      const affectedRows = (results as any).affectedRows;
      logger.debug("Product stock cleared", {
        productId,
        affectedRows,
      });
      return true;
    } catch (error) {
      logger.error("Error clearing product stock:", error);
      throw error;
    }
  }

  /**
   * Get product with all details (colors, sizes, category)
   */
  async getProductWithDetails(productId: number): Promise<any> {
    try {
      const product = await this.getProductById(productId);
      if (!product) return null;

      const colors = await this.getProductColors(productId);
      const sizes = await this.getProductSizes(productId);
      const stock = await this.getProductStock(productId);

      logger.debug("Retrieved product with details", { productId });
      return { ...product, colors, sizes, stock };
    } catch (error) {
      logger.error("Error fetching product with details:", error);
      throw error;
    }
  }
}

export default new ProductModel();
