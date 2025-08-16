# RCM Backend API Docs

Base URL: `http://localhost:5000/api`

---

## Customers

- `GET /customers` → 전체 고객 조회
- `POST /customers` → 고객 추가
- `PUT /customers/:id` → 고객 수정
- `DELETE /customers/:id` → 고객 삭제

## Vehicles

- `GET /vehicles` → 전체 차량 조회
- `GET /vehicles/:vin` → 특정 차량 조회
- `POST /vehicles` → 차량 등록
- `PUT /vehicles/:vin` → 차량 수정
- `DELETE /vehicles/:vin` → 차량 삭제

## Reservations

- `GET /reservations` → 예약 목록 조회
- `POST /reservations` → 예약 생성
- `PUT /reservations/:id` → 예약 수정
- `DELETE /reservations/:id` → 예약 삭제

---

### Auth (추후 확장 가능)

- `POST /auth/login`
- `POST /auth/register`
