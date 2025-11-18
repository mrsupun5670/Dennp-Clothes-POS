import React from "react";

const SettingsPage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold text-red-500">Settings</h1>
        <p className="text-gray-400 mt-2">Manage application settings and preferences here.</p>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {/* Store Settings */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-red-400 mb-4">Store Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300">Store Name</label>
              <input type="text" defaultValue="Dennep Clothes" className="mt-1 w-full px-4 py-2 bg-gray-700 border border-red-600/30 text-white placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Store Email</label>
              <input type="email" defaultValue="store@dennep.com" className="mt-1 w-full px-4 py-2 bg-gray-700 border border-red-600/30 text-white placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500" />
            </div>
          </div>
        </div>

        {/* Business Settings */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-red-400 mb-4">Business Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300">Currency</label>
              <select className="mt-1 w-full px-4 py-2 bg-gray-700 border border-red-600/30 text-white rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500">
                <option>USD ($)</option>
                <option>EUR (€)</option>
                <option>GBP (£)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Tax Rate (%)</label>
              <input
                type="number"
                defaultValue="10"
                className="mt-1 w-full px-4 py-2 bg-gray-700 border border-red-600/30 text-white placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
          </div>
        </div>

        {/* User Settings */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-red-400 mb-4">User Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300">Theme</label>
              <select className="mt-1 w-full px-4 py-2 bg-gray-700 border border-red-600/30 text-white rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500">
                <option>Light</option>
                <option selected>Dark</option>
                <option>Auto</option>
              </select>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex gap-3">
          <button className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors font-semibold">
            Save Settings
          </button>
          <button className="bg-gray-700 text-gray-300 px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors font-semibold">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
