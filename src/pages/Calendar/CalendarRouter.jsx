import { Outlet, useParams } from "react-router-dom";

import CalendarMonthly from "./CalendatMonthly/CalendarMonthly";

const CalendarRouter = () => {
  const { date } = useParams();

  if (/^\d{4}-\d{2}$/.test(date)) {
    return <CalendarMonthly />;
  } else if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return <Outlet />;
  } else {
    return <h2>404 Not Found</h2>;
  }
};

export default CalendarRouter;
