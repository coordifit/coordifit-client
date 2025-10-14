import { useMemo, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import "react-calendar/dist/Calendar.css";

import classNames from "classnames/bind";

import DatePicker from "../DatePicker/DatePicker";
import Modal from "@/components/Modal/Modal";
import { useClothesStore } from "@/store/clothesStore";
import styles from "./CalendarPage.module.css";
import CalendarHeader from "@calendar/CalendarHeader/CalendarHeader";
import ViewMode from "../ViewMode/ViewMode";
import { formatDate, formatYearMonth } from "@/utils/calendarUtils";

const cx = classNames.bind(styles);

const CalendarPage = () => {
  const [targetDate, setTargetDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("monthly");
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const navigate = useNavigate();
  const { clothes } = useClothesStore();

  const clickHandler = (date) => {
    const dateString = formatDate(new Date(date));

    setTargetDate(date);
    setViewMode("daily");
    navigate(`/calendar/${dateString}`);
  };

  const handleViewMode = (viewMode) => {
    let nextPath = "/calendar/";

    if (viewMode === "monthly") {
      nextPath += formatYearMonth(targetDate);
    } else if (viewMode === "daily") {
      nextPath += formatDate(targetDate);
    }

    if (clothes.length === 0) {
      setViewMode(viewMode);
      navigate(nextPath);
    }
  };

  const handleDayMove = (e) => {
    let offset = e.currentTarget.id === "prev" ? -1 : 1;

    const moveTargetDate = new Date(targetDate);

    moveTargetDate.setDate(targetDate.getDate() + offset);

    const nextPath = `/calendar/${formatDate(moveTargetDate)}`;

    if (clothes.length === 0) {
      setTargetDate(moveTargetDate);
      navigate(nextPath);
    }
  };

  const handleModal = (type) => {
    if (type === "open") {
      setIsDateModalOpen(true);
    } else if (type === "close") {
      setIsDateModalOpen(false);
    }
  };

  const handleDatePicker = (date) => {
    const pickedDate = `${date.year}-${date.month}-${date.day}`;
    const pickedDateObject = new Date(pickedDate);

    setIsDateModalOpen(false);
    setTargetDate(pickedDateObject);
    setViewMode("daily");

    navigate(`/calendar/${pickedDate}`);
  };

  const outletContext = useMemo(
    () => ({
      targetDate,
      setTargetDate,
      clickHandler,
      setViewMode,
    }),
    [viewMode, isDateModalOpen],
  );

  const handleMonthMove = (e) => {
    let offset = e.currentTarget.id === "prev" ? -1 : 1;

    const next = new Date(targetDate.getFullYear(), targetDate.getMonth() + offset, 1);

    setTargetDate(next);

    navigate(`/calendar/${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}`);
  };

  const ModalContent = (
    <ul>
      {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
        <li key={day}>{day}일</li>
      ))}
    </ul>
  );

  return (
    <>
      {viewMode === "monthly" && (
        <>
          <CalendarHeader onButtonClick={handleMonthMove}>
            <span className={cx("monthLabel")}>
              {targetDate.getFullYear()}년 {targetDate.getMonth() + 1}월
            </span>
            <button className={cx("dateButton")} onClick={() => handleModal("open")}>
              ▼
            </button>
          </CalendarHeader>
        </>
      )}
      {viewMode === "daily" && (
        <>
          <CalendarHeader onButtonClick={handleDayMove}>{formatDate(targetDate)}</CalendarHeader>
        </>
      )}
      <ViewMode viewMode={viewMode} onClick={handleViewMode} />
      <Outlet context={outletContext} />
      {isDateModalOpen && (
        <Modal title="날짜선택" onClose={() => handleModal("close")} children={ModalContent}>
          <DatePicker onConfirm={handleDatePicker} />
        </Modal>
      )}
    </>
  );
};

export default CalendarPage;
