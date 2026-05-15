/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { api } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("flash_token"));
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("flash_user");
    return raw ? JSON.parse(raw) : null;
  });

  const saveSession = useCallback((payload) => {
    localStorage.setItem("flash_token", payload.token);
    localStorage.setItem("flash_user", JSON.stringify(payload.user));
    setToken(payload.token);
    setUser(payload.user);
  }, []);

  const login = useCallback(async (form) => {
    const { data } = await api.post("/auth/login", form);
    saveSession(data);
  }, [saveSession]);

  const register = useCallback(async (form) => {
    const { data } = await api.post("/auth/register", form);
    saveSession(data);
  }, [saveSession]);

  const logout = () => {
    localStorage.removeItem("flash_token");
    localStorage.removeItem("flash_user");
    setToken(null);
    setUser(null);
  };

  const value = useMemo(() => ({ token, user, setUser, login, register, logout }), [token, user, login, register]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
