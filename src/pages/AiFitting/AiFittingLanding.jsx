import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import clsx from "clsx";
import styles from "./AiFittingLanding.module.css";
import { clothingTypes, closetCategoryMap } from "./data";
import { CLOTHING_ITEMS, MAIN_CATEGORIES } from "@/pages/ClosetPage/closetData";
import {
  selectAvatars,
  selectClothingSelection,
  selectSelectedAvatarId,
  selectUpdateClothingSelection,
  useAiFittingStore,
} from "./store/useAiFittingStore";
const AiFittingLanding = () => {
  const navigate = useNavigate();
  const avatars = useAiFittingStore(selectAvatars);
  const selectedAvatarId = useAiFittingStore(selectSelectedAvatarId);
  const clothingSelection = useAiFittingStore(selectClothingSelection);
  const updateClothingSelection = useAiFittingStore(
    selectUpdateClothingSelection
  );
  const [activeClothingType, setActiveClothingType] = useState(
    clothingTypes[0]?.id ?? null
  );
  const [activeSubCategory, setActiveSubCategory] = useState("all");
  const selectedAvatar = useMemo(
    () => avatars.find((avatar) => avatar.id === selectedAvatarId) ?? null,
    [avatars, selectedAvatarId]
  );
  const currentClosetMainCategory = useMemo(() => {
    if (!activeClothingType) return null;
    const categoryId = closetCategoryMap[activeClothingType];
    return (
      MAIN_CATEGORIES.find((category) => category.id === categoryId) ?? null
    );
  }, [activeClothingType]);
  const availableClosetItems = useMemo(() => {
    if (!activeClothingType) return [];
    const categoryId = closetCategoryMap[activeClothingType];
    return CLOTHING_ITEMS.filter((item) => item.category === categoryId);
  }, [activeClothingType]);
  const filteredClosetItems = useMemo(() => {
    if (!activeClothingType) return [];
    if (activeSubCategory === "all") return availableClosetItems;
    return availableClosetItems.filter(
      (item) => item.subCategory === activeSubCategory
    );
  }, [activeClothingType, activeSubCategory, availableClosetItems]);
  const currentSelection = activeClothingType
    ? clothingSelection[activeClothingType]
    : null;
  const isReadyForAi =
    Boolean(selectedAvatar) && Object.values(clothingSelection).some(Boolean);
  const handleClosetItemClick = (item) => {
    if (!activeClothingType) return;
    updateClothingSelection(activeClothingType, item);
  };
  return (
    <div className={styles.page}>
      <section className={styles.section}>
        <header className={styles.sectionHeader}>
          <div>
            <h1 className={styles.title}>AI 피팅</h1>
            <p className={styles.subtitle}>
              아바타와 옷을 선택해 AI 코디를 만들어보세요.
            </p>
          </div>
          <button
            type="button"
            className={styles.avatarSelectButton}
            onClick={() => navigate("/ai-fitting/avatars")}
          >
            아바타 선택
          </button>
        </header>
        <div className={styles.avatarCard}>
          {selectedAvatar ? (
            <img
              src={selectedAvatar.image}
              alt={selectedAvatar.name}
              className={styles.avatarImage}
            />
          ) : (
            <div className={styles.avatarPlaceholder}>아바타를 선택하세요</div>
          )}
          <div className={styles.avatarInfo}>
            <strong className={styles.avatarName}>
              {selectedAvatar
                ? selectedAvatar.name
                : "선택된 아바타가 없습니다"}
            </strong>
            <span className={styles.avatarHint}>
              아바타를 선택하거나 새로 만들어 나만의 코디를 구성해보세요.
            </span>
          </div>
        </div>
        <button
          type="button"
          className={styles.primaryButton}
          disabled={!isReadyForAi}
        >
          AI 코디 생성하기
        </button>
      </section>
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>의류 선택</h2>
        <div className={styles.clothingTypeList}>
          {clothingTypes.map((type) => (
            <button
              key={type.id}
              type="button"
              className={clsx(
                styles.clothingTypeButton,
                activeClothingType === type.id &&
                  styles.clothingTypeButtonActive
              )}
              onClick={() => {
                setActiveClothingType(type.id);
                setActiveSubCategory("all");
              }}
            >
              <img src={type.icon} alt="" className={styles.clothingTypeIcon} />
              <span>{type.label}</span>
            </button>
          ))}
        </div>
        {currentClosetMainCategory ? (
          <>
            <div className={styles.subCategoryTabs}>
              {currentClosetMainCategory.subcategories.map((sub) => (
                <button
                  key={sub.id}
                  type="button"
                  className={clsx(
                    styles.subCategoryButton,
                    activeSubCategory === sub.id &&
                      styles.subCategoryButtonActive
                  )}
                  onClick={() => setActiveSubCategory(sub.id)}
                >
                  {sub.name}
                </button>
              ))}
            </div>
            <div className={styles.closetGrid}>
              {filteredClosetItems.map((item) => {
                const isSelected = currentSelection?.id === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={clsx(
                      styles.closetCard,
                      isSelected && styles.closetCardSelected
                    )}
                    onClick={() => handleClosetItemClick(item)}
                  >
                    <img
                      src={item.images?.[0]}
                      alt=""
                      className={styles.closetImage}
                    />
                    <span className={styles.closetName}>{item.name}</span>
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <p className={styles.emptyState}>카테고리를 선택해주세요.</p>
        )}
      </section>
    </div>
  );
};
export default AiFittingLanding;
