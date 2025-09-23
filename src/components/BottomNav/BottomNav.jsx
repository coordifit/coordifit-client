import { Link, useLocation } from "react-router-dom";
import styles from "./BottomNav.module.css";
import clsx from "clsx";

import {
  MdCalendarToday,
  MdCameraAlt,
  MdCheckroom,
  MdImage,
  MdHome,
} from "react-icons/md";

const BottomNav = () => {
  const location = useLocation();

  const tabs = [
    { to: "/", icon: <MdHome size={24} />, label: "홈" },
    { to: "/calendar", icon: <MdCalendarToday size={24} />, label: "캘린더" },
    { to: "/snap", icon: <MdCameraAlt size={24} />, label: "스냅" },
    { to: "/closet", icon: <MdCheckroom size={28} />, label: "옷장" },
    { to: "/images", icon: <MdImage size={24} />, label: "이미지" },
  ];

  return (
    <nav className={styles["bottom-nav"]}>
      {tabs.map((tab) => (
        <Link
          key={tab.to}
          to={tab.to}
          className={clsx(styles["tab-item"], {
            [styles.active]: location.pathname === tab.to,
          })}
        >
          {tab.icon}
          <span>{tab.label}</span>
        </Link>
      ))}
    </nav>
  );
};

export default BottomNav;
