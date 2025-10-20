import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import clsx from "clsx";
import styles from "../ClosetDetailPage/ClosetDetailPage.module.css";
import ChevronDown from "@/assets/images/chevron-down.svg";
import ClothesServiceSample from "./clothesServiceSample";
import CommonCodeService from "@/services/commonCodeService";

const ClosetDetailPageSample = () => {
  const navigate = useNavigate();
  const { itemId } = useParams();
  const [currentIndex, setCurrentIndex] = useState(0);
  const trackRef = useRef(null);

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  const [mainCategories, setMainCategories] = useState([]);
  const [subCategoriesMap, setSubCategoriesMap] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isCategorySheetOpen, setIsCategorySheetOpen] = useState(false);

  // 카테고리 데이터 로드
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

  // 옷 상세 데이터 로드
  useEffect(() => {
    const fetchClothesDetail = async () => {
      try {
        setLoading(true);
        const response = await ClothesServiceSample.getClothesDetail(itemId);
        console.log("옷 상세 응답:", response);
        if (response.success && response.data) {
          setItem(response.data);
        } else {
          console.error("옷 상세 조회 실패:", response.message);
          alert("옷 정보를 불러오는데 실패했습니다.");
          navigate("/closet-sample");
        }
      } catch (err) {
        console.error("옷 상세 조회 실패:", err);
        alert("옷 정보를 불러오는데 실패했습니다.");
        navigate("/closet-sample");
      } finally {
        setLoading(false);
      }
    };
    fetchClothesDetail();
  }, [itemId, navigate]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const handleScroll = () => {
      const scrollPosition = track.scrollLeft;
      const slideWidth = track.offsetWidth;
      const newIndex = Math.round(scrollPosition / slideWidth);
      setCurrentIndex(newIndex);
    };

    track.addEventListener("scroll", handleScroll);
    return () => track.removeEventListener("scroll", handleScroll);
  }, []);

  const handleCategorySelect = (mainId, subId) => {
    setItem((prev) => ({
      ...prev,
      categoryMain: mainId,
      categoryCode: subId,
    }));
    setIsCategorySheetOpen(false);
  };

  const handleRemoveImage = (idx) => {
    setItem((prev) => {
      if (!prev?.images) return prev;
      return {
        ...prev,
        images: prev.images.filter((_, i) => i !== idx),
      };
    });
  };

  const handleToggleEdit = () => {
    if (isEditing) {
      // TODO: 수정 저장 기능 구현
      alert("수정 저장 기능은 아직 구현되지 않았습니다.");
    }
    setIsEditing((prev) => !prev);
  };

  const handleDelete = () => {
    if (!window.confirm("정말 이 옷을 삭제하시겠습니까?")) return;
    // TODO: 삭제 기능 구현
    alert("삭제 기능은 아직 구현되지 않았습니다.");
  };

  const handleFieldChange = (field, value) => {
    setItem((prev) => ({ ...prev, [field]: value }));
  };

  const getCategoryLabel = () => {
    if (!item?.categoryCode) return "-";

    for (const mainCat of mainCategories) {
      const subCats = subCategoriesMap[mainCat.codeId] || [];
      const subCat = subCats.find((sub) => sub.codeId === item.categoryCode);
      if (subCat) {
        return `${mainCat.codeName} / ${subCat.codeName}`;
      }
    }
    return "-";
  };

  const categoryLabel = getCategoryLabel();

  // 로딩 상태
  if (loading) {
    return (
      <div className={styles.page}>
        <div style={{ textAlign: "center", padding: "50px" }}>
          <p>옷 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 아이템이 없는 경우
  if (!item) {
    return (
      <div className={styles.page}>
        <div style={{ textAlign: "center", padding: "50px" }}>
          <p>옷 정보를 찾을 수 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <main className={styles.content}>
        {/* 이미지 영역 */}
        <section className={styles.photoSection}>
          {item.images?.length ? (
            <div className={styles.carouselContainer}>
              <div className={styles.carouselTrack} ref={trackRef}>
                {item.images.map((img, idx) => (
                  <div key={idx} className={styles.carouselSlide}>
                    <img src={img} alt={`${item.name}-${idx}`} className={styles.previewImage} />
                    {isEditing && (
                      <button
                        type="button"
                        className={styles.removeButton}
                        onClick={() => handleRemoveImage(idx)}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {item.images?.length > 0 && (
                <div className={styles.photoCount}>
                  {currentIndex + 1}/{item.images.length}
                </div>
              )}
            </div>
          ) : (
            <div className={styles.imageFallback}>등록된 사진이 없어요</div>
          )}

          {/* 편집 모드에서만 추가 버튼 */}
          {isEditing && (
            <div className={styles.photoUploader}>
              <label htmlFor="edit-file-input" className={styles.photoPlaceholder}>
                <span className={styles.photoIcon}>📷</span>
                <span className={styles.photoText}>사진 추가</span>
              </label>
              <input
                id="edit-file-input"
                type="file"
                accept="image/*"
                multiple
                className={styles.fileInput}
                onChange={(e) => {
                  // TODO: 이미지 추가 기능 구현
                  alert("이미지 추가 기능은 아직 구현되지 않았습니다.");
                }}
              />
            </div>
          )}
          <h2 className={styles.itemName}>{item.name || "이름 없는 아이템"}</h2>

          <div className={styles.statRow}>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>카테고리</span>
              {isEditing ? (
                <>
                  <button
                    className={styles.categoryButton}
                    onClick={() => setIsCategorySheetOpen(true)}
                  >
                    {categoryLabel !== "-" ? categoryLabel : "카테고리 선택"}
                  </button>
                  {isCategorySheetOpen && (
                    <div
                      className={styles.sheetOverlay}
                      onClick={() => setIsCategorySheetOpen(false)}
                    >
                      <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.sheetHandle} />
                        <h3 className={styles.sheetTitle}>카테고리 선택</h3>

                        <div className={styles.sheetMainList}>
                          {mainCategories
                            .filter((main) => main.codeId !== "all")
                            .map((main) => (
                              <button
                                key={main.codeId}
                                type="button"
                                className={clsx(
                                  styles.sheetMainButton,
                                  item.categoryMain === main.codeId && styles.sheetMainActive,
                                )}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setItem((prev) => ({
                                    ...prev,
                                    categoryMain: main.codeId,
                                    categoryCode: "",
                                  }));
                                }}
                              >
                                <span className={styles.sheetMainIcon}>👕</span>
                                {main.codeName}
                              </button>
                            ))}
                        </div>

                        {item.categoryMain && (
                          <>
                            <h4 className={styles.sheetSubTitle}>세부 카테고리</h4>
                            <div className={styles.sheetSubGrid}>
                              {(subCategoriesMap[item.categoryMain] || [])
                                .filter((sub) => sub.codeId !== "all")
                                .map((sub) => (
                                  <button
                                    key={sub.codeId}
                                    type="button"
                                    className={clsx(
                                      styles.sheetSubButton,
                                      item.categoryCode === sub.codeId && styles.sheetSubActive,
                                    )}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCategorySelect(item.categoryMain, sub.codeId);
                                    }}
                                  >
                                    {sub.codeName}
                                  </button>
                                ))}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <span className={styles.statValue}>{categoryLabel}</span>
              )}
            </div>

            <div className={styles.statCard}>
              <span className={styles.statLabel}>착용횟수</span>
              <span className={styles.statValue}>{`${item.wearCount || 0}회`}</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>최근착용</span>
              <span className={styles.statValue}>{item.lastWornDate || "-"}</span>
            </div>
          </div>
        </section>

        {/* 상세정보 */}
        <section className={styles.infoSection}>
          {/* 브랜드 */}
          <div className={styles.fieldRow}>
            <span className={styles.fieldLabel}>브랜드</span>
            {isEditing ? (
              <input
                className={styles.fieldInput}
                value={item.brand || ""}
                placeholder="브랜드를 입력하세요"
                onChange={(e) => handleFieldChange("brand", e.target.value)}
              />
            ) : (
              <span className={styles.fieldValue}>{item.brand || "-"}</span>
            )}
          </div>

          {/* 사이즈 */}
          <div className={styles.fieldRow}>
            <span className={styles.fieldLabel}>사이즈</span>
            {isEditing ? (
              <input
                className={styles.fieldInput}
                value={item.clothesSize || ""}
                placeholder="사이즈를 입력하세요"
                onChange={(e) => handleFieldChange("clothesSize", e.target.value)}
              />
            ) : (
              <span className={styles.fieldValue}>{item.clothesSize || "-"}</span>
            )}
          </div>

          {/* 상세정보 */}
          <div className={styles.detailGroup}>
            <button
              type="button"
              className={styles.detailToggle}
              onClick={() => setIsInfoOpen((prev) => !prev)}
            >
              <span className={styles.detailToggleLabel}>상세정보</span>
              <img
                src={ChevronDown}
                alt=""
                className={clsx(styles.chevron, isInfoOpen && styles.chevronOpen)}
              />
            </button>

            {isInfoOpen && (
              <div className={styles.detailPanel}>
                {/* 가격 */}
                <div className={styles.fieldRow}>
                  <span className={styles.fieldLabel}>가격</span>
                  {isEditing ? (
                    <input
                      className={styles.fieldInput}
                      type="number"
                      placeholder="가격을 입력하세요"
                      value={item.price || ""}
                      onChange={(e) => handleFieldChange("price", e.target.value)}
                    />
                  ) : (
                    <span className={clsx(styles.fieldValue, styles.textRight)}>
                      {item.price ? `${Number(item.price).toLocaleString()}원` : "-"}
                    </span>
                  )}
                </div>

                {/* 구매일 */}
                <div className={styles.fieldRow}>
                  <span className={styles.fieldLabel}>구매일</span>
                  {isEditing ? (
                    <input
                      className={styles.fieldInput}
                      type="date"
                      value={item.purchaseDate || ""}
                      onChange={(e) => handleFieldChange("purchaseDate", e.target.value)}
                    />
                  ) : (
                    <span className={clsx(styles.fieldValue, styles.textRight)}>
                      {item.purchaseDate || "-"}
                    </span>
                  )}
                </div>

                {/* 구매링크 */}
                <div className={styles.fieldRow}>
                  <span className={styles.fieldLabel}>구매링크</span>
                  {isEditing ? (
                    <input
                      className={styles.fieldInput}
                      placeholder="링크를 입력하세요"
                      value={item.purchaseUrl || ""}
                      onChange={(e) => handleFieldChange("purchaseUrl", e.target.value)}
                    />
                  ) : (
                    <span className={clsx(styles.fieldValue, styles.textRight)}>
                      {item.purchaseUrl || "-"}
                    </span>
                  )}
                </div>

                {/* 설명 */}
                <div className={clsx(styles.fieldRow, styles.fieldAlignTop, styles.fieldEditing)}>
                  <span className={styles.fieldLabel}>설명</span>
                  {isEditing ? (
                    <textarea
                      className={styles.fieldInput}
                      placeholder="설명을 입력하세요"
                      value={item.description || ""}
                      onChange={(e) => handleFieldChange("description", e.target.value)}
                    />
                  ) : (
                    <span className={clsx(styles.fieldValue, styles.descriptionValue)}>
                      {item.description || "-"}
                    </span>
                  )}
                </div>
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

export default ClosetDetailPageSample;
