import React from "react";
import { useShop } from "../context/ShopContext";

interface ShopBadgeProps {
  size?: "sm" | "md" | "lg";
  showBorder?: boolean;
}

export const ShopBadge: React.FC<ShopBadgeProps> = ({
  size = "md",
  showBorder = true,
}) => {
  const { shopId, shopName } = useShop();

  if (!shopId || !shopName) {
    return null;
  }

  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-2 text-sm",
    lg: "px-4 py-3 text-base",
  };

  const borderClass = showBorder ? "border-2 border-red-600" : "";

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
