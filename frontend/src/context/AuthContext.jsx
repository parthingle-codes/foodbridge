import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('foodbridge_token'));
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const response = await authService.getProfile();
      if (response.success) {
        setUser(response.data);
        localStorage.setItem('foodbridge_user', JSON.stringify(response.data));
      }
    } catch (error) {
      console.error('Failed to load user profile:', error);
      // Try to load from localStorage as fallback
      const cached = localStorage.getItem('foodbridge_user');
      if (cached) {
        try {
          setUser(JSON.parse(cached));
        } catch {
          localStorage.removeItem('foodbridge_token');
          localStorage.removeItem('foodbridge_user');
          setToken(null);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      if (response.success) {
        const { token: newToken, user: userData } = response.data;
        localStorage.setItem('foodbridge_token', newToken);
        localStorage.setItem('foodbridge_user', JSON.stringify(userData));
        setToken(newToken);
        setUser(userData);
        toast.success('Login successful!');
        return { success: true, user: userData };
      }
      return { success: false, message: response.message };
    } catch (error) {
      const msg = error.message || 'Login failed';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      if (response.success) {
        const { token: newToken, user: newUser } = response.data;
        if (newToken) {
          localStorage.setItem('foodbridge_token', newToken);
          localStorage.setItem('foodbridge_user', JSON.stringify(newUser));
          setToken(newToken);
          setUser(newUser);
        }
        toast.success('Registration successful!');
        return { success: true, user: newUser };
      }
      return { success: false, message: response.message };
    } catch (error) {
      const msg = error.message || 'Registration failed';
      toast.error(msg);
      return { success: false, message: msg, errors: error.errors };
    }
  };

  const logout = () => {
    authService.logout();
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully');
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    login,
    register,
    logout,
    refreshUser: loadUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
