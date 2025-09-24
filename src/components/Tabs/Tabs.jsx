import clsx from "clsx";
import styles from "./Tabs.module.css";
const Tabs = ({ tabs, activeTab, onChange }) => {
    return (
        <div className={styles.tabs}>
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    type="button"
                    className={clsx(styles.tab, {
                        [styles.active]: tab.id === activeTab,
                    })}
                    onClick={() => onChange(tab.id)}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
};
export default Tabs;
