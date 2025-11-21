import React, { createContext, useContext, useState, useEffect } from "react";

interface ShopContextType {
  shopId: number | null;
  shopName: string | null;
  setShop: (shopId: number, shopName: string) => void;
  clearShop: () => void;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [shopId, setShopId] = useState<number | null>(null);
  const [shopName, setShopName] = useState<string | null>(null);

  // Load shop info from localStorage on mount
  useEffect(() => {
    const storedShopId = localStorage.getItem("shopId");
    const storedShopName = localStorage.getItem("shopName");

    if (storedShopId && storedShopName) {
      setShopId(Number(storedShopId));
      setShopName(storedShopName);
    }
  }, []);

  const setShop = (id: number, name: string) => {
    setShopId(id);
    setShopName(name);
    localStorage.setItem("shopId", id.toString());
    localStorage.setItem("shopName", name);
  };

  const clearShop = () => {
    setShopId(null);
    setShopName(null);
    localStorage.removeItem("shopId");
    localStorage.removeItem("shopName");
  };

  return (
    <ShopContext.Provider value={{ shopId, shopName, setShop, clearShop }}>
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
