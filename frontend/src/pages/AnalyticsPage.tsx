import React, { useState, useMemo } from "react";

interface TopItem {
  rank: number;
  productCode: string;
  productName: string;
  unitsSold: number;
  revenue: number;
}

interface TopCustomer {
  rank: number;
  customerId: string;
  customerName: string;
  totalSpent: number;
  orders: number;
}

// Sample sales data for analytics
const SAMPLE_SALES_DATA = {
  today: [
    { date: "2024-11-17", sales: 45000, cost: 22500, profit: 22500 },
  ],
  thisWeek: [
    { date: "2024-11-11", sales: 35000, cost: 17500, profit: 17500 },
    { date: "2024-11-12", sales: 42000, cost: 21000, profit: 21000 },
    { date: "2024-11-13", sales: 38000, cost: 19000, profit: 19000 },
    { date: "2024-11-14", sales: 48000, cost: 24000, profit: 24000 },
    { date: "2024-11-15", sales: 52000, cost: 26000, profit: 26000 },
    { date: "2024-11-16", sales: 39000, cost: 19500, profit: 19500 },
    { date: "2024-11-17", sales: 45000, cost: 22500, profit: 22500 },
  ],
  thisMonth: [
    { date: "2024-11-01", sales: 38000, cost: 19000, profit: 19000 },
    { date: "2024-11-02", sales: 42000, cost: 21000, profit: 21000 },
    { date: "2024-11-03", sales: 45000, cost: 22500, profit: 22500 },
    { date: "2024-11-04", sales: 40000, cost: 20000, profit: 20000 },
    { date: "2024-11-05", sales: 48000, cost: 24000, profit: 24000 },
    { date: "2024-11-06", sales: 52000, cost: 26000, profit: 26000 },
    { date: "2024-11-07", sales: 41000, cost: 20500, profit: 20500 },
    { date: "2024-11-08", sales: 39000, cost: 19500, profit: 19500 },
    { date: "2024-11-09", sales: 46000, cost: 23000, profit: 23000 },
    { date: "2024-11-10", sales: 50000, cost: 25000, profit: 25000 },
    { date: "2024-11-11", sales: 35000, cost: 17500, profit: 17500 },
    { date: "2024-11-12", sales: 42000, cost: 21000, profit: 21000 },
    { date: "2024-11-13", sales: 38000, cost: 19000, profit: 19000 },
    { date: "2024-11-14", sales: 48000, cost: 24000, profit: 24000 },
    { date: "2024-11-15", sales: 52000, cost: 26000, profit: 26000 },
    { date: "2024-11-16", sales: 39000, cost: 19500, profit: 19500 },
    { date: "2024-11-17", sales: 45000, cost: 22500, profit: 22500 },
  ],
};

const TOP_ITEMS_THIS_WEEK: TopItem[] = [
  { rank: 1, productCode: "TSH-KN01", productName: "Cotton Crew Neck T-Shirt", unitsSold: 156, revenue: 195000 },
  { rank: 2, productCode: "SHT-OX01", productName: "Oxford Formal Shirt", unitsSold: 89, revenue: 249200 },
  { rank: 3, productCode: "TRS-FR01", productName: "Formal Trousers", unitsSold: 67, revenue: 234500 },
  { rank: 4, productCode: "CRP-SU01", productName: "Summer Crop Top", unitsSold: 124, revenue: 204600 },
  { rank: 5, productCode: "DRS-EV01", productName: "Evening Saree Blouse", unitsSold: 95, revenue: 209000 },
  { rank: 6, productCode: "JKT-CB01", productName: "Casual Blazer", unitsSold: 43, revenue: 180600 },
  { rank: 7, productCode: "TSH-KN02", productName: "Premium Cotton T-Shirt", unitsSold: 78, revenue: 156000 },
  { rank: 8, productCode: "SHT-OX02", productName: "Linen Formal Shirt", unitsSold: 56, revenue: 168000 },
  { rank: 9, productCode: "TRS-CS01", productName: "Casual Trousers", unitsSold: 72, revenue: 216000 },
  { rank: 10, productCode: "DRS-EV02", productName: "Casual Blouse", unitsSold: 61, revenue: 158600 },
];

const TOP_CUSTOMERS: TopCustomer[] = [
  { rank: 1, customerId: "C004", customerName: "Lakshmi Fernando", totalSpent: 52000, orders: 14 },
  { rank: 2, customerId: "C001", customerName: "Roshan Perera", totalSpent: 45000, orders: 12 },
  { rank: 3, customerId: "C005", customerName: "Arjun Wickramasinghe", totalSpent: 38500, orders: 9 },
  { rank: 4, customerId: "C002", customerName: "Priya Jayasooriya", totalSpent: 32500, orders: 8 },
  { rank: 5, customerId: "C003", customerName: "Kamal Silva", totalSpent: 28750, orders: 6 },
];

const AnalyticsPage: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<"today" | "thisWeek" | "thisMonth">("thisWeek");

  // Get data for selected period
  const currentData = useMemo(() => {
    return SAMPLE_SALES_DATA[selectedPeriod];
  }, [selectedPeriod]);

  // Calculate totals
  const totals = useMemo(() => {
    const totalSales = currentData.reduce((sum, item) => sum + item.sales, 0);
    const totalCost = currentData.reduce((sum, item) => sum + item.cost, 0);
    const totalProfit = currentData.reduce((sum, item) => sum + item.profit, 0);
    const avgDaily = Math.round(totalSales / currentData.length);

    return {
      totalSales,
      totalCost,
      totalProfit,
      avgDaily,
      profitMargin: totalSales > 0 ? ((totalProfit / totalSales) * 100).toFixed(1) : 0,
    };
  }, [currentData]);

  // Get period label
  const getPeriodLabel = () => {
    switch (selectedPeriod) {
      case "today":
        return "Today";
      case "thisWeek":
        return "This Week";
      case "thisMonth":
        return "This Month";
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-red-500">Analytics</h1>
          <span className="text-sm font-semibold text-red-400 bg-red-900/30 px-3 py-1 rounded-full">
            {getPeriodLabel()}
          </span>
        </div>
        <p className="text-gray-400 mt-2">Track sales performance and business insights</p>
      </div>

      {/* Period Selection */}
      <div className="flex gap-3 flex-shrink-0">
        <button
          onClick={() => setSelectedPeriod("today")}
          className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
            selectedPeriod === "today"
              ? "bg-red-600 text-white"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
        >
          Today
        </button>
        <button
          onClick={() => setSelectedPeriod("thisWeek")}
          className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
            selectedPeriod === "thisWeek"
              ? "bg-red-600 text-white"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
        >
          This Week
        </button>
        <button
          onClick={() => setSelectedPeriod("thisMonth")}
          className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
            selectedPeriod === "thisMonth"
              ? "bg-red-600 text-white"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
        >
          This Month
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Side - Metrics & Chart */}
        <div className="lg:col-span-3 space-y-6 flex flex-col min-h-0">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 border border-blue-600/30 rounded-lg p-4">
              <p className="text-xs text-blue-400 font-semibold mb-1">Total Sales</p>
              <p className="text-2xl font-bold text-blue-400">Rs. {totals.totalSales.toLocaleString()}</p>
              <p className="text-xs text-gray-400 mt-2">Revenue generated</p>
            </div>

            <div className="bg-gradient-to-br from-red-900/30 to-red-800/20 border border-red-600/30 rounded-lg p-4">
              <p className="text-xs text-red-400 font-semibold mb-1">Total Cost</p>
              <p className="text-2xl font-bold text-red-400">Rs. {totals.totalCost.toLocaleString()}</p>
              <p className="text-xs text-gray-400 mt-2">Cost of goods</p>
            </div>

            <div className="bg-gradient-to-br from-green-900/30 to-green-800/20 border border-green-600/30 rounded-lg p-4">
              <p className="text-xs text-green-400 font-semibold mb-1">Total Profit</p>
              <p className="text-2xl font-bold text-green-400">Rs. {totals.totalProfit.toLocaleString()}</p>
              <p className="text-xs text-gray-400 mt-2">{totals.profitMargin}% margin</p>
            </div>

            <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 border border-purple-600/30 rounded-lg p-4">
              <p className="text-xs text-purple-400 font-semibold mb-1">Avg Daily</p>
              <p className="text-2xl font-bold text-purple-400">Rs. {totals.avgDaily.toLocaleString()}</p>
              <p className="text-xs text-gray-400 mt-2">Per day average</p>
            </div>
          </div>

          {/* Sales Chart (Multi-line Graph) */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 flex-1 flex flex-col min-h-0">
            <h2 className="text-lg font-bold text-red-500 mb-4">Sales Analysis</h2>

            <div className="flex-1 flex flex-col justify-between min-h-0">
              {/* Line Graph */}
              <div className="flex items-end justify-between gap-1 h-64 relative">
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-400 w-12">
                  <span>{Math.max(...currentData.map((d) => d.sales)) / 1000}k</span>
                  <span>{(Math.max(...currentData.map((d) => d.sales)) * 0.75) / 1000}k</span>
                  <span>{(Math.max(...currentData.map((d) => d.sales)) * 0.5) / 1000}k</span>
                  <span>{(Math.max(...currentData.map((d) => d.sales)) * 0.25) / 1000}k</span>
                  <span>0</span>
                </div>

                {/* Grid lines and data points */}
                <svg className="absolute inset-0 w-full h-64" viewBox="0 0 100 256" preserveAspectRatio="none">
                  {/* Horizontal grid lines */}
                  {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
                    <line
                      key={`grid-${i}`}
                      x1="0"
                      y1={`${(1 - ratio) * 256}`}
                      x2="100%"
                      y2={`${(1 - ratio) * 256}`}
                      stroke="#374151"
                      strokeDasharray="4"
                      strokeWidth="1"
                    />
                  ))}

                  {/* Sales line */}
                  {currentData.length > 0 && (
                    <polyline
                      points={currentData
                        .map((data, index) => {
                          const maxSales = Math.max(...currentData.map((d) => d.sales));
                          const x = (index / (currentData.length - 1)) * 100;
                          const y = (1 - data.sales / maxSales) * 256;
                          return `${x},${y}`;
                        })
                        .join(" ")}
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}

                  {/* Cost line */}
                  {currentData.length > 0 && (
                    <polyline
                      points={currentData
                        .map((data, index) => {
                          const maxSales = Math.max(...currentData.map((d) => d.sales));
                          const x = (index / (currentData.length - 1)) * 100;
                          const y = (1 - data.cost / maxSales) * 256;
                          return `${x},${y}`;
                        })
                        .join(" ")}
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}

                  {/* Profit line */}
                  {currentData.length > 0 && (
                    <polyline
                      points={currentData
                        .map((data, index) => {
                          const maxSales = Math.max(...currentData.map((d) => d.sales));
                          const x = (index / (currentData.length - 1)) * 100;
                          const y = (1 - data.profit / maxSales) * 256;
                          return `${x},${y}`;
                        })
                        .join(" ")}
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}

                  {/* Sales data points */}
                  {currentData.map((data, index) => {
                    const maxSales = Math.max(...currentData.map((d) => d.sales));
                    const x = (index / (currentData.length - 1)) * 100;
                    const y = (1 - data.sales / maxSales) * 256;
                    return (
                      <circle
                        key={`sales-point-${index}`}
                        cx={x}
                        cy={y}
                        r="3"
                        fill="#ef4444"
                        stroke="#1f2937"
                        strokeWidth="1"
                      />
                    );
                  })}

                  {/* Cost data points */}
                  {currentData.map((data, index) => {
                    const maxSales = Math.max(...currentData.map((d) => d.sales));
                    const x = (index / (currentData.length - 1)) * 100;
                    const y = (1 - data.cost / maxSales) * 256;
                    return (
                      <circle
                        key={`cost-point-${index}`}
                        cx={x}
                        cy={y}
                        r="3"
                        fill="#f59e0b"
                        stroke="#1f2937"
                        strokeWidth="1"
                      />
                    );
                  })}

                  {/* Profit data points */}
                  {currentData.map((data, index) => {
                    const maxSales = Math.max(...currentData.map((d) => d.sales));
                    const x = (index / (currentData.length - 1)) * 100;
                    const y = (1 - data.profit / maxSales) * 256;
                    return (
                      <circle
                        key={`profit-point-${index}`}
                        cx={x}
                        cy={y}
                        r="3"
                        fill="#10b981"
                        stroke="#1f2937"
                        strokeWidth="1"
                      />
                    );
                  })}
                </svg>

                {/* Placeholder for proper layout */}
                <div className="w-full" />
              </div>

              {/* X-axis labels */}
              <div className="flex justify-between mt-4 pl-12">
                {currentData.map((data, index) => (
                  <div key={index} className="text-xs text-gray-400 text-center flex-1">
                    {data.date.split("-")[2]}
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="flex gap-6 mt-4 pt-4 border-t border-gray-700 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-xs text-gray-400">Sales Revenue</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                  <span className="text-xs text-gray-400">Cost of Goods</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                  <span className="text-xs text-gray-400">Profit</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Quick Stats */}
        <div className="space-y-6 flex flex-col min-h-0">
          {/* Key Insights Card */}
          <div className="bg-gradient-to-br from-yellow-900/30 to-yellow-800/20 border border-yellow-600/30 rounded-lg p-4">
            <h3 className="text-sm font-bold text-yellow-400 mb-3">Key Insights</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Profit Margin</span>
                <span className="font-semibold text-yellow-400">{totals.profitMargin}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Days in Period</span>
                <span className="font-semibold text-yellow-400">{currentData.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Best Day</span>
                <span className="font-semibold text-yellow-400">
                  Rs. {Math.max(...currentData.map((d) => d.sales)).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Worst Day</span>
                <span className="font-semibold text-yellow-400">
                  Rs. {Math.min(...currentData.map((d) => d.sales)).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Performance Badge */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <h3 className="text-sm font-bold text-red-400 mb-3">Performance</h3>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-400">Sales Target (80%)</span>
                  <span className="text-gray-300">85%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: "85%" }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-400">Profit Target (40%)</span>
                  <span className="text-gray-300">50%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: "50%" }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

        {/* Bottom Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Top Selling Items */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
          <h2 className="text-lg font-bold text-red-500 mb-4">Top 10 Selling Items (This Week)</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-700/50 border-b border-red-600">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold text-red-400">#</th>
                  <th className="px-3 py-2 text-left font-semibold text-red-400">Product</th>
                  <th className="px-3 py-2 text-right font-semibold text-red-400">Units</th>
                  <th className="px-3 py-2 text-right font-semibold text-red-400">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {TOP_ITEMS_THIS_WEEK.map((item) => (
                  <tr key={item.rank} className="hover:bg-gray-700/30 transition-colors">
                    <td className="px-3 py-2 text-gray-400 font-semibold">{item.rank}</td>
                    <td className="px-3 py-2">
                      <div className="text-gray-200 text-sm">{item.productName}</div>
                      <div className="text-gray-500 text-xs">{item.productCode}</div>
                    </td>
                    <td className="px-3 py-2 text-right text-gray-200 font-semibold">{item.unitsSold}</td>
                    <td className="px-3 py-2 text-right text-green-400 font-semibold">Rs. {item.revenue.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Customers */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
          <h2 className="text-lg font-bold text-red-500 mb-4">Top Spending Customers</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-700/50 border-b border-red-600">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold text-red-400">#</th>
                  <th className="px-3 py-2 text-left font-semibold text-red-400">Customer</th>
                  <th className="px-3 py-2 text-right font-semibold text-red-400">Total Spent</th>
                  <th className="px-3 py-2 text-right font-semibold text-red-400">Orders</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {TOP_CUSTOMERS.map((customer) => (
                  <tr key={customer.rank} className="hover:bg-gray-700/30 transition-colors">
                    <td className="px-3 py-2 text-gray-400 font-semibold">{customer.rank}</td>
                    <td className="px-3 py-2">
                      <div className="text-gray-200 text-sm">{customer.customerName}</div>
                      <div className="text-gray-500 text-xs">{customer.customerId}</div>
                    </td>
                    <td className="px-3 py-2 text-right text-blue-400 font-semibold">Rs. {customer.totalSpent.toLocaleString()}</td>
                    <td className="px-3 py-2 text-right text-gray-300">{customer.orders}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
