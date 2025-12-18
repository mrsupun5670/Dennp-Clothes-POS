/**
 * Product Controller
 * Handles requests related to products and sends responses to the frontend
 */

import { Request, Response } from "express";
import ProductModel from "../models/Product";
import { logger } from "../utils/logger";

class ProductController {
  /**
   * GET /products?shop_id=1 - Get all products
   */
  async getAllProducts(req: Request, res: Response): Promise<void> {
    try {
      const shopId = Number(req.query.shop_id);
      if (!shopId) {
        res.status(400).json({
          success: false,
          error: "shop_id is required",
        });
        return;
      }

      const products = await ProductModel.getAllProducts(shopId);
      res.json({
        success: true,
        data: products,
        message: `Retrieved ${products.length} products`,
      });
    } catch (error: any) {
      logger.error("Error in getAllProducts:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch products",
        details: error.message,
      });
    }
  }

  /**
   * GET /products/:id?shop_id=1 - Get product by ID (product code)
   */
  async getProductById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const shopId = Number(req.query.shop_id);
      if (!shopId) {
        res.status(400).json({
          success: false,
          error: "shop_id is required",
        });
        return;
      }

      const product = await ProductModel.getProductById(id, shopId);

      if (!product) {
        res.status(404).json({
          success: false,
          error: "Product not found",
        });
        return;
      }

      res.json({
        success: true,
        data: product,
      });
    } catch (error: any) {
      logger.error("Error in getProductById:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch product",
        details: error.message,
      });
    }
  }

  /**
   * GET /products/sku/:sku?shop_id=1 - Get product by product_id
   */
  async getProductBySku(req: Request, res: Response): Promise<void> {
    try {
      const { sku } = req.params;
      const productId = Number(sku);
      const shopId = Number(req.query.shop_id);
      if (!shopId) {
        res.status(400).json({
          success: false,
          error: "shop_id is required",
        });
        return;
      }

      const product = await ProductModel.getProductBySku(productId, shopId);

      if (!product) {
        res.status(404).json({
          success: false,
          error: "Product not found",
        });
        return;
      }

      res.json({
        success: true,
        data: product,
      });
    } catch (error: any) {
      logger.error("Error in getProductBySku:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch product",
        details: error.message,
      });
    }
  }

  /**
   * GET /products/category/:categoryId?shop_id=1 - Get products by category
   */
  async getProductsByCategory(req: Request, res: Response): Promise<void> {
    try {
      const { categoryId } = req.params;
      const shopId = Number(req.query.shop_id);
      if (!shopId) {
        res.status(400).json({
          success: false,
          error: "shop_id is required",
        });
        return;
      }

      const products = await ProductModel.getProductsByCategory(
        Number(categoryId),
        shopId
      );

      res.json({
        success: true,
        data: products,
        message: `Retrieved ${products.length} products in category`,
      });
    } catch (error: any) {
      logger.error("Error in getProductsByCategory:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch products",
        details: error.message,
      });
    }
  }

  /**
   * POST /products (body: { shop_id, product_id, product_name, ..., stock?: [...] }) - Create new product with optional stock
   * stock array format: [{ sizeId: number, colorId: number, quantity: number }, ...]
   */
  async createProduct(req: Request, res: Response): Promise<void> {
    try {
      const {
        shop_id,
        product_id,
        product_name,
        category_id,
        product_cost,
        print_cost,
        retail_price,
        wholesale_price,
        stock,
      } = req.body;

      // Validation
      if (!shop_id) {
        res.status(400).json({
          success: false,
          error: "Missing required field: shop_id",
        });
        return;
      }

      if (!product_id || !product_name || !category_id || retail_price === undefined || retail_price === null) {
        res.status(400).json({
          success: false,
          error:
            "Missing required fields: product_id, product_name, category_id, retail_price",
        });
        return;
      }

      // Create product with product_id (product code)
      const productIdResult = await ProductModel.createProduct(
        shop_id,
        product_id,
        {
          product_name,
          category_id,
          product_cost: product_cost || 0,
          print_cost: print_cost || 0,
          sewing_cost: req.body.sewing_cost || 0,
          extra_cost: req.body.extra_cost || 0,
          retail_price,
          wholesale_price,
        },
        stock // Pass stock data if provided
      );

      res.status(201).json({
        success: true,
        data: { product_id: productIdResult },
        message: "Product created successfully",
      });
    } catch (error: any) {
      logger.error("Error in createProduct:", error);

      // Handle duplicate key errors (409 Conflict)
      if ((error as any).statusCode === 409 || (error as any).isDuplicate) {
        res.status(409).json({
          success: false,
          error: error.message || "Product with this code or name already exists",
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: "Failed to create product",
        details: error.message,
      });
    }
  }

  /**
   * PUT /products/:id (body: { shop_id, ..., stock?: [...] }) - Update product with optional stock data
   * stock array format: [{ sizeId: number, colorId: number, quantity: number }, ...]
   */
  async updateProduct(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { shop_id, stock, ...updateData } = req.body;

      if (!shop_id) {
        res.status(400).json({
          success: false,
          error: "Missing required field: shop_id",
        });
        return;
      }

      const success = await ProductModel.updateProduct(
        id,
        shop_id,
        updateData,
        stock // Pass stock data if provided
      );

      if (!success) {
        res.status(404).json({
          success: false,
          error: "Product not found or no changes made",
        });
        return;
      }

      res.json({
        success: true,
        message: "Product updated successfully",
      });
    } catch (error: any) {
      logger.error("Error in updateProduct:", error);
      res.status(500).json({
        success: false,
        error: "Failed to update product",
        details: error.message,
      });
    }
  }

  /**
   * DELETE /products/:id?shop_id=1 - Delete product (soft delete) (id is product code)
   */
  async deleteProduct(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const shopId = Number(req.query.shop_id);

      if (!shopId) {
        res.status(400).json({
          success: false,
          error: "shop_id is required",
        });
        return;
      }

      const success = await ProductModel.deleteProduct(id, shopId);

      if (!success) {
        res.status(404).json({
          success: false,
          error: "Product not found",
        });
        return;
      }

      res.json({
        success: true,
        message: "Product deleted successfully",
      });
    } catch (error: any) {
      logger.error("Error in deleteProduct:", error);
      res.status(500).json({
        success: false,
        error: "Failed to delete product",
        details: error.message,
      });
    }
  }

  /**
   * GET /products/active?shop_id=1&page=1&limit=10 - Get active products with pagination
   */
  async getActiveProducts(req: Request, res: Response): Promise<void> {
    try {
      const shopId = Number(req.query.shop_id);
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;

      if (!shopId) {
        res.status(400).json({
          success: false,
          error: "shop_id is required",
        });
        return;
      }

      const { products, total } = await ProductModel.getActiveProducts(
        shopId,
        page,
        limit
      );

      res.json({
        success: true,
        data: products,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error: any) {
      logger.error("Error in getActiveProducts:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch products",
        details: error.message,
      });
    }
  }

  /**
   * GET /products/search?shop_id=1&q=term - Search products
   */
  async searchProducts(req: Request, res: Response): Promise<void> {
    try {
      const shopId = Number(req.query.shop_id);
      const { q } = req.query;

      if (!shopId) {
        res.status(400).json({
          success: false,
          error: "shop_id is required",
        });
        return;
      }

      if (!q || typeof q !== "string") {
        res.status(400).json({
          success: false,
          error: "Search term (q) is required",
        });
        return;
      }

      const products = await ProductModel.searchProducts(shopId, q);

      res.json({
        success: true,
        data: products,
        message: `Found ${products.length} products`,
      });
    } catch (error: any) {
      logger.error("Error in searchProducts:", error);
      res.status(500).json({
        success: false,
        error: "Failed to search products",
        details: error.message,
      });
    }
  }

  /**
   * GET /products/:id/prices?shop_id=1 - Get product prices
   */
  async getProductPrices(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const shopId = Number(req.query.shop_id);

      if (!shopId) {
        res.status(400).json({
          success: false,
          error: "shop_id is required",
        });
        return;
      }

      const prices = await ProductModel.getProductPrices(id, shopId);

      if (!prices) {
        res.status(404).json({
          success: false,
          error: "Product not found",
        });
        return;
      }

      res.json({
        success: true,
        data: prices,
      });
    } catch (error: any) {
      logger.error("Error in getProductPrices:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch prices",
        details: error.message,
      });
    }
  }

  /**
   * GET /products/:id/details?shop_id=1 - Get product with all details (colors, sizes)
   */
  async getProductWithDetails(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const shopId = Number(req.query.shop_id);

      if (!shopId) {
        res.status(400).json({
          success: false,
          error: "shop_id is required",
        });
        return;
      }

      const product = await ProductModel.getProductWithDetails(id, shopId);

      if (!product) {
        res.status(404).json({
          success: false,
          error: "Product not found",
        });
        return;
      }

      res.json({
        success: true,
        data: product,
      });
    } catch (error: any) {
      logger.error("Error in getProductWithDetails:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch product details",
        details: error.message,
      });
    }
  }

  /**
   * GET /products/:id/colors?shop_id=1 - Get all colors for a product
   */
  async getProductColors(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const shopId = Number(req.query.shop_id);

      if (!shopId) {
        res.status(400).json({
          success: false,
          error: "shop_id is required",
        });
        return;
      }

      const colors = await ProductModel.getProductColors(id, shopId);

      res.json({
        success: true,
        data: colors,
        message: `Retrieved ${colors.length} colors`,
      });
    } catch (error: any) {
      logger.error("Error in getProductColors:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch colors",
        details: error.message,
      });
    }
  }

  /**
   * POST /products/:id/colors (body: { shop_id, color_id }) - Add color to product
   */
  async addProductColor(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { shop_id, color_id } = req.body;

      if (!shop_id) {
        res.status(400).json({
          success: false,
          error: "Missing required field: shop_id",
        });
        return;
      }

      if (!color_id) {
        res.status(400).json({
          success: false,
          error: "Missing required field: color_id",
        });
        return;
      }

      const productColorId = await ProductModel.addProductColor(
        id,
        color_id,
        shop_id
      );

      res.status(201).json({
        success: true,
        data: { product_color_id: productColorId },
        message: "Color added to product",
      });
    } catch (error: any) {
      logger.error("Error in addProductColor:", error);
      res.status(500).json({
        success: false,
        error: "Failed to add color",
        details: error.message,
      });
    }
  }

  /**
   * DELETE /products/:id/colors/:colorId?shop_id=1 - Remove color from product
   */
  async removeProductColor(req: Request, res: Response): Promise<void> {
    try {
      const { id, colorId } = req.params;
      const shopId = Number(req.query.shop_id);

      if (!shopId) {
        res.status(400).json({
          success: false,
          error: "shop_id is required",
        });
        return;
      }

      const success = await ProductModel.removeProductColor(
        id,
        Number(colorId),
        shopId
      );

      if (!success) {
        res.status(404).json({
          success: false,
          error: "Product color not found",
        });
        return;
      }

      res.json({
        success: true,
        message: "Color removed from product",
      });
    } catch (error: any) {
      logger.error("Error in removeProductColor:", error);
      res.status(500).json({
        success: false,
        error: "Failed to remove color",
        details: error.message,
      });
    }
  }

  /**
   * GET /products/:id/sizes?shop_id=1 - Get all sizes for a product
   */
  async getProductSizes(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const shopId = Number(req.query.shop_id);

      if (!shopId) {
        res.status(400).json({
          success: false,
          error: "shop_id is required",
        });
        return;
      }

      const sizes = await ProductModel.getProductSizes(id, shopId);

      res.json({
        success: true,
        data: sizes,
        message: `Retrieved ${sizes.length} sizes`,
      });
    } catch (error: any) {
      logger.error("Error in getProductSizes:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch sizes",
        details: error.message,
      });
    }
  }

  /**
   * POST /products/:id/sizes (body: { shop_id, size_id }) - Add size to product
   */
  async addProductSize(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { shop_id, size_id } = req.body;

      if (!shop_id) {
        res.status(400).json({
          success: false,
          error: "Missing required field: shop_id",
        });
        return;
      }

      if (!size_id) {
        res.status(400).json({
          success: false,
          error: "Missing required field: size_id",
        });
        return;
      }

      const productSizeId = await ProductModel.addProductSize(
        id,
        size_id,
        shop_id
      );

      res.status(201).json({
        success: true,
        data: { product_size_id: productSizeId },
        message: "Size added to product",
      });
    } catch (error: any) {
      logger.error("Error in addProductSize:", error);
      res.status(500).json({
        success: false,
        error: "Failed to add size",
        details: error.message,
      });
    }
  }

  /**
   * DELETE /products/:id/sizes/:sizeId?shop_id=1 - Remove size from product
   */
  async removeProductSize(req: Request, res: Response): Promise<void> {
    try {
      const { id, sizeId } = req.params;
      const shopId = Number(req.query.shop_id);

      if (!shopId) {
        res.status(400).json({
          success: false,
          error: "shop_id is required",
        });
        return;
      }

      const success = await ProductModel.removeProductSize(
        id,
        Number(sizeId),
        shopId
      );

      if (!success) {
        res.status(404).json({
          success: false,
          error: "Product size not found",
        });
        return;
      }

      res.json({
        success: true,
        message: "Size removed from product",
      });
    } catch (error: any) {
      logger.error("Error in removeProductSize:", error);
      res.status(500).json({
        success: false,
        error: "Failed to remove size",
        details: error.message,
      });
    }
  }

  /**
   * POST /products/stock (body: { shop_id, productId, sizeId, colorId, quantity }) - Update stock
   */
  async updateProductStock(req: Request, res: Response): Promise<void> {
    try {
      const { shop_id, productId, sizeId, colorId, quantity } = req.body;

      if (!shop_id) {
        res.status(400).json({
          success: false,
          error: "Missing required field: shop_id",
        });
        return;
      }

      if (
        productId === undefined ||
        sizeId === undefined ||
        colorId === undefined ||
        quantity === undefined
      ) {
        res.status(400).json({
          success: false,
          error:
            "Missing required fields: productId, sizeId, colorId, quantity",
        });
        return;
      }

      const success = await ProductModel.updateProductStock(
        productId,
        Number(sizeId),
        Number(colorId),
        Number(quantity),
        shop_id
      );

      if (!success) {
        res.status(500).json({
          success: false,
          error: "Failed to update product stock",
        });
        return;
      }

      res.json({
        success: true,
        message: "Product stock updated successfully",
      });
    } catch (error: any) {
      logger.error("Error in updateProductStock:", error);
      res.status(500).json({
        success: false,
        error: "Failed to update product stock",
        details: error.message,
      });
    }
  }

  /**
   * GET /products/:id/stock?shop_id=1 - Get product stock with color and size details
   */
  async getProductStockDetails(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const shopId = Number(req.query.shop_id);

      if (!shopId) {
        res.status(400).json({
          success: false,
          error: "shop_id is required",
        });
        return;
      }

      const stockDetails = await ProductModel.getProductStockDetails(id, shopId);

      res.json({
        success: true,
        data: stockDetails,
        message: `Retrieved ${stockDetails.length} stock entries`,
      });
    } catch (error: any) {
      logger.error("Error in getProductStockDetails:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch stock details",
        details: error.message,
      });
    }
  }

  /**
   * DELETE /products/:id/stock?shop_id=1 - Clear all stock for a product
   */
  async clearProductStock(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const shopId = Number(req.query.shop_id);

      if (!shopId) {
        res.status(400).json({
          success: false,
          error: "shop_id is required",
        });
        return;
      }

      const success = await ProductModel.clearProductStock(id, shopId);

      if (!success) {
        res.status(500).json({
          success: false,
          error: "Failed to clear product stock",
        });
        return;
      }

      res.json({
        success: true,
        message: "Product stock cleared successfully",
      });
    } catch (error: any) {
      logger.error("Error in clearProductStock:", error);
      res.status(500).json({
        success: false,
        error: "Failed to clear product stock",
        details: error.message,
      });
    }
  }
}

export default new ProductController();
