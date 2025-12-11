import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  isAdmin: boolean;
  isAuthenticated: boolean;
  login: (password: string) => boolean;
  logout: () => void;
  changePassword: (currentPassword: string, newPassword: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEFAULT_ADMIN_PASSWORD = 'secretsanta2024';
const PASSWORD_STORAGE_KEY = 'secretsanta_admin_password';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [adminPassword, setAdminPassword] = useState(DEFAULT_ADMIN_PASSWORD);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Load persisted password and auth state
    const storedPassword = localStorage.getItem(PASSWORD_STORAGE_KEY);
    if (storedPassword) {
      setAdminPassword(storedPassword);
    }

    const storedAuth = sessionStorage.getItem('secretsanta_admin');
    if (storedAuth === 'true') {
      setIsAdmin(true);
      setIsAuthenticated(true);
    }
  }, []);

  const login = (password: string): boolean => {
    if (password === adminPassword) {
      setIsAdmin(true);
      setIsAuthenticated(true);
      sessionStorage.setItem('secretsanta_admin', 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAdmin(false);
    setIsAuthenticated(false);
    sessionStorage.removeItem('secretsanta_admin');
  };

  const changePassword = (currentPassword: string, newPassword: string): boolean => {
    if (currentPassword !== adminPassword || !newPassword) {
      return false;
    }

    setAdminPassword(newPassword);
    localStorage.setItem(PASSWORD_STORAGE_KEY, newPassword);
    setIsAdmin(true);
    setIsAuthenticated(true);
    sessionStorage.setItem('secretsanta_admin', 'true');
    return true;
  };

  return (
    <AuthContext.Provider value={{ isAdmin, isAuthenticated, login, logout, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
