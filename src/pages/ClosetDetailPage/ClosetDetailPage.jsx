import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import clsx from "clsx";
import styles from "./ClosetDetailPage.module.css";
import { useRef } from "react";
import ChevronDown from "@/assets/images/chevron-down.svg";
import ClothesService from "@/services/clothesService";
import CommonCodeService from "@/services/commonCodeService";

const ClosetDetailPage = () => {
  const navigate = useNavigate();
  const { itemId } = useParams();
  const [currentIndex, setCurrentIndex] = useState(0);
  const trackRef = useRef(null);
  const [item, setItem] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isCategorySheetOpen, setIsCategorySheetOpen] = useState(false);
  const [deletedImageIds, setDeletedImageIds] = useState([]);

  // ✅ 카테고리 데이터
  const [mainCategories, setMainCategories] = useState([]);
  const [subCategoriesMap, setSubCategoriesMap] = useState({});

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { mainCategories, subCategoriesMap } = await CommonCodeService.getCategoryData();
        setMainCategories(mainCategories);
        setSubCategoriesMap(subCategoriesMap);
      } catch (err) {
        console.error("❌ 카테고리 로드 실패:", err);
      }
    };
    fetchCategories();
  }, []);

  // ✅ 상세조회
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const data = await ClothesService.getClothesDetail(itemId);
        setItem(data);
      } catch (err) {
        console.error("❌ 상세조회 실패:", err);
        alert("상세 정보를 불러올 수 없습니다.");
        navigate("/closet");
      }
    };
    if (itemId) fetchDetail();
  }, [itemId, navigate]);

  // ✅ 카테고리 선택 상태 동기화
  useEffect(() => {
    if (!item || !item.categoryCode || mainCategories.length === 0) return;
    const main = mainCategories.find((m) =>
      (subCategoriesMap[m.codeId] || []).some((s) => s.codeId === item.categoryCode),
    );
    if (main && item.categoryMain !== main.codeId) {
      setItem((prev) => ({ ...prev, categoryMain: main.codeId }));
    }
  }, [item?.categoryCode, mainCategories, subCategoriesMap]);

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

  // ✅ 카테고리 선택 함수
  const handleCategorySelect = (mainId, subId) => {
    setItem((prev) => ({
      ...prev,
      categoryMain: mainId,
      categoryCode: subId,
    }));
    setIsCategorySheetOpen(false);
  };

  // ✅ 이미지 삭제
  const handleRemoveImage = (idx) => {
    setItem((prev) => {
      if (!prev?.images) return prev;
      const removed = prev.images[idx];
      if (removed?.fileId) {
        setDeletedImageIds((prevDel) => [...prevDel, removed.fileId]);
      }
      return {
        ...prev,
        images: prev.images.filter((_, i) => i !== idx),
      };
    });
  };

  // ✅ 수정 (기존 + 새 이미지 처리 완벽)
  const handleToggleEdit = async () => {
    if (isEditing) {
      try {
        const existingImages = item.images?.filter((img) => img.url);
        const newImages = item.images?.filter((img) => img.dataUrl);
        const hasNewImages = newImages && newImages.length > 0;

        const payload = {
          ...item,
          deletedImageIds,
        };

        if (hasNewImages) payload.images = newImages;
        else delete payload.images;

        console.log("📤 전송 payload:", payload);

        const res = await ClothesService.updateClothes(item.clothesId, payload);
        console.log("✅ 수정 요청 성공:", res);

        alert("수정 완료되었습니다.");
        setDeletedImageIds([]);
        setItem((prev) => ({ ...prev, ...payload }));
        setIsEditing(false);
      } catch (err) {
        console.error("❌ 수정 실패:", err);
        alert("수정 중 오류가 발생했습니다.");
      }
    } else {
      setIsEditing(true);
    }
  };

  // ✅ 삭제
  const handleDelete = async () => {
    if (!window.confirm("정말 이 옷을 삭제하시겠습니까?")) return;
    try {
      await ClothesService.deleteClothes(item.clothesId, { deletedImageIds });
      alert("삭제 완료되었습니다.");
      navigate("/closet");
    } catch (err) {
      console.error("❌ 삭제 실패:", err);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  const handleFieldChange = (field, value) => {
    setItem((prev) => ({ ...prev, [field]: value }));
  };

  const categoryLabel = useMemo(() => {
    if (!item || !item.categoryCode) return "-";
    const main = mainCategories.find((c) =>
      Object.values(subCategoriesMap[c.codeId] || []).some((s) => s.codeId === item.categoryCode),
    );
    if (!main) return "-";
    const sub = (subCategoriesMap[main.codeId] || []).find((s) => s.codeId === item.categoryCode);
    return sub ? `${main.codeName} / ${sub.codeName}` : main.codeName || "-";
  }, [item, mainCategories, subCategoriesMap]);

  if (!item) return <div className={styles.page}>로딩 중...</div>;

  return (
    <div className={styles.page}>
      <main className={styles.content}>
        {/* ✅ 이미지 영역 */}
        <section className={styles.photoSection}>
          {item.images?.length ? (
            <div className={styles.carouselContainer}>
              <div className={styles.carouselTrack} ref={trackRef}>
                {item.images.map((img, idx) => (
                  <div key={idx} className={styles.carouselSlide}>
                    <img
                      src={img.url || img.dataUrl || img}
                      alt={`image-${idx}`}
                      className={styles.previewImage}
                    />
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

          {/* ✅ 이미지 개수 표시 */}

          {/* ✅ 편집 모드에서만 추가 버튼 */}
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
                onChange={async (e) => {
                  const files = Array.from(e.target.files);
                  const newImages = await Promise.all(
                    files.map(
                      (file) =>
                        new Promise((resolve) => {
                          const reader = new FileReader();
                          reader.onloadend = () => resolve({ dataUrl: reader.result });
                          reader.readAsDataURL(file);
                        }),
                    ),
                  );
                  setItem((prev) => ({
                    ...prev,
                    images: [...(prev.images || []), ...newImages],
                  }));
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
                          {mainCategories.map((main) => (
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
                              {(subCategoriesMap[item.categoryMain] || []).map((sub) => (
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
              <span className={styles.statValue}>{`${item.wearCount ?? 0}회`}</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>최근착용</span>
              <span className={styles.statValue}>{item.lastWornDate ?? "-"}</span>
            </div>
          </div>
        </section>

        {/* ✅ 상세정보 (유지) */}
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

export default ClosetDetailPage;
