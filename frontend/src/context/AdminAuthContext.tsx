import React, { createContext, useContext, useState, useEffect } from 'react';

interface AdminAuthContextType {
  isAdminAuthenticated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  changePassword: (currentPassword: string, newPassword: string) => boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const ADMIN_USERNAME = 'admin';
const DEFAULT_PASSWORD = '200122300341';
const STORAGE_KEY = 'admin_password';
const AUTH_SESSION_KEY = 'admin_authenticated';

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  // Check if admin is already authenticated on mount
  useEffect(() => {
    const isAuthenticated = sessionStorage.getItem(AUTH_SESSION_KEY) === 'true';
    setIsAdminAuthenticated(isAuthenticated);
  }, []);

  const getStoredPassword = (): string => {
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_PASSWORD;
  };

  const login = (username: string, password: string): boolean => {
    const storedPassword = getStoredPassword();

    if (username === ADMIN_USERNAME && password === storedPassword) {
      setIsAdminAuthenticated(true);
      sessionStorage.setItem(AUTH_SESSION_KEY, 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAdminAuthenticated(false);
    sessionStorage.removeItem(AUTH_SESSION_KEY);
  };

  const changePassword = (currentPassword: string, newPassword: string): boolean => {
    const storedPassword = getStoredPassword();

    if (currentPassword === storedPassword) {
      localStorage.setItem(STORAGE_KEY, newPassword);
      return true;
    }
    return false;
  };

  return (
    <AdminAuthContext.Provider value={{ isAdminAuthenticated, login, logout, changePassword }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
