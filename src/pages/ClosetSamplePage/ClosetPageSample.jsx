import { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import clsx from "clsx";
import styles from "../ClosetPage/ClosetPage.module.css";
import CommonCodeService from "@/services/commonCodeService";
import ClothesServiceSample from "./clothesServiceSample";
import { useAllCoordisQuery } from "@/hooks/useCoordiQuery";

const ClosetPageSample = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [tabs, setTabs] = useState([]);
  const [activeTab, setActiveTab] = useState("clothes");

  const [mainCategories, setMainCategories] = useState([]);
  const [subCategoriesMap, setSubCategoriesMap] = useState({});
  const [mainCategory, setMainCategory] = useState("all");
  const [subCategory, setSubCategory] = useState("all");

  const [clothesItems, setClothesItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [sortType, setSortType] = useState("purchase");
  const [isSortOpen, setIsSortOpen] = useState(false);

  const { data: coordi = { data: [] } } = useAllCoordisQuery();

  useEffect(() => {
    const fetchTabs = async () => {
      try {
        const response = await CommonCodeService.getCommonCodesByParentCodeId("B10002");
        const tabsData = Object.values(response).map((tab) => ({
          id: tab.codeId,
          label: tab.codeName,
        }));
        setTabs(tabsData);
      } catch (err) {
        console.error("탭 데이터 로드 실패:", err);
      }
    };
    fetchTabs();
  }, []);

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        const { mainCategories, subCategoriesMap } = await CommonCodeService.getCategoryData();
        setMainCategories(mainCategories);
        setSubCategoriesMap(subCategoriesMap);
      } catch (err) {
        console.error("카테고리 데이터 로드 실패:", err);
      }
    };
    fetchCategoryData();
  }, []);

  // MainPage에서 전달받은 카테고리 정보 처리
  useEffect(() => {
    if (location.state && mainCategories.length > 0) {
      const { selectedMainCategory, selectedSubCategory } = location.state;

      console.log("MainPage에서 전달받은 카테고리:", {
        selectedMainCategory,
        selectedSubCategory,
      });

      // 메인 카테고리 설정
      if (selectedMainCategory && selectedMainCategory !== "all") {
        const validMainCategory = mainCategories.find((cat) => cat.codeId === selectedMainCategory);
        if (validMainCategory) {
          setMainCategory(selectedMainCategory);

          // 서브 카테고리 설정
          if (selectedSubCategory && selectedSubCategory !== "all") {
            const subCategories = subCategoriesMap[selectedMainCategory] || [];
            const validSubCategory = subCategories.find(
              (sub) => sub.codeId === selectedSubCategory,
            );
            if (validSubCategory) {
              setSubCategory(selectedSubCategory);
            }
          }
        }
      }
    }
  }, [location.state, mainCategories, subCategoriesMap]);

  useEffect(() => {
    const fetchClothes = async () => {
      try {
        setLoading(true);
        const response = await ClothesServiceSample.getUserClothes();
        if (response.success && response.data) {
          setClothesItems(response.data);
        } else {
          setClothesItems([]);
          console.error("옷 목록 조회 실패:", response.message);
        }
      } catch (err) {
        console.error("옷 목록 조회 실패:", err);
        setClothesItems([]);
      } finally {
        setLoading(false);
      }
    };
    fetchClothes();
  }, []);

  const handleSelectMode = () => {
    setIsSelecting((prev) => !prev);
    setSelectedItems([]);
  };

  const toggleItemSelection = (itemId) => {
    setSelectedItems((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId],
    );
  };

  const handleCardClick = (item) => {
    if (isSelecting) {
      toggleItemSelection(item.clothesId);
      return;
    }
    // TODO: 상세 페이지로 이동
    navigate(`/closet/item-sample/${item.clothesId}`);
  };

  const handleAddClick = () => {
    // TODO: 등록 페이지로 이동
    navigate("/closet/register-sample");
  };

  const handleClickCoordi = (item) => {
    if (isSelecting) {
      toggleItemSelection(item.id);
      return;
    }

    console.log("item click", item);
    navigate(`/closet/coordi/${item.coordiId}`);
  };

  const handleClickCoordiEditor = () => {
    navigate("/closet/coordi/editor");
  };

  const handleDelete = async () => {
    if (!selectedItems.length) return;
    if (!window.confirm(`선택한 ${selectedItems.length}개의 옷을 삭제하시겠습니까?`)) return;

    try {
      const response = await ClothesServiceSample.bulkDeleteClothes(selectedItems);

      if (response.success) {
        alert("선택한 옷이 삭제되었습니다.");
        // 삭제된 아이템 제거
        setClothesItems((prev) => prev.filter((item) => !selectedItems.includes(item.clothesId)));
        setSelectedItems([]);
        setIsSelecting(false);
      } else {
        alert("삭제에 실패했습니다: " + response.message);
      }
    } catch (error) {
      console.error("삭제 오류:", error);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  const handleCategoryChange = (id) => {
    setMainCategory(id);
    setSubCategory("all");
  };

  const handleSubCategoryChange = (id) => {
    setSubCategory(id);
  };

  const filteredItems = useMemo(() => {
    return clothesItems.filter((item) => {
      if (mainCategory === "all") {
        return true;
      }

      if (subCategory !== "all") {
        return item.categoryCode === subCategory;
      }

      const subCategoriesForMain = subCategoriesMap[mainCategory] || [];
      const subCategoryCodes = subCategoriesForMain.map((sub) => sub.codeId);
      return subCategoryCodes.includes(item.categoryCode);
    });
  }, [clothesItems, mainCategory, subCategory, subCategoriesMap]);

  const isCoordiTab = activeTab === "B20006";

  if (loading) {
    return (
      <div className={styles.container}>
        <div style={{ textAlign: "center", padding: "50px" }}>
          <p>옷 목록을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* TODO: 탭바 데이터 연결 */}
      <section className={styles.tabBar}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={clsx(styles.tabButton, activeTab === tab.id && styles.activeTab)}
            onClick={() => {
              setActiveTab(tab.id);
            }}
          >
            {tab.label}
          </button>
        ))}
      </section>

      {/* TODO: 카테고리 데이터 연결 */}
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
        <button
          type="button"
          className={styles.sortButton}
          onClick={() => setIsSortOpen((prev) => !prev)}
        >
          {sortType === "purchase" ? "구매일순" : sortType === "wear" ? "입은횟수순" : "최근착용순"}
          <span className={styles.sortArrow} aria-hidden />
        </button>

        {isSortOpen && (
          <ul className={styles.sortDropdown}>
            <li
              className={clsx(styles.sortOption, sortType === "recent" && styles.activeSort)}
              onClick={() => {
                setSortType("recent");
                setIsSortOpen(false);
              }}
            >
              최근착용순
            </li>
            <li
              className={clsx(styles.sortOption, sortType === "wear" && styles.activeSort)}
              onClick={() => {
                setSortType("wear");
                setIsSortOpen(false);
              }}
            >
              입은횟수순
            </li>
            <li
              className={clsx(styles.sortOption, sortType === "purchase" && styles.activeSort)}
              onClick={() => {
                setSortType("purchase");
                setIsSortOpen(false);
              }}
            >
              구매일순
            </li>
          </ul>
        )}
      </div>

      <section className={styles.gridSection}>
        <div className={styles.grid}>
          {isCoordiTab ? (
            <>
              {coordi.data.map((item) => (
                <article
                  key={item.coordiId}
                  className={clsx(styles.card, isSelecting && styles.cardSelectable)}
                  onClick={() => handleClickCoordi(item)}
                >
                  <div className={styles.cardImageWrapper}>
                    <img src={item.thumbImageUrl} alt={item.title} className={styles.cardImage} />
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
                    <p className={styles.cardName}>{item.title}</p>
                  </div>
                </article>
              ))}
            </>
          ) : (
            <>
              {filteredItems.map((item) => (
                <article
                  key={item.id}
                  className={clsx(styles.card, isSelecting && styles.cardSelectable)}
                  onClick={() => handleCardClick(item)}
                >
                  <div className={styles.cardImageWrapper}>
                    <img
                      src={item.imageUrl || "/noimage.png"}
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
            </>
          )}
          {!isCoordiTab && (
            <button type="button" className={styles.addCard} onClick={handleAddClick}>
              <span className={styles.addIcon}>＋</span>
              <span className={styles.addLabel}>아이템 추가</span>
            </button>
          )}
        </div>
      </section>
      {isCoordiTab && <button onClick={handleClickCoordiEditor}>코디 추가하기</button>}
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

export default ClosetPageSample;
