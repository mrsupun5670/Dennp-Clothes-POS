import React from "react";
import { useShop } from "../context/ShopContext";

interface ShopBadgeProps {
  size?: "sm" | "md" | "lg";
  showBorder?: boolean;
  showFullDetails?: boolean;
}

export const ShopBadge: React.FC<ShopBadgeProps> = ({
  size = "md",
  showBorder = true,
  showFullDetails = false,
}) => {
  const { shopId, shopName, shopData } = useShop();

  if (!shopId || !shopName) {
    return null;
  }

  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-2 text-sm",
    lg: "px-4 py-3 text-base",
  };

  const borderClass = showBorder ? "border-2 border-red-600" : "";

  // Full details view
  if (showFullDetails && shopData) {
    return (
      <div
        className={`${borderClass} bg-red-900/30 rounded-lg text-red-400 font-semibold p-4 min-w-max`}
      >
        <div className="flex items-center gap-3">
          <span className="text-3xl">🏪</span>
          <div className="space-y-1">
            <div className="font-bold text-red-400 text-lg">{shopData.shop_name}</div>
            <div className="text-xs text-red-500/70">ID: {shopData.shop_id}</div>
            <div className="text-xs text-gray-400">Manager: {shopData.manager_name || "N/A"}</div>
            <div className="text-xs text-gray-400">📞 {shopData.contact_phone}</div>
            <div className="text-xs text-gray-400">📍 {shopData.address}</div>
            <div className="text-xs text-gray-400">Status: {shopData.shop_status}</div>
          </div>
        </div>
      </div>
    );
  }

  // Compact view
  return (
    <div
      className={`${sizeClasses[size]} ${borderClass} bg-red-900/30 rounded-lg text-red-400 font-semibold flex items-center gap-2 whitespace-nowrap`}
    >
      <span className="text-lg">🏪</span>
      <div>
        <div className="font-bold text-red-400">{shopName}</div>
        <div className="text-xs text-red-500/70">ID: {shopId}</div>
      </div>
    </div>
  );
};

export const ShopIndicator: React.FC = () => {
  const { shopId, shopName } = useShop();

  if (!shopId || !shopName) {
    return (
      <div className="px-3 py-2 text-sm bg-yellow-900/30 border border-yellow-600 text-yellow-400 rounded-lg font-semibold">
        ⚠️ No Shop Selected
      </div>
    );
  }

  return (
    <div className="px-3 py-2 text-sm bg-green-900/30 border border-green-600 text-green-400 rounded-lg font-semibold">
      ✓ {shopName} (ID: {shopId})
    </div>
  );
};
