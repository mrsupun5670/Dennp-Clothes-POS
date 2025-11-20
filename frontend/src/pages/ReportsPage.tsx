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

  const allSoldItems: SoldItem[] = [
    { id: "SI001", productName: "Cotton Crew Neck T-Shirt", category: "tshirt", size: "M", color: "Black", quantity: 5, price: 1250, totalAmount: 6250, orderId: "ORD001", orderDate: "2024-11-20" },
    { id: "SI002", productName: "Cotton Crew Neck T-Shirt", category: "tshirt", size: "L", color: "White", quantity: 3, price: 1250, totalAmount: 3750, orderId: "ORD001", orderDate: "2024-11-20" },
    { id: "SI003", productName: "Jeans Premium", category: "trouser", size: "32", color: "Blue", quantity: 2, price: 2500, totalAmount: 5000, orderId: "ORD002", orderDate: "2024-11-20" },
    { id: "SI004", productName: "Cotton Crew Neck T-Shirt", category: "tshirt", size: "M", color: "Blue", quantity: 4, price: 1250, totalAmount: 5000, orderId: "ORD003", orderDate: "2024-11-19" },
    { id: "SI005", productName: "Formal Shirt", category: "shirt", size: "16", color: "White", quantity: 2, price: 1800, totalAmount: 3600, orderId: "ORD004", orderDate: "2024-11-18" },
    { id: "SI006", productName: "Casual Dress", category: "dress", size: "S", color: "Red", quantity: 1, price: 3500, totalAmount: 3500, orderId: "ORD005", orderDate: "2024-11-17" },
    { id: "SI007", productName: "Winter Jacket", category: "jacket", size: "L", color: "Navy", quantity: 2, price: 4500, totalAmount: 9000, orderId: "ORD006", orderDate: "2024-11-16" },
  ];

  const allOrderCosts: OrderCost[] = [
    { orderId: "ORD001", orderDate: "2024-11-20", customerName: "John Doe", productCost: 12000, printCost: 2000, totalCost: 14000, totalItems: 8, totalSaleAmount: 10000 },
    { orderId: "ORD002", orderDate: "2024-11-20", customerName: "Sarah Smith", productCost: 5000, printCost: 1500, totalCost: 6500, totalItems: 2, totalSaleAmount: 5000 },
    { orderId: "ORD003", orderDate: "2024-11-19", customerName: "Ahmed Khan", productCost: 5000, printCost: 800, totalCost: 5800, totalItems: 4, totalSaleAmount: 5000 },
    { orderId: "ORD004", orderDate: "2024-11-18", customerName: "Priya Jayasooriya", productCost: 3600, printCost: 500, totalCost: 4100, totalItems: 2, totalSaleAmount: 3600 },
    { orderId: "ORD005", orderDate: "2024-11-17", customerName: "Lakshmi Fernando", productCost: 3500, printCost: 600, totalCost: 4100, totalItems: 1, totalSaleAmount: 3500 },
    { orderId: "ORD006", orderDate: "2024-11-16", customerName: "Roshan Perera", productCost: 9000, printCost: 1200, totalCost: 10200, totalItems: 2, totalSaleAmount: 9000 },
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
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-red-500">Reports</h1>
          <p className="text-gray-400 mt-2">View sales and cost analytics</p>
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={() => setCurrentView("sold-items")} className={`px-6 py-3 rounded-lg font-semibold transition-colors ${currentView === "sold-items" ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}>
          📊 Sold Items
        </button>
        <button onClick={() => setCurrentView("costs")} className={`px-6 py-3 rounded-lg font-semibold transition-colors ${currentView === "costs" ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}>
          💰 Costs
        </button>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-semibold text-red-400">Time Period</label>
        <select value={timePeriod} onChange={(e) => setTimePeriod(e.target.value as TimePeriod)} className="px-4 py-2 bg-gray-700 border-2 border-red-600/30 text-white rounded-lg focus:border-red-500 focus:outline-none">
          <option value="today">Today</option>
          <option value="week">Last 7 Days</option>
          <option value="month">Last Month</option>
          <option value="3months">Last 3 Months</option>
          <option value="12months">Last 12 Months</option>
        </select>
      </div>

      {currentView === "sold-items" && (
        <div className="flex-1 flex flex-col min-h-0 space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-red-400">Search Items</label>
            <input type="text" placeholder="Search by product name or order ID..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full px-4 py-2 bg-gray-700 border-2 border-red-600/30 text-white placeholder-gray-500 rounded-lg focus:border-red-500 focus:outline-none" />
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-red-400">Sort By</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortBy)} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded text-sm focus:border-red-500 focus:outline-none">
                <option value="name">Name</option>
                <option value="category">Category</option>
                <option value="size">Size</option>
                <option value="color">Color</option>
                <option value="quantity">Quantity (High to Low)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-red-400">Category</label>
              <select value={sortCategory} onChange={(e) => setSortCategory(e.target.value)} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded text-sm focus:border-red-500 focus:outline-none">
                <option value="">All Categories</option>
                {uniqueCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-red-400">Size</label>
              <select value={sortSize} onChange={(e) => setSortSize(e.target.value)} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded text-sm focus:border-red-500 focus:outline-none">
                <option value="">All Sizes</option>
                {uniqueSizes.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-red-400">Color</label>
              <select value={sortColor} onChange={(e) => setSortColor(e.target.value)} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded text-sm focus:border-red-500 focus:outline-none">
                <option value="">All Colors</option>
                {uniqueColors.map((color) => (
                  <option key={color} value={color}>
                    {color}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-3">
              <p className="text-xs text-gray-400 font-semibold">Total Quantity Sold</p>
              <p className="text-2xl font-bold text-red-400 mt-1">{soldItemsTotals.totalQuantity}</p>
            </div>
            <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-3">
              <p className="text-xs text-gray-400 font-semibold">Total Amount</p>
              <p className="text-2xl font-bold text-green-400 mt-1">Rs. {soldItemsTotals.totalAmount.toFixed(2)}</p>
            </div>
            <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-3">
              <p className="text-xs text-gray-400 font-semibold">Unique Products</p>
              <p className="text-2xl font-bold text-blue-400 mt-1">{soldItemsTotals.totalItems}</p>
            </div>
          </div>

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
        <div className="flex-1 flex flex-col min-h-0 space-y-4">
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-3">
              <p className="text-xs text-gray-400 font-semibold">Total Product Cost</p>
              <p className="text-2xl font-bold text-orange-400 mt-1">Rs. {costsTotals.totalProductCost.toFixed(2)}</p>
            </div>
            <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-3">
              <p className="text-xs text-gray-400 font-semibold">Total Print Cost</p>
              <p className="text-2xl font-bold text-purple-400 mt-1">Rs. {costsTotals.totalPrintCost.toFixed(2)}</p>
            </div>
            <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-3">
              <p className="text-xs text-gray-400 font-semibold">Total Cost</p>
              <p className="text-2xl font-bold text-red-400 mt-1">Rs. {costsTotals.totalCost.toFixed(2)}</p>
            </div>
            <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-3">
              <p className="text-xs text-gray-400 font-semibold">Total Sales</p>
              <p className="text-2xl font-bold text-green-400 mt-1">Rs. {costsTotals.totalSales.toFixed(2)}</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-900/30 to-blue-800/30 border border-blue-600/30 rounded-lg p-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-blue-300 font-semibold">Total Profit</p>
                <p className="text-3xl font-bold text-blue-400 mt-1">Rs. {(costsTotals.totalSales - costsTotals.totalCost).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-blue-300 font-semibold">Profit Margin</p>
                <p className="text-3xl font-bold text-blue-400 mt-1">{costsTotals.totalSales > 0 ? (((costsTotals.totalSales - costsTotals.totalCost) / costsTotals.totalSales) * 100).toFixed(2) : "0"}%</p>
              </div>
              <div>
                <p className="text-sm text-blue-300 font-semibold">Orders</p>
                <p className="text-3xl font-bold text-blue-400 mt-1">{costsTotals.totalOrders}</p>
              </div>
            </div>
          </div>

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
