import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import clsx from "clsx";
import styles from "./ClosetDetailPage.module.css";
import { CLOTHING_ITEMS, MAIN_CATEGORIES } from "@/pages/ClosetPage/closetData";
import ChevronDown from "@/assets/images/chevron-down.svg";

const ClosetDetailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { itemId } = useParams();
  const initialItem = useMemo(() => {
    if (location.state?.item) {
      return location.state.item;
    }

    return CLOTHING_ITEMS.find((item) => item.id === itemId) ?? CLOTHING_ITEMS[0];
  }, [itemId, location.state]);

  const [item, setItem] = useState(initialItem);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const currentImageIndex = 0;

  const categoryLabel = useMemo(() => {
    if (!item) {
      return "-";
    }

    const main = MAIN_CATEGORIES.find((category) => category.id === item.category);
    const sub = main?.subcategories?.find((subcategory) => subcategory.id === item.subCategory);

    if (main && sub && sub.id !== "all") {
      return `${main.name}/${sub.name}`;
    }

    return main?.name ?? "-";
  }, [item]);

  useEffect(() => {
    setItem(initialItem);
  }, [initialItem]);

  const images = item?.images?.length ? item.images : [];

  const handleFieldChange = (field, value) => {
    setItem((prev) => ({ ...prev, [field]: value }));
  };

  const handleToggleInfo = () => {
    setIsInfoOpen((prev) => !prev);
  };

  const handleToggleEdit = () => {
    setIsEditing((prev) => !prev);
  };

  const handleDelete = () => {
    navigate("/closet", { replace: true });
  };

  const renderField = (label, fieldName, options = {}) => {
    const value = item?.[fieldName] ?? "";
    const isTextArea = options.type === "textarea";
    const displayValue = options.formatDisplay ? options.formatDisplay(value) : value || "-";
    const inputType = options.inputType ?? "text";

    const rowClass = clsx(styles.fieldRow, options.alignTop && styles.fieldAlignTop);

    if (!isEditing) {
      return (
        <div className={rowClass}>
          <span className={styles.fieldLabel}>{label}</span>
          <span className={clsx(styles.fieldValue, options.valueClass)}>{displayValue}</span>
        </div>
      );
    }

    if (isTextArea) {
      return (
        <label className={clsx(rowClass, styles.fieldEditing)}>
          <span className={styles.fieldLabel}>{label}</span>
          <textarea
            className={styles.fieldInput}
            value={value}
            placeholder={options.placeholder}
            onChange={(event) => handleFieldChange(fieldName, event.target.value)}
          />
        </label>
      );
    }

    return (
      <label className={clsx(rowClass, styles.fieldEditing)}>
        <span className={styles.fieldLabel}>{label}</span>
        <input
          type={inputType}
          className={styles.fieldInput}
          value={value}
          placeholder={options.placeholder}
          onChange={(event) => handleFieldChange(fieldName, event.target.value)}
        />
      </label>
    );
  };

  if (!item) {
    return null;
  }

  return (
    <div className={styles.page}>
      <main className={styles.content}>
        <section className={styles.previewSection}>
          <div className={styles.imageFrame}>
            {images.length > 0 ? (
              <img src={images[currentImageIndex]} alt={item.name} className={styles.image} />
            ) : (
              <div className={styles.imageFallback}>등록된 사진이 없어요</div>
            )}

            <span className={styles.imageBadge}>
              {images.length > 0 ? `${currentImageIndex + 1}/${images.length}` : "0/0"}
            </span>
          </div>

          <h2 className={styles.itemName}>{item.name || "이름 없는 아이템"}</h2>

          <div className={styles.statRow}>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>카테고리</span>
              <span className={styles.statValue}>{categoryLabel}</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>착용횟수</span>
              <span className={styles.statValue}>{`${item.wearCount ?? 0}회`}</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>최근착용</span>
              <span className={styles.statValue}>{item.lastWornDate ?? "-"}</span>
            </div>
          </div>
        </section>

        <section className={styles.infoSection}>
          {renderField("브랜드", "brand", {
            placeholder: "브랜드를 입력하세요",
          })}
          {renderField("사이즈", "size", {
            placeholder: "사이즈를 입력하세요",
          })}

          {/* 상세정보 토글 */}
          <div className={styles.detailGroup}>
            <button type="button" className={styles.detailToggle} onClick={handleToggleInfo}>
              <span className={styles.detailToggleLabel}>상세정보</span>
              <img
                src={ChevronDown}
                alt=""
                className={clsx(styles.chevron, isInfoOpen && styles.chevronOpen)}
              />
            </button>

            {isInfoOpen && (
              <div className={styles.detailPanel}>
                {renderField("가격", "price", {
                  inputType: "number",
                  placeholder: "가격을 입력하세요",
                  formatDisplay: (value) =>
                    value || value === 0 ? `${Number(value).toLocaleString()}원` : "-",
                })}
                {renderField("구매일", "purchaseDate", {
                  inputType: "date",
                  placeholder: "구매일을 입력하세요",
                  valueClass: styles.textRight,
                })}
                {renderField("구매링크", "purchaseLink", {
                  placeholder: "링크를 입력하세요",
                  valueClass: styles.textRight,
                })}
                {renderField("설명", "description", {
                  type: "textarea",
                  placeholder: "아이템에 대한 설명을 입력하세요",
                  valueClass: styles.descriptionValue,
                })}
              </div>
            )}
          </div>
        </section>
      </main>
      <footer className={styles.footer}>
        <button type="button" className={styles.primaryAction} onClick={handleToggleEdit}>
          {isEditing ? "수정완료" : "수정하기"}
        </button>
        <button type="button" className={styles.secondaryAction} onClick={handleDelete}>
          삭제하기
        </button>
      </footer>
    </div>
  );
};

export default ClosetDetailPage;
