import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Set default auth headers
  const setAuthToken = (token) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  };

  // Check if token exists in localStorage on load
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        setAuthToken(token);
        try {
          const res = await axios.get('/api/auth/me');
          setUser(res.data);
        } catch (err) {
          console.error('Failed to load user with stored token:', err);
          setAuthToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      setAuthToken(res.data.token);
      setUser(res.data.user);
      return { success: true };
    } catch (err) {
      console.error(err);
      return { 
        success: false, 
        message: err.response?.data?.message || 'Login failed. Please check your credentials.' 
      };
    }
  };

  const register = async (username, email, password) => {
    try {
      const res = await axios.post('/api/auth/register', { username, email, password });
      setAuthToken(res.data.token);
      setUser(res.data.user);
      return { success: true };
    } catch (err) {
      console.error(err);
      return { 
        success: false, 
        message: err.response?.data?.message || 'Registration failed.' 
      };
    }
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
  };

  const connectPlatform = async (platform, handle) => {
    try {
      const res = await axios.post('/api/platforms/connect', { platform, handle });
      setUser(res.data);
      return { success: true };
    } catch (err) {
      console.error(err);
      throw new Error(err.response?.data?.message || 'Linking handle failed.');
    }
  };

  const disconnectPlatform = async (platform) => {
    try {
      const res = await axios.post('/api/platforms/disconnect', { platform });
      setUser(res.data);
      return { success: true };
    } catch (err) {
      console.error(err);
      throw new Error(err.response?.data?.message || 'Disconnecting platform failed.');
    }
  };

  const syncPlatforms = async () => {
    try {
      const res = await axios.post('/api/platforms/sync');
      setUser(res.data);
      return { success: true };
    } catch (err) {
      console.error(err);
      throw new Error(err.response?.data?.message || 'Syncing platform data failed.');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        connectPlatform,
        disconnectPlatform,
        syncPlatforms,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
