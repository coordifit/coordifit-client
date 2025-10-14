import { useNavigate, useParams } from "react-router-dom";
import styles from "./CalendarDetail.module.css";
import ItemCarousel from "@/components/ItemCarousel/ItemCarousel";
import Button from "@/components/Button/Button";
import { useDailyLookByDateQuery } from "@/hooks/useDailyLookQuery";

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
    <div className={styles.container}>
      <h2>{date}</h2>
      {dailyLook?.data?.canvasJson ? (
        <>
          <img
            className={styles.image}
            src={dailyLook.data.originImageUrl}
            alt="Daily Look Thumbnail"
          />
          <ItemCarousel items={JSON.parse(dailyLook.data.canvasJson)} />
          <div className={styles["button-wrapper"]}>
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
          <div>등록된 데일리룩이 없습니다.</div>
          <div>empty image box is here</div>
        </>
      )}

      <button onClick={handleAddDailyLook}>데일리룩 추가하기</button>
    </div>
  );
};

export default CalendarDetail;
