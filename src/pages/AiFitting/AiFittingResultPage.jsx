import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import styles from "./AiFittingResultPage.module.css";
import { useAiFittingStore } from "@/stores/aiFittingStore";
import autoAwesomeIcon from "@/assets/images/auto_awesome.png";

const defaultAnalysis = {
  title: "화이트 상의로 밝아진 얼굴 톤",
  description:
    "화이트 색상의 상의로 얼굴 톤이 밝아 보이는 효과를 줍니다. 어깨선이 살짝 내려간 루즈핏 디자인으로 상체에 부피감을 더해 어깨가 더 넓어 보이도록 연출했어요. 탄탄한 소재의 팬츠는 하체 라인을 자연스럽게 커버해 안정감 있는 실루엣을 완성합니다.",
  hashtags: ["편안", "출근"],
};

const fallbackResultImage =
  "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80";

const formatPrice = (value) => {
  if (typeof value !== "number") return null;
  return new Intl.NumberFormat("ko-KR").format(value);
};

const AiFittingResultPage = () => {
  const navigate = useNavigate();
  const avatars = useAiFittingStore((state) => state.avatars);
  const selectedAvatarId = useAiFittingStore((state) => state.selectedAvatarId);
  const clothingSelection = useAiFittingStore((state) => state.clothingSelection);
  const clearClothingSelection = useAiFittingStore((state) => state.clearClothingSelection);

  const location = useLocation();
  const imageBase64 = location.state?.imageBase64 ?? null;

  const [showAnalysis, setShowAnalysis] = useState(false);

  const selectedAvatar = useMemo(
    () => avatars.find((avatar) => avatar.id === selectedAvatarId) ?? null,
    [avatars, selectedAvatarId],
  );

  const selectedItems = useMemo(
    () =>
      Object.entries(clothingSelection)
        .filter(([, item]) => Boolean(item))
        .map(([type, item]) => ({
          type,
          ...item,
        })),
    [clothingSelection],
  );

  useEffect(() => {
    if (!selectedAvatar || selectedItems.length === 0) {
      navigate("/ai-fitting");
    }
  }, [navigate, selectedAvatar, selectedItems]);

  const handleRetry = () => {
    clearClothingSelection();
    navigate("/ai-fitting");
  };

  const outfitSummary = selectedItems.map((item) => item.name).join(" / ");

  const resultImageSrc = imageBase64 ? `data:image/png;base64,${imageBase64}` : fallbackResultImage;

  return (
    <div className={styles.page}>
      <section className={styles.main}>
        <div className={styles.resultImageWrapper}>
          <img src={resultImageSrc} alt="AI로 생성된 코디 결과" className={styles.resultImage} />
        </div>
        <div className={styles.avatarInfo}>
          <span className={styles.avatarName}>{selectedAvatar?.name ?? "선택된 아바타 없음"}</span>
          {outfitSummary && <span className={styles.outfitSummary}>{outfitSummary}</span>}
        </div>
        <div className={styles.actionRow}>
          <button type="button" className={styles.saveButton}>
            코디에 저장하기
          </button>
          <button type="button" className={styles.retryButton} onClick={handleRetry}>
            다른 옷 입히기
          </button>
        </div>
        <button
          type="button"
          className={`${styles.analysisToggle} ${showAnalysis ? styles.active : ""}`}
          onClick={() => setShowAnalysis((prev) => !prev)}
          aria-expanded={showAnalysis}
        >
          <img src={autoAwesomeIcon} alt="" className={styles.analysisIcon} aria-hidden="true" />
          <span className={styles.analysisToggleLabel}>
            {showAnalysis ? "AI 분석 결과" : "AI 분석"}
          </span>
        </button>
        {showAnalysis && (
          <article className={styles.analysisPanel}>
            <h3 className={styles.analysisTitle}>{defaultAnalysis.title}</h3>
            <p className={styles.analysisDescription}>{defaultAnalysis.description}</p>
            <ul className={styles.hashtagList}>
              {defaultAnalysis.hashtags.map((tag) => (
                <li key={tag} className={styles.hashtag}>
                  #{tag}
                </li>
              ))}
            </ul>
          </article>
        )}
        <h3 className={styles.productHeading}>착용 상품 정보</h3>
        <div className={styles.productList}>
          {selectedItems.map((item) => {
            const price = formatPrice(item.price);
            return (
              <article key={item.id ?? item.name} className={styles.productCard}>
                <div className={styles.productThumbnail}>
                  <img
                    src={item.images?.[0] ?? fallbackResultImage}
                    alt={item.name}
                    className={styles.productImage}
                  />
                </div>
                <div className={styles.productMeta}>
                  <div className={styles.productMetaHeader}>
                    {item.brand && <span className={styles.productBrand}>{item.brand}</span>}
                  </div>
                  <span className={styles.productName}>{item.name}</span>
                  {price && <span className={styles.productPrice}>{price}원</span>}
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default AiFittingResultPage;
