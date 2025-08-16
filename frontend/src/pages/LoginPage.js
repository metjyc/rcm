// 📁 src/pages/LoginPage.js
import React, { useState } from "react";
import { Form, Input, Button, message } from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:6001";

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // 로그인 API 호출
      const { data } = await axios.post(`${API_BASE}/auth/login`, {
        email: values.email,
        password: values.password,
      });

      // 응답에서 토큰과 유저 정보 추출
      const { accessToken, refreshToken, user } = data;

      // 토큰 저장
      localStorage.setItem("token", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      axios.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;

      // Context에 로그인 상태 저장
      login(user, accessToken);

      message.success("로그인 성공!");
      // 루트 페이지로 이동
      navigate("/");
    } catch (err) {
      message.error(`로그인 실패: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: 360,
        margin: "100px auto",
        padding: 24,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        borderRadius: 4,
        background: "#fff",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: 24 }}>관리자 로그인</h2>
      <Form name="login" onFinish={onFinish} layout="vertical">
        <Form.Item
          name="email"
          label="이메일"
          rules={[{ required: true, message: "이메일을 입력해주세요" }]}
        >
          <Input placeholder="admin@company.com" />
        </Form.Item>

        <Form.Item
          name="password"
          label="비밀번호"
          rules={[{ required: true, message: "비밀번호를 입력해주세요" }]}
        >
          <Input.Password placeholder="••••••••" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            로그인
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default LoginPage;
