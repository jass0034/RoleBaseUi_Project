'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const router = useRouter();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userName');
    localStorage.removeItem('expiryTime');

    setIsLoggedIn(false);
    setIsAdmin(false);
    setUserName('');

    window.dispatchEvent(new Event('authChange'));

    router.replace('/login');
  };

  const loadAuth = () => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const storedUserName = localStorage.getItem('userName');
    const expiryTime = localStorage.getItem('expiryTime');

    if (!token || !expiryTime) {
      setIsLoggedIn(false);
      setIsAdmin(false);
      setUserName('');
      setLoading(false);

      return;
    }

    const expiry = Number(expiryTime);

    if (!Number.isFinite(expiry) || expiry <= Date.now()) {
      logout();
      return;
    }

    setIsLoggedIn(true);

    setIsAdmin(role?.trim().toLowerCase() === 'admin');

    setUserName(storedUserName || '');

    setLoading(false);
  };

  useEffect(() => {
    loadAuth();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const expiryTime = localStorage.getItem('expiryTime');

    if (!token || !expiryTime) {
      return;
    }

    const expiry = Number(expiryTime);

    const remainingTime = expiry - Date.now();

    if (remainingTime <= 0) {
      logout();
      return;
    }

    const timer = setTimeout(() => {
      logout();
    }, remainingTime);

    return () => {
      clearTimeout(timer);
    };
  }, [isLoggedIn]);

  useEffect(() => {
    const handleAuthChange = () => {
      loadAuth();
    };

    window.addEventListener('authChange', handleAuthChange);

    return () => {
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        isAdmin,
        userName,
        loading,
        logout,
        loadAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
