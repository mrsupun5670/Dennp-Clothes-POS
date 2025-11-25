import React, { useState, useMemo, useEffect } from "react";
import { useShop } from "../context/ShopContext";
import {
  getSalesAnalysis,
  getTopSellingItems,
  getTopCustomers,
  getSalesMetrics,
  SalesAnalysisData,
  TopSellingItem,
  TopCustomer,
  SalesMetrics,
} from "../services/analyticsService";

const AnalyticsPage: React.FC = () => {
  const { shopId: contextShopId } = useShop();
  const shopId = contextShopId || 1;

  const [selectedPeriod, setSelectedPeriod] = useState<"today" | "thisWeek" | "thisMonth">("thisWeek");
  const [loading, setLoading] = useState(false);
  const [salesData, setSalesData] = useState<SalesAnalysisData[]>([]);
  const [topItems, setTopItems] = useState<TopSellingItem[]>([]);
  const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([]);
  const [metrics, setMetrics] = useState<SalesMetrics | null>(null);

  // Get date range based on selected period
  const getDateRange = () => {
    const today = new Date();
    let startDate: Date;

    switch (selectedPeriod) {
      case "today":
        startDate = new Date(today);
        startDate.setHours(0, 0, 0, 0);
        return {
          start: startDate.toISOString().split("T")[0],
          end: today.toISOString().split("T")[0],
        };
      case "thisWeek":
        startDate = new Date(today);
        startDate.setDate(today.getDate() - today.getDay());
        return {
          start: startDate.toISOString().split("T")[0],
          end: today.toISOString().split("T")[0],
        };
      case "thisMonth":
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        return {
          start: startDate.toISOString().split("T")[0],
          end: today.toISOString().split("T")[0],
        };
    }
  };

  // Load analytics data
  useEffect(() => {
    const loadAnalyticsData = async () => {
      try {
        setLoading(true);
        const dateRange = getDateRange();

        const [salesAnalysisData, topItemsData, topCustomersData, metricsData] = await Promise.all([
          getSalesAnalysis(shopId, dateRange.start, dateRange.end),
          getTopSellingItems(shopId, dateRange.start, dateRange.end, 10),
          getTopCustomers(shopId, 5),
          getSalesMetrics(shopId, dateRange.start, dateRange.end),
        ]);

        setSalesData(salesAnalysisData);
        setTopItems(topItemsData);
        setTopCustomers(topCustomersData);
        setMetrics(metricsData);
      } catch (error) {
        console.error("Error loading analytics data:", error);
        setSalesData([]);
        setTopItems([]);
        setTopCustomers([]);
        setMetrics(null);
      } finally {
        setLoading(false);
      }
    };

    loadAnalyticsData();
  }, [selectedPeriod, shopId]);

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

  const totals = useMemo(() => {
    if (!metrics) {
      return {
        totalSales: 0,
        totalCost: 0,
        totalProfit: 0,
        avgDaily: 0,
        profitMargin: 0,
      };
    }
    return {
      totalSales: metrics.totalSales,
      totalCost: metrics.totalCost,
      totalProfit: metrics.totalProfit,
      avgDaily: metrics.avgDaily,
      profitMargin: metrics.profitMargin,
    };
  }, [metrics]);

  // Handle loading state
  if (loading && salesData.length === 0) {
    return (
      <div className="space-y-6 h-full flex flex-col items-center justify-center">
        <div className="text-gray-400">Loading analytics data...</div>
      </div>
    );
  }

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
                <p className="text-2xl font-bold text-blue-400">Rs. {Math.round(totals.totalSales).toLocaleString()}</p>
                <p className="text-xs text-gray-400 mt-2">Revenue generated</p>
              </div>

              <div className="bg-gradient-to-br from-red-900/30 to-red-800/20 border border-red-600/30 rounded-lg p-4">
                <p className="text-xs text-red-400 font-semibold mb-1">Total Cost</p>
                <p className="text-2xl font-bold text-red-400">Rs. {Math.round(totals.totalCost).toLocaleString()}</p>
                <p className="text-xs text-gray-400 mt-2">Cost of goods</p>
              </div>

              <div className="bg-gradient-to-br from-green-900/30 to-green-800/20 border border-green-600/30 rounded-lg p-4">
                <p className="text-xs text-green-400 font-semibold mb-1">Total Profit</p>
                <p className="text-2xl font-bold text-green-400">Rs. {Math.round(totals.totalProfit).toLocaleString()}</p>
                <p className="text-xs text-gray-400 mt-2">{totals.profitMargin.toFixed(1)}% margin</p>
              </div>

              <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 border border-purple-600/30 rounded-lg p-4">
                <p className="text-xs text-purple-400 font-semibold mb-1">Avg Daily</p>
                <p className="text-2xl font-bold text-purple-400">Rs. {Math.round(totals.avgDaily).toLocaleString()}</p>
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
                    <span>{salesData.length > 0 ? (Math.max(...salesData.map((d) => d.sales)) / 1000).toFixed(1) : 0}k</span>
                    <span>{salesData.length > 0 ? ((Math.max(...salesData.map((d) => d.sales)) * 0.75) / 1000).toFixed(1) : 0}k</span>
                    <span>{salesData.length > 0 ? ((Math.max(...salesData.map((d) => d.sales)) * 0.5) / 1000).toFixed(1) : 0}k</span>
                    <span>{salesData.length > 0 ? ((Math.max(...salesData.map((d) => d.sales)) * 0.25) / 1000).toFixed(1) : 0}k</span>
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
                    {salesData.length > 0 && (
                      <polyline
                        points={salesData
                          .map((data, index) => {
                            const maxSales = Math.max(...salesData.map((d) => d.sales));
                            const x = (index / (salesData.length - 1)) * 100;
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
                    {salesData.length > 0 && (
                      <polyline
                        points={salesData
                          .map((data, index) => {
                            const maxSales = Math.max(...salesData.map((d) => d.sales));
                            const x = (index / (salesData.length - 1)) * 100;
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
                    {salesData.length > 0 && (
                      <polyline
                        points={salesData
                          .map((data, index) => {
                            const maxSales = Math.max(...salesData.map((d) => d.sales));
                            const x = (index / (salesData.length - 1)) * 100;
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
                    {salesData.map((data, index) => {
                      const maxSales = Math.max(...salesData.map((d) => d.sales));
                      const x = (index / (salesData.length - 1)) * 100;
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
                    {salesData.map((data, index) => {
                      const maxSales = Math.max(...salesData.map((d) => d.sales));
                      const x = (index / (salesData.length - 1)) * 100;
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
                    {salesData.map((data, index) => {
                      const maxSales = Math.max(...salesData.map((d) => d.sales));
                      const x = (index / (salesData.length - 1)) * 100;
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
                </div>

                {/* Legend */}
                <div className="flex gap-6 justify-center mt-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-gray-300">Sales Revenue</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    <span className="text-gray-300">Cost of Goods</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-gray-300">Profit</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Key Insights */}
          <div className="lg:col-span-1 space-y-6 flex flex-col min-h-0">
            {/* Key Insights */}
            <div className="bg-gradient-to-br from-yellow-900/30 to-yellow-800/20 border border-yellow-600/30 rounded-lg p-6">
              <h3 className="text-lg font-bold text-yellow-400 mb-4">Key Insights</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Profit Margin</p>
                  <p className="text-2xl font-bold text-yellow-400">{totals.profitMargin.toFixed(1)}%</p>
                </div>
                <div className="border-t border-yellow-600/20 pt-3">
                  <p className="text-xs text-gray-400 mb-1">Days in Period</p>
                  <p className="text-2xl font-bold text-yellow-400">{metrics?.daysInPeriod || 0}</p>
                </div>
                {metrics?.bestDay && (
                  <div className="border-t border-yellow-600/20 pt-3">
                    <p className="text-xs text-gray-400 mb-1">Best Day Sales</p>
                    <p className="text-lg font-bold text-yellow-400">Rs. {Math.round(metrics.bestDay.sales).toLocaleString()}</p>
                    <p className="text-xs text-gray-500">{metrics.bestDay.date}</p>
                  </div>
                )}
                {metrics?.worstDay && (
                  <div className="border-t border-yellow-600/20 pt-3">
                    <p className="text-xs text-gray-400 mb-1">Worst Day Sales</p>
                    <p className="text-lg font-bold text-yellow-400">Rs. {Math.round(metrics.worstDay.sales).toLocaleString()}</p>
                    <p className="text-xs text-gray-500">{metrics.worstDay.date}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Performance Card */}
            <div className="bg-gradient-to-br from-gray-700/30 to-gray-600/20 border border-gray-600/30 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-300 mb-4">Performance</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <p className="text-xs text-gray-400">Sales Target</p>
                    <p className="text-xs text-gray-400">80%</p>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: "80%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <p className="text-xs text-gray-400">Profit Target</p>
                    <p className="text-xs text-gray-400">40%</p>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: "40%" }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section - Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Top Selling Items Table */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-bold text-red-500 mb-4">Top Selling Items</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-700">
                  <tr>
                    <th className="text-left py-2 px-2 text-gray-400">#</th>
                    <th className="text-left py-2 px-2 text-gray-400">Product</th>
                    <th className="text-center py-2 px-2 text-gray-400">Units</th>
                    <th className="text-right py-2 px-2 text-gray-400">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {topItems.map((item) => (
                    <tr key={item.rank} className="border-b border-gray-700/50 hover:bg-gray-700/20">
                      <td className="py-3 px-2 text-gray-300 font-semibold">{item.rank}</td>
                      <td className="py-3 px-2">
                        <div>
                          <p className="text-gray-300">{item.productName}</p>
                          <p className="text-xs text-gray-500">{item.productCode}</p>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-center text-gray-300">{item.unitsSold}</td>
                      <td className="py-3 px-2 text-right text-green-400 font-semibold">
                        Rs. {Math.round(item.revenue).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Customers Table */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-bold text-red-500 mb-4">Top Customers</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-700">
                  <tr>
                    <th className="text-left py-2 px-2 text-gray-400">#</th>
                    <th className="text-left py-2 px-2 text-gray-400">Customer</th>
                    <th className="text-center py-2 px-2 text-gray-400">Orders</th>
                    <th className="text-right py-2 px-2 text-gray-400">Total Spent</th>
                  </tr>
                </thead>
                <tbody>
                  {topCustomers.map((customer) => (
                    <tr key={customer.rank} className="border-b border-gray-700/50 hover:bg-gray-700/20">
                      <td className="py-3 px-2 text-gray-300 font-semibold">{customer.rank}</td>
                      <td className="py-3 px-2">
                        <div>
                          <p className="text-gray-300">{customer.customerName}</p>
                          <p className="text-xs text-gray-500">ID: {customer.customerId}</p>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-center text-gray-300">{customer.orders}</td>
                      <td className="py-3 px-2 text-right text-green-400 font-semibold">
                        Rs. {Math.round(customer.totalSpent).toLocaleString()}
                      </td>
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
