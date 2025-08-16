import React, { useEffect, useState } from "react";
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
  const [vehicles, setVehicles] = useState([]);
  const [schedules, setSchedules] = useState([]);

  // 모달 상태
  const [modalOpen, setModalOpen] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [initialData, setInitial] = useState({});

  // 데이터 로드
  const loadData = async () => {
    setVehicles(await fetchVehicles());
    setSchedules(await fetchReservations());
  };
  useEffect(() => {
    loadData();
  }, []);

  const dateList = Array.from({ length: DAYS_TO_SHOW }, (_, i) =>
    today.add(i, "day").format("YYYY-MM-DD")
  );

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

  // 생성/수정 콜백
  const handleOk = async (payload) => {
    if (formMode === "create") {
      await createReservation({ company_id: 1, ...payload });
    } else {
      await updateReservation(initialData.reservation_id, payload);
    }
    setModalOpen(false);
    await loadData();
  };

  // 삭제 콜백
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
                // 이 셀에 보이는 r 들만 필터
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
                    key={date}
                    className={`calendar-cell ${
                      date === today.format("YYYY-MM-DD") ? "today-border" : ""
                    }`}
                    onDoubleClick={() =>
                      openCreate(v.vin, v.name, v.plate, date)
                    }
                  >
                    {filtered.map((r) => {
                      // 이 예약이 보이는 첫 셀 계산
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
