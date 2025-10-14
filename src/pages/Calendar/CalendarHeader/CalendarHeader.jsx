import React from "react";
import styles from "./CalendarHeader.module.css";

import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import { MdOutlineKeyboardArrowLeft } from "react-icons/md";

import cn from "classnames";

const CalendarHeader = ({ onButtonClick, children }) => {
  return (
    <header className={cn("calendar-header")}>
      <button id="prev" className={cn("action-button")} onClick={onButtonClick}>
        <MdOutlineKeyboardArrowLeft />
      </button>
      {children}
      <button id="next" className={cn("action-button")} onClick={onButtonClick}>
        <MdOutlineKeyboardArrowRight />
      </button>
    </header>
  );
};

export default CalendarHeader;
