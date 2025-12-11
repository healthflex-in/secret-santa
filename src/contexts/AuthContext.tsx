import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { database } from '@/lib/database';

interface AuthContextType {
  isAdmin: boolean;
  isAuthenticated: boolean;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEFAULT_ADMIN_PASSWORD = 'secretsanta2024';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [adminPassword, setAdminPassword] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load password from Supabase
    const loadPassword = async () => {
      try {
        const password = await database.getAdminPassword();
        if (password) {
          setAdminPassword(password);
        } else {
          // Fallback to default if not found in database
          setAdminPassword(DEFAULT_ADMIN_PASSWORD);
          // Save default to database
          await database.setAdminPassword(DEFAULT_ADMIN_PASSWORD);
        }
      } catch (error) {
        console.error('Error loading admin password:', error);
        // Fallback to default on error
        setAdminPassword(DEFAULT_ADMIN_PASSWORD);
      } finally {
        setIsLoading(false);
      }
    };

    loadPassword();

    // Load auth state from sessionStorage
    const storedAuth = sessionStorage.getItem('secretsanta_admin');
    if (storedAuth === 'true') {
      setIsAdmin(true);
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (password: string): Promise<boolean> => {
    // Wait for password to load if still loading
    if (isLoading) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    const currentPassword = adminPassword || DEFAULT_ADMIN_PASSWORD;
    if (password === currentPassword) {
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

  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    // Wait for password to load if still loading
    if (isLoading) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    const currentAdminPassword = adminPassword || DEFAULT_ADMIN_PASSWORD;
    if (currentPassword !== currentAdminPassword || !newPassword) {
      return false;
    }

    // Save to Supabase
    const success = await database.setAdminPassword(newPassword);
    if (!success) {
      return false;
    }

    setAdminPassword(newPassword);
    setIsAdmin(true);
    setIsAuthenticated(true);
    sessionStorage.setItem('secretsanta_admin', 'true');
    return true;
  };

  return (
    <AuthContext.Provider value={{ isAdmin, isAuthenticated, login, logout, changePassword, isLoading }}>
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
