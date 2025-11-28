import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { User } from '../types';
import apiClient, { ApiError } from '../lib/apiClient';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    try {
      const storedData = localStorage.getItem('authData');
      if (storedData) {
        const authData = JSON.parse(storedData);
        if (authData && authData.id_token) {
            // Check for token expiry if possible, or just load user
          setUser({
            id: authData.user_id,
            name: authData.user_email.split('@')[0], // Using part of email as name
            email: authData.user_email,
            avatarUrl: `https://i.pravatar.cc/150?u=${authData.user_id}`,
          });
        }
      }
    } catch (error) {
      console.error("Failed to parse auth data from localStorage", error);
      localStorage.removeItem('authData');
    }
  }, []);
  
  const isAuthenticated = !!user;

  const login = async (email: string, pass: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const data = await apiClient.post('/auth/login', {
        username: email,
        password: pass,
        signinType: 'EMAIL',
      });
      
      if (data && data.id_token) {
        localStorage.setItem('authData', JSON.stringify(data));
        setUser({
          id: data.user_id,
          name: data.user_email.split('@')[0], // Using part of email as name
          email: data.user_email,
          avatarUrl: `https://i.pravatar.cc/150?u=${data.user_id}`,
        });
        return { success: true };
      }
      
      return { success: false, message: 'Invalid credentials or unexpected response.' };
    } catch (error) {
      console.error('An error occurred during login:', error);
      const message = error instanceof ApiError ? error.message : 'An unexpected error occurred during login.';
      return { success: false, message };
    }
  };

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('authData');
  }, []);

  useEffect(() => {
      const handleSessionExpired = () => {
          logout();
      };
      window.addEventListener('auth:session-expired', handleSessionExpired);
      return () => window.removeEventListener('auth:session-expired', handleSessionExpired);
  }, [logout]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};