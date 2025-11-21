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
      try {
        const response = await fetch(`${API_URL}/shops`);
        const result = await response.json();
        if (result.success) {
          setShops(result.data);
        } else {
          setError("Failed to load shops");
        }
      } catch (err) {
        setError("Error loading shops");
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
    return (
      <div className="flex items-center justify-center p-4">
        <p className="text-red-400">{error}</p>
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
