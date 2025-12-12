import React, { useState, useMemo, useEffect, useRef } from "react";
import { useShop } from "../context/ShopContext";
import { getSoldItems, getCostBreakdown, getCostDetails, getMultiPeriodBreakdown } from "../services/reportsService";
import type { SoldItem, CostBreakdown, CostDetails } from "../services/reportsService";
import { printContent, generateSalesReportHTML, generateProductCostsReportHTML, generateDeliveryCostsReportHTML, generateProfitsReportHTML } from "../utils/exportUtils";

type TimePeriod = "today" | "week" | "month" | "3months" | "12months" | "custom";
type ReportView = "sold-items" | "costs";
type SortBy = "name" | "category";

const ReportsPage: React.FC = () => {
  const { shopId: contextShopId } = useShop();
  const shopId = contextShopId || 1;

  const [currentView, setCurrentView] = useState<ReportView>("sold-items");
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("month");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("name");
  const [soldItems, setSoldItems] = useState<SoldItem[]>([]);
  const [costBreakdown, setCostBreakdown] = useState<CostBreakdown | null>(null);
  const [costDetails, setCostDetails] = useState<CostDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [customFromDate, setCustomFromDate] = useState<string>("");
  const [customToDate, setCustomToDate] = useState<string>("");

  // Use ref to prevent duplicate requests in strict mode
  const loadDataRef = useRef(false);

  // Get date range based on period
  const getDateRange = (period: TimePeriod) => {
    const today = new Date();
    let startDate = new Date();

    if (period === "custom") {
      // Use custom dates if provided
      if (customFromDate && customToDate) {
        return {
          startDate: customFromDate,
          endDate: customToDate,
        };
      }
      // Fall back to month if custom dates not set
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    } else {
      switch (period) {
        case "today":
          startDate = new Date(today);
          break;
        case "week":
          startDate.setDate(today.getDate() - 7);
          break;
        case "month":
          // Go back 30 days
          startDate.setDate(today.getDate() - 30);
          break;
        case "3months":
          // Go back 90 days
          startDate.setDate(today.getDate() - 90);
          break;
        case "12months":
          // Go back 365 days
          startDate.setDate(today.getDate() - 365);
          break;
      }
    }

    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(today);
    endDate.setHours(23, 59, 59, 999);

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    };
  };

  // Load data from API
  useEffect(() => {
    // Reset ref when dependencies change to allow new requests
    loadDataRef.current = false;
  }, [shopId, timePeriod, customFromDate, customToDate]);

  useEffect(() => {
    // Prevent duplicate requests in React Strict Mode
    if (loadDataRef.current) return;
    loadDataRef.current = true;

    const loadReportsData = async () => {
      try {
        setLoading(true);

        // If custom range is selected but no dates are chosen, show all items
        let startDate: string;
        let endDate: string;

        if (timePeriod === "custom" && (!customFromDate || !customToDate)) {
          // Show all data - use a wide date range
          startDate = "2000-01-01";
          endDate = new Date().toISOString().split('T')[0];
        } else {
          const dateRange = getDateRange(timePeriod);
          startDate = dateRange.startDate;
          endDate = dateRange.endDate;
        }

        const [items, breakdown, details] = await Promise.all([
          getSoldItems(shopId, startDate, endDate),
          getCostBreakdown(shopId, startDate, endDate),
          getCostDetails(shopId, startDate, endDate),
        ]);

        setSoldItems(items || []);
        setCostBreakdown(breakdown || null);
        setCostDetails(details || []);
      } catch (error) {
        console.error("Error loading reports data:", error);
        setSoldItems([]);
        setCostBreakdown(null);
        setCostDetails([]);
      } finally {
        setLoading(false);
      }
    };

    loadReportsData();
  }, [shopId, timePeriod, customFromDate, customToDate]);

  // Filter sold items by search
  const filteredSoldItems = useMemo(() => {
    let items = [...soldItems];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      items = items.filter(
        (item) =>
          item.productName.toLowerCase().includes(query) ||
          item.orderNumber.toLowerCase().includes(query)
      );
    }

    items.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.productName.localeCompare(b.productName);
        case "category":
          return a.productCode.localeCompare(b.productCode);
        default:
          return 0;
      }
    });

    return items;
  }, [soldItems, searchQuery, sortBy]);

  return (
    <div className="space-y-3 h-full flex flex-col">
      {/* Compact Single-Row Header - All controls in one line */}
      <div className="flex items-center gap-4">
        {/* Title */}
        <div className="flex-shrink-0">
          <h1 className="text-2xl font-bold text-red-500">Reports</h1>
        </div>

        {/* View Buttons (Sold Items / Costs Chips) */}
        <div className="flex gap-2">
          <button onClick={() => setCurrentView("sold-items")} className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${currentView === "sold-items" ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}>
            📊 Sold Items
          </button>
          <button onClick={() => setCurrentView("costs")} className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${currentView === "costs" ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}>
            💰 Costs
          </button>
        </div>

        {/* Time Period */}
        <div className="flex items-center gap-2">
          <select value={timePeriod} onChange={(e) => setTimePeriod(e.target.value as TimePeriod)} className="px-3 py-2 bg-gray-700 border-2 border-red-600/30 text-white rounded text-sm focus:border-red-500 focus:outline-none">
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last Month</option>
            <option value="3months">Last 3 Months</option>
            <option value="12months">Last 12 Months</option>
            <option value="custom">Custom Range</option>
          </select>

          {/* Custom Date Range - Inline */}
          {timePeriod === "custom" && (
            <>
              <input
                type="date"
                value={customFromDate}
                onChange={(e) => setCustomFromDate(e.target.value)}
                className="px-3 py-2 bg-gray-700 border-2 border-red-600/30 text-white rounded text-sm focus:border-red-500 focus:outline-none"
                placeholder="From"
              />
              <input
                type="date"
                value={customToDate}
                onChange={(e) => setCustomToDate(e.target.value)}
                className="px-3 py-2 bg-gray-700 border-2 border-red-600/30 text-white rounded text-sm focus:border-red-500 focus:outline-none"
                placeholder="To"
              />
            </>
          )}
        </div>

        {/* Print Buttons */}
        <div className="flex gap-2">
          {currentView === "sold-items" && (
            <button
              onClick={() => {
                const html = generateSalesReportHTML(filteredSoldItems);
                printContent(html, 'Sales Report');
              }}
              className="bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700 transition-colors font-semibold flex items-center gap-1"
              title="Print Sales Report"
            >
              🖨️ Print
            </button>
          )}
          {currentView === "costs" && (
            <>
              <button
                onClick={() => {
                  const html = generateProductCostsReportHTML(costBreakdown || {});
                  printContent(html, 'Product Costs Report');
                }}
                className="bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700 transition-colors font-semibold"
                title="Print Product Costs"
              >
                🖨️ P.Costs
              </button>
              <button
                onClick={() => {
                  const html = generateDeliveryCostsReportHTML(costBreakdown || {});
                  printContent(html, 'Delivery Costs Report');
                }}
                className="bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700 transition-colors font-semibold"
                title="Print Delivery Costs"
              >
                🖨️ D.Costs
              </button>
              <button
                onClick={() => {
                  const html = generateProfitsReportHTML(costBreakdown || {});
                  printContent(html, 'Profits Report');
                }}
                className="bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700 transition-colors font-semibold"
                title="Print Profits"
              >
                🖨️ Profits
              </button>
            </>
          )}
        </div>

        {/* Search Bar - Only show for Sold Items view */}
        {currentView === "sold-items" && (
          <input
            type="text"
            placeholder="🔍 Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-3 py-2 bg-gray-700 border-2 border-red-600/30 text-white placeholder-gray-500 rounded text-sm focus:border-red-500 focus:outline-none"
          />
        )}
      </div>

      {currentView === "sold-items" && (
        <div className="flex-1 flex flex-col min-h-0 space-y-2">
          {loading ? (
            <div className="flex-1 flex items-center justify-center bg-gray-800/50 border border-gray-700 rounded-lg">
              <p className="text-gray-400 text-lg">Loading sold items data...</p>
            </div>
          ) : (
            <>
              {/* Summary Metrics */}
              <div className="grid grid-cols-4 gap-2">
                <div className="bg-green-900/40 border border-green-600/50 rounded p-2">
                  <p className="text-xs text-green-300 font-semibold">Total Revenue</p>
                  <p className="text-lg font-bold text-green-400">
                    Rs. {filteredSoldItems.reduce((sum, item) => sum + parseFloat(String(item.totalPrice)), 0).toFixed(2)}
                  </p>
                </div>
                <div className="bg-blue-900/40 border border-blue-600/50 rounded p-2">
                  <p className="text-xs text-blue-300 font-semibold">Items Sold</p>
                  <p className="text-lg font-bold text-blue-400">
                    {filteredSoldItems.reduce((sum, item) => sum + (item.quantity || 0), 0)}
                  </p>
                </div>
                <div className="bg-orange-900/40 border border-orange-600/50 rounded p-2">
                  <p className="text-xs text-orange-300 font-semibold">Total Costs</p>
                  <p className="text-lg font-bold text-orange-400">
                    Rs. {filteredSoldItems.reduce((sum, item) => sum + parseFloat(String(item.totalCost)), 0).toFixed(2)}
                  </p>
                </div>
                <div className="bg-purple-900/40 border border-purple-600/50 rounded p-2">
                  <p className="text-xs text-purple-300 font-semibold">Total Profit</p>
                  <p className="text-lg font-bold text-purple-400">
                    Rs. {filteredSoldItems.reduce((sum, item) => sum + parseFloat(String(item.profit)), 0).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Data Table - Takes remaining space */}
              <div className="flex-1 overflow-hidden flex flex-col bg-gray-800/50 border border-gray-700 rounded-lg">
                <div className="overflow-x-auto overflow-y-auto flex-1">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-gray-700/80 border-b-2 border-red-600 z-10">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-red-400">Product Name</th>
                        <th className="px-4 py-3 text-left font-semibold text-red-400">Product Code</th>
                        <th className="px-4 py-3 text-right font-semibold text-red-400">Qty</th>
                        <th className="px-4 py-3 text-right font-semibold text-red-400">Unit Price (Rs.)</th>
                        <th className="px-4 py-3 text-right font-semibold text-red-400">Total Price (Rs.)</th>
                        <th className="px-4 py-3 text-right font-semibold text-red-400">Product Cost (Rs.)</th>
                        <th className="px-4 py-3 text-right font-semibold text-red-400">Print Cost (Rs.)</th>
                        <th className="px-4 py-3 text-right font-semibold text-red-400">Total Cost (Rs.)</th>
                        <th className="px-4 py-3 text-right font-semibold text-red-400">Profit (Rs.)</th>
                        <th className="px-4 py-3 text-left font-semibold text-red-400">Order #</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {filteredSoldItems.length > 0 ? (
                        filteredSoldItems.map((item) => (
                          <tr key={item.itemId} className="hover:bg-gray-700/30 transition-colors">
                            <td className="px-4 py-3 text-gray-200">{item.productName}</td>
                            <td className="px-4 py-3 text-gray-400 text-sm">{item.productCode}</td>
                            <td className="px-4 py-3 text-right font-semibold text-gray-200">{item.quantity}</td>
                            <td className="px-4 py-3 text-right text-gray-400">
                              {parseFloat(String(item.unitPrice)).toFixed(2)}
                            </td>
                            <td className="px-4 py-3 text-right font-bold text-green-400">
                              {parseFloat(String(item.totalPrice)).toFixed(2)}
                            </td>
                            <td className="px-4 py-3 text-right text-orange-400">
                              {parseFloat(String(item.productCost)).toFixed(2)}
                            </td>
                            <td className="px-4 py-3 text-right text-purple-400">
                              {parseFloat(String(item.printCost)).toFixed(2)}
                            </td>
                            <td className="px-4 py-3 text-right text-red-400">
                              {parseFloat(String(item.totalCost)).toFixed(2)}
                            </td>
                            <td className="px-4 py-3 text-right font-bold text-blue-400">
                              {parseFloat(String(item.profit)).toFixed(2)}
                            </td>
                            <td className="px-4 py-3 text-gray-400 font-mono text-xs">{item.orderNumber}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={10} className="px-4 py-8 text-center text-gray-400">
                            No items found for the selected period
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
            )}
        </div>
      )}

      {currentView === "costs" && (
        <div className="flex-1 flex flex-col min-h-0 space-y-2">
          {loading ? (
            <div className="flex-1 flex items-center justify-center bg-gray-800/50 border border-gray-700 rounded-lg">
              <p className="text-gray-400 text-lg">Loading cost breakdown data...</p>
            </div>
          ) : costBreakdown ? (
            <>
              {/* Metrics Grid */}
              <div className="grid grid-cols-7 gap-2">
                <div className="bg-green-900/40 border border-green-600/50 rounded p-2">
                  <p className="text-xs text-green-300 font-semibold">Total Revenue</p>
                  <p className="text-sm font-bold text-green-400">
                    Rs. {parseFloat(String(costBreakdown.totalRevenue)).toFixed(0)}
                  </p>
                </div>
                <div className="bg-orange-900/40 border border-orange-600/50 rounded p-2">
                  <p className="text-xs text-orange-300 font-semibold">Product Cost</p>
                  <p className="text-sm font-bold text-orange-400">
                    Rs. {parseFloat(String(costBreakdown.totalProductCost)).toFixed(0)}
                  </p>
                </div>
                <div className="bg-purple-900/40 border border-purple-600/50 rounded p-2">
                  <p className="text-xs text-purple-300 font-semibold">Print Cost</p>
                  <p className="text-sm font-bold text-purple-400">
                    Rs. {parseFloat(String(costBreakdown.totalPrintCost)).toFixed(0)}
                  </p>
                </div>
                <div className="bg-yellow-900/40 border border-yellow-600/50 rounded p-2">
                  <p className="text-xs text-yellow-300 font-semibold">Delivery Cost</p>
                  <p className="text-sm font-bold text-yellow-400">
                    Rs. {parseFloat(String(costBreakdown.totalDeliveryCost)).toFixed(0)}
                  </p>
                </div>
                <div className="bg-red-900/40 border border-red-600/50 rounded p-2">
                  <p className="text-xs text-red-300 font-semibold">Total Cost</p>
                  <p className="text-sm font-bold text-red-400">
                    Rs. {parseFloat(String(costBreakdown.totalCost)).toFixed(0)}
                  </p>
                </div>
                <div className="bg-blue-900/40 border border-blue-600/50 rounded p-2">
                  <p className="text-xs text-blue-300 font-semibold">Profit</p>
                  <p className={`text-sm font-bold ${parseFloat(String(costBreakdown.totalProfit)) >= 0 ? "text-blue-400" : "text-red-400"}`}>
                    Rs. {parseFloat(String(costBreakdown.totalProfit)).toFixed(0)}
                  </p>
                </div>
                <div className="bg-indigo-900/40 border border-indigo-600/50 rounded p-2">
                  <p className="text-xs text-indigo-300 font-semibold">Margin</p>
                  <p className="text-sm font-bold text-indigo-400">
                    {parseFloat(String(costBreakdown.profitMargin)).toFixed(1)}%
                  </p>
                </div>
              </div>

              {/* Cost Distribution Chart */}
              <div className="flex-1 overflow-hidden flex flex-col bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                <h3 className="text-sm font-bold text-red-400 mb-4">Cost Distribution</h3>
                <div className="flex-1 flex gap-6 items-end justify-center pb-4">
                  {costDetails.length > 0 ? (
                    <>
                      {/* Legend and Details */}
                      <div className="flex flex-col gap-3 w-40">
                        {costDetails.map((detail, idx) => {
                          const colors = ["bg-orange-500", "bg-purple-500", "bg-yellow-500"];
                          const colors_light = ["text-orange-400", "text-purple-400", "text-yellow-400"];
                          return (
                            <div key={idx} className="space-y-1">
                              <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${colors[idx]}`}></div>
                                <span className={`text-xs font-semibold ${colors_light[idx]}`}>
                                  {detail.costType}
                                </span>
                              </div>
                              <p className="text-xs text-gray-400 ml-5">
                                Rs. {parseFloat(String(detail.amount)).toFixed(0)}
                              </p>
                              <p className="text-xs font-bold text-gray-300 ml-5">
                                {parseFloat(String(detail.percentage)).toFixed(1)}%
                              </p>
                            </div>
                          );
                        })}
                      </div>

                      {/* Bar Chart */}
                      <div className="flex-1 flex items-end justify-center gap-6 h-64">
                        {costDetails.map((detail, idx) => {
                          const colors = ["bg-orange-500", "bg-purple-500", "bg-yellow-500"];
                          const percentage = parseFloat(String(detail.percentage));
                          const height = Math.max(percentage * 2, 10); // Scale for visibility
                          return (
                            <div
                              key={idx}
                              className="flex flex-col items-center gap-2 flex-1"
                            >
                              <div
                                className={`${colors[idx]} rounded-t-lg transition-all duration-300 hover:opacity-80 w-full`}
                                style={{ height: `${height}px` }}
                                title={`${detail.costType}: ${parseFloat(String(detail.percentage)).toFixed(1)}%`}
                              ></div>
                              <span className="text-xs font-semibold text-gray-300 text-center mt-2">
                                {percentage.toFixed(1)}%
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-400">
                      No cost distribution data available
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-800/50 border border-gray-700 rounded-lg">
              <p className="text-gray-400 text-lg">No cost data available for this period</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
