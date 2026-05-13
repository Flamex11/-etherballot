import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI, adminAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('etherballot_token');
      const savedUser = localStorage.getItem('etherballot_user');
      
      if (token && savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          setUser(parsed);
          setRole(parsed.role);
          setIsAuthenticated(true);
        } catch (e) {
          localStorage.removeItem('etherballot_token');
          localStorage.removeItem('etherballot_user');
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const loginVoter = useCallback((token, userData) => {
    const userWithRole = { ...userData, role: 'voter' };
    localStorage.setItem('etherballot_token', token);
    localStorage.setItem('etherballot_user', JSON.stringify(userWithRole));
    setUser(userWithRole);
    setRole('voter');
    setIsAuthenticated(true);
  }, []);

  const loginAdmin = useCallback((token, adminData) => {
    const adminWithData = { ...adminData };
    localStorage.setItem('etherballot_token', token);
    localStorage.setItem('etherballot_user', JSON.stringify(adminWithData));
    setUser(adminWithData);
    setRole(adminData.role);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('etherballot_token');
    localStorage.removeItem('etherballot_user');
    setUser(null);
    setRole(null);
    setIsAuthenticated(false);
  }, []);

  const isSuperAdmin = role === 'super_admin';
  const isStateAdmin = role === 'state_admin';
  const isDistrictAdmin = role === 'district_admin';
  const isAdmin = ['super_admin', 'state_admin', 'district_admin'].includes(role);
  const isVoter = role === 'voter';

  const value = {
    user,
    role,
    loading,
    isAuthenticated,
    loginVoter,
    loginAdmin,
    logout,
    isSuperAdmin,
    isStateAdmin,
    isDistrictAdmin,
    isAdmin,
    isVoter
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
