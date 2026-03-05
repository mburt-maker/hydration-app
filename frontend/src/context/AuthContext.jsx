import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('hydration_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const userData = await api.getMe();
      setUser(userData);
      // Check if user needs onboarding (no name and default goal)
      if (!userData.name && userData.hydration_goal_oz === 64) {
        setNeedsOnboarding(true);
      }
    } catch (err) {
      localStorage.removeItem('hydration_token');
    } finally {
      setLoading(false);
    }
  };

  const login = (token, userData, isNewUser) => {
    localStorage.setItem('hydration_token', token);
    setUser(userData);
    setNeedsOnboarding(isNewUser);
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (err) {
      // Ignore logout errors
    }
    localStorage.removeItem('hydration_token');
    setUser(null);
    setNeedsOnboarding(false);
  };

  const updateUser = (userData) => {
    setUser(userData);
    setNeedsOnboarding(false);
  };

  const value = {
    user,
    loading,
    needsOnboarding,
    login,
    logout,
    updateUser,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
