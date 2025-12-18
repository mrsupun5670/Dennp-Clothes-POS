import React, { useState, useMemo, useEffect, useRef } from "react";
import { useShop } from "../context/ShopContext";
import { getCostBreakdown, getCostDetails } from "../services/reportsService";
import type { CostBreakdown, CostDetails } from "../services/reportsService";
import { printContent, generateProductCostsReportHTML, generateDeliveryCostsReportHTML, generateProfitsReportHTML } from "../utils/exportUtils";
import { API_URL } from "../config/api";

type TimePeriod = "today" | "week" | "month" | "3months" | "12months" | "custom";
type ReportView = "orders" | "costs";

interface Order {
  order_id: number;
  order_number: string;
  customer_id: number | null;
  total_items: number;
  total_amount: number;
  delivery_charge: number;
  final_amount: number;
  order_status: string;
  payment_status: string;
  order_date: string;
  created_at: string;
}

interface GroupedOrderItem {
  product_id: string;
  product_name: string;
  unit_price: number;
  total_quantity: number;
  product_cost: number;
  print_cost: number;
  sewing_cost: number;
  extra_cost: number;
  total_product_cost: number;
  total_print_cost: number;
  total_sewing_cost: number;
  total_extra_cost: number;
  total_cost: number;
  total_sold: number;
  profit: number;
}

const ReportsPage: React.FC = () => {
  const { shopId: contextShopId } = useShop();
  const shopId = contextShopId || 1;

  const [currentView, setCurrentView] = useState<ReportView>("orders");
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("today");
  const [searchQuery, setSearchQuery] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [costBreakdown, setCostBreakdown] = useState<CostBreakdown | null>(null);
  const [costDetails, setCostDetails] = useState<CostDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [customFromDate, setCustomFromDate] = useState<string>("");
  const [customToDate, setCustomToDate] = useState<string>("");

  // Modal state
  const [showItemsModal, setShowItemsModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [groupedItems, setGroupedItems] = useState<GroupedOrderItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);

  const loadDataRef = useRef(false);

  // Get date range based on period
  const getDateRange = (period: TimePeriod) => {
    const today = new Date();
    let startDate = new Date();

    if (period === "custom") {
      if (customFromDate && customToDate) {
        return {
          startDate: customFromDate,
          endDate: customToDate,
        };
      }
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
          startDate.setDate(today.getDate() - 30);
          break;
        case "3months":
          startDate.setDate(today.getDate() - 90);
          break;
        case "12months":
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

  // Load orders data
  useEffect(() => {
    loadDataRef.current = false;
  }, [shopId, timePeriod, customFromDate, customToDate]);

  useEffect(() => {
    if (loadDataRef.current) return;
    loadDataRef.current = true;

    const loadReportsData = async () => {
      try {
        setLoading(true);

        let startDate: string;
        let endDate: string;

        if (timePeriod === "custom" && (!customFromDate || !customToDate)) {
          startDate = "2000-01-01";
          endDate = new Date().toISOString().split('T')[0];
        } else {
          const dateRange = getDateRange(timePeriod);
          startDate = dateRange.startDate;
          endDate = dateRange.endDate;
        }

        // Fetch orders and cost breakdown
        const [ordersResponse, breakdown, details] = await Promise.all([
          fetch(`${API_URL}/orders?shop_id=${shopId}`),
          getCostBreakdown(shopId, startDate, endDate),
          getCostDetails(shopId, startDate, endDate),
        ]);

        const ordersResult = await ordersResponse.json();
        
        if (ordersResult.success) {
          // Filter orders by date range
          const filteredOrders = ordersResult.data.filter((order: Order) => {
            const orderDate = new Date(order.created_at || order.order_date);
            const start = new Date(startDate);
            const end = new Date(endDate);
            return orderDate >= start && orderDate <= end;
          });
          setOrders(filteredOrders || []);
        } else {
          setOrders([]);
        }

        setCostBreakdown(breakdown || null);
        setCostDetails(details || []);
      } catch (error) {
        console.error("Error loading reports data:", error);
        setOrders([]);
        setCostBreakdown(null);
        setCostDetails([]);
      } finally {
        setLoading(false);
      }
    };

    loadReportsData();
  }, [shopId, timePeriod, customFromDate, customToDate]);

  // Handle double-click to open modal with grouped items
  const handleOrderDoubleClick = async (order: Order) => {
    setSelectedOrder(order);
    setShowItemsModal(true);
    setLoadingItems(true);

    try {
      const response = await fetch(`${API_URL}/orders/${order.order_id}/items-grouped`);
      const result = await response.json();
      
      if (result.success) {
        setGroupedItems(result.data || []);
      } else {
        setGroupedItems([]);
      }
    } catch (error) {
      console.error("Error fetching grouped items:", error);
      setGroupedItems([]);
    } finally {
      setLoadingItems(false);
    }
  };

  // Filter orders by search
  const filteredOrders = useMemo(() => {
    let result = [...orders];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (order) =>
          order.order_number.toLowerCase().includes(query) ||
          (order.customer_id && order.customer_id.toString().includes(query))
      );
    }

    return result;
  }, [orders, searchQuery]);

  const totalOrders = filteredOrders.length;
  const totalRevenue = filteredOrders.reduce((sum, order) => sum + parseFloat(String(order.total_amount)), 0);

  return (
    <div className="space-y-3 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0">
          <h1 className="text-2xl font-bold text-red-500">Reports ({totalOrders.toString().padStart(2, '0')})</h1>
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

          {timePeriod === "custom" && (
            <>
              <input
                type="date"
                value={customFromDate}
                onChange={(e) => setCustomFromDate(e.target.value)}
                className="px-3 py-2 bg-gray-700 border-2 border-red-600/30 text-white rounded text-sm focus:border-red-500 focus:outline-none"
              />
              <input
                type="date"
                value={customToDate}
                onChange={(e) => setCustomToDate(e.target.value)}
                className="px-3 py-2 bg-gray-700 border-2 border-red-600/30 text-white rounded text-sm focus:border-red-500 focus:outline-none"
              />
            </>
          )}
        </div>

        {/* Search Bar */}
        <input
            type="text"
            placeholder="🔍 Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-3 py-2 bg-gray-700 border-2 border-red-600/30 text-white placeholder-gray-500 rounded text-sm focus:border-red-500 focus:outline-none"
          />
      </div>

      {currentView === "orders" && (
        <div className="flex-1 flex flex-col min-h-0 space-y-2">
          {loading ? (
            <div className="flex-1 flex items-center justify-center bg-gray-800/50 border border-gray-700 rounded-lg">
              <p className="text-gray-400 text-lg">Loading orders data...</p>
            </div>
          ) : (
            <>
              {/* Summary Metrics - Cost Breakdown */}
              <div className="grid grid-cols-9 gap-2">
                <div className="bg-green-900/40 border border-green-600/50 rounded p-2">
                  <p className="text-xs text-green-300 font-semibold">Total Revenue</p>
                  <p className="text-sm font-bold text-green-400">
                    Rs. {costBreakdown ? parseFloat(String(costBreakdown.totalRevenue)).toFixed(0) : totalRevenue.toFixed(0)}
                  </p>
                </div>
                <div className="bg-orange-900/40 border border-orange-600/50 rounded p-2">
                  <p className="text-xs text-orange-300 font-semibold">Product Cost</p>
                  <p className="text-sm font-bold text-orange-400">
                    Rs. {costBreakdown ? parseFloat(String(costBreakdown.totalProductCost)).toFixed(0) : '0'}
                  </p>
                </div>
                <div className="bg-purple-900/40 border border-purple-600/50 rounded p-2">
                  <p className="text-xs text-purple-300 font-semibold">Print Cost</p>
                  <p className="text-sm font-bold text-purple-400">
                    Rs. {costBreakdown ? parseFloat(String(costBreakdown.totalPrintCost)).toFixed(0) : '0'}
                  </p>
                </div>
                <div className="bg-cyan-900/40 border border-cyan-600/50 rounded p-2">
                  <p className="text-xs text-cyan-300 font-semibold">Sewing Cost</p>
                  <p className="text-sm font-bold text-cyan-400">
                    Rs. {costBreakdown ? parseFloat(String(costBreakdown.totalSewingCost)).toFixed(0) : '0'}
                  </p>
                </div>
                <div className="bg-pink-900/40 border border-pink-600/50 rounded p-2">
                  <p className="text-xs text-pink-300 font-semibold">Extra Cost</p>
                  <p className="text-sm font-bold text-pink-400">
                    Rs. {costBreakdown ? parseFloat(String(costBreakdown.totalExtraCost)).toFixed(0) : '0'}
                  </p>
                </div>
                <div className="bg-yellow-900/40 border border-yellow-600/50 rounded p-2">
                  <p className="text-xs text-yellow-300 font-semibold">Delivery Cost</p>
                  <p className="text-sm font-bold text-yellow-400">
                    Rs. {costBreakdown ? parseFloat(String(costBreakdown.totalDeliveryCost)).toFixed(0) : '0'}
                  </p>
                </div>
                <div className="bg-red-900/40 border border-red-600/50 rounded p-2">
                  <p className="text-xs text-red-300 font-semibold">Total Cost</p>
                  <p className="text-sm font-bold text-red-400">
                    Rs. {costBreakdown ? parseFloat(String(costBreakdown.totalCost)).toFixed(0) : '0'}
                  </p>
                </div>
                <div className="bg-blue-900/40 border border-blue-600/50 rounded p-2">
                  <p className="text-xs text-blue-300 font-semibold">Profit</p>
                  <p className={`text-sm font-bold ${costBreakdown && parseFloat(String(costBreakdown.totalProfit)) >= 0 ? "text-blue-400" : "text-red-400"}`}>
                    Rs. {costBreakdown ? parseFloat(String(costBreakdown.totalProfit)).toFixed(0) : '0'}
                  </p>
                </div>
                <div className="bg-indigo-900/40 border border-indigo-600/50 rounded p-2">
                  <p className="text-xs text-indigo-300 font-semibold">Margin</p>
                  <p className="text-sm font-bold text-indigo-400">
                    {costBreakdown ? parseFloat(String(costBreakdown.profitMargin)).toFixed(1) : '0.0'}%
                  </p>
                </div>
              </div>

              {/* Orders Table */}
              <div className="flex-1 overflow-hidden flex flex-col bg-gray-800/50 border border-gray-700 rounded-lg">
                <div className="overflow-x-auto overflow-y-auto flex-1">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-gray-700/80 border-b-2 border-red-600 z-10">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-red-400">Order #</th>
                        <th className="px-4 py-3 text-center font-semibold text-red-400">Date</th>
                        <th className="px-4 py-3 text-center font-semibold text-red-400">Items</th>
                        <th className="px-4 py-3 text-right font-semibold text-red-400">Total Amount (Rs.)</th>
                        <th className="px-4 py-3 text-right font-semibold text-red-400">Delivery Cost (Rs.)</th>
                        <th className="px-4 py-3 text-right font-semibold text-red-400">Final Amount (Rs.)</th>
                        <th className="px-4 py-3 text-center font-semibold text-red-400">Order Status</th>
                        <th className="px-4 py-3 text-center font-semibold text-red-400">Payment Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {filteredOrders.length > 0 ? (
                        filteredOrders.map((order) => (
                          <tr 
                            key={order.order_id} 
                            className="hover:bg-gray-700/50 transition-colors cursor-pointer"
                            onDoubleClick={() => handleOrderDoubleClick(order)}
                            title="Double-click to view items"
                          >
                            <td className="px-4 py-3 text-gray-200 font-mono">{order.order_number}</td>
                            <td className="px-4 py-3 text-center text-gray-400 text-xs">
                              {new Date(order.created_at || order.order_date).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 text-center font-semibold text-gray-300">{order.total_items}</td>
                            <td className="px-4 py-3 text-right font-bold text-green-400">
                              {parseFloat(String(order.total_amount)).toFixed(2)}
                            </td>
                            <td className="px-4 py-3 text-right text-yellow-400">
                              {parseFloat(String(order.delivery_charge || 0)).toFixed(2)}
                            </td>
                            <td className="px-4 py-3 text-right font-bold text-blue-400">
                              {parseFloat(String(order.final_amount || 0)).toFixed(2)}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                order.order_status === 'delivered' ? 'bg-green-900/50 text-green-400' :
                                order.order_status === 'shipped' ? 'bg-blue-900/50 text-blue-400' :
                                order.order_status === 'processing' ? 'bg-yellow-900/50 text-yellow-400' :
                                'bg-gray-700 text-gray-400'
                              }`}>
                                {order.order_status.toUpperCase()}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                order.payment_status === 'fully_paid' ? 'bg-green-900/50 text-green-400' :
                                order.payment_status === 'partial' ? 'bg-yellow-900/50 text-yellow-400' :
                                'bg-red-900/50 text-red-400'
                              }`}>
                                {order.payment_status.replace('_', ' ').toUpperCase()}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                            No orders found for the selected period
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

      {/* Grouped Items Modal */}
      {showItemsModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg shadow-2xl border-2 border-red-600 w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-red-700 to-red-900 text-white p-4 border-b border-red-600 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">Order Items - {selectedOrder.order_number}</h2>
                <p className="text-red-200 text-sm">Grouped by Product & Price</p>
              </div>
              <button
                onClick={() => setShowItemsModal(false)}
                className="text-white hover:text-red-200 transition-colors text-2xl"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-auto p-4">
              {loadingItems ? (
                <div className="flex items-center justify-center py-12">
                  <p className="text-gray-400">Loading items...</p>
                </div>
              ) : groupedItems.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <p className="text-gray-400">No items found</p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-700/50 border-b border-gray-600 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left text-gray-300 font-semibold">Product</th>
                      <th className="px-3 py-2 text-center text-gray-300 font-semibold">Qty</th>
                      <th className="px-3 py-2 text-right text-gray-300 font-semibold">Unit Price</th>
                      <th className="px-3 py-2 text-right text-gray-300 font-semibold">Prod. Cost</th>
                      <th className="px-3 py-2 text-right text-gray-300 font-semibold">Print</th>
                      <th className="px-3 py-2 text-right text-gray-300 font-semibold">Sewing</th>
                      <th className="px-3 py-2 text-right text-gray-300 font-semibold">Extra</th>
                      <th className="px-3 py-2 text-right text-gray-300 font-semibold">Total Cost</th>
                      <th className="px-3 py-2 text-right text-gray-300 font-semibold">Total Sold</th>
                      <th className="px-3 py-2 text-right text-gray-300 font-semibold">Profit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {groupedItems.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-700/30">
                        <td className="px-3 py-2 text-gray-200">
                          <div className="font-medium">{item.product_name}</div>
                          <div className="text-xs text-gray-400">{item.product_id}</div>
                        </td>
                        <td className="px-3 py-2 text-center text-gray-300 font-semibold">{item.total_quantity}</td>
                        <td className="px-3 py-2 text-right text-gray-400">{parseFloat(String(item.unit_price)).toFixed(2)}</td>
                        <td className="px-3 py-2 text-right text-orange-400">{parseFloat(String(item.total_product_cost)).toFixed(2)}</td>
                        <td className="px-3 py-2 text-right text-purple-400">{parseFloat(String(item.total_print_cost)).toFixed(2)}</td>
                        <td className="px-3 py-2 text-right text-yellow-400">{parseFloat(String(item.total_sewing_cost)).toFixed(2)}</td>
                        <td className="px-3 py-2 text-right text-pink-400">{parseFloat(String(item.total_extra_cost)).toFixed(2)}</td>
                        <td className="px-3 py-2 text-right text-red-400 font-semibold">{parseFloat(String(item.total_cost)).toFixed(2)}</td>
                        <td className="px-3 py-2 text-right text-green-400 font-semibold">{parseFloat(String(item.total_sold)).toFixed(2)}</td>
                        <td className={`px-3 py-2 text-right font-bold ${parseFloat(String(item.profit)) >= 0 ? 'text-blue-400' : 'text-red-500'}`}>
                          {parseFloat(String(item.profit)).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-gray-700/50 font-semibold">
                      <td colSpan={3} className="px-3 py-2 text-right">Totals:</td>
                      <td className="px-3 py-2 text-right text-orange-400">
                        Rs. {groupedItems.reduce((sum, item) => sum + parseFloat(String(item.total_product_cost)), 0).toFixed(2)}
                      </td>
                      <td className="px-3 py-2 text-right text-purple-400">
                        Rs. {groupedItems.reduce((sum, item) => sum + parseFloat(String(item.total_print_cost)), 0).toFixed(2)}
                      </td>
                      <td className="px-3 py-2 text-right text-yellow-400">
                        Rs. {groupedItems.reduce((sum, item) => sum + parseFloat(String(item.total_sewing_cost)), 0).toFixed(2)}
                      </td>
                      <td className="px-3 py-2 text-right text-pink-400">
                        Rs. {groupedItems.reduce((sum, item) => sum + parseFloat(String(item.total_extra_cost)), 0).toFixed(2)}
                      </td>
                      <td className="px-3 py-2 text-right text-red-400">
                        Rs. {groupedItems.reduce((sum, item) => sum + parseFloat(String(item.total_cost)), 0).toFixed(2)}
                      </td>
                      <td className="px-3 py-2 text-right text-green-400">
                        Rs. {groupedItems.reduce((sum, item) => sum + parseFloat(String(item.total_sold)), 0).toFixed(2)}
                      </td>
                      <td className={`px-3 py-2 text-right font-bold ${
                        groupedItems.reduce((sum, item) => sum + parseFloat(String(item.profit)), 0) >= 0 ? 'text-blue-400' : 'text-red-500'
                      }`}>
                        Rs. {groupedItems.reduce((sum, item) => sum + parseFloat(String(item.profit)), 0).toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
