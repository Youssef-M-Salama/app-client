'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import authService from '@/services/authService';

const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  role: null,
  isLoading: true,
  login: async () => { },
  logout: () => { },
});

export const UserRoleEnum = {
  CHARITY: 0,
  DONOR: 1,
  ADMIN: 2
};

const getRoleString = (roleVal) => {
  const roleInt = Number(roleVal);
  if (roleInt === UserRoleEnum.CHARITY) return 'Charity';
  if (roleInt === UserRoleEnum.DONOR) return 'DonorOrganization';
  if (roleInt === UserRoleEnum.ADMIN) return 'Admin';
  return roleVal; // Fallback if it's already a string
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize state from local storage and cookies on mount
  const initAuth = () => {
    const token = Cookies.get('accessToken');
    if (token) {
      try {
        const cachedUser = localStorage.getItem('user');
        const cachedRole = localStorage.getItem('role');

        if (cachedUser) setUser(JSON.parse(cachedUser));
        if (cachedRole) setRole(cachedRole); // Already mapped to string when saved

        setIsAuthenticated(true);
      } catch (e) {
        console.error("Error reading cached auth data");
        handleLocalLogout();
      }
    } else {
      handleLocalLogout();
    }
    setIsLoading(false);
  };

  const handleLocalLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setRole(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
      localStorage.removeItem('role');
    }
  };

  useEffect(() => {
    initAuth();
  }, []);

  const login = async (credentials) => {
    // authService.login() returns response.data (the API envelope: { success, message, data, error })
    // The actual payload is inside the .data field of that envelope.
    const envelope = await authService.login(credentials);
    const payload = envelope?.data || envelope; // unwrap { success, message, data } → get real data

    const token = payload.token || payload.accessToken;
    const refreshToken = payload.refreshToken;

    if (token) {
      Cookies.set('accessToken', token);
      if (refreshToken) Cookies.set('refreshToken', refreshToken);

      // Extract role integer from the payload (field name: 'role')
      const rawRole = payload.role !== undefined ? payload.role : payload.userRole;

      if (rawRole !== undefined) {
        const mappedRole = getRoleString(rawRole);
        localStorage.setItem('role', mappedRole);
        setRole(mappedRole);
      }

      // Store the full payload (minus sensitive token fields) as the user object.
      // This includes: userId, userName, email, role, verificationState, tokenExpiration, etc.
      const { token: _t, refreshToken: _rt, ...safeUserData } = payload;
      localStorage.setItem('user', JSON.stringify(safeUserData));
      setUser(safeUserData);

      setIsAuthenticated(true);
    }

    // Return the raw envelope so LoginForm can read role for redirect
    return payload;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('API logout failed, clearing local session.', error);
    } finally {
      Cookies.remove('accessToken');
      Cookies.remove('refreshToken');
      handleLocalLogout();
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, role, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
