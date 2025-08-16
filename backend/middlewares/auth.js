// 📁 backend/middlewares/auth.js
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

module.exports = (req, res, next) => {
  // Preflight 요청
  if (req.method === "OPTIONS") return next();

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "토큰이 제공되지 않았습니다." });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = {
      user_id: decoded.user_id,
      company_id: decoded.company_id,
      name: decoded.name,
      role: decoded.role,
    };
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      // Access token 만료
      return res
        .status(401)
        .json({ error: "토큰 만료", code: "TOKEN_EXPIRED" });
    }
    // 토큰 자체가 잘못된 경우
    return res
      .status(401)
      .json({ error: "유효하지 않은 토큰입니다.", code: "TOKEN_INVALID" });
  }
};
