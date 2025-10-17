import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import clsx from "clsx";
import styles from "./ClosetPage.module.css";
import { CLOSET_TABS, CLOTHING_ITEMS, COORDI_ITEMS, ITEMS_PER_BATCH } from "./closetData";
import ClothesService from "@/services/clothesService";
import CommonCodeService from "@/services/commonCodeService";

const ClosetPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("clothes");
  const [mainCategory, setMainCategory] = useState("all");
  const [subCategory, setSubCategory] = useState("all");

  const [items, setItems] = useState([]); // 실제 서버 데이터
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_BATCH);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [isCategoryPanelOpen, setIsCategoryPanelOpen] = useState(false);
  const observer = useRef(null);

  // ✅ DB 기반 카테고리
  const [mainCategories, setMainCategories] = useState([]);
  const [subCategoriesMap, setSubCategoriesMap] = useState({});

  // ==================== 1️⃣ 카테고리 로드 ====================
  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        const { mainCategories, subCategoriesMap } = await CommonCodeService.getCategoryData();
        setMainCategories(mainCategories);
        setSubCategoriesMap(subCategoriesMap);
      } catch (err) {
        console.error("❌ 카테고리 조회 실패:", err);
      }
    };
    fetchCategoryData();
  }, []);

  // ==================== 2️⃣ 내 옷 전체 불러오기 ====================
  useEffect(() => {
    const fetchMyClothes = async () => {
      try {
        const data = await ClothesService.getMyClothes(); // JWT 인증 자동
        const mapped = data.map((c) => ({
          id: c.clothesId,
          name: c.name,
          categoryCode: c.categoryCode,
          purchaseDate: c.purchaseDate,
          images: c.thumbnailUrl ? [c.thumbnailUrl] : [],
        }));
        setItems(mapped);
      } catch (err) {
        console.error("❌ 옷장 목록 조회 실패:", err);
        setItems(CLOTHING_ITEMS); // fallback
      }
    };
    fetchMyClothes();
  }, []);

  // ==================== 3️⃣ 탭별 아이템 분기 ====================
  const currentItems = useMemo(() => {
    if (activeTab === "coordi") return COORDI_ITEMS;
    return items;
  }, [activeTab, items]);

  // ==================== 4️⃣ 카테고리 필터 ====================
  const filteredItems = useMemo(() => {
    if (activeTab === "coordi") return currentItems;

    return currentItems.filter((item) => {
      const code = item.categoryCode;

      // 전체 (상의, 하의 등 무관하게 다 보여줌)
      if (mainCategory === "all") return true;

      // 상의 전체 등
      if (subCategory === "all") {
        return subCategoriesMap[mainCategory]?.some((sub) => sub.codeId === code);
      }
      // 셔츠 등 (정확히 일치)
      return code === subCategory;
    });
  }, [activeTab, currentItems, mainCategory, subCategory]);

  // ==================== 5️⃣ 무한 스크롤 ====================
  const sentinelRef = useCallback(
    (node) => {
      if (observer.current) observer.current.disconnect();
      if (!node) return;

      observer.current = new IntersectionObserver((entries) => {
        if (!entries[0].isIntersecting) return;
        setVisibleCount((prev) => Math.min(prev + ITEMS_PER_BATCH, filteredItems.length));
      });

      observer.current.observe(node);
    },
    [filteredItems.length],
  );

  useEffect(() => () => observer.current?.disconnect(), []);

  const visibleItems = useMemo(
    () => filteredItems.slice(0, visibleCount),
    [filteredItems, visibleCount],
  );

  // ==================== 6️⃣ 선택모드 & 삭제 ====================
  const handleSelectMode = () => {
    setIsSelecting((prev) => !prev);
    setSelectedItems([]);
  };

  const toggleItemSelection = (itemId) => {
    setSelectedItems((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId],
    );
  };

  const handleDelete = async () => {
    if (!selectedItems.length) return;
    if (!window.confirm("선택한 옷을 삭제하시겠습니까?")) return;

    try {
      await ClothesService.deleteClothesBulk(selectedItems);
      alert("삭제 완료되었습니다.");
      setItems((prev) => prev.filter((i) => !selectedItems.includes(i.id)));
      setSelectedItems([]);
      setIsSelecting(false);
    } catch (err) {
      console.error("❌ 일괄 삭제 실패:", err);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  // ==================== 7️⃣ 클릭 핸들러 ====================
  const handleCardClick = (item) => {
    if (isSelecting) {
      toggleItemSelection(item.id);
      return;
    }
    navigate(`/closet/item/${item.id}`, { state: { item } });
  };

  const handleAddClick = () => navigate("/closet/register");

  // ==================== 8️⃣ 카테고리 변경 ====================
  const handleCategoryChange = (id) => {
    setMainCategory(id);
    setSubCategory("all"); // ← 항상 초기화: "상의 전체" 포함
  };

  const handleSubCategoryChange = (id) => {
    setSubCategory(id === "all" ? "all" : id);
  };

  const isCoordiTab = activeTab === "coordi";

  // ==================== 9️⃣ 렌더링 ====================
  return (
    <div className={styles.container}>
      {/* 탭바 */}
      <section className={styles.tabBar}>
        {CLOSET_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={clsx(styles.tabButton, activeTab === tab.id && styles.activeTab)}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </section>

      {/* 카테고리 바 */}
      {!isCoordiTab && (
        <section className={styles.categories}>
          <div className={styles.categoryHeader}>
            <div className={styles.categoryMainList}>
              {mainCategories.map((cat) => (
                <button
                  key={cat.codeId}
                  type="button"
                  className={clsx(
                    styles.categoryButton,
                    mainCategory === cat.codeId && styles.activeCategory,
                  )}
                  onClick={() => handleCategoryChange(cat.codeId)}
                >
                  {cat.codeName}
                </button>
              ))}
            </div>
          </div>

          {mainCategory !== "all" && (
            <div className={styles.subCategoryList}>
              {(subCategoriesMap[mainCategory] || []).map((sub) => (
                <button
                  key={sub.codeId}
                  type="button"
                  className={clsx(
                    styles.subCategoryButton,
                    subCategory === sub.codeId && styles.activeSubCategory,
                  )}
                  onClick={() => handleSubCategoryChange(sub.codeId)}
                >
                  {sub.codeName}
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      {/* 유틸리티 바 */}
      <div className={styles.utilityRow}>
        <button
          type="button"
          className={clsx(styles.selectToggle, isSelecting && styles.cancelSelect)}
          onClick={handleSelectMode}
        >
          <span className={styles.toggleIcon} aria-hidden />
          {isSelecting ? "취소하기" : "선택하기"}
        </button>
        {isSelecting ? (
          <div className={styles.selectionStatus}>
            <span className={styles.selectionBadge} aria-hidden />
            <span className={styles.selectionText}>{selectedItems.length}개 선택됨</span>
          </div>
        ) : (
          <div className={styles.selectionPlaceholder} />
        )}
        <button type="button" className={styles.sortButton}>
          구매일순
          <span className={styles.sortIcon} aria-hidden />
        </button>
      </div>

      {/* 목록 */}
      <section className={styles.gridSection}>
        <div className={styles.grid}>
          {visibleItems.map((item) => (
            <article
              key={item.id}
              className={clsx(styles.card, isSelecting && styles.cardSelectable)}
              onClick={() => handleCardClick(item)}
            >
              <div className={styles.cardImageWrapper}>
                <img
                  src={item.images?.[0] || "/noimage.png"}
                  alt={item.name}
                  className={styles.cardImage}
                />
                {isSelecting && (
                  <span
                    className={clsx(
                      styles.checkbox,
                      selectedItems.includes(item.id) && styles.checkboxChecked,
                    )}
                  />
                )}
              </div>
              <div className={styles.cardContent}>
                <p className={styles.cardName}>{item.name}</p>
                {item.purchaseDate && <p className={styles.cardMeta}>{item.purchaseDate}</p>}
              </div>
            </article>
          ))}

          {!isCoordiTab && (
            <button type="button" className={styles.addCard} onClick={handleAddClick}>
              <span className={styles.addIcon}>＋</span>
              <span className={styles.addLabel}>아이템 추가</span>
            </button>
          )}
        </div>

        <div ref={sentinelRef} className={styles.observerTarget} aria-hidden />
      </section>

      {/* 카테고리 패널 */}
      {isCategoryPanelOpen && !isCoordiTab && (
        <aside className={styles.categoryPanel}>
          <header className={styles.categoryPanelHeader}>
            <h2 className={styles.categoryPanelTitle}>카테고리 선택</h2>
            <button
              type="button"
              className={styles.categoryPanelClose}
              onClick={() => setIsCategoryPanelOpen(false)}
            >
              닫기
            </button>
          </header>
          <div className={styles.categoryPanelBody}>
            {mainCategories.map((cat) => (
              <div key={cat.codeId} className={styles.categoryPanelGroup}>
                <button
                  type="button"
                  className={clsx(
                    styles.categoryPanelMain,
                    mainCategory === cat.codeId && styles.activePanelMain,
                  )}
                  onClick={() => handleCategoryChange(cat.codeId)}
                >
                  {cat.codeName}
                </button>
                {mainCategory === cat.codeId && (
                  <div className={styles.categoryPanelSubList}>
                    {(subCategoriesMap[cat.codeId] || []).map((sub) => (
                      <button
                        key={sub.codeId}
                        type="button"
                        className={clsx(
                          styles.categoryPanelSub,
                          subCategory === sub.codeId && styles.activePanelSub,
                        )}
                        onClick={() => handleSubCategoryChange(sub.codeId)}
                      >
                        {sub.codeName}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </aside>
      )}

      {/* 삭제 버튼 */}
      {isSelecting && selectedItems.length > 0 && (
        <button type="button" className={styles.deletePill} onClick={handleDelete}>
          <span className={styles.deleteIcon} aria-hidden />
          삭제
        </button>
      )}
    </div>
  );
};

export default ClosetPage;
