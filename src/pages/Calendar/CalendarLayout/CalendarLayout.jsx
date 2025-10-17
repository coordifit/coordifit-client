import { useMemo, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";

import classNames from "classnames/bind";

import Modal from "@/components/Modal/Modal";
import CalendarHeader from "@calendar/CalendarHeader/CalendarHeader";
import DatePicker from "@calendar/DatePicker/DatePicker";
import ViewMode from "@calendar/ViewMode/ViewMode";

import { formatDate, formatYearMonth } from "@/utils/calendarUtils";
import styles from "./CalendarLayout.module.css";
import "react-calendar/dist/Calendar.css";
import { IoMdArrowDropdown } from "react-icons/io";
import Weather from "../Weather/Weather";
import { useClothesStore } from "@/stores/clothesStore";

const cx = classNames.bind(styles);

const CalendarLayout = () => {
  const [targetDate, setTargetDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("monthly");
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const navigate = useNavigate();
  const { clothes } = useClothesStore();

  const handleClickDay = (date) => {
    const dateString = formatDate(new Date(date));

    setTargetDate(date);
    setViewMode("daily");
    navigate(`/calendar/${dateString}`);
  };

  const outletContext = useMemo(
    () => ({
      targetDate,
      setTargetDate,
      handleClickDay,
      setViewMode,
    }),
    [targetDate, viewMode, handleClickDay],
  );

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

  const handleMonthMove = (e) => {
    let offset = e.currentTarget.id === "prev" ? -1 : 1;

    const nextMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + offset);

    setTargetDate(nextMonth);
    navigate(`/calendar/${formatYearMonth(nextMonth)}`);
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
            <div>
              <span className={cx("monthLabel")}>
                {targetDate.getFullYear()}년 {targetDate.getMonth() + 1}월
              </span>
              <button className={cx("dateButton")} onClick={() => handleModal("open")}>
                <IoMdArrowDropdown className={cx("arrowIcon")} />
              </button>
            </div>
          </CalendarHeader>
        </>
      )}
      {viewMode === "daily" && (
        <>
          <CalendarHeader onButtonClick={handleDayMove}>
            <div>
              <span className={cx("monthLabel")}>{formatDate(targetDate)}</span>
              <Weather targetDate={targetDate} />
            </div>
          </CalendarHeader>
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

export default CalendarLayout;
