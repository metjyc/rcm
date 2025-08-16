// 📁 backend/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");

// auth 라우트
const authRoutes = require("./routes/auth");

// 보호가 필요한 라우트들
const vehicleRoutes = require("./routes/vehicles");
const customerRoutes = require("./routes/customers");
const reservationRoutes = require("./routes/reservations");

// JWT 검증 미들웨어
const authMiddleware = require("./middlewares/auth");

const app = express();

// CORS, JSON 바디 파싱
app.use(cors());
app.use(express.json());

// MySQL 풀 연결
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});
app.set("db", pool);

// ─── 인증 라우트 (토큰 없이 접근) ───
app.use("/auth", authRoutes);

// ─── 이후 모든 라우트는 JWT 검증 ───
app.use(authMiddleware);

// 헬스체크
app.get("/", (req, res) => {
  res.send("🚗 RCM API 실행 중");
});

// 보호된 리소스
app.use("/vehicles", vehicleRoutes);
app.use("/customers", customerRoutes);
app.use("/reservations", reservationRoutes);

// 에러 핸들러
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message });
});

const PORT = process.env.PORT || 6001;
app.listen(PORT, () => {
  console.log(`🚀 서버 실행: http://localhost:${PORT}`);
});
