import { useState, useEffect } from "react";
import "./App.css";
import POSLayout from "./components/layout/POSLayout";
import { ShopProvider } from "./context/ShopContext";
import { ShopDetailsModal } from "./components/ShopDetailsModal";
import { ShopSelector } from "./components/ShopSelector";
import SalesPage from "./pages/SalesPage";
import ProductsPage from "./pages/ProductsPage";
import InventoryPage from "./pages/InventoryPage";
import CustomersPage from "./pages/CustomersPage";
import OrdersPage from "./pages/OrdersPage";
import PaymentsPage from "./pages/PaymentsPage";
import BankAccountsPage from "./pages/BankAccountsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import StockPage from "./pages/StockPage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";

type PageType = "sales" | "products" | "inventory" | "customers" | "orders" | "payments" | "bankaccounts" | "analytics" | "stock" | "reports" | "settings";

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>("sales");

  // Listen for navigation requests from other pages (only run on mount and when flag changes)
  useEffect(() => {
    const checkNavigation = setInterval(() => {
      const navigateToSales = sessionStorage.getItem('navigateToSales');
      if (navigateToSales === 'true') {
        setCurrentPage('sales');
        sessionStorage.removeItem('navigateToSales');
      }
    }, 100);

    return () => clearInterval(checkNavigation);
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case "sales":
        return <SalesPage />;
      case "products":
        return <ProductsPage />;
      case "inventory":
        return <InventoryPage />;
      case "customers":
        return <CustomersPage />;
      case "orders":
        return <OrdersPage />;
      case "payments":
        return <PaymentsPage />;
      case "bankaccounts":
        return <BankAccountsPage />;
      case "analytics":
        return <AnalyticsPage />;
      case "stock":
        return <StockPage />;
      case "reports":
        return <ReportsPage />;
      case "settings":
        return <SettingsPage />;
      default:
        return <SalesPage />;
    }
  };

  return (
    <ShopProvider>
      <ShopSelector />
      <POSLayout currentPage={currentPage} onPageChange={setCurrentPage}>
        {renderPage()}
      </POSLayout>
      <ShopDetailsModal />
    </ShopProvider>
  );
}

export default App;
