import { Link, useLocation } from "react-router-dom";
import styles from "./BottomNav.module.css";
import clsx from "clsx";

import {
    MdCalendarToday,
    MdCameraAlt,
    MdCheckroom,
    MdPerson,
    MdHome,
} from "react-icons/md";

const BottomNav = () => {
    const location = useLocation();

    const tabs = [
        { to: "/closet", icon: <MdCheckroom size={26} />, label: "내 옷장" },
        {
            to: "/calendar",
            icon: <MdCalendarToday size={24} />,
            label: "코디 캘린더",
        },
        { to: "/", icon: <MdHome size={24} />, label: "홈" },
        { to: "/snap", icon: <MdCameraAlt size={24} />, label: "스냅" },
        { to: "/mypage", icon: <MdPerson size={24} />, label: "마이페이지" },
    ];

    return (
        <nav className={styles["bottom-nav"]}>
            {tabs.map((tab) => (
                <Link
                    key={tab.to}
                    to={tab.to}
                    className={clsx(styles["tab-item"], {
                        [styles.active]:
                            location.pathname === tab.to ||
                            (tab.to !== "/" &&
                                location.pathname.startsWith(`${tab.to}/`)),
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
