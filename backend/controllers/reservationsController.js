// 📁 backend/controllers/reservationsController.js

const dayjs = require("dayjs");

/**
 * Reservation Controller
 * 모든 예약 CRUD 작업에서 company_id는
 * JWT 미들웨어로 세팅된 req.user.company_id 를 사용합니다.
 */

exports.getAllReservations = async (req, res) => {
  const db = req.app.get("db");
  const companyId = req.user.company_id;

  try {
    const [rows] = await db.query(
      `
      SELECT
        r.reservation_id,
        r.company_id,
        r.vin,
        v.model   AS vehicle_model,
        v.plate_number AS vehicle_plate,
        r.customer_id,
        c.name    AS customer_name,
        r.start_datetime,
        r.end_datetime,
        r.status,
        r.daily_price,
        r.discount,
        r.dispatch_location,
        r.return_location,
        r.payment_status,
        r.payment_method
      FROM reservations r
      JOIN customers c ON r.customer_id = c.customer_id
      JOIN vehicles  v ON r.vin         = v.vin
      WHERE r.company_id = ?
      ORDER BY r.start_datetime
      `,
      [companyId]
    );
    res.json(rows);
  } catch (err) {
    console.error("▶︎ 예약 조회 실패:", err);
    res.status(500).json({ error: "예약 조회 실패" });
  }
};

exports.getReservationById = async (req, res) => {
  const db = req.app.get("db");
  const companyId = req.user.company_id;
  const reservationId = req.params.id;

  try {
    const [rows] = await db.query(
      `
      SELECT
        r.reservation_id,
        r.company_id,
        r.vin,
        v.model         AS vehicle_model,
        v.plate_number  AS vehicle_plate,
        r.customer_id,
        c.name          AS customer_name,
        r.start_datetime,
        r.end_datetime,
        r.status,
        r.daily_price,
        r.discount,
        r.dispatch_location,
        r.return_location,
        r.payment_status,
        r.payment_method
      FROM reservations r
      JOIN customers c ON r.customer_id = c.customer_id
      JOIN vehicles  v ON r.vin         = v.vin
      WHERE r.company_id     = ?
        AND r.reservation_id = ?
      LIMIT 1
      `,
      [companyId, reservationId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "예약을 찾을 수 없습니다." });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error("▶︎ 단일 예약 조회 실패:", err);
    res.status(500).json({ error: "예약 조회 실패" });
  }
};

exports.createReservation = async (req, res) => {
  const db = req.app.get("db");
  const companyId = req.user.company_id;
  const {
    vin,
    customer_id,
    start_datetime,
    end_datetime,
    status,
    daily_price,
    discount,
    dispatch_location,
    return_location,
    payment_status,
    payment_method,
  } = req.body;

  try {
    const [result] = await db.query(
      `
      INSERT INTO reservations
        (company_id, vin, customer_id, start_datetime, end_datetime, status,
         daily_price, discount, dispatch_location, return_location,
         payment_status, payment_method)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        companyId,
        vin,
        customer_id,
        dayjs(start_datetime).format("YYYY-MM-DD HH:mm:ss"),
        dayjs(end_datetime).format("YYYY-MM-DD HH:mm:ss"),
        status || "PENDING",
        daily_price ?? null,
        discount ?? null,
        dispatch_location ?? null,
        return_location ?? null,
        payment_status ?? null,
        payment_method ?? null,
      ]
    );

    res.json({ reservation_id: result.insertId });
  } catch (err) {
    console.error("▶︎ 예약 생성 실패:", err);
    res.status(500).json({ error: "예약 생성 실패" });
  }
};

exports.updateReservation = async (req, res) => {
  const db = req.app.get("db");
  const companyId = req.user.company_id;
  const reservationId = req.params.id;
  const {
    vin,
    customer_id,
    start_datetime,
    end_datetime,
    status,
    daily_price,
    discount,
    dispatch_location,
    return_location,
    payment_status,
    payment_method,
  } = req.body;

  try {
    // 권한 확인
    const [existing] = await db.query(
      "SELECT reservation_id FROM reservations WHERE reservation_id = ? AND company_id = ?",
      [reservationId, companyId]
    );
    if (existing.length === 0) {
      return res.status(403).json({ error: "권한 없음 또는 예약 없음" });
    }

    await db.query(
      `
      UPDATE reservations SET
        vin               = ?,
        customer_id       = ?,
        start_datetime    = ?,
        end_datetime      = ?,
        status            = ?,
        daily_price       = ?,
        discount          = ?,
        dispatch_location = ?,
        return_location   = ?,
        payment_status    = ?,
        payment_method    = ?
      WHERE reservation_id = ?
        AND company_id     = ?
      `,
      [
        vin,
        customer_id,
        dayjs(start_datetime).format("YYYY-MM-DD HH:mm:ss"),
        dayjs(end_datetime).format("YYYY-MM-DD HH:mm:ss"),
        status || "PENDING",
        daily_price ?? null,
        discount ?? null,
        dispatch_location ?? null,
        return_location ?? null,
        payment_status ?? null,
        payment_method ?? null,
        reservationId,
        companyId,
      ]
    );

    res.json({ message: "예약 수정 완료" });
  } catch (err) {
    console.error("▶︎ 예약 수정 실패:", err);
    res.status(500).json({ error: "예약 수정 실패" });
  }
};

exports.deleteReservation = async (req, res) => {
  const db = req.app.get("db");
  const companyId = req.user.company_id;
  const reservationId = req.params.id;

  try {
    // 권한 확인
    const [existing] = await db.query(
      "SELECT reservation_id FROM reservations WHERE reservation_id = ? AND company_id = ?",
      [reservationId, companyId]
    );
    if (existing.length === 0) {
      return res.status(403).json({ error: "권한 없음 또는 예약 없음" });
    }

    await db.query(
      "DELETE FROM reservations WHERE reservation_id = ? AND company_id = ?",
      [reservationId, companyId]
    );

    res.json({ message: "예약 삭제 완료" });
  } catch (err) {
    console.error("▶︎ 예약 삭제 실패:", err);
    res.status(500).json({ error: "예약 삭제 실패" });
  }
};
