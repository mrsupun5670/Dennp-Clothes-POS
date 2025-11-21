import React, { createContext, useContext, useState, useEffect } from "react";

export interface Shop {
  shop_id: number;
  shop_name: string;
  address: string;
  contact_phone: string;
  manager_name: string;
  shop_status: string;
  opening_date?: string;
}

interface ShopContextType {
  shopId: number | null;
  shopName: string | null;
  shopData: Shop | null;
  isInitialized: boolean;
  setShop: (shopId: number, shopName: string) => void;
  setShopData: (shop: Shop) => void;
  clearShop: () => void;
  resetForReininstall: () => void;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [shopId, setShopId] = useState<number | null>(null);
  const [shopName, setShopName] = useState<string | null>(null);
  const [shopData, setShopDataState] = useState<Shop | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load shop info from localStorage on mount
  useEffect(() => {
    const storedShopId = localStorage.getItem("shopId");
    const storedShopName = localStorage.getItem("shopName");
    const storedShopData = localStorage.getItem("shopData");
    const hasInitialized = localStorage.getItem("shopInitialized");

    if (storedShopId && storedShopName && hasInitialized === "true") {
      setShopId(Number(storedShopId));
      setShopName(storedShopName);
      setIsInitialized(true);

      if (storedShopData) {
        try {
          const parsedData = JSON.parse(storedShopData);
          setShopDataState(parsedData);
        } catch (e) {
          console.error("Failed to parse shop data from localStorage");
        }
      }
    }
  }, []);

  const setShop = (id: number, name: string) => {
    setShopId(id);
    setShopName(name);
    localStorage.setItem("shopId", id.toString());
    localStorage.setItem("shopName", name);
  };

  const setShopData = (shop: Shop) => {
    setShopId(shop.shop_id);
    setShopName(shop.shop_name);
    setShopDataState(shop);
    setIsInitialized(true);
    localStorage.setItem("shopId", shop.shop_id.toString());
    localStorage.setItem("shopName", shop.shop_name);
    localStorage.setItem("shopData", JSON.stringify(shop));
    localStorage.setItem("shopInitialized", "true");
  };

  const clearShop = () => {
    setShopId(null);
    setShopName(null);
    setShopDataState(null);
    localStorage.removeItem("shopId");
    localStorage.removeItem("shopName");
    localStorage.removeItem("shopData");
  };

  const resetForReininstall = () => {
    setShopId(null);
    setShopName(null);
    setShopDataState(null);
    setIsInitialized(false);
    localStorage.removeItem("shopId");
    localStorage.removeItem("shopName");
    localStorage.removeItem("shopData");
    localStorage.removeItem("shopInitialized");
  };

  return (
    <ShopContext.Provider value={{ shopId, shopName, shopData, isInitialized, setShop, setShopData, clearShop, resetForReininstall }}>
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = (): ShopContextType => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error("useShop must be used within a ShopProvider");
  }
  return context;
};
