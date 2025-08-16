// 📁 src/components/CalendarCell.jsx
import React from "react";

export default function CalendarCell({
  date,
  isToday,
  onDoubleClick,
  children,
}) {
  return (
    <td
      style={{ width: 80, padding: 0 }}
      className={`calendar-cell ${isToday ? "today-border" : ""}`}
      onDoubleClick={onDoubleClick}
    >
      <div className="cell-inner">{children}</div>
    </td>
  );
}
