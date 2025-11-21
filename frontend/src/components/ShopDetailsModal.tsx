import React, { useState } from "react";
import { useShop } from "../context/ShopContext";

export const ShopDetailsModal: React.FC = () => {
  const { shopData } = useShop();
  const [isOpen, setIsOpen] = useState(false);

  if (!shopData) {
    return null;
  }

  return (
    <>
      {/* Floating Button to Open Modal */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg flex items-center justify-center font-bold text-xl transition-all duration-200 hover:scale-110 z-30"
        title="View Shop Details"
      >
        ℹ️
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg shadow-2xl border-2 border-red-600 w-full max-w-2xl">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-red-700 to-red-900 text-white p-6 border-b border-red-600 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Shop Details</h2>
                <p className="text-red-200 text-sm mt-1">Current Active Shop Information</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-red-200 transition-colors text-2xl"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-8 space-y-6">
              {/* Header Section */}
              <div className="flex items-start gap-4 border-b border-gray-700 pb-6">
                <span className="text-6xl">🏪</span>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-red-400">{shopData.shop_name}</h1>
                  <p className="text-sm text-gray-400 mt-2">
                    Shop ID: <span className="text-white font-semibold">{shopData.shop_id}</span>
                  </p>

                  {/* Status Badge */}
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-sm text-gray-400">Status:</span>
                    <div
                      className={`px-4 py-1 rounded-full text-sm font-semibold ${
                        shopData.shop_status === "active"
                          ? "bg-green-900/50 text-green-400 border border-green-600"
                          : shopData.shop_status === "inactive"
                            ? "bg-yellow-900/50 text-yellow-400 border border-yellow-600"
                            : "bg-red-900/50 text-red-400 border border-red-600"
                      }`}
                    >
                      {shopData.shop_status.toUpperCase()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Information Grid */}
              <div className="grid grid-cols-2 gap-6">
                {/* Manager Information */}
                <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4">
                  <p className="text-xs text-gray-400 font-semibold mb-2">👤 Manager</p>
                  <p className="text-gray-200 font-medium">
                    {shopData.manager_name || "Not assigned"}
                  </p>
                </div>

                {/* Contact Number */}
                <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4">
                  <p className="text-xs text-gray-400 font-semibold mb-2">📞 Contact Phone</p>
                  <p className="text-gray-200 font-medium">{shopData.contact_phone}</p>
                </div>

                {/* Address */}
                <div className="col-span-2 bg-gray-700/50 border border-gray-600 rounded-lg p-4">
                  <p className="text-xs text-gray-400 font-semibold mb-2">📍 Address</p>
                  <p className="text-gray-200 font-medium">{shopData.address}</p>
                </div>

                {/* Opening Date */}
                {shopData.opening_date && (
                  <div className="col-span-2 bg-gray-700/50 border border-gray-600 rounded-lg p-4">
                    <p className="text-xs text-gray-400 font-semibold mb-2">📅 Opening Date</p>
                    <p className="text-gray-200 font-medium">
                      {new Date(shopData.opening_date).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                )}
              </div>

              {/* Key Information Section */}
              <div className="bg-red-900/20 border border-red-600/50 rounded-lg p-4">
                <p className="text-xs text-red-400 font-semibold mb-3">🔑 Key Information</p>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>
                    <span className="text-gray-400">Shop ID:</span>{" "}
                    <span className="font-mono font-semibold text-red-400">#{shopData.shop_id}</span>
                  </li>
                  <li>
                    <span className="text-gray-400">Data Scope:</span> All products, customers, and
                    orders are isolated to this shop
                  </li>
                  <li>
                    <span className="text-gray-400">Status:</span> This shop is currently{" "}
                    <span className="font-semibold text-green-400">ACTIVE</span> and ready for
                    operations
                  </li>
                </ul>
              </div>

              {/* Database Info */}
              <div className="bg-blue-900/20 border border-blue-600/50 rounded-lg p-4">
                <p className="text-xs text-blue-400 font-semibold mb-3">💾 Database Information</p>
                <p className="text-xs text-gray-300">
                  This information is retrieved from the shops table in the database. All operations
                  performed in this system are scoped to this shop and its data.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-700 p-6 flex justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="px-6 py-2 bg-gray-700 text-gray-300 hover:bg-gray-600 rounded-lg font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
