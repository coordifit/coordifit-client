import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./OcrResultPage.module.css";
import editIcon from "@/assets/images/editpencil.png";
import trashIcon from "@/assets/images/trash.png";
import checkIcon from "@/assets/images/checkicon.png";
import cancelIcon from "@/assets/images/circle-x.png";

const OcrResultPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const scrollRef = useRef(null);

  // 상태 최적화: 필요한 상태만 관리
  const [selectedItems, setSelectedItems] = useState(new Set()); // Set으로 최적화
  const [editingField, setEditingField] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [currentPage, setCurrentPage] = useState(0);

  const { originalImage, ocrData, analysisResult } = location.state || {};

  // 데이터 복원 최적화
  const restoredData = useMemo(() => {
    if (!originalImage && !ocrData && !analysisResult) {
      const savedData = sessionStorage.getItem("ocrResultData");
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          // 이미지 URL 복원 (메모리 누수 방지)
          if (parsed.originalImageBlob) {
            parsed.originalImage = new File([parsed.originalImageBlob], "image.jpg", {
              type: "image/jpeg",
            });
          }
          return parsed;
        } catch (error) {
          console.error("저장된 OCR 데이터 복원 실패:", error);
          sessionStorage.removeItem("ocrResultData"); // 손상된 데이터 제거
        }
      }
    }
    return null;
  }, [originalImage, ocrData, analysisResult]);

  // 실제 사용할 데이터
  const finalOriginalImage = originalImage || restoredData?.originalImage;
  const finalOcrData = ocrData || restoredData?.ocrData;
  const finalAnalysisResult = analysisResult || restoredData?.analysisResult;

  // 상품 데이터 memoization
  const products = useMemo(() => finalAnalysisResult?.data?.products || [], [finalAnalysisResult]);

  // OCR 데이터에서 구매일 추출 함수
  const extractPurchaseDate = useMemo(() => {
    if (!finalOcrData?.results) return "날짜 정보 없음";

    // 날짜 패턴 찾기 (예: 24.04.26(금), 2024.04.26 등)
    const datePattern = /\d{2,4}[.\-/]\d{1,2}[.\-/]\d{1,2}(\([가-힣]\))?/;

    for (const result of finalOcrData.results) {
      if (result.text && datePattern.test(result.text)) {
        return `구매일: ${result.text}`;
      }
    }

    return "구매일: 날짜 정보 없음";
  }, [finalOcrData]);

  // 이미지 URL memoization (메모리 누수 방지)
  const imageUrl = useMemo(() => {
    if (finalOriginalImage) {
      return URL.createObjectURL(finalOriginalImage);
    }
    return null;
  }, [finalOriginalImage]);

  // 컴포넌트 언마운트 시 URL 정리
  useEffect(() => {
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  // 선택된 아이템 복원 최적화
  useEffect(() => {
    if (restoredData?.selectedItems) {
      setSelectedItems(new Set(restoredData.selectedItems));
    }
  }, [restoredData]);

  // 즉시 반응하는 스크롤 핸들러 (dot 반영 최적화)
  const handleScroll = useCallback(() => {
    if (scrollRef.current) {
      const scrollLeft = scrollRef.current.scrollLeft;
      const itemWidth = 320;
      const newPage = Math.round(scrollLeft / itemWidth);
      // 조건 없이 즉시 업데이트
      setCurrentPage(newPage);
    }
  }, []);

  // 스크롤 이벤트 리스너 등록 (즉시 반응)
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll, { passive: true });
      return () => {
        scrollContainer.removeEventListener("scroll", handleScroll);
      };
    }
  }, [handleScroll]);

  // 편집 핸들러 최적화
  const handleEdit = useCallback(
    (itemIndex, field, e) => {
      e.stopPropagation();
      const editKey = `${itemIndex}-${field}`;
      setEditingField({ itemIndex, field });
      setEditValues((prev) => ({
        ...prev,
        [editKey]: products[itemIndex][field] || "",
      }));
    },
    [products],
  );

  const handleSave = useCallback(
    (itemIndex, field, e) => {
      e.stopPropagation();
      const editKey = `${itemIndex}-${field}`;
      const newValue = editValues[editKey];

      // 상품 데이터 업데이트는 products를 직접 관리하지 않고 필요시에만
      console.log(`${field} 수정:`, newValue);

      setEditingField(null);
      setEditValues((prev) => {
        const updated = { ...prev };
        delete updated[editKey];
        return updated;
      });
    },
    [editValues],
  );

  const handleCancel = useCallback((e) => {
    e.stopPropagation();
    setEditingField(null);
    setEditValues({});
  }, []);

  const handleInputChange = useCallback((itemIndex, field, value) => {
    const editKey = `${itemIndex}-${field}`;
    setEditValues((prev) => ({
      ...prev,
      [editKey]: value,
    }));
  }, []);

  const isEditing = (itemIndex, field) => {
    return editingField?.itemIndex === itemIndex && editingField?.field === field;
  };

  const getDisplayValue = useCallback(
    (item, field, itemIndex) => {
      const editKey = `${itemIndex}-${field}`;
      if (isEditing(itemIndex, field)) {
        return editValues[editKey] || "";
      }

      switch (field) {
        case "brand":
          return item.brand || "예: 무신사 스탠다드";
        case "name":
          return item.name || "예: 오피스 캐주얼 룩";
        case "size":
          return item.size || "예: L, XL";
        case "price":
          return item.price ? `${item.price.toLocaleString()}원` : "예: 50,000원";
        default:
          return "";
      }
    },
    [editingField, editValues],
  );

  const handleDelete = useCallback((itemIndex, field, e) => {
    e.stopPropagation();
    if (confirm(`${field} 항목을 삭제하시겠습니까?`)) {
      console.log(`${field} 삭제`);
    }
  }, []);

  // Set 기반 선택 로직으로 최적화
  const handleItemSelect = useCallback((index) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  }, []);

  const handleAddToCloset = useCallback(() => {
    console.log("🚀 handleAddToCloset 실행됨");
    console.log("선택된 아이템들:", Array.from(selectedItems));

    if (selectedItems.size === 0) {
      alert("추가할 상품을 선택해주세요.");
      return;
    }

    const selectedProducts = Array.from(selectedItems).map((index) => products[index]);
    console.log("선택된 상품들:", selectedProducts);

    // OCR 결과 데이터를 sessionStorage에 저장 (뒤로가기 시 복원용)
    sessionStorage.setItem(
      "ocrResultData",
      JSON.stringify({
        originalImage: finalOriginalImage,
        ocrData: finalOcrData,
        analysisResult: finalAnalysisResult,
        selectedItems: Array.from(selectedItems),
      }),
    );

    // 선택된 상품들을 옷장 등록 페이지로 전달
    console.log("네비게이션 시작: /closet/register");
    navigate("/closet/register", {
      state: {
        ocrProducts: selectedProducts,
        isMultipleRegistration: selectedProducts.length > 1,
      },
    });
  }, [selectedItems, products, finalOriginalImage, finalOcrData, finalAnalysisResult, navigate]);

  const handleRetry = useCallback(() => {
    navigate("/closet/ocr");
  }, [navigate]);

  if (!finalAnalysisResult) {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.errorMessage}>
            <p>분석 결과를 불러올 수 없습니다.</p>
            <button className={styles.retryButton} onClick={handleRetry}>
              다시 시도하기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h2 className={styles.resultTitle}>구매내역 인식 결과 화면</h2>

        <h3 className={styles.sectionTitle}>실물 사진</h3>
        <div className={styles.originalImageSection}>
          {finalOriginalImage && finalOriginalImage instanceof File && (
            <img
              src={URL.createObjectURL(finalOriginalImage)}
              alt="원본 영수증 이미지"
              className={styles.originalImage}
            />
          )}
        </div>

        {/* 총 개수 메시지 - 실물 사진 바로 아래 */}
        <div className={styles.countMessage}>
          <p className={styles.countText}>총 {products.length}건의 구매 물건이 감지되었습니다.</p>
          <p className={styles.instructionText}>
            데이터를 확인하고 옷장에 추가하려면 추가하기 버튼을 눌러주세요
          </p>
        </div>

        <div className={styles.resultSection}>
          {products.length > 0 ? (
            <div className={styles.productsContainer}>
              {/* 페이지 인디케이터를 카드 위에 배치 */}
              {products.length > 1 && (
                <div className={styles.pageIndicator}>
                  {products.map((_, index) => (
                    <div
                      key={index}
                      className={`${styles.dot} ${index === currentPage ? styles.activeDot : ""}`}
                    ></div>
                  ))}
                </div>
              )}

              <div className={styles.productCards} ref={scrollRef}>
                {products.map((item, index) => (
                  <div
                    key={index}
                    className={`${styles.resultItem} ${selectedItems.has(index) ? styles.selected : ""}`}
                    onClick={() => handleItemSelect(index)}
                  >
                    {/* 구매일 */}
                    <div className={styles.purchaseDate}>
                      <span>{extractPurchaseDate}</span>
                    </div>

                    {/* 테이블 헤더 */}
                    <div className={styles.tableHeader}>
                      <div className={styles.headerCell}>Filed</div>
                      <div className={styles.headerCell}>Value</div>
                    </div>

                    {/* 데이터 행들 */}
                    <div className={styles.tableBody}>
                      {/* 브랜드 행 */}
                      <div className={styles.tableRow}>
                        <div className={styles.fieldCell}>브랜드</div>
                        <div className={styles.valueCell}>
                          <div
                            className={`${styles.valueInput} ${!item.brand && !isEditing(index, "brand") ? styles.placeholder : ""}`}
                          >
                            {isEditing(index, "brand") ? (
                              <div className={styles.editingContainer}>
                                <input
                                  type="text"
                                  value={getDisplayValue(item, "brand", index)}
                                  onChange={(e) =>
                                    handleInputChange(index, "brand", e.target.value)
                                  }
                                  className={styles.editInput}
                                  autoFocus
                                />
                                <div className={styles.editActions}>
                                  <img
                                    src={checkIcon}
                                    alt="저장"
                                    className={styles.saveButton}
                                    onClick={(e) => handleSave(index, "brand", e)}
                                  />
                                  <img
                                    src={cancelIcon}
                                    alt="취소"
                                    className={styles.cancelButton}
                                    onClick={handleCancel}
                                  />
                                </div>
                              </div>
                            ) : (
                              <>
                                <span>{getDisplayValue(item, "brand", index)}</span>
                                <div className={styles.actionIcons}>
                                  <img
                                    src={editIcon}
                                    alt="편집"
                                    className={styles.editIcon}
                                    onClick={(e) => handleEdit(index, "brand", e)}
                                  />
                                  <img
                                    src={trashIcon}
                                    alt="삭제"
                                    className={styles.deleteIcon}
                                    onClick={(e) => handleDelete(index, "brand", e)}
                                  />
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* 상품명 행 */}
                      <div className={styles.tableRow}>
                        <div className={styles.fieldCell}>상품명</div>
                        <div className={styles.valueCell}>
                          <div
                            className={`${styles.valueInput} ${!item.name && !isEditing(index, "name") ? styles.placeholder : ""}`}
                          >
                            {isEditing(index, "name") ? (
                              <div className={styles.editingContainer}>
                                <input
                                  type="text"
                                  value={getDisplayValue(item, "name", index)}
                                  onChange={(e) => handleInputChange(index, "name", e.target.value)}
                                  className={styles.editInput}
                                  autoFocus
                                />
                                <div className={styles.editActions}>
                                  <img
                                    src={checkIcon}
                                    alt="저장"
                                    className={styles.saveButton}
                                    onClick={(e) => handleSave(index, "name", e)}
                                  />
                                  <img
                                    src={cancelIcon}
                                    alt="취소"
                                    className={styles.cancelButton}
                                    onClick={handleCancel}
                                  />
                                </div>
                              </div>
                            ) : (
                              <>
                                <span>{getDisplayValue(item, "name", index)}</span>
                                <div className={styles.actionIcons}>
                                  <img
                                    src={editIcon}
                                    alt="편집"
                                    className={styles.editIcon}
                                    onClick={(e) => handleEdit(index, "name", e)}
                                  />
                                  <img
                                    src={trashIcon}
                                    alt="삭제"
                                    className={styles.deleteIcon}
                                    onClick={(e) => handleDelete(index, "name", e)}
                                  />
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* 사이즈 행 */}
                      <div className={styles.tableRow}>
                        <div className={styles.fieldCell}>사이즈</div>
                        <div className={styles.valueCell}>
                          <div
                            className={`${styles.valueInput} ${!item.size && !isEditing(index, "size") ? styles.placeholder : ""}`}
                          >
                            {isEditing(index, "size") ? (
                              <div className={styles.editingContainer}>
                                <input
                                  type="text"
                                  value={getDisplayValue(item, "size", index)}
                                  onChange={(e) => handleInputChange(index, "size", e.target.value)}
                                  className={styles.editInput}
                                  autoFocus
                                />
                                <div className={styles.editActions}>
                                  <img
                                    src={checkIcon}
                                    alt="저장"
                                    className={styles.saveButton}
                                    onClick={(e) => handleSave(index, "size", e)}
                                  />
                                  <img
                                    src={cancelIcon}
                                    alt="취소"
                                    className={styles.cancelButton}
                                    onClick={handleCancel}
                                  />
                                </div>
                              </div>
                            ) : (
                              <>
                                <span>{getDisplayValue(item, "size", index)}</span>
                                <div className={styles.actionIcons}>
                                  <img
                                    src={editIcon}
                                    alt="편집"
                                    className={styles.editIcon}
                                    onClick={(e) => handleEdit(index, "size", e)}
                                  />
                                  <img
                                    src={trashIcon}
                                    alt="삭제"
                                    className={styles.deleteIcon}
                                    onClick={(e) => handleDelete(index, "size", e)}
                                  />
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* 금액 행 */}
                      <div className={styles.tableRow}>
                        <div className={styles.fieldCell}>금액</div>
                        <div className={styles.valueCell}>
                          <div
                            className={`${styles.valueInput} ${!item.price && !isEditing(index, "price") ? styles.placeholder : ""}`}
                          >
                            {isEditing(index, "price") ? (
                              <div className={styles.editingContainer}>
                                <input
                                  type="text"
                                  value={getDisplayValue(item, "price", index)}
                                  onChange={(e) =>
                                    handleInputChange(index, "price", e.target.value)
                                  }
                                  className={styles.editInput}
                                  autoFocus
                                />
                                <div className={styles.editActions}>
                                  <img
                                    src={checkIcon}
                                    alt="저장"
                                    className={styles.saveButton}
                                    onClick={(e) => handleSave(index, "price", e)}
                                  />
                                  <img
                                    src={cancelIcon}
                                    alt="취소"
                                    className={styles.cancelButton}
                                    onClick={handleCancel}
                                  />
                                </div>
                              </div>
                            ) : (
                              <>
                                <span>{getDisplayValue(item, "price", index)}</span>
                                <div className={styles.actionIcons}>
                                  <img
                                    src={editIcon}
                                    alt="편집"
                                    className={styles.editIcon}
                                    onClick={(e) => handleEdit(index, "price", e)}
                                  />
                                  <img
                                    src={trashIcon}
                                    alt="삭제"
                                    className={styles.deleteIcon}
                                    onClick={(e) => handleDelete(index, "price", e)}
                                  />
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 체크박스 */}
                    <div className={styles.checkbox}>
                      {selectedItems.has(index) && (
                        <img src={checkIcon} alt="체크" className={styles.checkIcon} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className={styles.noResults}>
              <p>인식된 상품이 없습니다.</p>
              <button className={styles.retryButton} onClick={handleRetry}>
                다시 시도하기
              </button>
            </div>
          )}
        </div>

        {products.length > 0 && (
          <div className={styles.bottomActions}>
            <div className={styles.selectionInfo}>
              선택된 상품 <span className={styles.selectionCount}>{selectedItems.size}</span>개
            </div>
            <button
              className={styles.addToClosetButton}
              onClick={handleAddToCloset}
              disabled={selectedItems.size === 0}
            >
              옷장에 등록
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OcrResultPage;
