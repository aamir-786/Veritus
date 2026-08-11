import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('veritus_token');
      if (token) {
        try {
          const res = await api.getProfile();
          if (res.success) {
            setUser(res.user);
          } else {
            localStorage.removeItem('veritus_token');
          }
        } catch (err) {
          localStorage.removeItem('veritus_token');
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.login(email, password);
    if (res.success) {
      localStorage.setItem('veritus_token', res.token);
      setUser(res.user);
    }
    return res;
  };

  const register = async (email, password, full_name) => {
    const res = await api.register(email, password, full_name);
    if (res.success) {
      localStorage.setItem('veritus_token', res.token);
      setUser(res.user);
    }
    return res;
  };

  const googleLogin = async (payload) => {
    const res = await api.googleLogin(payload);
    if (res.success) {
      localStorage.setItem('veritus_token', res.token);
      setUser(res.user);
    }
    return res;
  };

  const logout = () => {
    localStorage.removeItem('veritus_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, googleLogin, logout, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
