import React from "react";
import { useShop } from "../context/ShopContext";

interface ShopInfoPanelProps {
  variant?: "card" | "inline" | "detailed";
  showStatus?: boolean;
  className?: string;
}

export const ShopInfoPanel: React.FC<ShopInfoPanelProps> = ({
  variant = "card",
  showStatus = true,
  className = "",
}) => {
  const { shopId, shopName, shopData } = useShop();

  if (!shopId || !shopName) {
    return (
      <div className={`${className} p-4 bg-yellow-900/30 border border-yellow-600 rounded-lg text-yellow-400 text-sm`}>
        ⚠️ No shop selected
      </div>
    );
  }

  // Inline variant - single line
  if (variant === "inline") {
    return (
      <div className={`${className} flex items-center gap-2 text-sm text-gray-300`}>
        <span className="text-lg">🏪</span>
        <span className="font-semibold text-red-400">{shopName}</span>
        <span className="text-gray-500">|</span>
        <span className="text-gray-400">ID: {shopId}</span>
      </div>
    );
  }

  // Card variant - compact card
  if (variant === "card") {
    return (
      <div
        className={`${className} bg-gray-700/50 border-2 border-red-600/30 rounded-lg p-4 space-y-2`}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">🏪</span>
          <div className="flex-1">
            <h3 className="font-bold text-red-400 text-lg">{shopName}</h3>
            <p className="text-xs text-gray-400">ID: {shopId}</p>
          </div>
        </div>
        {shopData && showStatus && (
          <div className="text-xs text-gray-400 border-t border-gray-600 pt-2">
            Manager: <span className="text-gray-300">{shopData.manager_name || "N/A"}</span>
          </div>
        )}
      </div>
    );
  }

  // Detailed variant - full information
  if (variant === "detailed" && shopData) {
    const statusColor =
      shopData.shop_status === "active"
        ? "bg-green-900/30 text-green-400 border-green-600"
        : shopData.shop_status === "inactive"
          ? "bg-yellow-900/30 text-yellow-400 border-yellow-600"
          : "bg-red-900/30 text-red-400 border-red-600";

    return (
      <div
        className={`${className} bg-gradient-to-br from-gray-700 to-gray-800 border-2 border-red-600 rounded-lg p-6 space-y-4`}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <span className="text-5xl">🏪</span>
            <div>
              <h2 className="text-2xl font-bold text-red-400">{shopData.shop_name}</h2>
              <p className="text-sm text-gray-400">Shop ID: {shopData.shop_id}</p>
            </div>
          </div>
          {showStatus && (
            <div
              className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColor}`}
            >
              {shopData.shop_status.toUpperCase()}
            </div>
          )}
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4 border-t border-gray-600 pt-4">
          {/* Manager */}
          <div>
            <p className="text-xs text-gray-400 font-semibold mb-1">Manager</p>
            <p className="text-sm text-gray-200">{shopData.manager_name || "N/A"}</p>
          </div>

          {/* Contact */}
          <div>
            <p className="text-xs text-gray-400 font-semibold mb-1">📞 Contact</p>
            <p className="text-sm text-gray-200">{shopData.contact_phone}</p>
          </div>

          {/* Address */}
          <div className="col-span-2">
            <p className="text-xs text-gray-400 font-semibold mb-1">📍 Address</p>
            <p className="text-sm text-gray-200">{shopData.address}</p>
          </div>

          {/* Opening Date */}
          {shopData.opening_date && (
            <div className="col-span-2">
              <p className="text-xs text-gray-400 font-semibold mb-1">📅 Opened</p>
              <p className="text-sm text-gray-200">
                {new Date(shopData.opening_date).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-600 pt-4 text-xs text-gray-500">
          Currently working with this shop | All data is isolated by shop
        </div>
      </div>
    );
  }

  return null;
};

export const ShopStatus: React.FC<{ className?: string }> = ({ className = "" }) => {
  const { shopId, shopName, shopData } = useShop();

  if (!shopId) {
    return (
      <div
        className={`${className} inline-block px-3 py-1 bg-yellow-900/30 border border-yellow-600 text-yellow-400 rounded-full text-xs font-semibold`}
      >
        ⚠️ No Shop
      </div>
    );
  }

  const statusColor =
    shopData?.shop_status === "active"
      ? "bg-green-900/30 text-green-400 border-green-600"
      : shopData?.shop_status === "inactive"
        ? "bg-yellow-900/30 text-yellow-400 border-yellow-600"
        : "bg-red-900/30 text-red-400 border-red-600";

  return (
    <div className={`${className} inline-flex items-center gap-2`}>
      <div className="inline-block px-3 py-1 bg-green-900/30 border border-green-600 text-green-400 rounded-full text-xs font-semibold">
        ✓ Active
      </div>
      <div className={`inline-block px-3 py-1 border rounded-full text-xs font-semibold ${statusColor}`}>
        {shopData?.shop_status?.toUpperCase() || "UNKNOWN"}
      </div>
    </div>
  );
};
