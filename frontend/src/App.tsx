import { useState } from "react";
import "./App.css";
import POSLayout from "./components/layout/POSLayout";
import SalesPage from "./pages/SalesPage";
import ProductsPage from "./pages/ProductsPage";
import InventoryPage from "./pages/InventoryPage";
import CustomersPage from "./pages/CustomersPage";
import OrdersPage from "./pages/OrdersPage";
import PaymentsPage from "./pages/PaymentsPage";
import BankAccountsPage from "./pages/BankAccountsPage";
import AnalyticsPage from "./pages/AnalyticsPage";

type PageType = "sales" | "products" | "inventory" | "customers" | "orders" | "payments" | "bankaccounts" | "analytics";

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>("sales");

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
      default:
        return <SalesPage />;
    }
  };

  return (
    <POSLayout currentPage={currentPage} onPageChange={setCurrentPage}>
      {renderPage()}
    </POSLayout>
  );
}

export default App;
