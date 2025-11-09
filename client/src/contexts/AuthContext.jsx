import React, { useState, useEffect } from 'react';
import { loginUser as loginUserApi, registerUser as registerUserApi } from '../api/auth';
import axiosInstance from '../api/axiosInstance';
import { AuthContext } from './auth-context'; // Import the context from its new file

// Helper function to parse JWT
const parseJwt = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch { 
    // It's better to handle this gracefully in case of a malformed token
    return null;
  }
};


export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      const decodedUser = parseJwt(token);
      if (decodedUser && decodedUser.exp * 1000 > Date.now()) {
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(decodedUser);
      } else {
        // Token is expired or invalid
        delete axiosInstance.defaults.headers.common['Authorization'];
        localStorage.removeItem('token');
        setToken(null);
      }
    }
  }, [token]);

  const login = async (credentials) => {
    const data = await loginUserApi(credentials);
    localStorage.setItem('token', data.token);
    const loggedInUser = parseJwt(data.token);
    setUser(loggedInUser);
    setToken(data.token); // This will trigger the useEffect to set the user
    return { token: data.token, user: loggedInUser };
  };

  const register = async (userData) => {
    const data = await registerUserApi(userData);
    localStorage.setItem('token', data.token);
    const registeredUser = parseJwt(data.token);
    setUser(registeredUser);
    setToken(data.token); // This will trigger the useEffect to set the user
    // Return the same structure as login for consistency
    return { token: data.token, user: registeredUser };
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete axiosInstance.defaults.headers.common['Authorization'];
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};