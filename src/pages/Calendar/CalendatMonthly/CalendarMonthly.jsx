import { useParams } from "react-router-dom";
import styles from "./CalendarMonthly.module.css";

const CalendarMonthly = () => {
  const { yearMonth } = useParams();
  return <h3 className={styles.color}>This is {yearMonth} Montly page</h3>;
};

export default CalendarMonthly;
