"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (firstName: string, lastName: string, email: string, password: string, inviteToken?: string | null, siteId?: string | null) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Load user from local storage on initial load
  useEffect(() => {
    console.log('[AUTH-CONTEXT] Loading user from localStorage');
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      console.log('[AUTH-CONTEXT] User loaded from localStorage');
    } else {
      console.log('[AUTH-CONTEXT] No user found in localStorage');
    }
    
    setLoading(false);
  }, []);

  // Check if token is still valid and fetch current user data
  useEffect(() => {
    const validateSession = async () => {
      if (token) {
        try {
          console.log('[AUTH-CONTEXT] Validating session with token');
          // Include token in Authorization header AND as a custom header
          const response = await fetch('/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'X-Auth-Token': token,
            },
            credentials: 'include',
          });

          if (!response.ok) {
            // If token is invalid, logout
            if (response.status === 401) {
              console.log('[AUTH-CONTEXT] Session invalid, logging out');
              await logout();
            }
            return;
          }

          const data = await response.json();
          setUser(data.user);
          console.log('[AUTH-CONTEXT] Session valid, user data updated');
          
          // Force refresh token to localStorage
          localStorage.setItem('auth_token', token);
          localStorage.setItem('user', JSON.stringify(data.user));
        } catch (error) {
          console.error('[AUTH-CONTEXT] Session validation error:', error);
        }
      }
    };

    if (token && !loading) {
      validateSession();
      
      // Schedule periodic validation to keep session alive
      const intervalId = setInterval(() => {
        console.log('[AUTH-CONTEXT] Running scheduled token validation');
        validateSession();
      }, 5 * 60 * 1000); // Every 5 minutes
      
      return () => {
        clearInterval(intervalId);
        console.log('[AUTH-CONTEXT] Cleared validation interval');
      };
    }
  }, [token, loading]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('[AUTH-CONTEXT] Attempting login');
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to login');
      }

      const data = await response.json();
      
      // Store token and user in localStorage FIRST
      console.log('[AUTH-CONTEXT] Storing auth data in localStorage');
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // THEN update React state
      setToken(data.token);
      setUser(data.user);
      
      // Also set as a cookie manually for redundancy
      document.cookie = `auth_token=${data.token}; path=/; max-age=${24 * 60 * 60}; SameSite=Strict`;
      
      console.log('[AUTH-CONTEXT] Login successful, redirecting to /sites');
      // Redirect to dashboard or sites
      router.push('/sites');
    } catch (error) {
      setError((error as Error).message);
      console.error('[AUTH-CONTEXT] Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const signup = async (firstName: string, lastName: string, email: string, password: string, inviteToken?: string | null, siteId?: string | null) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ firstName, lastName, email, password, inviteToken, siteId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to register');
      }

      // After successful signup, log the user in
      await login(email, password);
    } catch (error) {
      setError((error as Error).message);
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      console.log('[AUTH-CONTEXT] Attempting logout');
      // Get the current token for the API call
      const currentToken = localStorage.getItem('auth_token');
      
      // Call logout API with the token
      if (currentToken) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${currentToken}`,
            'X-Auth-Token': currentToken
          },
          credentials: 'include',
        });
      }
      console.log('[AUTH-CONTEXT] Logout API call successful');
    } catch (error) {
      console.error('[AUTH-CONTEXT] Logout API error:', error);
    } finally {
      // Clear state and local storage regardless of API result
      console.log('[AUTH-CONTEXT] Clearing auth data');
      
      // Clear localStorage first
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      
      // Then clear state
      setUser(null);
      setToken(null);
      
      // Also clear the cookie
      document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict';
      
      setLoading(false);
      
      // Use setTimeout to ensure all state/storage is cleared before redirect
      setTimeout(() => {
        console.log('[AUTH-CONTEXT] Redirecting to login page');
        router.push('/auth?signedOut=true');
      }, 100);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        login,
        signup,
        logout,
        clearError,
      }}
    >
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