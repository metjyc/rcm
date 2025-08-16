// 📁 backend/controllers/authController.js

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// 환경변수가 설정되어 있지 않을 때를 대비한 기본값
const JWT_SECRET = process.env.JWT_SECRET || "default_jwt_secret";
const REFRESH_SECRET = process.env.REFRESH_SECRET || JWT_SECRET;

// 임시 리프레시 토큰 저장소 (프로덕션에서는 DB나 Redis 사용을 권장)
const refreshTokens = new Set();

/**
 * POST /auth/login
 * Body: { email, password }
 * Response: { accessToken, refreshToken, user }
 */
exports.login = async (req, res) => {
  const db = req.app.get("db");
  const { email, password } = req.body;

  try {
    // 1) 사용자 조회
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (rows.length === 0) {
      return res.status(401).json({ error: "이메일 또는 비밀번호 오류" });
    }
    const user = rows[0];

    // 2) 비밀번호 검증
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: "이메일 또는 비밀번호 오류" });
    }

    // 3) 토큰 페이로드 구성
    const payload = {
      user_id: user.user_id,
      company_id: user.company_id,
      name: user.name,
      role: user.role,
    };

    // 4) 액세스 토큰(2시간), 리프레시 토큰(7일) 발급
    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "2h" });
    const refreshToken = jwt.sign({ user_id: user.user_id }, REFRESH_SECRET, {
      expiresIn: "1h",
    });

    // 5) 리프레시 토큰 저장
    refreshTokens.add(refreshToken);

    // 6) 응답
    return res.json({
      accessToken,
      refreshToken,
      user: payload,
    });
  } catch (err) {
    console.error("▶︎ 로그인 실패:", err);
    return res.status(500).json({ error: "서버 오류" });
  }
};

/**
 * POST /auth/refresh
 * Body: { refreshToken }
 * Response: { accessToken }
 */
exports.refresh = (req, res) => {
  const { refreshToken } = req.body;

  // 1) 토큰 존재 및 저장소 유효성 확인
  if (!refreshToken || !refreshTokens.has(refreshToken)) {
    return res.status(401).json({ error: "리프레시 토큰 유효하지 않음" });
  }

  try {
    // 2) 리프레시 토큰 검증
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
    const payload = { user_id: decoded.user_id };
    // 필요 시 DB에서 company_id, name, role을 다시 조회해 payload를 완성하세요.

    // 3) 새로운 액세스 토큰 발급
    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "2h" });
    return res.json({ accessToken });
  } catch (err) {
    console.error("▶︎ 리프레시 실패:", err);
    return res.status(401).json({ error: "리프레시 토큰 유효하지 않음" });
  }
};

/**
 * POST /auth/logout
 * Body: { refreshToken }
 * Response: { message }
 */
exports.logout = (req, res) => {
  const { refreshToken } = req.body;
  // 1) 리프레시 토큰 제거
  refreshTokens.delete(refreshToken);
  return res.json({ message: "로그아웃 되었습니다." });
};
