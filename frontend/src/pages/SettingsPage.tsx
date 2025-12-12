import React, { useState } from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';

const SettingsPage: React.FC = () => {
  const { changePassword } = useAdminAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleChangePassword = () => {
    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage({ type: 'error', text: 'All fields are required' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'New password must be at least 6 characters' });
      return;
    }

    const success = changePassword(currentPassword, newPassword);
    if (success) {
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      setTimeout(() => setMessage(null), 3000);
    } else {
      setMessage({ type: 'error', text: 'Current password is incorrect' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-gray-800/50 backdrop-blur-sm border-2 border-red-600/30 rounded-lg shadow-2xl p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-red-500 mb-2">Settings</h1>
            <p className="text-gray-400">Manage your admin account settings</p>
          </div>

          {/* Change Password Section */}
          <div className="space-y-6">
            <div className="border-b border-red-600/30 pb-4">
              <h2 className="text-xl font-bold text-red-400 mb-1">Change Admin Password</h2>
              <p className="text-sm text-gray-400">Update your admin login password</p>
            </div>

            {message && (
              <div
                className={`p-4 rounded-lg border ${
                  message.type === 'success'
                    ? 'bg-green-900/30 border-green-600/50 text-green-400'
                    : 'bg-red-900/30 border-red-600/50 text-red-400'
                } font-semibold`}
              >
                {message.text}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-red-400 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border-2 border-red-600/30 text-white placeholder-gray-500 rounded-lg focus:border-red-500 focus:outline-none"
                  placeholder="Enter current password"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-red-400 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border-2 border-red-600/30 text-white placeholder-gray-500 rounded-lg focus:border-red-500 focus:outline-none"
                  placeholder="Enter new password (min 6 characters)"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-red-400 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border-2 border-red-600/30 text-white placeholder-gray-500 rounded-lg focus:border-red-500 focus:outline-none"
                  placeholder="Re-enter new password"
                />
              </div>

              <button
                onClick={handleChangePassword}
                className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors duration-200"
              >
                Change Password
              </button>
            </div>
          </div>

          {/* Info Section */}
          <div className="mt-8 p-4 bg-gray-900/50 border border-red-600/20 rounded-lg">
            <h3 className="text-sm font-bold text-red-400 mb-2">Security Information</h3>
            <ul className="text-xs text-gray-400 space-y-1">
              <li>• Admin username: <span className="text-white font-mono">admin</span></li>
              <li>• Password must be at least 6 characters long</li>
              <li>• Your password is stored securely in browser local storage</li>
              <li>• Logout and login again after changing password</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
