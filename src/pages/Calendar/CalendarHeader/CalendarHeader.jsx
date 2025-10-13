import React from "react";
import styles from "./CalendarHeader.module.css";

const CalendarHeader = ({ targetDate, setTargetDate, navigate, onOpenDateModal }) => {
  const year = targetDate.getFullYear();
  const month = targetDate.getMonth() + 1;

  const handlePrev = () => {
    const prev = new Date(year, month - 1, 1);
    setTargetDate(prev);
    navigate(`/calendar/${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, "0")}`);
  };

  const handleNext = () => {
    const next = new Date(year, month + 1, 1);
    setTargetDate(next);
    navigate(`/calendar/${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}`);
  };

  return (
    <div className="calendar-header">
      <button className={styles.navButton} onClick={handlePrev}>
        ◀
      </button>
      <span className={styles.monthLabel}>
        {year}년 {month}월
      </span>
      <button className={styles.dateButton} onClick={() => onOpenDateModal("open")}>
        ▼
      </button>
      <button className={styles.navButton} onClick={handleNext}>
        ▶
      </button>
    </div>
  );
};

export default CalendarHeader;
