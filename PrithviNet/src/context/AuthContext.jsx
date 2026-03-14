import React, { createContext, useContext, useState, useEffect } from "react";
import * as API from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() =>
    localStorage.getItem("prithvinet_token"),
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      API.getMe().then((res) => {
        if (res.ok) setUser(res.data);
        else {
          localStorage.removeItem("prithvinet_token");
          setToken(null);
        }
        setLoading(false);
      });
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
    }
  }, [token]);

  const loginUser = async (email, password) => {
    const res = await API.login(email, password);
    if (res.ok) {
      localStorage.setItem("prithvinet_token", res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
    }
    return res;
  };

  const registerUser = async (name, email, password, role, extra = {}) => {
    const res = await API.register(name, email, password, role, extra);
    if (res.ok) {
      localStorage.setItem("prithvinet_token", res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
    }
    return res;
  };

  const logout = () => {
    localStorage.removeItem("prithvinet_token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, loginUser, registerUser, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
