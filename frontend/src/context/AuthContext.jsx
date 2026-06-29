import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext';
import { api, isMockEnabled } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

// Code-configured credentials
export const CODE_CREDENTIALS = {
  admin: {
    email: 'admin@test.com',
    password: 'password123'
  },
  vendor: {
    email: 'vendor@test.com',
    password: 'password123'
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    // Check if user session exists in localStorage
    const savedUser = localStorage.getItem('app_user');
    const token = localStorage.getItem('app_token');
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      let loginRole = 'customer'; // Default for mock
      const isAdminCred = email === CODE_CREDENTIALS.admin.email && password === CODE_CREDENTIALS.admin.password;
      const isVendorCred = email === CODE_CREDENTIALS.vendor.email && password === CODE_CREDENTIALS.vendor.password;

      if (isAdminCred) {
        loginRole = 'admin';
      } else if (isVendorCred) {
        loginRole = 'vendor';
      }

      if (isMockEnabled) {
        await new Promise((resolve) => setTimeout(resolve, 800));
        const mockUser = {
          id: loginRole === 'admin' ? 'admin-1' : loginRole === 'vendor' ? 'vendor-1' : 'customer-1',
          email,
          name: loginRole === 'admin' ? 'Super Admin' : loginRole === 'vendor' ? 'Premium Vendor Store' : 'John Doe',
          role: loginRole,
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop',
          storeName: loginRole === 'vendor' ? 'TechNova Solutions' : undefined,
        };
        localStorage.setItem('app_token', 'mock_jwt_token_header.' + btoa(JSON.stringify(mockUser)));
        localStorage.setItem('app_user', JSON.stringify(mockUser));
        setUser(mockUser);
        addToast(`Logged in successfully as ${loginRole}!`, 'success');
        return mockUser;
      } else {
        const res = await api.post('/auth/login', { email, password });
        if (res.data.requiresOtp) {
          addToast(res.data.message || 'OTP sent to your email for verification.', 'info');
          return res.data;
        }

        const loggedUser = {
          id: res.data.id || res.data._id,
          name: res.data.name,
          email: res.data.email,
          role: res.data.role,
          avatar: res.data.avatar,
          storeName: res.data.storeName
        };
        localStorage.setItem('app_token', res.data.token);
        localStorage.setItem('app_user', JSON.stringify(loggedUser));
        setUser(loggedUser);
        addToast(`Logged in successfully as ${loggedUser.role}!`, 'success');
        return loggedUser;
      }
    } catch (error) {
      addToast(error.message || 'Login failed', 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const verifyLoginOtp = async (email, otp) => {
    setLoading(true);
    try {
      if (isMockEnabled) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        addToast('OTP Verified successfully! (Mock)', 'success');
        return true;
      } else {
        const res = await api.post('/auth/verify-login-otp', { email, otp });
        const loggedUser = {
          id: res.data.id || res.data._id,
          name: res.data.name,
          email: res.data.email,
          role: res.data.role,
          avatar: res.data.avatar,
          storeName: res.data.storeName
        };
        localStorage.setItem('app_token', res.data.token);
        localStorage.setItem('app_user', JSON.stringify(loggedUser));
        setUser(loggedUser);
        addToast(`Logged in successfully as ${loggedUser.role}!`, 'success');
        return loggedUser;
      }
    } catch (error) {
      addToast(error.message || 'Invalid OTP', 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const sendOtp = async (email) => {
    setLoading(true);
    try {
      if (isMockEnabled) {
        await new Promise((resolve) => setTimeout(resolve, 800));
        addToast('OTP sent successfully to email (Mock)', 'success');
        return true;
      } else {
        const res = await api.post('/auth/send-otp', { email });
        addToast(res.data.message || 'OTP sent successfully to email', 'success');
        return true;
      }
    } catch (error) {
      addToast(error.message || 'Failed to send OTP', 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password, role = 'customer', extraData = {}) => {
    setLoading(true);
    try {
      if (isMockEnabled) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const mockUser = {
          id: Math.random().toString(36).substring(2, 9),
          email,
          name,
          role,
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=256&auto=format&fit=crop',
          ...extraData,
        };
        localStorage.setItem('app_token', 'mock_jwt_token_header.' + btoa(JSON.stringify(mockUser)));
        localStorage.setItem('app_user', JSON.stringify(mockUser));
        setUser(mockUser);
        addToast('Account created successfully!', 'success');
        return mockUser;
      } else {
        const payload = {
          name,
          email,
          password,
          role,
          storeName: extraData.storeName,
          otp: extraData.otp
        };
        const res = await api.post('/auth/register', payload);
        const registeredUser = {
          id: res.data.id || res.data._id,
          name: res.data.name,
          email: res.data.email,
          role: res.data.role,
          avatar: res.data.avatar,
          storeName: res.data.storeName
        };
        localStorage.setItem('app_token', res.data.token);
        localStorage.setItem('app_user', JSON.stringify(registeredUser));
        setUser(registeredUser);
        addToast('Account created successfully!', 'success');
        return registeredUser;
      }
    } catch (error) {
      addToast(error.message || 'Registration failed', 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('app_token');
    localStorage.removeItem('app_user');
    setUser(null);
    addToast('Logged out successfully', 'info');
  };

  const updateProfile = async (profileData) => {
    setLoading(true);
    try {
      if (isMockEnabled) {
        await new Promise((resolve) => setTimeout(resolve, 800));
        const updatedUser = { ...user, ...profileData };
        localStorage.setItem('app_user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        addToast('Profile updated successfully!', 'success');
        return updatedUser;
      } else {
        const res = await api.put('/auth/profile', profileData);
        const updatedUser = {
          id: res.data.id || res.data._id,
          name: res.data.name,
          email: res.data.email,
          role: res.data.role,
          avatar: res.data.avatar,
          storeName: res.data.storeName
        };
        localStorage.setItem('app_user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        addToast('Profile updated successfully!', 'success');
        return updatedUser;
      }
    } catch (error) {
      addToast(error.message || 'Failed to update profile', 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (email) => {
    setLoading(true);
    try {
      if (isMockEnabled) {
        await new Promise((resolve) => setTimeout(resolve, 800));
        addToast('Password reset link sent (mock)', 'success');
        return true;
      } else {
        const res = await api.post('/auth/forgot-password', { email });
        addToast(res.data.message || 'OTP sent to email', 'success');
        return true;
      }
    } catch (error) {
      addToast(error.message || 'Failed to process request', 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email, otp, newPassword) => {
    setLoading(true);
    try {
      if (isMockEnabled) {
        await new Promise((resolve) => setTimeout(resolve, 800));
        addToast('Password reset successful (mock)', 'success');
        return true;
      } else {
        const res = await api.post('/auth/reset-password', { email, otp, newPassword });
        addToast(res.data.message || 'Password reset successful', 'success');
        return true;
      }
    } catch (error) {
      addToast(error.message || 'Failed to reset password', 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        verifyLoginOtp,
        sendOtp,
        forgotPassword,
        resetPassword,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
export default AuthProvider;
