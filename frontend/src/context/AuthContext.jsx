import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authAPI } from "../services/api";
import toast from "react-hot-toast";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const resp = await authAPI.me();
      setUser(resp.data.data);
    } catch {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const login = async (email, password) => {
    const resp = await authAPI.login({ email, password });
    const { user, access_token, refresh_token } = resp.data.data;
    localStorage.setItem("access_token", access_token);
    localStorage.setItem("refresh_token", refresh_token);
    setUser(user);
    toast.success(`Welcome back, ${user.name}!`);
    return user;
  };

  const register = async (data) => {
    const resp = await authAPI.register(data);
    const { user, access_token, refresh_token } = resp.data.data;
    localStorage.setItem("access_token", access_token);
    localStorage.setItem("refresh_token", refresh_token);
    setUser(user);
    toast.success("Account created successfully!");
    return user;
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch {}
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setUser(null);
    toast.success("Logged out successfully");
  };

  const isAdmin = user?.role === "admin";
  const isProvider = user?.role === "provider";
  const isCustomer = user?.role === "customer";

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin, isProvider, isCustomer, fetchMe }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
