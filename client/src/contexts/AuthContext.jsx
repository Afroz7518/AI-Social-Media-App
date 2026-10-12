import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('socialai_token');
    const savedUser = localStorage.getItem('socialai_user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      // Verify token with server
      api.get('/auth/me')
        .then(res => {
          setUser(res.data.user);
          localStorage.setItem('socialai_user', JSON.stringify(res.data.user));
        })
        .catch(() => {
          localStorage.removeItem('socialai_token');
          localStorage.removeItem('socialai_user');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('socialai_token', res.data.token);
    localStorage.setItem('socialai_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    localStorage.setItem('socialai_token', res.data.token);
    localStorage.setItem('socialai_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('socialai_token');
    localStorage.removeItem('socialai_user');
    setUser(null);
  }, []);

  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('socialai_user', JSON.stringify(updatedUser));
  }, []);

  const deleteAccount = useCallback(async (password) => {
    const res = await api.delete('/users/account', { data: { password } });
    logout();
    return res.data;
  }, [logout]);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
