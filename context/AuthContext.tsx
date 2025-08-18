"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';

// Define the structure of the user object we'll get from the decoded JWT
interface DecodedToken {
  userId: string;
  email: string;
  userType: 'company' | 'investor';
  iat: number;
  exp: number;
}

interface AuthContextType {
  user: DecodedToken | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<DecodedToken | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    console.log("Logging out...");
    localStorage.removeItem('authToken');
    setUser(null);
  }, []);

  useEffect(() => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        const decoded = jwtDecode<DecodedToken>(token);
        // Check if the token is expired
        if (decoded.exp * 1000 > Date.now()) {
          setUser(decoded);
        } else {
          // Token is expired, so log the user out
          logout();
        }
      }
    } catch (error) {
      console.error("Failed to decode token on initial load", error);
      logout(); // Clear any invalid token
    } finally {
      setLoading(false);
    }
  }, [logout]);

  const login = (token: string) => {
    setLoading(true);
    try {
      localStorage.setItem('authToken', token);
      const decoded = jwtDecode<DecodedToken>(token);
      setUser(decoded);
    } catch (error) {
      console.error("Failed to decode token on login", error);
      logout(); // Ensure we don't leave a bad token
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = () => useContext(AuthContext);
