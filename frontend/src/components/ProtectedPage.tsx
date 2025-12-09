import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';
import AdminLoginModal from './AdminLoginModal';

interface ProtectedPageProps {
  children: React.ReactNode;
}

const ProtectedPage: React.FC<ProtectedPageProps> = ({ children }) => {
  const { isAdminAuthenticated } = useAdminAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (!isAdminAuthenticated && !isAuthenticated) {
      setShowLoginModal(true);
    }
  }, [isAdminAuthenticated, isAuthenticated]);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setShowLoginModal(false);
  };

  const handleClose = () => {
    // Allow closing and redirect to sales page
    setShowLoginModal(false);
    sessionStorage.setItem('navigateToSales', 'true');
  };

  if (!isAdminAuthenticated && !isAuthenticated) {
    return (
      <>
        <div className="flex items-center justify-center min-h-screen bg-gray-900">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">🔒</div>
            <h1 className="text-2xl font-bold text-white mb-2">Admin Access Required</h1>
            <p className="text-gray-400">Please login to access this page</p>
          </div>
        </div>
        <AdminLoginModal
          isOpen={showLoginModal}
          onClose={handleClose}
          onLoginSuccess={handleLoginSuccess}
        />
      </>
    );
  }

  return <>{children}</>;
};

export default ProtectedPage;
