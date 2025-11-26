/**
 * Product Model
 * Handles all database queries and operations for products table
 */

import { query } from "../config/database";
import { logger } from "../utils/logger";

export interface Product {
  product_id: string;
  shop_id: number;
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
  async getAllProducts(shopId: number): Promise<Product[]> {
    try {
      const results = await query(
        "SELECT * FROM products WHERE shop_id = ? ORDER BY created_at DESC",
        [shopId]
      );
      // TODO: This is inefficient (N+1 problem). Refactor to use a single query with JOINs.
      const products = await Promise.all(
        (results as any[]).map((p) =>
          this.getProductWithDetails(p.product_id, shopId)
        )
      );
      logger.info("Retrieved all products for shop", {
        shopId,
        count: products.length,
      });
      return products as Product[];
    } catch (error) {
      logger.error("Error fetching all products:", error);
      throw error;
    }
  }

  /**
   * Get product by ID (with shop validation)
   * Note: product_id is now the product code (VARCHAR)
   */
  async getProductById(
    productId: string,
    shopId: number
  ): Promise<Product | null> {
    try {
      const results = await query(
        "SELECT * FROM products WHERE product_id = ? AND shop_id = ?",
        [productId, shopId]
      );
      const product = (results as Product[])[0] || null;
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
        [sku, shopId]
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
        'SELECT * FROM products WHERE category_id = ? AND shop_id = ? AND product_status = "active"',
        [categoryId, shopId]
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
   * Create new product with specific product_id (using product code)
   * Also inserts initial stock entries for all color/size combinations if provided
   */
  async createProduct(
    shopId: number,
    productId: string,
    productData: Omit<
      Product,
      "product_id" | "created_at" | "updated_at" | "shop_id"
    >,
    stockData?: Array<{ sizeId: number; colorId: number; quantity: number }>
  ): Promise<string> {
    try {
      const {
        product_name,
        category_id,
        description,
        product_cost,
        print_cost,
        retail_price,
        wholesale_price,
        product_status,
      } = productData;

      // Step 0: Check for duplicates before inserting
      // Check if product_id already exists for this shop
      const duplicateCodeResult = await query(
        "SELECT product_id FROM products WHERE product_id = ? AND shop_id = ?",
        [productId, shopId]
      );
      if ((duplicateCodeResult as any[]).length > 0) {
        const error = new Error(`Product with code ${productId} already exists`);
        (error as any).statusCode = 409;
        (error as any).isDuplicate = true;
        throw error;
      }

      // Check if product_name already exists for this shop
      const duplicateNameResult = await query(
        "SELECT product_id FROM products WHERE product_name = ? AND shop_id = ?",
        [product_name, shopId]
      );
      if ((duplicateNameResult as any[]).length > 0) {
        const error = new Error(`Product with name "${product_name}" already exists`);
        (error as any).statusCode = 409;
        (error as any).isDuplicate = true;
        throw error;
      }

      // Step 1: Insert product first
      logger.info("Inserting product into products table", {
        productId,
        shopId,
        product_name,
      });

      const productResult = await query(
        `INSERT INTO products (product_id, shop_id, product_name, category_id, description, product_cost, print_cost, retail_price, wholesale_price, product_status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          productId,
          shopId,
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

      logger.info("Product inserted successfully", {
        productId,
        shopId,
        affectedRows: (productResult as any).affectedRows,
      });

      // Step 2: Insert stock data if provided (ONLY after product is inserted)
      if (stockData && stockData.length > 0) {
        logger.info("Starting to insert stock data", {
          productId,
          shopId,
          stockCount: stockData.length,
        });

        for (const stock of stockData) {
          try {
            await query(
              `INSERT INTO shop_product_stock (shop_id, product_id, size_id, color_id, stock_qty, created_at)
               VALUES (?, ?, ?, ?, ?, NOW())`,
              [shopId, productId, stock.sizeId, stock.colorId, stock.quantity]
            );
            logger.debug("Stock entry inserted", {
              productId,
              shopId,
              sizeId: stock.sizeId,
              colorId: stock.colorId,
              quantity: stock.quantity,
            });
          } catch (stockError) {
            logger.error("Error inserting stock entry", {
              productId,
              shopId,
              stock,
              error: stockError,
            });
            throw stockError;
          }
        }

        logger.info("All stock entries created for product", {
          productId,
          shopId,
          stockCount: stockData.length,
        });
      }

      logger.info("Product created successfully", {
        productId,
        shopId,
        product_name,
      });
      return productId;
    } catch (error) {
      logger.error("Error creating product:", error);
      throw error;
    }
  }


  /**
   * Update product with optional stock data
   * Accepts stockData to update shop_product_stock table along with product details
   */
  async updateProduct(
    productId: string,
    shopId: number,
    productData: Partial<
      Omit<Product, "product_id" | "created_at" | "updated_at" | "shop_id">
    >,
    stockData?: Array<{ sizeId: number; colorId: number; quantity: number }>
  ): Promise<boolean> {
    try {
      // Verify ownership first
      const ownership = await query(
        "SELECT product_id FROM products WHERE product_id = ? AND shop_id = ?",
        [productId, shopId]
      );
      if ((ownership as any[]).length === 0) {
        logger.warn("Product not found or does not belong to shop", {
          productId,
          shopId,
        });
        return false;
      }

      // Update product details
      const fields: string[] = [];
      const values: any[] = [];

      const updateableFields: (keyof Omit<
        Product,
        "product_id" | "created_at" | "updated_at" | "shop_id"
      >)[] = [
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

      if (fields.length === 0 && (!stockData || stockData.length === 0)) {
        logger.warn("No product or stock data to update", { productId, shopId });
        return false;
      }

      // Update product if there are product fields to update
      if (fields.length > 0) {
        fields.push("updated_at = NOW()");
        values.push(productId);
        values.push(shopId);

        const results = await query(
          `UPDATE products SET ${fields.join(", ")} WHERE product_id = ? AND shop_id = ?`,
          values
        );
        const affectedRows = (results as any).affectedRows;

        logger.info("Product details updated", {
          productId,
          shopId,
          affectedRows,
        });
      }

      // Update stock if provided
      if (stockData && stockData.length > 0) {
        // First, clear existing stock for this product
        await query(
          "DELETE FROM shop_product_stock WHERE product_id = ? AND shop_id = ?",
          [productId, shopId]
        );

        // Then insert new stock entries
        for (const stock of stockData) {
          await query(
            `INSERT INTO shop_product_stock (shop_id, product_id, size_id, color_id, stock_qty, created_at)
             VALUES (?, ?, ?, ?, ?, NOW())`,
            [shopId, productId, stock.sizeId, stock.colorId, stock.quantity]
          );
        }

        logger.info("Product stock updated", {
          productId,
          shopId,
          stockCount: stockData.length,
        });
      }

      return true;
    } catch (error) {
      logger.error("Error updating product:", error);
      throw error;
    }
  }

  /**
   * Delete product (soft delete by changing status)
   */
  async deleteProduct(productId: string, shopId: number): Promise<boolean> {
    try {
      const results = await query(
        'UPDATE products SET product_status = "discontinued", updated_at = NOW() WHERE product_id = ? AND shop_id = ?',
        [productId, shopId]
      );
      const affectedRows = (results as any).affectedRows;

      logger.info("Product deleted (soft delete)", { productId, shopId });
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
    shopId: number,
    page: number = 1,
    limit: number = 10
  ): Promise<{ products: Product[]; total: number }> {
    try {
      const offset = (page - 1) * limit;

      const products = await query(
        'SELECT * FROM products WHERE shop_id = ? AND product_status = "active" ORDER BY created_at DESC LIMIT ?, ?',
        [shopId, offset, limit]
      );

      const countResults = await query(
        'SELECT COUNT(*) as total FROM products WHERE shop_id = ? AND product_status = "active"',
        [shopId]
      );
      const total = (countResults as any)[0].total;

      logger.debug("Retrieved active products", {
        shopId,
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
  async searchProducts(shopId: number, searchTerm: string): Promise<Product[]> {
    try {
      const searchPattern = `%${searchTerm}%`;
      const results = await query(
        'SELECT * FROM products WHERE shop_id = ? AND (product_name LIKE ? OR sku LIKE ?) AND product_status = "active" ORDER BY product_name ASC',
        [shopId, searchPattern, searchPattern]
      );

      logger.debug("Searched products", {
        shopId,
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
    productId: string,
    shopId: number
  ): Promise<{
    product_cost: number;
    print_cost: number;
    retail_price: number;
    wholesale_price?: number;
  } | null> {
    try {
      const results = await query(
        "SELECT product_cost, print_cost, retail_price, wholesale_price FROM products WHERE product_id = ? AND shop_id = ?",
        [productId, shopId]
      );

      const prices = (results as any[])[0] || null;
      logger.debug("Retrieved product prices", { productId, shopId });
      return prices;
    } catch (error) {
      logger.error("Error fetching product prices:", error);
      throw error;
    }
  }

  /**
   * Add color to product
   */
  async addProductColor(
    productId: string,
    colorId: number,
    shopId: number
  ): Promise<number> {
    try {
      // Verify product belongs to shop
      const product = await query(
        "SELECT product_id FROM products WHERE product_id = ? AND shop_id = ?",
        [productId, shopId]
      );
      if ((product as any[]).length === 0) {
        throw new Error("Product not found or does not belong to shop");
      }

      const results = await query(
        "INSERT INTO product_colors (product_id, color_id) VALUES (?, ?)",
        [productId, colorId]
      );

      const productColorId = (results as any).insertId;
      logger.debug("Color added to product", {
        productId,
        colorId,
        shopId,
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
    productId: string,
    colorId: number,
    shopId: number
  ): Promise<boolean> {
    try {
      // Verify product belongs to shop
      const product = await query(
        "SELECT product_id FROM products WHERE product_id = ? AND shop_id = ?",
        [productId, shopId]
      );
      if ((product as any[]).length === 0) {
        throw new Error("Product not found or does not belong to shop");
      }

      const results = await query(
        "DELETE FROM product_colors WHERE product_id = ? AND color_id = ?",
        [productId, colorId]
      );
      const affectedRows = (results as any).affectedRows;

      logger.debug("Color removed from product", {
        productId,
        colorId,
        shopId,
      });
      return affectedRows > 0;
    } catch (error) {
      logger.error("Error removing color from product:", error);
      throw error;
    }
  }

  /**
   * Get all colors for a product
   */
  async getProductColors(productId: string, shopId: number): Promise<any[]> {
    try {
      const results = await query(
        `SELECT c.color_id, c.color_name, c.hex_code
         FROM product_colors pc
         JOIN colors c ON pc.color_id = c.color_id
         JOIN products p ON pc.product_id = p.product_id
         WHERE pc.product_id = ? AND p.shop_id = ?
         ORDER BY c.color_name ASC`,
        [productId, shopId]
      );

      logger.debug("Retrieved product colors", {
        productId,
        shopId,
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
  async addProductSize(
    productId: string,
    sizeId: number,
    shopId: number
  ): Promise<number> {
    try {
      // Verify product belongs to shop
      const product = await query(
        "SELECT product_id FROM products WHERE product_id = ? AND shop_id = ?",
        [productId, shopId]
      );
      if ((product as any[]).length === 0) {
        throw new Error("Product not found or does not belong to shop");
      }

      const results = await query(
        "INSERT INTO product_sizes (product_id, size_id) VALUES (?, ?)",
        [productId, sizeId]
      );

      const productSizeId = (results as any).insertId;
      logger.debug("Size added to product", {
        productId,
        sizeId,
        shopId,
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
  async removeProductSize(
    productId: string,
    sizeId: number,
    shopId: number
  ): Promise<boolean> {
    try {
      // Verify product belongs to shop
      const product = await query(
        "SELECT product_id FROM products WHERE product_id = ? AND shop_id = ?",
        [productId, shopId]
      );
      if ((product as any[]).length === 0) {
        throw new Error("Product not found or does not belong to shop");
      }

      const results = await query(
        "DELETE FROM product_sizes WHERE product_id = ? AND size_id = ?",
        [productId, sizeId]
      );
      const affectedRows = (results as any).affectedRows;

      logger.debug("Size removed from product", { productId, sizeId, shopId });
      return affectedRows > 0;
    } catch (error) {
      logger.error("Error removing size from product:", error);
      throw error;
    }
  }

  /**
   * Get all sizes for a product
   */
  async getProductSizes(productId: string, shopId: number): Promise<any[]> {
    try {
      const results = await query(
        `SELECT s.size_id, s.size_name, st.size_type_name as size_type
         FROM product_sizes ps
         JOIN sizes s ON ps.size_id = s.size_id
         JOIN size_types st ON s.size_type_id = st.size_type_id
         JOIN products p ON ps.product_id = p.product_id
         WHERE ps.product_id = ? AND p.shop_id = ?
         ORDER BY s.size_name ASC`,
        [productId, shopId]
      );

      logger.debug("Retrieved product sizes", {
        productId,
        shopId,
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
  async getProductStock(productId: string, shopId: number): Promise<number> {
    try {
      const results = await query(
        "SELECT SUM(stock_qty) as total_stock FROM shop_product_stock WHERE product_id = ? AND shop_id = ?",
        [productId, shopId]
      );
      const totalStock = (results as any)[0].total_stock || 0;
      logger.debug("Retrieved product stock", {
        productId,
        shopId,
        totalStock,
      });
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
    productId: string,
    sizeId: number,
    colorId: number,
    quantity: number,
    shopId: number
  ): Promise<boolean> {
    try {
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
        shopId,
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
  async clearProductStock(productId: string, shopId: number): Promise<boolean> {
    try {
      const results = await query(
        "DELETE FROM shop_product_stock WHERE product_id = ? AND shop_id = ?",
        [productId, shopId]
      );

      const affectedRows = (results as any).affectedRows;
      logger.debug("Product stock cleared", {
        productId,
        shopId,
        affectedRows,
      });
      return true;
    } catch (error) {
      logger.error("Error clearing product stock:", error);
      throw error;
    }
  }

  /**
   * Get product stock details with color and size information
   */
  async getProductStockDetails(
    productId: string,
    shopId: number
  ): Promise<any[]> {
    try {
      const results = await query(
        `SELECT
          sps.stock_id,
          sps.product_id,
          sps.size_id,
          sps.color_id,
          sps.stock_qty,
          sps.created_at,
          sps.updated_at,
          c.color_id,
          c.color_name,
          s.size_id,
          s.size_name
        FROM shop_product_stock sps
        LEFT JOIN colors c ON sps.color_id = c.color_id
        LEFT JOIN sizes s ON sps.size_id = s.size_id
        WHERE sps.product_id = ? AND sps.shop_id = ?
        ORDER BY c.color_name ASC, s.size_name ASC`,
        [productId, shopId]
      );

      logger.debug("Retrieved product stock details", {
        productId,
        shopId,
        count: (results as any[]).length,
      });
      return results as any[];
    } catch (error) {
      logger.error("Error fetching product stock details:", error);
      throw error;
    }
  }

  /**
   * Get product with all details (colors, sizes, category)
   */
  async getProductWithDetails(productId: string, shopId: number): Promise<any> {
    try {
      const product = await this.getProductById(productId, shopId);
      if (!product) return null;

      const colors = await this.getProductColors(productId, shopId);
      const sizes = await this.getProductSizes(productId, shopId);
      const stock = await this.getProductStock(productId, shopId);

      logger.debug("Retrieved product with details", { productId, shopId });
      return { ...product, colors, sizes, stock };
    } catch (error) {
      logger.error("Error fetching product with details:", error);
      throw error;
    }
  }
}

export default new ProductModel();
