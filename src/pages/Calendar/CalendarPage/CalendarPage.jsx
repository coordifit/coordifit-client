import { useState } from "react";
import { Outlet, useNavigate, useParams } from "react-router-dom";

import Calendar from "react-calendar";
import classNames from "classnames/bind";
import "react-calendar/dist/Calendar.css";

import DatePicker from "../DatePicker/DatePicker";
import Modal from "@/components/Modal/Modal";
import { useClothesStore } from "@/store/clothesStore";
import { useDailyLooksByMonthQuery } from "@/hooks/useDailyLookQuery";
import { formatDate, formatYearMonth } from "@/utils/calenderUtils";
import styles from "./CalendarPage.module.css";

const cx = classNames.bind(styles);

const CalendarPage = () => {
  const navigate = useNavigate();
  const [targetDate, setTargetDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("monthly");
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [pendingViewMode, setPendingViewMode] = useState(null);
  const [pendingPath, setPendingPath] = useState(null);
  const [pendingDate, setPendingDate] = useState(null);
  const { clearClothes, clothes } = useClothesStore();

  const { date } = useParams();

  const { data: dailyLooks = { data: [] }, isLoading, error } = useDailyLooksByMonthQuery(date);
  const trimDate = (datetime) => datetime.split(" ")[0];
  const isYearMonth = (value) => /^\d{4}-\d{2}$/.test(value);

  const clickHandler = (date) => {
    const dateString = formatDate(new Date(date));

    setTargetDate(date);
    setViewMode("daily");
    navigate(`/calendar/${dateString}`);
  };

  const verifyClothes = () => {
    if (clothes.length === 0) {
      return true;
    }

    setIsCancelModalOpen(true);

    return false;
  };

  const clearPending = () => {
    setPendingDate(null);
    setPendingPath(null);
    setPendingViewMode(null);
  };

  const handlerCancelModal = () => {
    clearClothes();
    setIsCancelModalOpen(false);

    if (pendingDate) setTargetDate(pendingDate);
    if (pendingViewMode) setViewMode(pendingViewMode);
    if (pendingPath) navigate(pendingPath);

    clearPending();
  };

  const closeCancelModal = () => {
    setIsCancelModalOpen(false);
  };

  const handleViewMode = (e) => {
    const viewMode = e.currentTarget.innerText;
    let nextPath = null;

    if (viewMode === "monthly") {
      nextPath = formatYearMonth(targetDate);
    } else if (viewMode === "daily") {
      nextPath = formatDate(targetDate);
      setPendingDate(targetDate);
    }

    setPendingViewMode(viewMode);
    setPendingPath(nextPath);

    if (verifyClothes(`/calendar/${nextPath}`)) {
      setViewMode(viewMode);
      navigate(`/calendar/${nextPath}`);
      clearPending();
    }
  };

  const handleDateMove = (type) => {
    const moveTargetDate = new Date(targetDate);

    if (type === "prev") {
      moveTargetDate.setDate(targetDate.getDate() - 1);
    } else if (type === "next") {
      moveTargetDate.setDate(targetDate.getDate() + 1);
    }

    const nextPath = `/calendar/${formatDate(moveTargetDate)}`;

    setPendingPath(nextPath);
    setPendingDate(moveTargetDate);

    if (verifyClothes(nextPath)) {
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
    console.log("date.month", date.month);
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
  if (isLoading) return <h1>로딩 중...</h1>;
  if (error)
    return (
      <>
        <p>데이터를 불러오는 중 오류가 발생했습니다.</p>
        <span>error</span>
      </>
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
      {viewMode === "monthly" && isYearMonth(date) && (
        <>
          <span>
            {targetDate.getFullYear()}년 {targetDate.getMonth() + 1}월
          </span>
          <button onClick={() => handleModal("open")}>날짜 선택 ▼</button>

          <Calendar
            onChange={setTargetDate}
            value={targetDate}
            onClickDay={clickHandler}
            onActiveStartDateChange={({ activeStartDate }) => {
              console.log("activeStartDate", activeStartDate);
              setTargetDate(activeStartDate);
              navigate(`/calendar/${formatYearMonth(activeStartDate)}`);
            }}
            tileContent={({ date, view }) => {
              if (view !== "month") return null;
              const target = dailyLooks.data.find(
                (item) => trimDate(item.wearDate) === formatDate(date),
              );
              if (!target) return null;

              return (
                <div className={cx("calendar-thumb-wrapper")}>
                  <img
                    src={target.thumbImageUrl}
                    alt=""
                    className={cx("calendar-thumb")}
                    onClick={(e) => {
                      e.stopPropagation();
                      setViewMode("daily");
                      clearClothes();
                      navigate(`/calendar/${formatDate(new Date(target.wearDate))}`);
                    }}
                  />
                </div>
              );
            }}
          />
          {isDateModalOpen && (
            <Modal title="날짜선택" onClose={() => handleModal("close")} children={ModalContent}>
              <DatePicker onConfirm={handleDatePicker} />
            </Modal>
          )}
        </>
      )}
      {viewMode === "daily" && (
        <div>
          <button onClick={() => handleDateMove("prev")}>prev</button>
          {formatDate(targetDate)}
          <button onClick={() => handleDateMove("next")}>next</button>
        </div>
      )}
      <div className={cx("content-box")}>
        <Outlet />
      </div>
      {isCancelModalOpen && (
        <Modal
          onClose={closeCancelModal}
          footer={
            <>
              <button type="button" onClick={closeCancelModal}>
                아니요
              </button>
              <button type="button" onClick={handlerCancelModal}>
                예
              </button>
            </>
          }
          children={"작성중인 데일리룩은 삭제됩니다. \n 계속 하시겠습니까?"}
        />
      )}
    </>
  );
};

export default CalendarPage;
