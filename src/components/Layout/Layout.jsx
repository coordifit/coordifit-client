import { Outlet } from "react-router-dom";
import BottomNav from "@/components/Layout/BottomNav/BottomNav";
import Header from "@/components/Layout/Header/Header";
import styles from "./Layout.module.css";

const Layout = () => {
    return (
        <div className={styles.page}>
            <div className={styles.app}>
                <Header />
                <main className={styles["main-content"]}>
                    <Outlet />
                </main>
                <BottomNav />
            </div>
        </div>
    );
};
export default Layout;
