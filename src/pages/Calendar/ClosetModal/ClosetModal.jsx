import styles from "./ClosetModal.module.css";
import cn from "classnames";

import top1 from "@images/top1.png";
import top2 from "@images/top2.png";
import pants1 from "@images/pants1.png";
import outer1 from "@images/outer1.png";
import shoes1 from "@images/shoes1.png";
import shoes2 from "@images/shoes2.png";
import acc1 from "@images/acc1.png";
import { CATEGORIES } from "@/constants/category";

const MOCK_CLOSET = [
  {
    clothesId: "top-01",
    name: "Brown sweater",
    categoryCode: "B30007",
    thumbnailUrl: top1,
  },
  {
    clothesId: "top-02",
    name: "Denim shirts",
    categoryCode: "B30001",
    thumbnailUrl: top2,
  },
  {
    clothesId: "pants-01",
    name: "Cotton pants",
    categoryCode: "B30014",
    thumbnailUrl: pants1,
  },
  {
    clothesId: "outer-01",
    name: "Blue Shirt",
    categoryCode: "B30001",
    thumbnailUrl: outer1,
  },
  {
    clothesId: "shoes-01",
    name: "Berwick Shoes",
    categoryCode: "B30022",
    thumbnailUrl: shoes1,
  },
  {
    clothesId: "shoes-02",
    name: "Adidas Shoes",
    categoryCode: "B30019",
    thumbnailUrl: shoes2,
  },
  {
    clothesId: "acc-01",
    name: "Chrome hearts",
    categoryCode: "B30035",
    thumbnailUrl: acc1,
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
              const isAdded = clothes.some((c) => c.clothesId === item.clothesId);

              return (
                <button
                  key={item.clothesId}
                  className={cn(styles.closetCard, isAdded && styles.disabledCard)}
                  onClick={() => onAdd(item)}
                  disabled={isAdded}
                >
                  <img src={item.thumbnailUrl} alt={item.name} className={styles.closetImg} />
                  <div className={styles.closetInfo}>
                    <div className={styles.closetName}>{item.name}</div>
                    <div className={styles.closetCat}>{CATEGORIES[item.categoryCode].ko}</div>
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
                  <li key={item.clothesId} className={styles.selectedItem}>
                    <button
                      className={styles.removeBtn}
                      onClick={() => onRemove(item.clothesId)}
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
