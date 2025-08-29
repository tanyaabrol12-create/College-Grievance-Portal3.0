import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing auth data on app load
    const existingToken = localStorage.getItem('token');
    const existingUser = localStorage.getItem('user');
    
    if (existingToken && existingUser) {
      setToken(existingToken);
      setUser(JSON.parse(existingUser));
    }
    
    setLoading(false);
  }, []);

  const login = (userData, tokenData) => {
    console.log('AuthContext login called with:', { 
      userData: userData, 
      tokenPreview: tokenData ? tokenData.substring(0, 20) + '...' : 'no token' 
    });
    
    if (!tokenData) {
      console.error('Login attempted with null/undefined token');
      return false;
    }
    
    if (!userData) {
      console.error('Login attempted with null/undefined user data');
      return false;
    }
    
    try {
      localStorage.setItem('token', tokenData);
      localStorage.setItem('user', JSON.stringify(userData));
      console.log('Auth data saved to localStorage');
      
      setToken(tokenData);
      setUser(userData);
      console.log('Auth state updated in context');
      
      return true;
    } catch (error) {
      console.error('Error during login process:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const updateUser = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    updateUser,
    isAuthenticated: !!token
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};