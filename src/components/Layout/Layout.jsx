// components/Layout/Layout.jsx
import { Outlet, useMatches } from "react-router-dom";
import BottomNav from "@/components/Layout/BottomNav/BottomNav";
import Header from "@/components/Layout/Header/Header";
import styles from "./Layout.module.css";

const lastDefined = (arr) => [...arr].reverse().find((v) => v !== undefined);

const Layout = () => {
    const matches = useMatches();
    const handles = matches.map((m) => m.handle ?? {});

    const showHeader = lastDefined(handles.map((h) => h.showHeader));
    const showTabbar = lastDefined(handles.map((h) => h.showTabbar));

    return (
        <div className={styles.page}>
            <div className={styles.app}>
                {showHeader !== false && <Header />}
                <main className={styles["main-content"]}>
                    <Outlet />
                </main>
                {showTabbar && <BottomNav />}
            </div>
        </div>
    );
};

export default Layout;
