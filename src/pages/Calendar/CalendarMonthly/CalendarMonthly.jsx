import { useDailyLooksByMonthQuery, useDailylookSummaryQuery } from "@/hooks/useDailyLookQuery";
import { formatDate, formatYearMonth } from "@/utils/calendarUtils";
import Calendar from "react-calendar";
import { useNavigate } from "react-router-dom";

import styles from "./CalendarMonthly.module.css";
import classNames from "classnames/bind";
import { useClothesStore } from "@/stores/clothesStore";

const cx = classNames.bind(styles);

const CalendarMonthly = ({ targetDate, date, setTargetDate, setViewMode, handleClickDay }) => {
  const navigate = useNavigate();

  const { data: dailyLooks = { data: [] }, isLoading, error } = useDailyLooksByMonthQuery(date);

  const isYearMonth = (value) => /^\d{4}-\d{2}$/.test(value);
  console.log("dailyLooks", dailyLooks);
  const {
    data: summary = {
      totalDailylooks: 10,
      mostWornOverall: {
        instanceId: "C251022002-1761218823935",
        clothesId: "C251022002",
        imageUrl:
          "https://memory-forest-test.s3.ap-southeast-2.amazonaws.com/8472952a-4278-4cf8-92e5-7e0f56cef253_image-removebg-preview (19).png",
        name: "브라운 스웨터",
        categoryCode: "B30007",
        x: 70,
        y: -10,
        scaleX: 0.5,
        scaleY: 0.5,
      },
      mostWornThisMonth: {
        instanceId: "C251022002-1761218823935",
        clothesId: "C251022002",
        imageUrl:
          "https://memory-forest-test.s3.ap-southeast-2.amazonaws.com/8472952a-4278-4cf8-92e5-7e0f56cef253_image-removebg-preview (19).png",
        name: "브라운 스웨터",
        categoryCode: "B30007",
        x: 70,
        y: -10,
        scaleX: 0.5,
        scaleY: 0.5,
      },
    },
    isLoading: isLoadingSummary,
  } = useDailylookSummaryQuery(isYearMonth(date) ? date : undefined);

  const { clearClothes } = useClothesStore();

  const trimDate = (datetime) => datetime.split(" ")[0];

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
                    setTargetDate(new Date(target.wearDate));
                    navigate(`/calendar/${formatDate(new Date(target.wearDate))}`);
                  }}
                />
              </div>
            );
          }}
        />
      )}
      <div className={cx("summaryRow")}>
        <button type="button" className={cx("summaryCard")} disabled>
          <div className={cx("summaryTitle")}>데일리룩</div>
          <div className={cx("summaryCount", "accent")}>{summary?.totalDailylooks || 0}개</div>
        </button>

        <button
          type="button"
          className={cx("summaryCard")}
          onClick={() => {
            const id = summary?.mostWornOverall?.clothesId;
            if (id) navigate(`/closet/item-sample/${id}`);
          }}
        >
          <div className={cx("summaryTitle")}>가장 많이입은 옷</div>
          <div className={cx("summaryThumbBox")}>
            {summary?.mostWornOverall?.imageUrl ? (
              <img
                className={cx("summaryThumb")}
                src={summary.mostWornOverall.imageUrl}
                alt={summary?.mostWornOverall?.name || "most worn overall"}
              />
            ) : (
              <div className={cx("summaryThumbSkeleton")} />
            )}
          </div>
        </button>

        <button
          type="button"
          className={cx("summaryCard")}
          onClick={() => {
            const id = summary?.mostWornThisMonth?.clothesId;
            if (id) navigate(`/closet/item-sample/${id}`);
          }}
        >
          <div className={cx("summaryTitle")}>이번달 많이입은옷</div>
          <div className={cx("summaryThumbBox")}>
            {summary?.mostWornThisMonth?.imageUrl ? (
              <img
                className={cx("summaryThumb")}
                src={summary.mostWornThisMonth.imageUrl}
                alt={summary?.mostWornThisMonth?.name || "most worn this month"}
              />
            ) : (
              <div className={cx("summaryThumbSkeleton")} />
            )}
          </div>
        </button>
      </div>
    </>
  );
};

export default CalendarMonthly;
