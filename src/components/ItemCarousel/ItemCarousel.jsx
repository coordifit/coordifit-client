import styles from "./ItemCarousel.module.css";
import cn from "classnames";

const ItemCarousel = ({ items = [], selectedId, onClick }) => {
  return (
    <div className={styles.usedPanel}>
      <h3 className={styles.panelTitle}>사용된 아이템</h3>
      {items.length === 0 && <div className={styles.empty}>아직 없음</div>}
      <ul className={styles.usedList}>
        {items.map((o) => (
          <li
            key={o.id}
            className={cn(styles.usedItem, o.id === selectedId && styles.usedItemActive)}
            onClick={() => onClick?.(o.id)}
          >
            <img src={o.src} alt={o.name} className={styles.thumb} />
            <div className={styles.meta}>
              <div className={styles.name}>{o.name}</div>
              <div className={styles.category}>{o.category}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ItemCarousel;
