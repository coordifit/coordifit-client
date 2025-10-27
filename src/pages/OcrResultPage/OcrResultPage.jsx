import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./OcrResultPage.module.css";
import editIcon from "@/assets/images/editpencil.png";
import trashIcon from "@/assets/images/trash.png";
import checkIcon from "@/assets/images/checkicon.png";
import cancelIcon from "@/assets/images/circle-x.png";

const OcrResultPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedItems, setSelectedItems] = useState([]);
  const [editingField, setEditingField] = useState(null); // { itemIndex, field }
  const [editValues, setEditValues] = useState({}); // 편집 중인 값들 저장
  const [currentPage, setCurrentPage] = useState(0); // 현재 페이지 인덱스
  const scrollRef = useRef(null); // 스크롤 컴테이너 참조

  const { originalImage, ocrData, analysisResult } = location.state || {};

  // 상품 데이터를 상태로 관리
  const [products, setProducts] = useState(() => analysisResult?.data?.products || []);

  // 받은 데이터 상세 로그
  console.log("📊 OcrResultPage 받은 데이터:", {
    hasOriginalImage: !!originalImage,
    ocrData: ocrData,
    analysisResult: analysisResult,
    locationState: location.state,
  });

  console.log("🛍️ 상품 데이터 분석:", {
    productCount: products.length,
    products: products,
    hasAnalysisResult: !!analysisResult,
    hasAnalysisData: !!analysisResult?.data,
    analysisResultKeys: analysisResult ? Object.keys(analysisResult) : [],
    analysisDataKeys: analysisResult?.data ? Object.keys(analysisResult.data) : [],
  });

  // 스크롤 이벤트 핸들러
  const handleScroll = () => {
    if (scrollRef.current) {
      const scrollLeft = scrollRef.current.scrollLeft;
      const containerWidth = scrollRef.current.clientWidth; // 동적 컴테이너 너비
      const newPage = Math.round(scrollLeft / containerWidth);
      setCurrentPage(newPage);
    }
  };

  // 스크롤 이벤트 리스너 등록
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll);
      return () => scrollContainer.removeEventListener("scroll", handleScroll);
    }
  }, []);

  const handleEdit = (itemIndex, field, e) => {
    e.stopPropagation(); // 카드 선택 방지
    const editKey = `${itemIndex}-${field}`;
    setEditingField({ itemIndex, field });
    setEditValues((prev) => ({
      ...prev,
      [editKey]: products[itemIndex][field] || "",
    }));
  };

  const handleSave = (itemIndex, field, e) => {
    e.stopPropagation();
    const editKey = `${itemIndex}-${field}`;
    const newValue = editValues[editKey];

    // 실제 데이터 업데이트
    setProducts((prev) => {
      const updated = [...prev];
      updated[itemIndex] = {
        ...updated[itemIndex],
        [field]: newValue,
      };
      return updated;
    });

    console.log(`${field} 수정:`, newValue);

    setEditingField(null);
    setEditValues((prev) => {
      const updated = { ...prev };
      delete updated[editKey];
      return updated;
    });
  };

  const handleCancel = (e) => {
    e.stopPropagation();
    setEditingField(null);
    setEditValues({});
  };

  const handleInputChange = (itemIndex, field, value) => {
    const editKey = `${itemIndex}-${field}`;
    setEditValues((prev) => ({
      ...prev,
      [editKey]: value,
    }));
  };

  const isEditing = (itemIndex, field) => {
    return editingField?.itemIndex === itemIndex && editingField?.field === field;
  };

  const getDisplayValue = (item, field, itemIndex) => {
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
  };

  const handleDelete = (itemIndex, field, e) => {
    e.stopPropagation(); // 카드 선택 방지
    if (confirm(`${field} 항목을 삭제하시겠습니까?`)) {
      // 실제 데이터에서 필드 삭제 (빈 문자열로 설정)
      setProducts((prev) => {
        const updated = [...prev];
        updated[itemIndex] = {
          ...updated[itemIndex],
          [field]: "",
        };
        return updated;
      });

      console.log(`${field} 삭제`);
    }
  };

  const handleItemSelect = (index) => {
    setSelectedItems((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  };

  const handleAddToCloset = () => {
    if (selectedItems.length === 0) {
      alert("추가할 상품을 선택해주세요.");
      return;
    }

    const selectedProducts = selectedItems.map((index) => products[index]);

    // TODO: 선택된 상품들을 옷장에 추가하는 로직
    console.log("옷장에 추가할 상품들:", selectedProducts);

    alert(`${selectedItems.length}개 상품이 옷장에 추가되었습니다!`);
    navigate("/closet");
  };

  const handleRetry = () => {
    navigate("/closet/ocr");
  };

  if (!analysisResult) {
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
          {originalImage && (
            <img
              src={URL.createObjectURL(originalImage)}
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
                    className={`${styles.resultItem} ${selectedItems.includes(index) ? styles.selected : ""}`}
                    onClick={() => handleItemSelect(index)}
                  >
                    {/* 구매일 */}
                    <div className={styles.purchaseDate}>
                      <span>구매일: 24.04.26(금)</span>
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
                      {selectedItems.includes(index) && (
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
              선택된 상품 <span className={styles.selectionCount}>{selectedItems.length}</span>개
            </div>
            <button
              className={styles.addToClosetButton}
              onClick={handleAddToCloset}
              disabled={selectedItems.length === 0}
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
