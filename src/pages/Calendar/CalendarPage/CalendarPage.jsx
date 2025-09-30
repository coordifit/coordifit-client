import { Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";

import Calendar from "react-calendar";
import classNames from "classnames/bind";
import DatePicker from "../DatePicker/DatePicker";

import Modal from "@/components/Modal/Modal";

import "react-calendar/dist/Calendar.css";
import styles from "./CalendarPage.module.css";
import { useClothesStore } from "@/store/clothesStore";

const cx = classNames.bind(styles);

const CalendarPage = () => {
  const navigate = useNavigate();
  const [targetDate, setTargetDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("monthly");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { clearClothes } = useClothesStore();
  const toDateString = (dateObject) => dateObject.toISOString().split("T")[0];
  const toYearMonthString = (dateObject) => dateObject.toISOString().slice(0, 7);

  const clickHandler = (date) => {
    const dateString = toDateString(date);

    setTargetDate(date);
    setViewMode("daily");
    navigate(`/calendar/${dateString}`);
  };

  const handleDateMove = (type) => {
    console.log("targetDate", targetDate);
    const moveTargetDate = new Date(targetDate);
    console.log("moveTargetDate", moveTargetDate);

    if (type === "prev") {
      moveTargetDate.setDate(targetDate.getDate() - 1);
    } else if (type === "next") {
      moveTargetDate.setDate(targetDate.getDate() + 1);
    }

    clearClothes();
    setTargetDate(moveTargetDate);
    navigate(`/calendar/${toDateString(moveTargetDate)}`);
  };

  const handleViewMode = (e) => {
    const viewMode = e.currentTarget.innerText;

    if (viewMode === "monthly") {
      const yearMonth = toYearMonthString(targetDate);

      navigate(`/calendar/${yearMonth}`);
    } else if (viewMode === "daily") {
      const dateString = toDateString(targetDate);

      navigate(`/calendar/${dateString}`);
    }

    setViewMode(viewMode);
  };

  const handleModal = (type) => {
    if (type === "open") {
      setIsModalOpen(true);
    } else if (type === "close") {
      setIsModalOpen(false);
    }
  };

  const handleDatePicker = (date) => {
    console.log("date.month", date.month);
    const pickedDate = `${date.year}-${date.month}-${date.day}`;
    const pickedDateObject = new Date(pickedDate);

    setIsModalOpen(false);
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
      <div className={cx("viewmode-box")}>
        <div onClick={handleViewMode} className={cx("viewmode", { active: viewMode === "daily" })}>
          daily
        </div>
        <div
          onClick={handleViewMode}
          className={cx("viewmode", { active: viewMode === "monthly" })}
        >
          monthly
        </div>
      </div>
      {viewMode === "monthly" && (
        <>
          <span>
            {targetDate.getFullYear()}년 {targetDate.getMonth() + 1}월
          </span>
          <button onClick={() => handleModal("open")}>날짜 선택 ▼</button>

          <Calendar onChange={setTargetDate} value={targetDate} onClickDay={clickHandler} />
          {isModalOpen && (
            <Modal title="날짜선택" onClose={() => handleModal("close")} children={ModalContent}>
              <DatePicker onConfirm={handleDatePicker} />
            </Modal>
          )}
        </>
      )}
      {viewMode === "daily" && (
        <div>
          <button onClick={() => handleDateMove("prev")}>prev</button>
          {targetDate.toISOString()}
          <button onClick={() => handleDateMove("next")}>next</button>
        </div>
      )}
      <div className={cx("content-box")}>
        <Outlet />
      </div>
    </>
  );
};

export default CalendarPage;
