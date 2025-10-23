import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./OcrResultPage.module.css";

const OcrResultPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedItems, setSelectedItems] = useState([]);

  const { originalImage, ocrData, analysisResult } = location.state || {};

  const products = analysisResult?.products || [];

  const handleBack = () => {
    navigate("/closet/ocr");
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
    navigate("/closet-sample");
  };

  const handleRetry = () => {
    navigate("/closet/ocr");
  };

  if (!analysisResult) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <button className={styles.backButton} onClick={handleBack}>
            ←
          </button>
          <h1 className={styles.title}>분석 결과</h1>
        </div>
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
      <div className={styles.header}>
        <button className={styles.backButton} onClick={handleBack}>
          ←
        </button>
        <h1 className={styles.title}>구매내역 인식 결과 화면</h1>
      </div>

      <div className={styles.content}>
        <h2 className={styles.resultTitle}>실물 사진</h2>

        <div className={styles.resultSection}>
          {products.length > 0 ? (
            products.map((item, index) => (
              <div
                key={index}
                className={`${styles.resultItem} ${selectedItems.includes(index) ? styles.selected : ""}`}
                onClick={() => handleItemSelect(index)}
              >
                <div className={styles.itemHeader}>
                  <div className={styles.itemDate}>24.04.26(금)</div>
                  <div className={styles.checkbox}>
                    {selectedItems.includes(index) && <span>✓</span>}
                  </div>
                </div>

                <div className={styles.itemContent}>
                  <div className={styles.itemImage}>
                    <img src={item.image || "/noimage.png"} alt={item.name} />
                  </div>
                  <div className={styles.itemInfo}>
                    <div className={styles.itemBrand}>{item.brand || "브랜드"}</div>
                    <div className={styles.itemName}>{item.name}</div>
                    <div className={styles.itemDetails}>
                      {item.size && `${item.size} / `}
                      {item.quantity || 1}개
                    </div>
                    <div className={styles.itemPrice}>
                      {item.price ? `${item.price.toLocaleString()}원` : "가격 정보 없음"}
                    </div>
                  </div>
                  <button className={styles.addButton}>스냅 보기</button>
                </div>

                <div className={styles.itemActions}>
                  <button className={styles.actionButton}>배송 조회</button>
                  <button className={styles.actionButton}>재구매</button>
                </div>
              </div>
            ))
          ) : (
            <div className={styles.noResults}>
              <p>인식된 상품이 없습니다.</p>
              <button className={styles.retryButton} onClick={handleRetry}>
                다시 시도하기
              </button>
            </div>
          )}
        </div>

        <div className={styles.summarySection}>
          <p className={styles.resultNote}>총 {products.length}건의 구매 물건이 감지되었습니다.</p>
          <p className={styles.resultSubNote}>
            데이터를 확인하고 옷장에 추가하려면 상품을 선택하고 추가하기 버튼을 눌러주세요
          </p>
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
