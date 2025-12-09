import React, { useState, useRef, useEffect } from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const { login } = useAdminAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const usernameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setUsername('');
      setPassword('');
      setError('');
      setTimeout(() => usernameRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleLogin = () => {
    if (!username || !password) {
      setError('Username and password are required');
      return;
    }

    const success = login(username, password);
    if (success) {
      onLoginSuccess();
      onClose();
    } else {
      setError('Invalid username or password');
      setPassword('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg shadow-2xl border-2 border-red-600 w-full max-w-md">
        <div className="bg-gradient-to-r from-red-700 to-red-900 text-white p-6 border-b border-red-600">
          <h2 className="text-2xl font-bold">Admin Login Required</h2>
          <p className="text-sm text-red-200 mt-1">Please enter admin credentials to continue</p>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-900/30 border border-red-600/50 text-red-400 px-4 py-3 rounded-lg text-sm font-semibold">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-red-400 mb-2">
              Username
            </label>
            <input
              ref={usernameRef}
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-4 py-2 bg-gray-700 border-2 border-red-600/30 text-white placeholder-gray-500 rounded-lg focus:border-red-500 focus:outline-none"
              placeholder="Enter username"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-red-400 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-4 py-2 bg-gray-700 border-2 border-red-600/30 text-white placeholder-gray-500 rounded-lg focus:border-red-500 focus:outline-none"
              placeholder="Enter password"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleLogin}
              className="flex-1 bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors"
            >
              Login
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-700 text-gray-300 py-2 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginModal;
