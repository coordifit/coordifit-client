import { useDailyLooksByMonthQuery } from "@/hooks/useDailyLookQuery";
import { useClothesStore } from "@/store/clothesStore";
import { formatDate, formatYearMonth } from "@/utils/calendarUtils";
import Calendar from "react-calendar";
import { useNavigate } from "react-router-dom";

import styles from "./CalendarMonthly.module.css";
import classNames from "classnames/bind";

const cx = classNames.bind(styles);

const CalendarMonthly = ({ targetDate, date, setTargetDate, setViewMode, handleClickDay }) => {
  const navigate = useNavigate();

  const { data: dailyLooks = { data: [] }, isLoading, error } = useDailyLooksByMonthQuery(date);

  const { clearClothes } = useClothesStore();

  const trimDate = (datetime) => datetime.split(" ")[0];
  const isYearMonth = (value) => /^\d{4}-\d{2}$/.test(value);

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
      {isYearMonth(date) && (
        <Calendar
          locale="en-US"
          formatShortWeekday={(locale, date) =>
            ["일", "월", "화", "수", "목", "금", "토"][date.getDay()]
          }
          value={targetDate}
          onClickDay={handleClickDay}
          showNavigation={false}
          tileClassName={({ date, view }) => {
            if (view !== "month") return null;
            const day = date.getDay();
            if (day === 0) return "sunday";
            if (day === 6) return "saturday";
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
      )}
    </>
  );
};

export default CalendarMonthly;
