import React, { useState, useEffect } from "react";
import { useShop } from "../context/ShopContext";

interface Shop {
  shop_id: number;
  shop_name: string;
  address: string;
  contact_phone: string;
  manager_name: string;
  shop_status: string;
}

interface ShopSelectorProps {
  onShopSelected?: () => void;
  isInitialSetup?: boolean;
}

export const ShopSelector: React.FC<ShopSelectorProps> = ({
  onShopSelected,
  isInitialSetup = false,
}) => {
  const { shopId, setShop } = useShop();
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/v1/shops");
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
    setShop(shop.shop_id, shop.shop_name);
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

  // If already selected and not initial setup, don't show
  if (shopId && !isInitialSetup) {
    return null;
  }

  return (
    <div
      className={`${
        isInitialSetup
          ? "fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
          : "p-4"
      }`}
    >
      <div
        className={`${
          isInitialSetup
            ? "bg-gray-800 rounded-lg shadow-2xl border-2 border-red-600 w-full max-w-md"
            : "bg-gray-800/50 border border-gray-700 rounded-lg"
        } p-6`}
      >
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-red-500 mb-2">
            {isInitialSetup ? "Select Your Shop" : "Switch Shop"}
          </h2>
          <p className="text-gray-400 text-sm">
            {isInitialSetup
              ? "Please select the shop you want to work with"
              : "Choose a shop to manage"}
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

        {isInitialSetup && shops.length > 0 && (
          <p className="text-xs text-gray-500 text-center mt-6">
            You can change shops anytime from the shop selector
          </p>
        )}
      </div>
    </div>
  );
};
