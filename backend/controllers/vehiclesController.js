// 📁 backend/controllers/vehiclesController.js
const db = require("../db");

// ─── 모든 차량 조회 ───
exports.getVehicles = async (req, res) => {
  const companyId = req.user.company_id;
  try {
    const [rows] = await db.query(
      "SELECT vin, model, plate_number, year FROM vehicles WHERE company_id = ?",
      [companyId]
    );
    res.json(rows);
  } catch (err) {
    console.error("차량 조회 실패:", err);
    res.status(500).json({ error: "차량 조회 실패" });
  }
};

// ─── 단일 차량 조회 ───
exports.getVehicleByVin = async (req, res) => {
  const companyId = req.user.company_id;
  const { vin } = req.params;
  try {
    const [rows] = await db.query(
      "SELECT vin, model, plate_number, year FROM vehicles WHERE vin = ? AND company_id = ?",
      [vin, companyId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "차량을 찾을 수 없습니다." });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error("단일 차량 조회 실패:", err);
    res.status(500).json({ error: "차량 조회 실패" });
  }
};

// ─── 차량 등록 ───
exports.createVehicle = async (req, res) => {
  const companyId = req.user.company_id;
  const { vin, model, plate_number, year } = req.body;

  try {
    await db.query(
      `INSERT INTO vehicles (vin, model, plate_number, year, company_id)
       VALUES (?, ?, ?, ?, ?)`,
      [vin, model, plate_number, year, companyId]
    );
    res.json({ message: "차량 등록 성공" });
  } catch (err) {
    console.error("차량 등록 실패:", err);
    res.status(500).json({ error: "차량 등록 실패" });
  }
};

// ─── 차량 수정 (VIN 포함) ───
exports.updateVehicle = async (req, res) => {
  const companyId = req.user.company_id;
  const oldVin = req.params.vin;
  const { vin: newVin, model, plate_number, year } = req.body;

  try {
    // 권한 및 존재 여부 확인
    const [check] = await db.query(
      "SELECT 1 FROM vehicles WHERE vin = ? AND company_id = ?",
      [oldVin, companyId]
    );
    if (check.length === 0) {
      return res.status(403).json({ error: "권한 없음 또는 차량 없음" });
    }

    // VIN 포함하여 업데이트
    await db.query(
      `UPDATE vehicles
         SET vin = ?, model = ?, plate_number = ?, year = ?
       WHERE vin = ? AND company_id = ?`,
      [newVin, model, plate_number, year, oldVin, companyId]
    );
    res.json({ message: "차량 수정 성공" });
  } catch (err) {
    console.error("차량 수정 실패:", err);
    res.status(500).json({ error: "차량 수정 실패" });
  }
};

// ─── 차량 삭제 ───
exports.deleteVehicle = async (req, res) => {
  const companyId = req.user.company_id;
  const { vin } = req.params;

  try {
    // 권한 및 존재 여부 확인
    const [check] = await db.query(
      "SELECT 1 FROM vehicles WHERE vin = ? AND company_id = ?",
      [vin, companyId]
    );
    if (check.length === 0) {
      return res.status(403).json({ error: "권한 없음 또는 차량 없음" });
    }

    await db.query("DELETE FROM vehicles WHERE vin = ?", [vin]);
    res.json({ message: "차량 삭제 성공" });
  } catch (err) {
    console.error("차량 삭제 실패:", err);
    res.status(500).json({ error: "차량 삭제 실패" });
  }
};
