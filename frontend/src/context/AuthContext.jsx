import { createContext, useContext, useState, useEffect } from 'react';
import { authMe, authLogout } from '../api/api';

const Ctx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authMe().then(setUser).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const loginSuccess = (userData) => setUser(userData);
  const logout = async () => {
    try { await authLogout(); } catch {}
    setUser(null);
  };
  const refreshUser = () => authMe().then(setUser).catch(() => {});

  return <Ctx.Provider value={{ user, loading, loginSuccess, logout, refreshUser }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);