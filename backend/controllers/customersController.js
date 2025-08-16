// 📁 backend/controllers/customersController.js
const db = require("../db");

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
       WHERE company_id = ?`,
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
  const {
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
    const sql = `
      INSERT INTO customers
        (name, phone_number, email,
         zipcode, address, address_detail,
         ssn, birthdate, gender,
         license_number, license_expiry,
         note, is_blacklisted, company_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await db.query(sql, [
      name,
      phone_number || null,
      email || null,
      zipcode || null,
      address || null,
      address_detail || null,
      ssn || null,
      birthdate || null,
      gender || null,
      license_number || null,
      license_expiry || null,
      note || null,
      is_blacklisted ? 1 : 0,
      companyId,
    ]);
    res.json({ message: "고객 추가 완료!" });
  } catch (err) {
    console.error("고객 추가 실패:", err);
    res.status(500).json({ error: "고객 추가 실패" });
  }
};

// 고객 수정
exports.updateCustomer = async (req, res) => {
  const companyId = req.user.company_id;
  const customerId = req.params.id;
  const {
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
    // 권한 확인
    const [exist] = await db.query(
      "SELECT 1 FROM customers WHERE customer_id = ? AND company_id = ?",
      [customerId, companyId]
    );
    if (exist.length === 0)
      return res.status(403).json({ error: "권한 없음 또는 고객 없음" });

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
      phone_number || null,
      email || null,
      zipcode || null,
      address || null,
      address_detail || null,
      ssn || null,
      birthdate || null,
      gender || null,
      license_number || null,
      license_expiry || null,
      note || null,
      is_blacklisted ? 1 : 0,
      customerId,
    ]);
    res.json({ message: "고객 수정 완료!" });
  } catch (err) {
    console.error("고객 수정 실패:", err);
    res.status(500).json({ error: "고객 수정 실패" });
  }
};

// 고객 삭제 (변경 없음)
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
