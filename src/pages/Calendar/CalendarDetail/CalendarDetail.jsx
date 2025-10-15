import { useNavigate, useParams } from "react-router-dom";
import styles from "./CalendarDetail.module.css";
import ItemCarousel from "@/components/ItemCarousel/ItemCarousel";
import Button from "@/components/Button/Button";
import { useDailyLookByDateQuery } from "@/hooks/useDailyLookQuery";
import emptyImage from "@/assets/images/empty_image.png";

import classNames from "classnames/bind";

const cx = classNames.bind(styles);

const CalendarDetail = () => {
  const { date } = useParams();
  const navigate = useNavigate();

  const handleAddDailyLook = () => {
    navigate("editor");
  };

  const { data: dailyLook = { data: {} }, isLoading, isError } = useDailyLookByDateQuery(date);

  const handleEditClick = () => {
    navigate("editor");
  };
  const handleDeleteClick = async () => {
    if (!dailyLook?.data?.id) {
      alert("삭제할 데일리룩이 없습니다.");
      return;
    }
  };

  return (
    <div className={cx("container")}>
      {dailyLook?.data?.canvasJson ? (
        <>
          <div className={cx("wrapper")}>
            <img
              className={cx("image")}
              src={dailyLook.data.originImageUrl}
              alt="Daily Look Thumbnail"
            />
          </div>

          <ItemCarousel items={JSON.parse(dailyLook.data.canvasJson)} />
          <div className={cx("button-wrapper")}>
            <Button onClick={handleEditClick} style="default">
              수정하기
            </Button>
            <Button onClick={handleDeleteClick} style="secondary">
              삭제하기
            </Button>
          </div>
        </>
      ) : (
        <>
          {/* 콘텐츠 */}
          <div className={cx("content")}>
            <img
              src={emptyImage}
              alt="비어 있는 데일리룩"
              className={cx("emptyImage")}
              draggable={false}
            />
            <p className={styles.message}>아직 등록된 코디가 없어요.</p>

            <Button size="large" onClick={handleAddDailyLook}>
              데일리룩 만들기
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default CalendarDetail;
