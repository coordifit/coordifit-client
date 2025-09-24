import { Outlet } from "react-router-dom";
import BottomNav from "@/components/BottomNav/BottomNav";

import styles from "./Layout.module.css";

const Layout = () => {
  return (
    <div className={styles.page}>
      <div className={styles.app}>
        <main className={styles["main-content"]}>
          <Outlet />
        </main>
        <BottomNav />
      </div>
    </div>
  );
};
export default Layout;
