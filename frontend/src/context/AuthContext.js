// 📁 src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthReady, setAuthReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // 헤더에 토큰 설정
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // JWT 형식(token은 header.payload.signature)인지 확인
      const parts = token.split(".");
      if (parts.length === 3) {
        try {
          const decoded = jwtDecode(token);
          setUser({
            user_id: decoded.user_id,
            company_id: decoded.company_id,
            name: decoded.name,
            role: decoded.role,
          });
        } catch (err) {
          console.error("Invalid token:", err);
          localStorage.removeItem("token");
          setUser(null);
        }
      } else {
        console.warn("토큰 형식이 올바르지 않습니다:", token);
        localStorage.removeItem("token");
        setUser(null);
      }
    }
    setAuthReady(true);
  }, []);

  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem("token", token);
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthReady }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
