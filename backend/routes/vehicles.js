// 📁 backend/routes/vehicles.js
const express = require("express");
const router = express.Router();

// 컨트롤러에서 필요한 함수 모두 가져오기
const {
  getVehicles,
  getVehicleByVin,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} = require("../controllers/vehiclesController");

// GET    /vehicles        → 모든 차량 조회
router.get("/", getVehicles);

// GET    /vehicles/:vin   → 단일 차량 조회
router.get("/:vin", getVehicleByVin);

// POST   /vehicles        → 차량 생성
router.post("/", createVehicle);

// PUT    /vehicles/:vin   → 차량 수정
router.put("/:vin", updateVehicle);

// DELETE /vehicles/:vin   → 차량 삭제
router.delete("/:vin", deleteVehicle);

module.exports = router;
