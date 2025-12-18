import { useState, useEffect } from "react";
import "./App.css";
import POSLayout from "./components/layout/POSLayout";
import { ShopProvider } from "./context/ShopContext";
import { AdminAuthProvider } from "./context/AdminAuthContext";
import { ShopDetailsModal } from "./components/ShopDetailsModal";
import { ShopSelector } from "./components/ShopSelector";
import ProtectedPage from "./components/ProtectedPage";
import SalesPage from "./pages/SalesPage";
import ProductsPage from "./pages/ProductsPage";
import InventoryPage from "./pages/InventoryPage";
import CustomersPage from "./pages/CustomersPage";
import OrdersPage from "./pages/OrdersPage";
import PaymentsPage from "./pages/PaymentsPage";
import BankAccountsPage from "./pages/BankAccountsPage";
import StockPage from "./pages/StockPage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";
import NotesPage from "./pages/NotesPage";

type PageType = "sales" | "products" | "inventory" | "customers" | "orders" | "payments" | "bankaccounts" | "stock" | "reports" | "settings" | "notes";

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

  // Global handler to prevent scroll wheel from changing number input values
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (
        document.activeElement instanceof HTMLInputElement &&
        document.activeElement.type === "number"
      ) {
        (document.activeElement as HTMLInputElement).blur();
      }
    };

    // Add passive: false to allow preventDefault (though blur works even with passive)
    window.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      window.removeEventListener("wheel", handleWheel);
    };
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case "sales":
        return <SalesPage />;
      case "products":
        return <ProtectedPage><ProductsPage /></ProtectedPage>;
      case "inventory":
        return <ProtectedPage><InventoryPage /></ProtectedPage>;
      case "customers":
        return <ProtectedPage><CustomersPage /></ProtectedPage>;
      case "orders":
        return <ProtectedPage><OrdersPage /></ProtectedPage>;
      case "payments":
        return <ProtectedPage><PaymentsPage /></ProtectedPage>;
      case "bankaccounts":
        return <ProtectedPage><BankAccountsPage /></ProtectedPage>;
      case "stock":
        return <ProtectedPage><StockPage /></ProtectedPage>;
      case "reports":
        return <ProtectedPage><ReportsPage /></ProtectedPage>;
      case "settings":
        return <ProtectedPage><SettingsPage /></ProtectedPage>;
      case "notes":
        return <ProtectedPage><NotesPage /></ProtectedPage>;
      default:
        return <SalesPage />;
    }
  };

  return (
    <ShopProvider>
      <AdminAuthProvider>
        <ShopSelector />
        <POSLayout currentPage={currentPage} onPageChange={setCurrentPage}>
          {renderPage()}
        </POSLayout>
        <ShopDetailsModal />
      </AdminAuthProvider>
    </ShopProvider>
  );
}

export default App;
