import React, { useEffect, useState } from 'react';
import { getProducts } from '../services/productService';
import { saveAsPDF, generateProductsHTML } from '../utils/exportUtils';

interface Product {
  product_id: number;
  sku: string;
  product_name: string;
  retail_price: number;
  product_status: string;
}

const StockPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (err) {
        setError('Failed to fetch products.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">Stock</h1>
        <p>Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">Stock</h1>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Stock</h1>
      <div className="flex gap-3 mb-4">
        <button
          onClick={() => {
            const html = generateProductsHTML(products);
            saveAsPDF(html, 'stock_report', 'products');
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center gap-2"
          title="Export as PDF"
        >
          📄 Export
        </button>
      </div>
      {products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">SKU</th>
                <th className="py-2 px-4 border-b">Product Name</th>
                <th className="py-2 px-4 border-b">Retail Price</th>
                <th className="py-2 px-4 border-b">Status</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.product_id}>
                  <td className="py-2 px-4 border-b">{product.sku}</td>
                  <td className="py-2 px-4 border-b">{product.product_name}</td>
                  <td className="py-2 px-4 border-b">{product.retail_price}</td>
                  <td className="py-2 px-4 border-b">{product.product_status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StockPage;
