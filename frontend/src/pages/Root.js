// 📁 src/pages/Root.js
import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar/Sidebar";
import { useAuth } from "../context/AuthContext";

export default function Root() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* 사이드바 컨테이너(위치 기준) */}
      <div style={{ position: "relative" }}>
        <Sidebar />

        {/* 사이드바 배경 위에 절대 위치 */}
        {user && (
          <button
            onClick={handleLogout}
            style={{
              position: "absolute",
              right: 20,
              bottom: 20,
              left: 20,
              backgroundColor: "#f5222d",
              color: "#fff",
              border: "none",
              padding: "8px 16px",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            로그아웃
          </button>
        )}
      </div>

      {/* 메인 콘텐츠 */}
      <div style={{ flexGrow: 1, padding: 20 }}>
        <Outlet />
      </div>
    </div>
  );
}
