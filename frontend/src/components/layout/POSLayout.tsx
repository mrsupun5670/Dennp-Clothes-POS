import React from "react";

interface POSLayoutProps {
  currentPage: string;
  onPageChange: (page: any) => void;
  children: React.ReactNode;
}

const POSLayout: React.FC<POSLayoutProps> = ({ currentPage, onPageChange, children }) => {
  const menuItems = [
    { id: "sales", label: "Sales", icon: "🛒" },
    { id: "products", label: "Products", icon: "📦" },
    { id: "inventory", label: "Inventory", icon: "📦" },
    { id: "customers", label: "Customers", icon: "👥" },
    { id: "orders", label: "Orders", icon: "📋" },
    { id: "payments", label: "Payments", icon: "💳" },
    { id: "bankaccounts", label: "Bank Accounts", icon: "🏦" },
    { id: "analytics", label: "Analytics", icon: "📊" },
  ];

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black">
      {/* Top Header - Microsoft Word Style */}
      <header className="bg-black/95 shadow-lg border-b-2 border-red-600">
        {/* Logo and Title Bar */}
        <div className="px-6 py-3 border-b border-red-600/30 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img
              src="/dennep png.png"
              alt="Dennep Logo"
              className="h-12 w-12 object-contain"
            />
            <div>
              <h1 className="text-xl font-bold text-red-500">Dennep Clothes POS</h1>
              <p className="text-xs text-gray-400">Inventory & Sales Management System</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-red-400 font-mono bg-gray-900/50 px-3 py-2 rounded border border-red-600/30">
              {new Date().toLocaleTimeString()}
            </div>
            <div className="flex items-center gap-2 pl-4 border-l border-red-600/30">
              <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center font-bold text-white text-sm">
                A
              </div>
              <span className="text-sm font-medium text-red-400">Admin</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation - Microsoft Word Style */}
        <nav className="flex items-center gap-1 px-2 bg-black/80 overflow-x-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all duration-200 whitespace-nowrap ${
                currentPage === item.id
                  ? "border-b-red-600 bg-red-600/20 text-red-500 font-semibold"
                  : "border-b-transparent text-gray-300 hover:text-red-400 hover:bg-gray-800/50"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-sm">{item.label}</span>
            </button>
          ))}
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto p-8 bg-gradient-to-b from-gray-900 via-gray-800 to-black">
        {children}
      </main>
    </div>
  );
};

export default POSLayout;
