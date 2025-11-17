import React from "react";

const ReportsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-red-500">Reports</h1>
        <p className="text-gray-400 mt-2">View and generate reports here.</p>
      </div>

      {/* Report Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg shadow p-6 hover:border-red-600 hover:shadow-lg hover:bg-red-900/10 transition-all cursor-pointer">
          <div className="text-3xl mb-2">📊</div>
          <h3 className="text-lg font-semibold text-red-400">Sales Report</h3>
          <p className="text-gray-400 text-sm mt-2">View sales statistics and trends</p>
        </div>
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg shadow p-6 hover:border-red-600 hover:shadow-lg hover:bg-red-900/10 transition-all cursor-pointer">
          <div className="text-3xl mb-2">📦</div>
          <h3 className="text-lg font-semibold text-red-400">Inventory Report</h3>
          <p className="text-gray-400 text-sm mt-2">Check stock levels and movements</p>
        </div>
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg shadow p-6 hover:border-red-600 hover:shadow-lg hover:bg-red-900/10 transition-all cursor-pointer">
          <div className="text-3xl mb-2">👥</div>
          <h3 className="text-lg font-semibold text-red-400">Customer Report</h3>
          <p className="text-gray-400 text-sm mt-2">Analyze customer behavior and purchases</p>
        </div>
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg shadow p-6 hover:border-red-600 hover:shadow-lg hover:bg-red-900/10 transition-all cursor-pointer">
          <div className="text-3xl mb-2">💰</div>
          <h3 className="text-lg font-semibold text-red-400">Financial Report</h3>
          <p className="text-gray-400 text-sm mt-2">Revenue and expense analysis</p>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
