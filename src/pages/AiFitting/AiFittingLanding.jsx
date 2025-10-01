import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import clsx from "clsx";

import styles from "./AiFittingLanding.module.css";
import { clothingTypes, closetCategoryMap } from "./data.js";
import { CLOTHING_ITEMS, MAIN_CATEGORIES } from "@/pages/ClosetPage/closetData";
import { useAiFittingStore } from "@/stores/aiFittingStore.js";
import chevronDown from "@/assets/images/chevron-down.svg";
import userIcon from "@/assets/images/usericon.png"; // 교체

const AiFittingLanding = () => {
  const navigate = useNavigate();
  const avatars = useAiFittingStore((state) => state.avatars);
  const selectedAvatarId = useAiFittingStore((state) => state.selectedAvatarId);
  const clothingSelection = useAiFittingStore((state) => state.clothingSelection);
  const updateClothingSelection = useAiFittingStore((state) => state.updateClothingSelection);
  const loadAvatars = useAiFittingStore((state) => state.loadAvatars);
  const hasLoadedAvatars = useAiFittingStore((state) => state.hasLoadedAvatars);

  const [activeClothingType, setActiveClothingType] = useState(null);
  const [activeSubCategory, setActiveSubCategory] = useState("all");
  const [highlightedItem, setHighlightedItem] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const generationTimerRef = useRef(null);

  const selectedAvatar = useMemo(
    () => avatars.find((avatar) => avatar.id === selectedAvatarId) ?? null,
    [avatars, selectedAvatarId],
  );

  useEffect(() => {
    if (!hasLoadedAvatars) {
      loadAvatars().catch(() => {
        // 에러는 AvatarSelectionPage에서 안내
      });
    }
  }, [hasLoadedAvatars, loadAvatars]);

  const currentClosetMainCategory = useMemo(() => {
    if (!activeClothingType) return null;
    const categoryId = closetCategoryMap[activeClothingType];
    return MAIN_CATEGORIES.find((category) => category.id === categoryId) ?? null;
  }, [activeClothingType]);

  const availableClosetItems = useMemo(() => {
    if (!activeClothingType) return [];
    const categoryId = closetCategoryMap[activeClothingType];
    return CLOTHING_ITEMS.filter((item) => item.category === categoryId);
  }, [activeClothingType]);

  const filteredClosetItems = useMemo(() => {
    if (!activeClothingType) return [];
    if (activeSubCategory === "all") return availableClosetItems;
    return availableClosetItems.filter((item) => item.subCategory === activeSubCategory);
  }, [activeClothingType, activeSubCategory, availableClosetItems]);

  const isReadyForAi = Boolean(selectedAvatar) && Object.values(clothingSelection).some(Boolean);

  useEffect(
    () => () => {
      if (generationTimerRef.current) {
        clearTimeout(generationTimerRef.current);
      }
    },
    [],
  );

  const handleAvatarClick = () => {
    navigate("/ai-fitting/avatars");
  };

  const handleTypeCardClick = (typeId) => {
    if (activeClothingType === typeId) {
      setActiveClothingType(null);
      setActiveSubCategory("all");
      setHighlightedItem(null);
      return;
    }

    setActiveClothingType(typeId);
    setActiveSubCategory("all");
    setHighlightedItem(clothingSelection[typeId] ?? null);
  };

  const handleClosetItemClick = (item) => {
    setHighlightedItem(item);
  };

  const handleConfirmSelection = () => {
    if (!activeClothingType || !highlightedItem) return;
    updateClothingSelection(activeClothingType, highlightedItem);
    setActiveClothingType(null);
    setActiveSubCategory("all");
    setHighlightedItem(null);
  };

  const showClosetPanel = Boolean(activeClothingType && currentClosetMainCategory);

  const handleStartAi = () => {
    if (!isReadyForAi || isGenerating) return;

    setIsGenerating(true);

    generationTimerRef.current = setTimeout(() => {
      setIsGenerating(false);
      navigate("/ai-fitting/result");
    }, 1600);
  };

  return (
    <div className={styles.page}>
      <section className={styles.avatarSection}>
        {selectedAvatar ? (
          // ✅ 아바타 선택된 경우 → 큰 이미지
          <button
            type="button"
            className={styles.avatarPreviewButton}
            onClick={handleAvatarClick}
            aria-label="아바타 변경"
          >
            <img
              src={selectedAvatar.imageUrl}
              alt={selectedAvatar.name}
              className={styles.avatarPreviewImage}
            />
          </button>
        ) : (
          // ✅ 선택 안 된 경우 → placeholder + 텍스트 + 버튼 (피그마 스타일)
          <div className={styles.avatarPanel}>
            <div className={styles.avatarPlaceholderWrapper}>
              <img
                src={userIcon}
                alt="avatar placeholder"
                className={styles.avatarPlaceholderIcon}
              />
            </div>
            <h2 className={styles.avatarHeading}>
              아바타를 선택하거나
              <br />
              만들어보세요
            </h2>
            <button
              type="button"
              className={styles.avatarAction}
              onClick={() => navigate("/ai-fitting/avatars")}
            >
              아바타 선택
            </button>
          </div>
        )}
      </section>

      <section className={styles.selectionSection}>
        <h2 className={styles.sectionTitle}>의류 선택</h2>

        {!showClosetPanel && (
          <div className={styles.selectionList}>
            {clothingTypes.map((type) => {
              const selection = clothingSelection[type.id];
              const isActive = activeClothingType === type.id;

              return (
                <button
                  key={type.id}
                  type="button"
                  className={clsx(styles.selectionCard, isActive && styles.selectionCardActive)}
                  onClick={() => handleTypeCardClick(type.id)}
                >
                  {selection ? (
                    <div className={styles.selectionThumbnailWrapper}>
                      <img
                        src={selection.images?.[0]}
                        alt={selection.name}
                        className={styles.selectionThumbnail}
                      />
                    </div>
                  ) : (
                    <div className={styles.selectionIconWrapper}>
                      <img src={type.icon} alt="" className={styles.selectionIcon} />
                    </div>
                  )}
                  <div className={styles.selectionInfo}>
                    <span className={styles.selectionLabel}>{type.label}</span>
                    <span className={styles.selectionSummary}>
                      {selection ? selection.name : "선택된 아이템: 없음"}
                    </span>
                  </div>
                  <img
                    src={chevronDown}
                    alt=""
                    className={clsx(
                      styles.selectionChevronIcon,
                      isActive && styles.selectionChevronIconActive,
                    )}
                  />
                </button>
              );
            })}
          </div>
        )}

        {showClosetPanel && (
          <div className={styles.closetPanel}>
            <div className={styles.categoryTabs}>
              <div className={styles.subCategoryTabs}>
                {currentClosetMainCategory.subcategories.map((sub) => (
                  <button
                    key={sub.id}
                    type="button"
                    className={clsx(
                      styles.subCategoryButton,
                      activeSubCategory === sub.id && styles.subCategoryButtonActive,
                    )}
                    onClick={() => setActiveSubCategory(sub.id)}
                  >
                    {sub.name}
                  </button>
                ))}
              </div>
            </div>

            {filteredClosetItems.length > 0 ? (
              <div className={styles.closetGrid}>
                {filteredClosetItems.map((item) => {
                  const isSelected = highlightedItem?.id === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={clsx(styles.closetCard, isSelected && styles.closetCardSelected)}
                      onClick={() => handleClosetItemClick(item)}
                    >
                      <div className={styles.closetThumbnail}>
                        <img
                          src={item.images?.[0]}
                          alt={item.name}
                          className={styles.closetImage}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className={styles.emptyState}>선택 가능한 아이템이 없습니다.</p>
            )}

            <button
              type="button"
              className={styles.confirmButton}
              onClick={handleConfirmSelection}
              disabled={!highlightedItem || !activeClothingType}
            >
              옷 고르기
            </button>
          </div>
        )}
      </section>

      {!showClosetPanel && (
        <button
          type="button"
          className={styles.footerButton}
          onClick={handleStartAi}
          disabled={!isReadyForAi || isGenerating}
        >
          {isGenerating ? "AI 분석 중…" : "AI 옷입히기"}
        </button>
      )}

      {isGenerating && (
        <div className={styles.loadingOverlay} role="status" aria-live="polite">
          <div className={styles.loadingContent}>
            <span className={styles.loadingSpinner} aria-hidden="true" />
            <p className={styles.loadingMessage}>AI가 코디를 준비하고 있어요…</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiFittingLanding;
