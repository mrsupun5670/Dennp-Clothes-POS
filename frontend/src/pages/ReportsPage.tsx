import React, { useState, useMemo } from "react";

interface SoldItem {
  id: string;
  productName: string;
  category: string;
  size: string;
  color: string;
  quantity: number;
  price: number;
  totalAmount: number;
  orderId: string;
  orderDate: string;
}

interface OrderCost {
  orderId: string;
  orderDate: string;
  customerName: string;
  productCost: number;
  printCost: number;
  totalCost: number;
  totalItems: number;
  totalSaleAmount: number;
}

type TimePeriod = "today" | "week" | "month" | "3months" | "12months";
type ReportView = "sold-items" | "costs";
type SortBy = "name" | "category" | "size" | "color" | "quantity";

const ReportsPage: React.FC = () => {
  const [currentView, setCurrentView] = useState<ReportView>("sold-items");
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("today");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("name");
  const [sortCategory, setSortCategory] = useState("");
  const [sortSize, setSortSize] = useState("");
  const [sortColor, setSortColor] = useState("");

  // Generate today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayDate = getTodayDate();

  const allSoldItems: SoldItem[] = [
    // Sri Lankan Products - Today
    { id: "SI001", productName: "Colombo Cotton T-Shirt", category: "tshirt", size: "M", color: "White", quantity: 8, price: 950, totalAmount: 7600, orderId: "ORD101", orderDate: todayDate },
    { id: "SI002", productName: "Colombo Cotton T-Shirt", category: "tshirt", size: "L", color: "Blue", quantity: 6, price: 950, totalAmount: 5700, orderId: "ORD101", orderDate: todayDate },
    { id: "SI003", productName: "Kandy Silk Saree", category: "saree", size: "Free", color: "Red", quantity: 3, price: 8500, totalAmount: 25500, orderId: "ORD102", orderDate: todayDate },
    { id: "SI004", productName: "Kandy Silk Saree", category: "saree", size: "Free", color: "Gold", quantity: 2, price: 8500, totalAmount: 17000, orderId: "ORD102", orderDate: todayDate },
    { id: "SI005", productName: "Galle Linen Shirt", category: "shirt", size: "M", color: "Cream", quantity: 5, price: 2200, totalAmount: 11000, orderId: "ORD103", orderDate: todayDate },
    { id: "SI006", productName: "Negombo Beach Shorts", category: "shorts", size: "M", color: "Orange", quantity: 4, price: 1500, totalAmount: 6000, orderId: "ORD104", orderDate: todayDate },
    { id: "SI007", productName: "Negombo Beach Shorts", category: "shorts", size: "L", color: "Turquoise", quantity: 3, price: 1500, totalAmount: 4500, orderId: "ORD104", orderDate: todayDate },
    { id: "SI008", productName: "Trincomalee Cotton Dress", category: "dress", size: "S", color: "Purple", quantity: 2, price: 4000, totalAmount: 8000, orderId: "ORD105", orderDate: todayDate },
    { id: "SI009", productName: "Colombo Formal Shirt", category: "shirt", size: "15.5", color: "White", quantity: 4, price: 2800, totalAmount: 11200, orderId: "ORD106", orderDate: todayDate },
    { id: "SI010", productName: "Kandy Traditional Blouse", category: "blouse", size: "M", color: "Maroon", quantity: 3, price: 1800, totalAmount: 5400, orderId: "ORD107", orderDate: todayDate },
    { id: "SI011", productName: "Jaffna Linen Pants", category: "trouser", size: "32", color: "Khaki", quantity: 2, price: 3200, totalAmount: 6400, orderId: "ORD108", orderDate: todayDate },
    { id: "SI012", productName: "Matara Beach Dress", category: "dress", size: "M", color: "Emerald", quantity: 2, price: 4500, totalAmount: 9000, orderId: "ORD109", orderDate: todayDate },
    { id: "SI013", productName: "Kandy Silk Scarf", category: "accessory", size: "One Size", color: "Purple", quantity: 10, price: 600, totalAmount: 6000, orderId: "ORD110", orderDate: todayDate },
    { id: "SI014", productName: "Galle Designer Shawl", category: "accessory", size: "One Size", color: "Gold", quantity: 5, price: 2500, totalAmount: 12500, orderId: "ORD111", orderDate: todayDate },
    { id: "SI015", productName: "Colombo Cotton T-Shirt", category: "tshirt", size: "XL", color: "Green", quantity: 4, price: 950, totalAmount: 3800, orderId: "ORD112", orderDate: todayDate },
    { id: "SI016", productName: "Kandy Traditional Blouse", category: "blouse", size: "L", color: "Gold", quantity: 3, price: 1800, totalAmount: 5400, orderId: "ORD113", orderDate: todayDate },
    { id: "SI017", productName: "Negombo Cotton Shirt", category: "shirt", size: "L", color: "Sky Blue", quantity: 2, price: 1600, totalAmount: 3200, orderId: "ORD114", orderDate: todayDate },
    { id: "SI018", productName: "Trincomalee Linen Dress", category: "dress", size: "L", color: "Coral", quantity: 1, price: 5000, totalAmount: 5000, orderId: "ORD115", orderDate: todayDate },
    { id: "SI019", productName: "Colombo Linen Shorts", category: "shorts", size: "S", color: "White", quantity: 6, price: 1200, totalAmount: 7200, orderId: "ORD116", orderDate: todayDate },
    { id: "SI020", productName: "Kandy Silk Saree", category: "saree", size: "Free", color: "Sapphire", quantity: 1, price: 8500, totalAmount: 8500, orderId: "ORD117", orderDate: todayDate },
  ];

  const allOrderCosts: OrderCost[] = [
    // Sri Lankan Orders - Today
    { orderId: "ORD101", orderDate: todayDate, customerName: "Roshan Perera", productCost: 5600, printCost: 1200, totalCost: 6800, totalItems: 14, totalSaleAmount: 13300 },
    { orderId: "ORD102", orderDate: todayDate, customerName: "Priya Jayasooriya", productCost: 18900, printCost: 2500, totalCost: 21400, totalItems: 5, totalSaleAmount: 42500 },
    { orderId: "ORD103", orderDate: todayDate, customerName: "Lakshmi Fernando", productCost: 7700, printCost: 1100, totalCost: 8800, totalItems: 5, totalSaleAmount: 11000 },
    { orderId: "ORD104", orderDate: todayDate, customerName: "Kamal Silva", productCost: 4200, printCost: 900, totalCost: 5100, totalItems: 7, totalSaleAmount: 10500 },
    { orderId: "ORD105", orderDate: todayDate, customerName: "Chandrika Weerasekera", productCost: 2800, printCost: 600, totalCost: 3400, totalItems: 2, totalSaleAmount: 8000 },
    { orderId: "ORD106", orderDate: todayDate, customerName: "Anura Wickramasinghe", productCost: 7200, printCost: 1400, totalCost: 8600, totalItems: 4, totalSaleAmount: 11200 },
    { orderId: "ORD107", orderDate: todayDate, customerName: "Divya Perera", productCost: 3600, printCost: 800, totalCost: 4400, totalItems: 3, totalSaleAmount: 5400 },
    { orderId: "ORD108", orderDate: todayDate, customerName: "Sanjay De Silva", productCost: 3400, printCost: 900, totalCost: 4300, totalItems: 2, totalSaleAmount: 6400 },
    { orderId: "ORD109", orderDate: todayDate, customerName: "Niranja Jayasuriya", productCost: 5000, printCost: 1200, totalCost: 6200, totalItems: 2, totalSaleAmount: 9000 },
    { orderId: "ORD110", orderDate: todayDate, customerName: "Malini Gunasekera", productCost: 2200, printCost: 500, totalCost: 2700, totalItems: 10, totalSaleAmount: 6000 },
    { orderId: "ORD111", orderDate: todayDate, customerName: "Ravi Kumarasiri", productCost: 8000, printCost: 1500, totalCost: 9500, totalItems: 5, totalSaleAmount: 12500 },
    { orderId: "ORD112", orderDate: todayDate, customerName: "Asha Malalasekera", productCost: 2300, printCost: 600, totalCost: 2900, totalItems: 4, totalSaleAmount: 3800 },
    { orderId: "ORD113", orderDate: todayDate, customerName: "Tharaka Wanasinghe", productCost: 3200, printCost: 800, totalCost: 4000, totalItems: 3, totalSaleAmount: 5400 },
    { orderId: "ORD114", orderDate: todayDate, customerName: "Geetha Narayana", productCost: 2000, printCost: 500, totalCost: 2500, totalItems: 2, totalSaleAmount: 3200 },
    { orderId: "ORD115", orderDate: todayDate, customerName: "Vikram Senanayake", productCost: 3500, printCost: 800, totalCost: 4300, totalItems: 1, totalSaleAmount: 5000 },
    { orderId: "ORD116", orderDate: todayDate, customerName: "Nalini Ratnayake", productCost: 2400, printCost: 600, totalCost: 3000, totalItems: 6, totalSaleAmount: 7200 },
    { orderId: "ORD117", orderDate: todayDate, customerName: "Suresh Wijesinghe", productCost: 6500, printCost: 1200, totalCost: 7700, totalItems: 1, totalSaleAmount: 8500 },
  ];

  const getDateRange = (period: TimePeriod) => {
    const today = new Date();
    let startDate = new Date();
    startDate.setHours(0, 0, 0, 0);

    switch (period) {
      case "today":
        break;
      case "week":
        startDate.setDate(today.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(today.getMonth() - 1);
        break;
      case "3months":
        startDate.setMonth(today.getMonth() - 3);
        break;
      case "12months":
        startDate.setFullYear(today.getFullYear() - 1);
        break;
    }

    return { startDate, endDate: today };
  };

  const isDateInRange = (dateStr: string, range: ReturnType<typeof getDateRange>) => {
    const date = new Date(dateStr);
    date.setHours(0, 0, 0, 0);
    return date >= range.startDate && date <= range.endDate;
  };

  const filteredSoldItems = useMemo(() => {
    const dateRange = getDateRange(timePeriod);
    let items = allSoldItems.filter((item) => isDateInRange(item.orderDate, dateRange));

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      items = items.filter((item) => item.productName.toLowerCase().includes(query) || item.orderId.toLowerCase().includes(query));
    }

    if (sortCategory) {
      items = items.filter((item) => item.category === sortCategory);
    }

    if (sortSize) {
      items = items.filter((item) => item.size === sortSize);
    }

    if (sortColor) {
      items = items.filter((item) => item.color === sortColor);
    }

    items.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.productName.localeCompare(b.productName);
        case "category":
          return a.category.localeCompare(b.category);
        case "size":
          return a.size.localeCompare(b.size);
        case "color":
          return a.color.localeCompare(b.color);
        case "quantity":
          return b.quantity - a.quantity;
        default:
          return 0;
      }
    });

    return items;
  }, [timePeriod, searchQuery, sortBy, sortCategory, sortSize, sortColor]);

  const filteredOrderCosts = useMemo(() => {
    const dateRange = getDateRange(timePeriod);
    return allOrderCosts.filter((order) => isDateInRange(order.orderDate, dateRange));
  }, [timePeriod]);

  const soldItemsTotals = useMemo(() => {
    return {
      totalQuantity: filteredSoldItems.reduce((sum, item) => sum + item.quantity, 0),
      totalAmount: filteredSoldItems.reduce((sum, item) => sum + item.totalAmount, 0),
      totalItems: filteredSoldItems.length,
    };
  }, [filteredSoldItems]);

  const costsTotals = useMemo(() => {
    return {
      totalProductCost: filteredOrderCosts.reduce((sum, order) => sum + order.productCost, 0),
      totalPrintCost: filteredOrderCosts.reduce((sum, order) => sum + order.printCost, 0),
      totalCost: filteredOrderCosts.reduce((sum, order) => sum + order.totalCost, 0),
      totalSales: filteredOrderCosts.reduce((sum, order) => sum + order.totalSaleAmount, 0),
      totalOrders: filteredOrderCosts.length,
    };
  }, [filteredOrderCosts]);

  const uniqueCategories = Array.from(new Set(allSoldItems.map((item) => item.category)));
  const uniqueSizes = Array.from(new Set(allSoldItems.map((item) => item.size)));
  const uniqueColors = Array.from(new Set(allSoldItems.map((item) => item.color)));

  return (
    <div className="space-y-3 h-full flex flex-col">
      {/* Header and Controls - Compact */}
      <div className="space-y-2">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-red-500">Reports</h1>
            <p className="text-xs text-gray-400 mt-1">View sales and cost analytics</p>
          </div>
        </div>

        {/* View Buttons and Time Period - Horizontal Layout */}
        <div className="flex gap-4 items-end">
          <div className="flex gap-2">
            <button onClick={() => setCurrentView("sold-items")} className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${currentView === "sold-items" ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}>
              📊 Sold Items
            </button>
            <button onClick={() => setCurrentView("costs")} className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${currentView === "costs" ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}>
              💰 Costs
            </button>
          </div>

          <div className="flex items-end gap-2">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-red-400">Time Period</label>
              <select value={timePeriod} onChange={(e) => setTimePeriod(e.target.value as TimePeriod)} className="px-3 py-1 bg-gray-700 border-2 border-red-600/30 text-white rounded text-sm focus:border-red-500 focus:outline-none">
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last Month</option>
                <option value="3months">Last 3 Months</option>
                <option value="12months">Last 12 Months</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {currentView === "sold-items" && (
        <div className="flex-1 flex flex-col min-h-0 space-y-2">
          {/* Search and Filters - Compact Two Row Layout */}
          <div className="space-y-2">
            {/* Search Bar */}
            <input type="text" placeholder="🔍 Search by product name or order ID..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full px-3 py-2 bg-gray-700 border-2 border-red-600/30 text-white placeholder-gray-500 rounded text-sm focus:border-red-500 focus:outline-none" />

            {/* Filters Grid - Compact */}
            <div className="grid grid-cols-5 gap-2">
              <div>
                <label className="block text-xs font-semibold text-red-400 mb-1">Sort By</label>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortBy)} className="w-full px-2 py-1 bg-gray-700 border border-gray-600 text-white rounded text-xs focus:border-red-500 focus:outline-none">
                  <option value="name">Name</option>
                  <option value="category">Category</option>
                  <option value="size">Size</option>
                  <option value="color">Color</option>
                  <option value="quantity">Qty ↓</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-red-400 mb-1">Category</label>
                <select value={sortCategory} onChange={(e) => setSortCategory(e.target.value)} className="w-full px-2 py-1 bg-gray-700 border border-gray-600 text-white rounded text-xs focus:border-red-500 focus:outline-none">
                  <option value="">All</option>
                  {uniqueCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-red-400 mb-1">Size</label>
                <select value={sortSize} onChange={(e) => setSortSize(e.target.value)} className="w-full px-2 py-1 bg-gray-700 border border-gray-600 text-white rounded text-xs focus:border-red-500 focus:outline-none">
                  <option value="">All</option>
                  {uniqueSizes.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-red-400 mb-1">Color</label>
                <select value={sortColor} onChange={(e) => setSortColor(e.target.value)} className="w-full px-2 py-1 bg-gray-700 border border-gray-600 text-white rounded text-xs focus:border-red-500 focus:outline-none">
                  <option value="">All</option>
                  {uniqueColors.map((color) => (
                    <option key={color} value={color}>
                      {color}
                    </option>
                  ))}
                </select>
              </div>

              {/* Totals - Show inline with filters */}
              <div className="flex gap-2 items-end">
                <div className="bg-red-900/40 border border-red-600/50 rounded px-2 py-1 text-center flex-1">
                  <p className="text-xs text-red-300 font-semibold">{soldItemsTotals.totalQuantity}</p>
                  <p className="text-xs text-red-400 font-semibold">Qty Sold</p>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Metrics - Inline */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-gray-700/50 border border-gray-600 rounded p-2">
              <p className="text-xs text-gray-400 font-semibold">Total Amount</p>
              <p className="text-lg font-bold text-green-400">Rs. {soldItemsTotals.totalAmount.toFixed(2)}</p>
            </div>
            <div className="bg-gray-700/50 border border-gray-600 rounded p-2">
              <p className="text-xs text-gray-400 font-semibold">Unique Products</p>
              <p className="text-lg font-bold text-blue-400">{soldItemsTotals.totalItems}</p>
            </div>
            <div className="bg-gray-700/50 border border-gray-600 rounded p-2">
              <p className="text-xs text-gray-400 font-semibold">Items Found</p>
              <p className="text-lg font-bold text-gray-300">{filteredSoldItems.length}</p>
            </div>
          </div>

          {/* Data Table - Takes remaining space */}
          <div className="flex-1 overflow-hidden flex flex-col bg-gray-800/50 border border-gray-700 rounded-lg">
            <div className="overflow-x-auto overflow-y-auto flex-1">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-gray-700/80 border-b-2 border-red-600 z-10">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-red-400">Product Name</th>
                    <th className="px-4 py-3 text-left font-semibold text-red-400">Category</th>
                    <th className="px-4 py-3 text-left font-semibold text-red-400">Size</th>
                    <th className="px-4 py-3 text-left font-semibold text-red-400">Color</th>
                    <th className="px-4 py-3 text-right font-semibold text-red-400">Qty</th>
                    <th className="px-4 py-3 text-right font-semibold text-red-400">Price (Rs.)</th>
                    <th className="px-4 py-3 text-right font-semibold text-red-400">Total (Rs.)</th>
                    <th className="px-4 py-3 text-left font-semibold text-red-400">Order ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredSoldItems.length > 0 ? (
                    filteredSoldItems.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-700/30 transition-colors">
                        <td className="px-4 py-3 text-gray-200">{item.productName}</td>
                        <td className="px-4 py-3 text-gray-400 capitalize">{item.category}</td>
                        <td className="px-4 py-3 text-gray-400">{item.size}</td>
                        <td className="px-4 py-3 text-gray-400">{item.color}</td>
                        <td className="px-4 py-3 text-right font-semibold text-gray-200">{item.quantity}</td>
                        <td className="px-4 py-3 text-right text-red-400">{item.price.toFixed(2)}</td>
                        <td className="px-4 py-3 text-right font-bold text-green-400">{item.totalAmount.toFixed(2)}</td>
                        <td className="px-4 py-3 text-gray-400 font-mono text-xs">{item.orderId}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                        No items found for the selected period and filters
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {currentView === "costs" && (
        <div className="flex-1 flex flex-col min-h-0 space-y-2">
          {/* Metrics Grid - Compact */}
          <div className="grid grid-cols-7 gap-2">
            <div className="bg-orange-900/40 border border-orange-600/50 rounded p-2">
              <p className="text-xs text-orange-300 font-semibold">Product Cost</p>
              <p className="text-sm font-bold text-orange-400">Rs. {(costsTotals.totalProductCost / 1000).toFixed(1)}K</p>
            </div>
            <div className="bg-purple-900/40 border border-purple-600/50 rounded p-2">
              <p className="text-xs text-purple-300 font-semibold">Print Cost</p>
              <p className="text-sm font-bold text-purple-400">Rs. {(costsTotals.totalPrintCost / 1000).toFixed(1)}K</p>
            </div>
            <div className="bg-red-900/40 border border-red-600/50 rounded p-2">
              <p className="text-xs text-red-300 font-semibold">Total Cost</p>
              <p className="text-sm font-bold text-red-400">Rs. {(costsTotals.totalCost / 1000).toFixed(1)}K</p>
            </div>
            <div className="bg-green-900/40 border border-green-600/50 rounded p-2">
              <p className="text-xs text-green-300 font-semibold">Total Sales</p>
              <p className="text-sm font-bold text-green-400">Rs. {(costsTotals.totalSales / 1000).toFixed(1)}K</p>
            </div>
            <div className="bg-blue-900/40 border border-blue-600/50 rounded p-2">
              <p className="text-xs text-blue-300 font-semibold">Profit</p>
              <p className={`text-sm font-bold ${(costsTotals.totalSales - costsTotals.totalCost) >= 0 ? "text-blue-400" : "text-red-400"}`}>
                Rs. {((costsTotals.totalSales - costsTotals.totalCost) / 1000).toFixed(1)}K
              </p>
            </div>
            <div className="bg-indigo-900/40 border border-indigo-600/50 rounded p-2">
              <p className="text-xs text-indigo-300 font-semibold">Margin</p>
              <p className="text-sm font-bold text-indigo-400">
                {costsTotals.totalSales > 0 ? (((costsTotals.totalSales - costsTotals.totalCost) / costsTotals.totalSales) * 100).toFixed(1) : "0"}%
              </p>
            </div>
            <div className="bg-cyan-900/40 border border-cyan-600/50 rounded p-2">
              <p className="text-xs text-cyan-300 font-semibold">Orders</p>
              <p className="text-sm font-bold text-cyan-400">{costsTotals.totalOrders}</p>
            </div>
          </div>

          {/* Data Table - Takes remaining space */}
          <div className="flex-1 overflow-hidden flex flex-col bg-gray-800/50 border border-gray-700 rounded-lg">
            <div className="overflow-x-auto overflow-y-auto flex-1">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-gray-700/80 border-b-2 border-red-600 z-10">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-red-400">Order ID</th>
                    <th className="px-4 py-3 text-left font-semibold text-red-400">Customer</th>
                    <th className="px-4 py-3 text-left font-semibold text-red-400">Order Date</th>
                    <th className="px-4 py-3 text-right font-semibold text-red-400">Items</th>
                    <th className="px-4 py-3 text-right font-semibold text-red-400">Product Cost (Rs.)</th>
                    <th className="px-4 py-3 text-right font-semibold text-red-400">Print Cost (Rs.)</th>
                    <th className="px-4 py-3 text-right font-semibold text-red-400">Total Cost (Rs.)</th>
                    <th className="px-4 py-3 text-right font-semibold text-red-400">Sale Amount (Rs.)</th>
                    <th className="px-4 py-3 text-right font-semibold text-red-400">Profit (Rs.)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredOrderCosts.length > 0 ? (
                    filteredOrderCosts.map((order) => {
                      const profit = order.totalSaleAmount - order.totalCost;
                      return (
                        <tr key={order.orderId} className="hover:bg-gray-700/30 transition-colors">
                          <td className="px-4 py-3 text-gray-200 font-mono font-semibold">{order.orderId}</td>
                          <td className="px-4 py-3 text-gray-400">{order.customerName}</td>
                          <td className="px-4 py-3 text-gray-400 text-sm">{order.orderDate}</td>
                          <td className="px-4 py-3 text-right font-semibold text-gray-200">{order.totalItems}</td>
                          <td className="px-4 py-3 text-right text-orange-400">{order.productCost.toFixed(2)}</td>
                          <td className="px-4 py-3 text-right text-purple-400">{order.printCost.toFixed(2)}</td>
                          <td className="px-4 py-3 text-right font-bold text-red-400">{order.totalCost.toFixed(2)}</td>
                          <td className="px-4 py-3 text-right font-bold text-green-400">{order.totalSaleAmount.toFixed(2)}</td>
                          <td className={`px-4 py-3 text-right font-bold ${profit >= 0 ? "text-green-400" : "text-red-400"}`}>{profit.toFixed(2)}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={9} className="px-4 py-8 text-center text-gray-400">
                        No orders found for the selected period
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
