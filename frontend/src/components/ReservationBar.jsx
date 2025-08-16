// 📁 src/components/ReservationBar.jsx
import React from "react";
import dayjs from "dayjs";

export default function ReservationBar({ r, date, firstVisibleDate, onClick }) {
  const resStart = dayjs(r.start_datetime);
  const resEnd = dayjs(r.end_datetime);
  const dayStart = dayjs(date).startOf("day");
  const dayEnd = dayjs(date).endOf("day");

  // 1) 분 단위 위치 계산
  const fromMin = resStart.isBefore(dayStart)
    ? 0
    : resStart.diff(dayStart, "minute");
  const toMin = resEnd.isAfter(dayEnd) ? 1440 : resEnd.diff(dayStart, "minute");

  // 2) 퍼센트 변환
  const leftPct = (fromMin / 1440) * 100;
  const widthPct = ((toMin - fromMin) / 1440) * 100;

  // 3) border-radius 계산
  const startDate = resStart.format("YYYY-MM-DD");
  const endDate = resEnd.format("YYYY-MM-DD");
  const isStart = date === startDate;
  const isEnd = date === endDate;

  let radius;
  if (isStart && isEnd) radius = "4px";
  else if (isStart) radius = "4px 0 0 4px";
  else if (isEnd) radius = "0 4px 4px 0";
  else radius = "0";

  // 4) 이름 표시 여부 (보이는 첫 셀에서만)
  const showName = date === firstVisibleDate;

  return (
    <div
      className="bar"
      onClick={onClick}
      style={{
        position: "absolute",
        left: `calc(${leftPct}% - 1px)`, // 좌우 1px씩 덮기
        width: `calc(${widthPct}% + 2px)`,
        borderRadius: radius,
        background: "#4caf50",
        zIndex: 2,
        overflow: "visible",
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        padding: "0 4px",
      }}
    >
      {showName && (
        <span
          className="name"
          style={{
            whiteSpace: "nowrap",
            overflow: "visible",
            textOverflow: "clip",
            position: "relative",
            zIndex: 3,
            color: "#fff",
            fontWeight: 500,
          }}
        >
          {r.customer_name}
        </span>
      )}
    </div>
  );
}
