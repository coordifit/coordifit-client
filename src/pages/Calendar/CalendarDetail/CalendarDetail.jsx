import { useParams } from "react-router-dom";
import styles from "./CalendarDetail.module.css";

const CalendarDetail = () => {
  const { day } = useParams(); // "2025-09-24"

  return (
    <>
      <h3 className={styles.color}>This is Calendar Detail page</h3>
      <h2>{day}</h2>
    </>
  );
};

export default CalendarDetail;
