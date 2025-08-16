// 📁 backend/routes/auth.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// 로그인
// POST /auth/login
router.post("/login", authController.login);

// (선택) 회원가입
// POST /auth/register
// router.post("/register", authController.register);

module.exports = router;
