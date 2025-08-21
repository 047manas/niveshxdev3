"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';

// Define the structure of the user object we'll get from the decoded JWT
interface UserProfile {
  userId: string;
  email: string;
  userType: 'company' | 'investor';
  profileComplete?: boolean;
  // Add any other fields from your Firestore user document
  [key: string]: any;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAuthenticated: false,
  login: async () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = useCallback(async (token: string) => {
    try {
      const response = await fetch('/api/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      const userData = await response.json();
      const decodedToken = jwtDecode<UserProfile>(token);
      setUser({ ...decodedToken, ...userData });
    } catch (error) {
      console.error(error);
      logout(); // Log out if we can't fetch user data
    }
  }, []);

  const logout = useCallback(() => {
    console.log("Logging out...");
    localStorage.removeItem('authToken');
    setUser(null);
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const decoded = jwtDecode<{ exp: number }>(token);
          if (decoded.exp * 1000 > Date.now()) {
            await fetchUserData(token);
          } else {
            logout();
          }
        } catch (error) {
          console.error("Token validation failed", error);
          logout();
        }
      }
      setLoading(false);
    };
    initializeAuth();
  }, [fetchUserData, logout]);

  const login = async (token: string) => {
    setLoading(true);
    localStorage.setItem('authToken', token);
    await fetchUserData(token);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = () => useContext(AuthContext);
