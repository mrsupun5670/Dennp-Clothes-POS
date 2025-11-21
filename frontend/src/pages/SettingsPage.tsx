import React, { useState } from "react";
import { useShop } from "../context/ShopContext";

const SettingsPage: React.FC = () => {
  const { shopData, resetForReininstall } = useShop();
  const [showReinstallConfirm, setShowReinstallConfirm] = useState(false);

  const handleReinstall = () => {
    resetForReininstall();
    window.location.reload();
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold text-red-500">Settings</h1>
        <p className="text-gray-400 mt-2">Manage application settings and preferences here.</p>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {/* Shop Configuration */}
        <div className="bg-blue-900/20 border border-blue-600/50 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-blue-400 mb-4">Shop Configuration</h3>
          <div className="space-y-4">
            <div className="bg-gray-800/50 rounded p-4 border border-blue-600/30">
              <p className="text-xs text-gray-400 font-semibold mb-1">Selected Shop</p>
              <p className="text-xl font-bold text-blue-300">{shopData?.shop_name || "Not Selected"}</p>
              <p className="text-sm text-gray-400 mt-2">Shop ID: {shopData?.shop_id}</p>
              {shopData?.address && (
                <p className="text-sm text-gray-400">Address: {shopData.address}</p>
              )}
              {shopData?.manager_name && (
                <p className="text-sm text-gray-400">Manager: {shopData.manager_name}</p>
              )}
            </div>
            <div className="bg-yellow-900/20 border border-yellow-600/30 rounded p-3 text-sm text-yellow-300">
              <p className="font-semibold mb-1">ℹ️ Locked Configuration</p>
              <p>This shop selection is permanent and cannot be changed. To change shops, you must reinstall the application.</p>
            </div>
            <button
              onClick={() => setShowReinstallConfirm(true)}
              className="w-full bg-red-600/80 hover:bg-red-700 text-white py-2 rounded-lg font-semibold transition-colors border border-red-500/50"
            >
              🔄 Reinstall & Change Shop
            </button>
          </div>
        </div>

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

      {/* Reinstall Confirmation Modal */}
      {showReinstallConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg shadow-2xl border-2 border-red-600 w-full max-w-md">
            <div className="bg-gradient-to-r from-red-700 to-red-900 text-white p-6 border-b border-red-600">
              <h2 className="text-2xl font-bold">Reinstall Application?</h2>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-red-900/20 border border-red-600/50 rounded p-4">
                <p className="text-sm text-red-200">
                  <span className="font-bold">⚠️ Warning:</span> This will reset your shop selection and allow you to choose a different shop on next startup.
                </p>
              </div>

              <div className="text-gray-300 text-sm space-y-2">
                <p>• Your selected shop will be cleared</p>
                <p>• You will be prompted to select a shop on next app launch</p>
                <p>• All other data will remain unchanged</p>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-700">
                <button
                  onClick={handleReinstall}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-semibold transition-colors"
                >
                  Yes, Reinstall
                </button>
                <button
                  onClick={() => setShowReinstallConfirm(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-300 py-2 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
