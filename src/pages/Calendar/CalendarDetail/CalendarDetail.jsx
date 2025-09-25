import { useNavigate, useParams } from "react-router-dom";
import styles from "./CalendarDetail.module.css";

const CalendarDetail = () => {
  const { date } = useParams(); // "2025-09-24"

  const navigate = useNavigate();
  const handleAddDailyLook = () => {
    navigate("editor");
  };
  return (
    <>
      <h3 className={styles.color}>This is Calendar Detail page</h3>
      {console.log("day", date)}
      <h2>{date}</h2>
      <div>empty image box is here</div>
      <button onClick={handleAddDailyLook}>데일리룩 추가하기</button>
    </>
  );
};

export default CalendarDetail;
