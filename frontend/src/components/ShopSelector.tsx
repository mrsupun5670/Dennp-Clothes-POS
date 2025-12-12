import React, { useState, useEffect } from "react";
import { useShop, Shop } from "../context/ShopContext";
import { API_URL } from "../config/api";

interface ShopSelectorProps {
  onShopSelected?: () => void;
  isInitialSetup?: boolean;
}

export const ShopSelector: React.FC<ShopSelectorProps> = ({
  onShopSelected,
  isInitialSetup = false,
}) => {
  const { shopId, isInitialized, setShopData } = useShop();
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchShops = async () => {
      // First check if device is online
      if (!navigator.onLine) {
        setError("No network connection found. Please check your internet connection and try again.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/shops`);
        const result = await response.json();
        if (result.success) {
          setShops(result.data);
        } else {
          setError("Failed to load shops");
        }
      } catch (err: any) {
        // Distinguish between network errors and other errors
        if (err.message === 'Failed to fetch' || err.message.includes('NetworkError')) {
          setError(`Cannot connect to server. Please ensure the backend is running at ${API_URL}`);
        } else {
          setError(`Error loading shops: ${err.message || 'Unknown error'}`);
        }
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchShops();
  }, []);

  const handleSelectShop = (shop: Shop) => {
    setShopData(shop);
    if (onShopSelected) {
      onShopSelected();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <p className="text-gray-400">Loading shops...</p>
      </div>
    );
  }

  if (error) {
    const isNetworkError = !navigator.onLine || error.includes('network connection') || error.includes('Cannot connect');
    
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center">
        <div className="bg-gray-800 p-8 rounded-lg border-2 border-red-500 max-w-lg text-center">
          <div className="text-6xl mb-4">{isNetworkError ? '📡' : '⚠️'}</div>
          <h2 className="text-xl font-bold text-red-500 mb-2">
            {isNetworkError ? 'Network Connection Error' : 'Connection Error'}
          </h2>
          <p className="text-red-300 mb-4">{error}</p>
          <div className="text-xs text-gray-500 mb-4 font-mono text-left bg-black/50 p-2 rounded">
            <p>Target: {API_URL}</p>
            <p>Origin: {window.location.origin}</p>
            <p>Online: {navigator.onLine ? '✅ Yes' : '❌ No'}</p>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  // Only show on first install (not initialized yet)
  // Once shop is selected, never show again unless app is reinstalled
  if (isInitialized) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-gray-800 rounded-lg shadow-2xl border-2 border-red-600 w-full max-w-md p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-red-500 mb-2">
            Select Your Shop
          </h2>
          <p className="text-gray-400 text-sm">
            Please select the shop you want to work with. This selection cannot be changed later.
          </p>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {shops.length > 0 ? (
            shops.map((shop) => (
              <button
                key={shop.shop_id}
                onClick={() => handleSelectShop(shop)}
                className="w-full p-4 text-left bg-gray-700 hover:bg-red-600/30 border-2 border-gray-600 hover:border-red-600 rounded-lg transition-all duration-200 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-bold text-red-400 group-hover:text-red-300">
                      🏪 {shop.shop_name}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      ID: {shop.shop_id} | Manager: {shop.manager_name || "N/A"}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {shop.address}
                    </div>
                  </div>
                  <div className="text-2xl">→</div>
                </div>
              </button>
            ))
          ) : (
            <p className="text-gray-400 text-center py-8">No shops available</p>
          )}
        </div>

        {shops.length > 0 && (
          <p className="text-xs text-yellow-500/70 text-center mt-6">
            ⚠️ This choice is permanent and cannot be changed without reinstalling
          </p>
        )}
      </div>
    </div>
  );
};
