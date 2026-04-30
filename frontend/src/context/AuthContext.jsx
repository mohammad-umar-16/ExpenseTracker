import { createContext, useContext, useState, useEffect } from 'react';
import { authMe } from '../api/api';

const Ctx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem('token')) { setLoading(false); return; }
    authMe().then(setUser).catch(() => localStorage.removeItem('token')).finally(() => setLoading(false));
  }, []);

  const loginSuccess = ({ access_token, user }) => {
    localStorage.setItem('token', access_token);
    setUser(user);
  };
  const logout      = () => { localStorage.removeItem('token'); setUser(null); };
  const refreshUser = () => authMe().then(setUser).catch(() => {});

  return <Ctx.Provider value={{ user, loading, loginSuccess, logout, refreshUser }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
