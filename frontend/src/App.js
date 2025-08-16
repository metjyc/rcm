// 📁 src/App.js
import React from "react";
import {
  RouterProvider,
  createBrowserRouter,
  Navigate,
} from "react-router-dom";
import { Spin } from "antd";
import { AuthProvider, useAuth } from "./context/AuthContext";

import RootLayout from "./pages/Root";
import CalendarPage from "./pages/CalendarPage";
import VehiclePage from "./pages/vehicle/VehiclePage";
import NewCustomerPage from "./pages/customer/NewCustomerPage";
import ErrorPage from "./pages/Error";
import LoginPage from "./pages/LoginPage";

// 로그인 여부 & 초기 로딩 상태 확인 용 ProtectedRoute
const ProtectedRoute = ({ element }) => {
  const { user, isAuthReady } = useAuth();

  // 1) 인증 초기화 중이면 로딩 스피너
  if (!isAuthReady) {
    return (
      <div style={{ textAlign: "center", marginTop: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  // 2) 초기화 완료, 유저 없으면 로그인 페이지로
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3) 로그인된 상태면 요청된 페이지 렌더
  return element;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        path: "/",
        element: <ProtectedRoute element={<CalendarPage />} />,
      },
      {
        path: "calendar",
        element: <ProtectedRoute element={<CalendarPage />} />,
      },
      {
        path: "vehicle",
        element: <ProtectedRoute element={<VehiclePage />} />,
      },
      {
        path: "customer",
        element: <ProtectedRoute element={<NewCustomerPage />} />,
      },
      {
        path: "*",
        element: <ErrorPage />,
      },
    ],
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
]);

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
