import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved && saved !== 'undefined' ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [loading, setLoading] = useState(false);
  const [superAdminEmails, setSuperAdminEmails] = useState([]);
  const [recaptchaSiteKey, setRecaptchaSiteKey] = useState(null);

  useEffect(() => {
    authAPI.getConfig()
      .then(({ data }) => {
        setSuperAdminEmails(data.superAdminEmails || []);
        setRecaptchaSiteKey(data.recaptchaSiteKey || null);
      })
      .catch(() => {});
  }, []);

  const login = async (credentials) => {
    const { data } = await authAPI.login(credentials);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const register = async (userData) => {
    const { data } = await authAPI.register(userData);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateUser = (updated) => {
    const newUser = { ...user, ...updated };
    localStorage.setItem('user', JSON.stringify(newUser));
    setUser(newUser);
  };

  const isSuperAdmin = user?.role === 'admin' && superAdminEmails.includes(user?.email?.toLowerCase());

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, isAdmin: user?.role === 'admin', isSuperAdmin, superAdminEmails, recaptchaSiteKey }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
