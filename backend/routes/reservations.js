// 📁 backend/routes/reservations.js
const express = require("express");
const router = express.Router();

// 컨트롤러에서 함수 가져오기
const {
  getAllReservations,
  getReservationById,
  createReservation,
  updateReservation,
  deleteReservation,
} = require("../controllers/reservationsController");

// GET    /reservations        → 전체 예약 조회
router.get("/", getAllReservations);

// GET    /reservations/:id    → 단일 예약 조회
router.get("/:id", getReservationById);

// POST   /reservations        → 예약 생성
router.post("/", createReservation);

// PUT    /reservations/:id    → 예약 수정
router.put("/:id", updateReservation);

// DELETE /reservations/:id    → 예약 삭제
router.delete("/:id", deleteReservation);

module.exports = router;
