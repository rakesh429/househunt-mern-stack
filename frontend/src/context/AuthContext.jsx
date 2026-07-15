import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [refreshTokenVal, setRefreshTokenVal] = useState(localStorage.getItem('refreshToken') || null);

  // Setup base URL API defaults
  axios.defaults.baseURL = 'http://localhost:5000/api';

  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  // Fetch current user details if token exists
  const loadUser = async (authToken) => {
    try {
      axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
      const res = await axios.get('/auth/me');
      setUser(res.data.data);
    } catch (err) {
      console.error('Error loading user profile', err);
      // Attempt token refresh
      if (refreshTokenVal) {
        await handleTokenRefresh();
      } else {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTokenRefresh = async () => {
    try {
      const res = await axios.post('/auth/refresh-token', { token: refreshTokenVal });
      const { accessToken, refreshToken: newRefresh } = res.data;
      
      localStorage.setItem('token', accessToken);
      localStorage.setItem('refreshToken', newRefresh);
      setToken(accessToken);
      setRefreshTokenVal(newRefresh);
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      
      const userRes = await axios.get('/auth/me');
      setUser(userRes.data.data);
    } catch (err) {
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadUser(token);
    } else {
      setLoading(false);
    }
  }, [token]);

  // Login handler
  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await axios.post('/auth/login', { email, password });
      const { accessToken, refreshToken, user: userData } = res.data;

      localStorage.setItem('token', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      setToken(accessToken);
      setRefreshTokenVal(refreshToken);
      setUser(userData);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed. Invalid Credentials.',
      };
    } finally {
      setLoading(false);
    }
  };

  // Register handler
  const register = async (name, email, password, role) => {
    setLoading(true);
    try {
      const res = await axios.post('/auth/register', { name, email, password, role });
      const { accessToken, refreshToken, user: userData } = res.data;

      localStorage.setItem('token', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      setToken(accessToken);
      setRefreshTokenVal(refreshToken);
      setUser(userData);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed. Check details.',
      };
    } finally {
      setLoading(false);
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setToken(null);
    setRefreshTokenVal(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  // Simulated OTP / Google Authentication Logins
  const oauthLogin = async (payload) => {
    setLoading(true);
    try {
      const res = await axios.post('/auth/google', payload);
      const { accessToken, refreshToken, user: userData } = res.data;
      localStorage.setItem('token', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      setToken(accessToken);
      setRefreshTokenVal(refreshToken);
      setUser(userData);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Social login failed' };
    } finally {
      setLoading(false);
    }
  };

  const otpLogin = async (email, otp) => {
    setLoading(true);
    try {
      const res = await axios.post('/auth/otp/verify', { email, otp });
      const { accessToken, refreshToken, user: userData } = res.data;
      localStorage.setItem('token', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      setToken(accessToken);
      setRefreshTokenVal(refreshToken);
      setUser(userData);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Invalid or expired OTP' };
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        oauthLogin,
        otpLogin,
        loadUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
