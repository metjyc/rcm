// 📁 src/pages/CalendarPage.js
import React, { useEffect, useMemo, useState, useCallback } from "react";
import dayjs from "dayjs";
import "dayjs/locale/ko";

import {
  fetchVehicles,
  fetchReservations,
  createReservation,
  updateReservation,
  deleteReservation,
} from "../util/RentcarAPI";

import ReservationBar from "../components/ReservationBar";
import ReservationFormModal from "../components/ReservationFormModal";
import "./Calendar.css";

dayjs.locale("ko");

const DAYS_TO_SHOW = 30;
const CELL_WIDTH_PX = 80;

export default function CalendarPage() {
  const today = dayjs();

  // 데이터
  const [vehicles, setVehicles] = useState([]);
  const [schedules, setSchedules] = useState([]);

  // 모달 상태
  const [modalOpen, setModalOpen] = useState(false);
  const [formMode, setFormMode] = useState("create"); // 'create' | 'edit'
  const [initialData, setInitial] = useState({});

  // 날짜 리스트
  const dateList = useMemo(
    () =>
      Array.from({ length: DAYS_TO_SHOW }, (_, i) =>
        today.add(i, "day").format("YYYY-MM-DD")
      ),
    [today]
  );

  // 데이터 로드
  const loadData = useCallback(async () => {
    const [v, r] = await Promise.all([fetchVehicles(), fetchReservations()]);
    setVehicles(v || []);
    setSchedules(r || []);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 새 예약 모달 열기
  const openCreate = (vin, name, plate, date) => {
    setFormMode("create");
    setInitial({ vin, name, plate, date });
    setModalOpen(true);
  };

  // 수정 모달 열기
  const openEdit = (r) => {
    const vehicle = vehicles.find((v) => v.vin === r.vin) || {};
    setFormMode("edit");
    setInitial({
      reservation_id: r.reservation_id,
      vin: r.vin,
      name: vehicle.name,
      plate: vehicle.plate,
      start_datetime: r.start_datetime,
      end_datetime: r.end_datetime,
      customer_id: r.customer_id,
    });
    setModalOpen(true);
  };

  // 생성/수정 콜백 (ReservationFormModal -> onOk)
  const handleOk = async (payload) => {
    if (formMode === "create") {
      // 프론트에서 company_id 안 보냄 (백엔드에서 req.user.company_id 사용)
      await createReservation(payload);
    } else {
      await updateReservation(initialData.reservation_id, payload);
    }
    setModalOpen(false);
    await loadData();
  };

  // 삭제 콜백 (ReservationFormModal -> onDelete)
  const handleDelete = async (id) => {
    await deleteReservation(id);
    setModalOpen(false);
    await loadData();
  };

  return (
    <div className="calendar-container">
      <h2 className="current-date">오늘 {today.format("YYYY년 MM월 DD일")}</h2>

      <table className="calendar-table">
        <thead>
          <tr>
            <th style={{ width: 120 }}>차량모델</th>
            <th style={{ width: 120 }}>차량번호</th>
            {dateList.map((date) => {
              const isToday = date === today.format("YYYY-MM-DD");
              return (
                <th
                  key={date}
                  style={{ width: CELL_WIDTH_PX }}
                  className={isToday ? "today-header" : ""}
                >
                  <div className="calendar-weekday">
                    {dayjs(date).format("dd")}
                  </div>
                  <div>{dayjs(date).format("MM월 DD일")}</div>
                </th>
              );
            })}
          </tr>
        </thead>

        <tbody>
          {vehicles.map((v) => (
            <tr key={v.vin}>
              <td style={{ width: 120 }}>{v.name}</td>
              <td style={{ width: 120 }}>{v.plate}</td>

              {dateList.map((date) => {
                const filtered = schedules.filter(
                  (r) =>
                    r.vin === v.vin &&
                    dayjs(r.start_datetime).isBefore(
                      dayjs(date).endOf("day")
                    ) &&
                    dayjs(r.end_datetime).isAfter(dayjs(date).startOf("day"))
                );

                return (
                  <td
                    key={`${v.vin}-${date}`}
                    className={`calendar-cell ${
                      date === today.format("YYYY-MM-DD") ? "today-border" : ""
                    }`}
                    onDoubleClick={() =>
                      openCreate(v.vin, v.name, v.plate, date)
                    }
                  >
                    {filtered.map((r) => {
                      const rStart = dayjs(r.start_datetime);
                      const firstDate = rStart.isBefore(
                        dayjs(dateList[0]).startOf("day")
                      )
                        ? dateList[0]
                        : rStart.format("YYYY-MM-DD");

                      return (
                        <ReservationBar
                          key={r.reservation_id}
                          r={r}
                          date={date}
                          firstVisibleDate={firstDate}
                          onClick={() => openEdit(r)}
                        />
                      );
                    })}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <ReservationFormModal
        open={modalOpen}
        formMode={formMode}
        initial={initialData}
        onCancel={() => setModalOpen(false)}
        onOk={handleOk}
        onDelete={handleDelete}
      />
    </div>
  );
}
