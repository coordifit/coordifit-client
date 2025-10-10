import styles from "./ClosetModal.module.css";
import cn from "classnames";

import top1 from "@images/top1.png";
import top2 from "@images/top2.png";
import pants1 from "@images/pants1.png";
import outer1 from "@images/outer1.png";
import shoes1 from "@images/shoes1.png";
import shoes2 from "@images/shoes2.png";
import acc1 from "@images/acc1.png";

const MOCK_CLOSET = [
  {
    id: "top-01",
    name: "Brown sweater",
    category: "top",
    imageUrl: top1,
  },
  {
    id: "top-02",
    name: "Denim shirts",
    category: "top",
    imageUrl: top2,
  },
  {
    id: "pants-01",
    name: "Cotton pants",
    category: "bottom",
    imageUrl: pants1,
  },
  {
    id: "outer-01",
    name: "Blue Shirt",
    category: "outer",
    imageUrl: outer1,
  },
  {
    id: "shoes-01",
    name: "Berwick Shoes",
    category: "shoes",
    imageUrl: shoes1,
  },
  {
    id: "shoes-02",
    name: "Adidas Shoes",
    category: "shoes",
    imageUrl: shoes2,
  },
  {
    id: "acc-01",
    name: "Chrome hearts",
    category: "default",
    imageUrl: acc1,
  },
];

const ClosetModal = ({ onRemove, onAdd, clothes, onClose, isOpen }) => {
  return (
    <>
      {isOpen && <div className={styles.sheetOverlay} onClick={() => onClose(false)} />}
      <div className={cn(styles.sheet, isOpen && styles.sheetOpen)}>
        <div className={styles.sheetHeader}>
          <div className={styles.sheetTitle}>옷장</div>
          <button className={styles.sheetClose} onClick={() => onClose(false)}>
            닫기
          </button>
        </div>
        <div className={styles.sheetBody}>
          <div className={styles.closetGrid}>
            {MOCK_CLOSET.map((item) => {
              const isAdded = clothes.some((c) => c.id === item.id);

              return (
                <button
                  key={item.id}
                  className={cn(styles.closetCard, isAdded && styles.disabledCard)}
                  onClick={() => onAdd(item)}
                  disabled={isAdded}
                >
                  <img src={item.imageUrl} alt={item.name} className={styles.closetImg} />
                  <div className={styles.closetInfo}>
                    <div className={styles.closetName}>{item.name}</div>
                    <div className={styles.closetCat}>{item.category}</div>
                  </div>
                  {isAdded && <div className={styles.badge}>추가됨</div>}
                </button>
              );
            })}
          </div>
          <div className={styles.selectedBar}>
            {clothes.length === 0 ? (
              <div className={styles.selectedEmpty}>아직 추가된 아이템이 없어요</div>
            ) : (
              <ul className={styles.selectedList}>
                {clothes.map((item) => (
                  <li key={item.id} className={styles.selectedItem}>
                    <button
                      className={styles.removeBtn}
                      onClick={() => onRemove(item.id)}
                      aria-label="아이템 제거"
                    >
                      ×
                    </button>
                    <div className={styles.selectedThumbWrap}>
                      <img src={item.src} alt={item.name} className={styles.selectedThumb} />
                    </div>
                    <div className={styles.selectedMeta}>
                      <span className={styles.selectedName}>{item.name}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ClosetModal;
