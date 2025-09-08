// 📁 backend/controllers/customersController.js
const db = require("../db");

// 공백/하이픈 제거 유틸
const strip = (v) => (typeof v === "string" ? v.replace(/\s|-/g, "") : v);
// 빈 문자열 → null
const nullIfEmpty = (v) => (v === "" ? null : v);

// 전체 고객 조회
exports.getAllCustomers = async (req, res) => {
  const companyId = req.user.company_id;
  try {
    const [rows] = await db.query(
      `SELECT customer_id, name, phone_number, email,
              zipcode, address, address_detail,
              ssn, birthdate, gender,
              license_number, license_expiry,
              note, is_blacklisted
       FROM customers
       WHERE company_id = ?
       ORDER BY customer_id DESC`,
      [companyId]
    );
    res.json(rows);
  } catch (err) {
    console.error("고객 조회 실패:", err);
    res.status(500).json({ error: "고객 조회 실패" });
  }
};

// 고객 추가
exports.createCustomer = async (req, res) => {
  const companyId = req.user.company_id;
  let {
    name,
    phone_number,
    email,
    zipcode,
    address,
    address_detail,
    ssn,
    birthdate,
    gender,
    license_number,
    license_expiry,
    note,
    is_blacklisted,
  } = req.body;

  try {
    // 1) 서버 측 정규화
    phone_number = phone_number ? strip(phone_number) : null;
    ssn = ssn ? strip(ssn) : null;
    license_number = license_number ? strip(license_number) : null;

    // 빈문자열을 null 로
    email = nullIfEmpty(email);
    zipcode = nullIfEmpty(zipcode);
    address = nullIfEmpty(address);
    address_detail = nullIfEmpty(address_detail);
    birthdate = nullIfEmpty(birthdate);
    gender = nullIfEmpty(gender);
    license_expiry = nullIfEmpty(license_expiry);
    note = nullIfEmpty(note);

    // 2) (권장) 중복 검사: 같은 회사 내에서 전화번호 중복 방지
    if (phone_number) {
      const [dup] = await db.query(
        `SELECT customer_id FROM customers
         WHERE company_id = ? AND phone_number = ? LIMIT 1`,
        [companyId, phone_number]
      );
      if (dup.length > 0) {
        return res.status(409).json({
          error: "이미 등록된 연락처입니다.",
          customer_id: dup[0].customer_id,
        });
      }
    }

    // 3) INSERT
    const sql = `
      INSERT INTO customers
        (name, phone_number, email,
         zipcode, address, address_detail,
         ssn, birthdate, gender,
         license_number, license_expiry,
         note, is_blacklisted, company_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.query(sql, [
      name,
      phone_number,
      email,
      zipcode,
      address,
      address_detail,
      ssn,
      birthdate,
      gender,
      license_number,
      license_expiry,
      note,
      is_blacklisted ? 1 : 0,
      companyId,
    ]);

    // 4) insertId 반환(프론트에서 즉시 선택)
    res.json({
      message: "고객 추가 완료!",
      customer_id: result.insertId,
      // 선택적으로 프론트가 바로 UI 반영에 쓸 수 있게 몇 개 더 보냄
      name,
      phone_number,
      email,
    });
  } catch (err) {
    console.error("고객 추가 실패:", err);
    res.status(500).json({ error: "고객 추가 실패" });
  }
};

// 고객 수정
exports.updateCustomer = async (req, res) => {
  const companyId = req.user.company_id;
  const customerId = req.params.id;
  let {
    name,
    phone_number,
    email,
    zipcode,
    address,
    address_detail,
    ssn,
    birthdate,
    gender,
    license_number,
    license_expiry,
    note,
    is_blacklisted,
  } = req.body;

  try {
    // 권한/소속 확인
    const [exist] = await db.query(
      "SELECT 1 FROM customers WHERE customer_id = ? AND company_id = ?",
      [customerId, companyId]
    );
    if (exist.length === 0)
      return res.status(403).json({ error: "권한 없음 또는 고객 없음" });

    // 서버 측 정규화
    phone_number = phone_number ? strip(phone_number) : null;
    ssn = ssn ? strip(ssn) : null;
    license_number = license_number ? strip(license_number) : null;

    email = nullIfEmpty(email);
    zipcode = nullIfEmpty(zipcode);
    address = nullIfEmpty(address);
    address_detail = nullIfEmpty(address_detail);
    birthdate = nullIfEmpty(birthdate);
    gender = nullIfEmpty(gender);
    license_expiry = nullIfEmpty(license_expiry);
    note = nullIfEmpty(note);

    const sql = `
      UPDATE customers SET
        name            = ?,
        phone_number    = ?,
        email           = ?,
        zipcode         = ?,
        address         = ?,
        address_detail  = ?,
        ssn             = ?,
        birthdate       = ?,
        gender          = ?,
        license_number  = ?,
        license_expiry  = ?,
        note            = ?,
        is_blacklisted  = ?
      WHERE customer_id = ?
    `;
    await db.query(sql, [
      name,
      phone_number,
      email,
      zipcode,
      address,
      address_detail,
      ssn,
      birthdate,
      gender,
      license_number,
      license_expiry,
      note,
      is_blacklisted ? 1 : 0,
      customerId,
    ]);
    res.json({ message: "고객 수정 완료!" });
  } catch (err) {
    console.error("고객 수정 실패:", err);
    res.status(500).json({ error: "고객 수정 실패" });
  }
};

// 고객 삭제
exports.deleteCustomer = async (req, res) => {
  const companyId = req.user.company_id;
  const customerId = req.params.id;
  try {
    const [check] = await db.query(
      "SELECT 1 FROM customers WHERE customer_id = ? AND company_id = ?",
      [customerId, companyId]
    );
    if (check.length === 0)
      return res.status(403).json({ error: "권한 없음 또는 고객 없음" });

    await db.query("DELETE FROM customers WHERE customer_id = ?", [customerId]);
    res.json({ message: "고객 삭제 완료!" });
  } catch (err) {
    console.error("고객 삭제 실패:", err);
    res.status(500).json({ error: "고객 삭제 실패" });
  }
};
