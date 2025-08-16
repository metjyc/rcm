// 📁 src/components/CalendarHeader.jsx
import React from "react";
import dayjs from "dayjs";
import "dayjs/locale/ko"; // 한글 로케일 불러오기

dayjs.locale("ko"); // 모듈 단에서 한번만 전역 설정!

export default function CalendarHeader({ dateList, today }) {
  return (
    <thead>
      <tr>
        <th style={{ width: 120 }}>차량모델</th>
        <th style={{ width: 120 }}>차량번호</th>
        {dateList.map((date) => {
          const isToday = date === today.format("YYYY-MM-DD");
          return (
            <th
              key={date}
              style={{ width: 80 }}
              className={isToday ? "today-header" : ""}
            >
              {/* 한글 요일(월, 화, 수…) */}
              <div className="calendar-weekday">
                {dayjs(date).format("ddd")}
              </div>
              {/* 한글 월·일 포맷(06월 23일) */}
              <div>{dayjs(date).format("MM월 DD일")}</div>
            </th>
          );
        })}
      </tr>
    </thead>
  );
}
