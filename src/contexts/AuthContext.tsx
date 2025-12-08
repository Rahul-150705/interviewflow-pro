import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

const API_BASE = 'http://localhost:8080/api';

interface User {
  email: string;
  id: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    }
    setIsLoading(false);
  }, [token]);

  const login = async (email: string, password: string) => {
    // ✅ Endpoint matches your backend: POST /api/auth/login
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Login failed' }));
      throw new Error(error.message || 'Login failed');
    }
    
    const data = await response.json();
    
    // ✅ Updated to match your backend response structure
    // Your backend returns: { message, token, email, userId }
    if (data.token) {
      setToken(data.token);
      const userData = { 
        email: data.email, 
        id: data.userId.toString(), 
        name: data.name || email.split('@')[0] 
      };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } else {
      throw new Error('No token received');
    }
  };

  const register = async (name: string, email: string, password: string) => {
    // ✅ Endpoint matches your backend: POST /api/auth/register
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Registration failed' }));
      throw new Error(error.message || 'Registration failed');
    }
    
    const data = await response.json();
    
    // ✅ Updated to match your backend response structure
    // Your backend returns: { message, token, email, userId }
    if (data.token) {
      setToken(data.token);
      const userData = { 
        email: data.email, 
        id: data.userId.toString(), 
        name: name 
      };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } else {
      throw new Error('No token received');
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};