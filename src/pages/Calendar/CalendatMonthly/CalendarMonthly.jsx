import { useParams } from "react-router-dom";
import styles from "./CalendarMonthly.module.css";

const CalendarMonthly = () => {
  const { date } = useParams(); // "2025-09"
  return <h3 className={styles.color}>This is {date} Montly page</h3>;
};

export default CalendarMonthly;
