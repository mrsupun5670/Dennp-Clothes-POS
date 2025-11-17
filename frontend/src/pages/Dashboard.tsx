import React from "react";

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-red-500">Dashboard</h1>
        <p className="text-gray-400 mt-2">Welcome to your POS System. Key metrics and overview will be displayed here.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg shadow p-6 border-l-4 border-l-red-500">
          <p className="text-gray-400 text-sm font-medium">Total Sales</p>
          <p className="text-3xl font-bold text-white mt-2">$12,450</p>
          <p className="text-green-400 text-sm mt-2">+12% from last week</p>
        </div>
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg shadow p-6 border-l-4 border-l-red-500">
          <p className="text-gray-400 text-sm font-medium">Total Orders</p>
          <p className="text-3xl font-bold text-white mt-2">324</p>
          <p className="text-green-400 text-sm mt-2">+8% from last week</p>
        </div>
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg shadow p-6 border-l-4 border-l-red-500">
          <p className="text-gray-400 text-sm font-medium">Products in Stock</p>
          <p className="text-3xl font-bold text-white mt-2">1,245</p>
          <p className="text-orange-400 text-sm mt-2">5 items low stock</p>
        </div>
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg shadow p-6 border-l-4 border-l-red-500">
          <p className="text-gray-400 text-sm font-medium">Active Customers</p>
          <p className="text-3xl font-bold text-white mt-2">145</p>
          <p className="text-red-400 text-sm mt-2">+5 new customers</p>
        </div>
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-red-400">Sales Trend</h3>
          <div className="h-64 flex items-center justify-center bg-gray-700/50 rounded mt-4">
            <p className="text-gray-400">Sales chart will appear here</p>
          </div>
        </div>
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-red-400">Top Products</h3>
          <div className="h-64 flex items-center justify-center bg-gray-700/50 rounded mt-4">
            <p className="text-gray-400">Top products list will appear here</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
