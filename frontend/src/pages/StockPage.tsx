import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { getShopProducts } from '../services/productService';
import { printContent, generateProductsHTML } from '../utils/exportUtils';

interface StockDetail {
  size_name: string;
  color_name: string;
  stock_qty: number;
}

interface Product {
  product_id: string;
  product_code: string;
  product_name: string;
  retail_price: number;
  wholesale_price?: number;
  product_cost: number;
  print_cost: number;
  sewing_cost: number;
  extra_cost: number;
  stock: number;
  stockDetails?: StockDetail[];
}

const StockPage: React.FC = () => {
  const navigate = useNavigate();
  const { shopId } = useShop();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchProducts = async () => {
    if (!shopId) {
      setError('No shop selected');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getShopProducts(shopId);
      console.log('🔍 STOCK PAGE: Received data from API:', data);
      console.log('🔍 STOCK PAGE: First product:', data[0]);
      console.log('🔍 STOCK PAGE: First product stockDetails:', data[0]?.stockDetails);
      setProducts(data);
      setLastRefresh(new Date());
    } catch (err) {
      setError('Failed to fetch products.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();

    const handleFocus = () => {
      fetchProducts();
    };

    window.addEventListener('focus', handleFocus);
    
    // Refresh every 30 seconds
    const refreshInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchProducts();
      }
    }, 30000);

    return () => {
      window.removeEventListener('focus', handleFocus);
      clearInterval(refreshInterval);
    };
  }, [shopId]);

  const handleManualRefresh = () => {
    fetchProducts();
  };

  const formatSizesWithQty = (stockDetails?: StockDetail[]): string => {
    if (!stockDetails) return 'NO_DATA (Null)';
    if (stockDetails.length === 0) return 'NO_DATA (Empty)';
    
    // DEBUG: Log first item
    // console.log('fmtSize:', stockDetails[0]);

    const sizeMap = new Map<string, number>();
    stockDetails.forEach(detail => {
      const name = detail.size_name || 'Unknown';
      const currentQty = sizeMap.get(name) || 0;
      sizeMap.set(name, currentQty + detail.stock_qty);
    });

    return Array.from(sizeMap.entries())
      .map(([size, qty]) => `${size}(${qty})`)
      .join(', ');
  };

  const formatColorsWithQty = (stockDetails?: StockDetail[]): string => {
    if (!stockDetails) return 'NO_DATA (Null)';
    if (stockDetails.length === 0) return 'NO_DATA (Empty)';

    const colorMap = new Map<string, number>();
    stockDetails.forEach(detail => {
      const name = detail.color_name || 'Unknown';
      const currentQty = colorMap.get(name) || 0;
      colorMap.set(name, currentQty + detail.stock_qty);
    });

    return Array.from(colorMap.entries())
      .map(([color, qty]) => `${color}(${qty})`)
      .join(', ');
  };

  if (loading && products.length === 0) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4 text-white">Stock</h1>
        <p className="text-gray-400">Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4 text-white">Stock</h1>
        <p className="text-red-500">{error}</p>
        <button
          onClick={handleManualRefresh}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
        >
          🔄 Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-4xl text-red-600 font-extrabold border-4 border-red-600 p-4 mb-4 text-center bg-white">
          VERSION 2.0 (DEBUG) - IF YOU DO NOT SEE THIS, IT IS OLD CODE
      </h1>
      {/* Debug Info Section - RESTORED FOR DEBUGGING */}
      <div className="p-4 bg-gray-900 border border-red-500 rounded-lg mb-6">
        <h3 className="text-sm font-bold text-red-500 mb-2">DEBUG MODE (Share this with developer):</h3>
        <div className="grid grid-cols-2 gap-4 text-xs font-mono mb-2">
           <div><span className="text-gray-500">Shop ID:</span> <span className="text-blue-400">{shopId}</span></div>
           <div><span className="text-gray-500">Products Count:</span> <span className="text-blue-400">{products.length}</span></div>
        </div>
        <pre className="text-xs text-green-400 font-mono overflow-auto max-h-60 whitespace-pre-wrap bg-black p-2 rounded">
          {products.length > 0 
            ? JSON.stringify(products[0], null, 2) 
            : 'No products loaded yet.'}
        </pre>
      </div>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Stock Inventory</h1>
          <p className="text-sm text-gray-400">
            Last updated: {lastRefresh.toLocaleTimeString()} • {products.length} products
          </p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/add-product')}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center gap-2"
            title="Add Product"
          >
            ➕ Add Product
          </button>
          <button
            onClick={() => {
              const html = generateProductsHTML(products);
              printContent(html, 'Stock Report');
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center gap-2"
            title="Print Report"
          >
            🖨️ Print
          </button>
          <button
            onClick={handleManualRefresh}
            disabled={loading}
            className={`text-white px-4 py-2 rounded-lg transition-colors font-semibold flex items-center gap-2 ${
              loading 
                ? 'bg-gray-600 cursor-not-allowed' 
                : 'bg-purple-600 hover:bg-purple-700'
            }`}
            title="Refresh Stock Data"
          >
            🔄 {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {products.length === 0 ? (
        <p className="text-gray-400">No products found.</p>
      ) : (
        <div className="overflow-x-auto bg-gray-800 rounded-lg border border-gray-700">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-900 text-gray-200">
              <tr>
                <th className="py-3 px-4 text-left font-semibold border-b border-gray-700">Product Code</th>
                <th className="py-3 px-4 text-left font-semibold border-b border-gray-700">Name</th>
                <th className="py-3 px-4 text-left font-semibold border-b border-gray-700">Colors (Qty)</th>
                <th className="py-3 px-4 text-left font-semibold border-b border-gray-700">Sizes (Qty)</th>
                <th className="py-3 px-4 text-right font-semibold border-b border-gray-700">Prod. Cost</th>
                <th className="py-3 px-4 text-right font-semibold border-b border-gray-700">Print Cost</th>
                <th className="py-3 px-4 text-right font-semibold border-b border-gray-700">Sewing Cost</th>
                <th className="py-3 px-4 text-right font-semibold border-b border-gray-700">Extra Cost</th>
                <th className="py-3 px-4 text-right font-semibold border-b border-gray-700">Retail</th>
                <th className="py-3 px-4 text-right font-semibold border-b border-gray-700">Wholesale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {products.map((product) => (
                <tr key={product.product_id} className="hover:bg-gray-700/50 transition-colors">
                  <td className="py-3 px-4 text-blue-400 font-mono">{product.product_code}</td>
                  <td className="py-3 px-4 text-white font-medium">
                      {product.product_name}
                      {/* INLINE DEBUGGING */}
                      <div className="text-xs text-red-400">
                          Raw StockDetails: {product.stockDetails ? product.stockDetails.length : 'undefined'}
                      </div>
                  </td>
                  <td className="py-3 px-4 text-gray-300 text-sm">
                    {formatColorsWithQty(product.stockDetails)}
                  </td>
                  <td className="py-3 px-4 text-gray-300 text-sm">
                    {formatSizesWithQty(product.stockDetails)}
                  </td>
                  <td className="py-3 px-4 text-right text-gray-400">
                    {product.product_cost?.toFixed(2) || '0.00'}
                  </td>
                  <td className="py-3 px-4 text-right text-gray-400">
                    {product.print_cost?.toFixed(2) || '0.00'}
                  </td>
                  <td className="py-3 px-4 text-right text-gray-400">
                    {product.sewing_cost?.toFixed(2) || '0.00'}
                  </td>
                  <td className="py-3 px-4 text-right text-gray-400">
                    {product.extra_cost?.toFixed(2) || '0.00'}
                  </td>
                  <td className="py-3 px-4 text-right text-green-400 font-medium">
                    {product.retail_price?.toFixed(2) || '0.00'}
                  </td>
                  <td className="py-3 px-4 text-right text-yellow-400">
                    {product.wholesale_price?.toFixed(2) || '0.00'}
                  </td>
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
