// src/pages/ClosetPage/ClosetRegisterPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import clsx from "clsx";
import styles from "./ClosetRegisterPage.module.css";

import TopIcon from "@/assets/images/topicon.png";
import BottomIcon from "@/assets/images/bottomicon.png";
import ShoesIcon from "@/assets/images/shoesicon.png";
import OuterIcon from "@/assets/images/outericon.png";
import AccessoriesIcon from "@/assets/images/accessoriesicon.png";
import EnrollIcon from "@/assets/images/enrollicon.png";
import CalendarIcon from "@/assets/images/calendaricon.png";
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";

import ClothesService from "@/services/clothesService";
import CommonCodeService from "@/services/commonCodeService";

const MAX_PHOTOS = 5;

const CATEGORY_ICON_MAP = {
  top: TopIcon,
  bottom: BottomIcon,
  shoes: ShoesIcon,
  outer: OuterIcon,
  "fashion-item": AccessoriesIcon,
};

const ClosetRegisterPage = () => {
  const navigate = useNavigate();

  // ✅ form 데이터
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    size: "",
    price: "",
    purchaseDate: "",
    purchaseLink: "",
    description: "",
    category: "", // main
    subCategory: "", // sub
  });

  // ✅ 이미지 관련
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [photoFiles, setPhotoFiles] = useState([]);

  // ✅ 카테고리 관련
  const [isCategorySheetOpen, setIsCategorySheetOpen] = useState(false);
  const [activeMainCategory, setActiveMainCategory] = useState(null);
  const [mainCategories, setMainCategories] = useState([]);
  const [subCategoriesMap, setSubCategoriesMap] = useState({});

  // ✅ 카테고리 데이터 로드 (DB에서)
  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        const { mainCategories, subCategoriesMap } = await CommonCodeService.getCategoryData();
        setMainCategories(mainCategories);
        setSubCategoriesMap(subCategoriesMap);
      } catch (err) {
        console.error("❌ 카테고리 로드 실패:", err);
      }
    };
    fetchCategoryData();
  }, []);

  // ✅ 하위 카테고리 계산
  const subCategories = useMemo(() => {
    if (!activeMainCategory) return [];
    return subCategoriesMap[activeMainCategory] || [];
  }, [activeMainCategory, subCategoriesMap]);

  // ✅ 파일 선택
  const handleFileChange = (event) => {
    const files = Array.from(event.target.files || []);
    setPhotoFiles((prev) => [...prev, ...files.slice(0, MAX_PHOTOS - prev.length)]);

    setPhotoPreviews((previous) => [
      ...previous,
      ...files.slice(0, MAX_PHOTOS - previous.length).map((file) => ({
        url: URL.createObjectURL(file),
        name: file.name,
      })),
    ]);

    event.target.value = "";
  };

  // ✅ 입력 변경
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // ✅ 카테고리 선택
  const handleCategorySelect = (mainCodeId, subCodeId) => {
    setFormData((prev) => ({
      ...prev,
      category: mainCodeId,
      subCategory: subCodeId,
    }));
    setActiveMainCategory(mainCodeId);
    setIsCategorySheetOpen(false);
  };

  // ✅ 등록 요청
  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      // Base64 변환
      const base64Images = await Promise.all(
        photoFiles.map(
          (file) =>
            new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result);
              reader.onerror = reject;
              reader.readAsDataURL(file);
            }),
        ),
      );

      const payload = {
        name: formData.name,
        brand: formData.brand,
        clothesSize: formData.size,
        price: Number(formData.price) || 0,
        purchaseDate: formData.purchaseDate || null,
        purchaseUrl: formData.purchaseLink,
        description: formData.description,
        categoryCode: formData.subCategory, // ✅ DB 기준 코드 사용
        images: base64Images.map((dataUrl, index) => ({
          fileName: photoFiles[index]?.name || `image${index + 1}.png`,
          dataUrl,
        })),
      };

      await ClothesService.createClothes(payload);
      alert("✅ 옷이 성공적으로 등록되었습니다!");
      navigate("/closet", { replace: true });
    } catch (err) {
      console.error("❌ 옷 등록 실패:", err);
      alert("등록 중 오류가 발생했습니다.");
    }
  };

  // ✅ 미리보기 해제
  useEffect(() => {
    return () => photoPreviews.forEach((p) => URL.revokeObjectURL(p.url));
  }, [photoPreviews]);

  // ✅ 유효성 검사
  const isFormValid = useMemo(() => {
    return (
      photoPreviews.length > 0 &&
      formData.name.trim().length > 0 &&
      formData.category &&
      formData.subCategory
    );
  }, [photoPreviews, formData]);

  return (
    <div className={styles.page}>
      <form className={styles.form} onSubmit={handleSubmit}>
        {/* 사진 업로드 */}
        <section className={styles.photoSection}>
          {photoPreviews.length === 0 && (
            <p className={styles.photoGuide}>사진 등록 0/{MAX_PHOTOS} (1개 이상)</p>
          )}
          <label htmlFor="photo-input" className={styles.photoUploader}>
            {photoPreviews.length > 0 ? (
              <div className={styles.previewScroll}>
                {photoPreviews.map((photo, index) => (
                  <div key={photo.name + index} className={styles.previewItem}>
                    <img src={photo.url} alt={photo.name} className={styles.previewImage} />
                    <button
                      type="button"
                      className={styles.removeButton}
                      onClick={() => {
                        URL.revokeObjectURL(photo.url);
                        setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
                        setPhotoFiles((prev) => prev.filter((_, i) => i !== index));
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.photoPlaceholder}>
                <img src={EnrollIcon} alt="등록 아이콘" className={styles.photoIcon} />
              </div>
            )}
          </label>
          {photoPreviews.length > 0 && (
            <span className={styles.photoCount}>
              {photoPreviews.length}/{MAX_PHOTOS}
            </span>
          )}
          <input
            id="photo-input"
            className={styles.fileInput}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
          />
        </section>

        {/* 폼 입력 */}
        <section className={styles.fieldSection}>
          {/* 이름 */}
          <label className={styles.fieldRow}>
            <span className={styles.fieldLabel}>이름</span>
            <input
              type="text"
              className={styles.input}
              placeholder="이름을 입력하세요"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
          </label>

          {/* 카테고리 */}
          <label className={styles.fieldRow} onClick={() => setIsCategorySheetOpen(true)}>
            <span className={styles.fieldLabel}>카테고리</span>
            <span className={clsx(styles.fieldValue, !formData.category && styles.placeholder)}>
              {formData.category && formData.subCategory
                ? `${mainCategories.find((c) => c.codeId === formData.category)?.codeName} / ${
                    subCategoriesMap[formData.category]?.find(
                      (s) => s.codeId === formData.subCategory,
                    )?.codeName
                  }`
                : "카테고리 선택"}
            </span>
          </label>

          {/* 나머지 필드 동일 */}
          <label className={styles.fieldRow}>
            <span className={styles.fieldLabel}>브랜드</span>
            <input
              type="text"
              className={styles.input}
              placeholder="브랜드를 입력하세요"
              value={formData.brand}
              onChange={(e) => handleChange("brand", e.target.value)}
            />
          </label>

          <label className={styles.fieldRow}>
            <span className={styles.fieldLabel}>사이즈</span>
            <input
              type="text"
              className={styles.input}
              placeholder="사이즈를 입력하세요"
              value={formData.size}
              onChange={(e) => handleChange("size", e.target.value)}
            />
          </label>

          <label className={styles.fieldRow}>
            <span className={styles.fieldLabel}>가격</span>
            <input
              type="number"
              className={clsx(styles.input)}
              placeholder="가격을 입력하세요"
              value={formData.price}
              onChange={(e) => handleChange("price", e.target.value)}
            />
          </label>

          <label className={styles.fieldRow}>
            <span className={styles.fieldLabel}>구매일</span>
            <div className={styles.dateRow}>
              <img src={CalendarIcon} alt="캘린더" className={styles.calendarIcon} />
              <DatePicker
                selected={formData.purchaseDate ? new Date(formData.purchaseDate) : null}
                onChange={(date) =>
                  handleChange("purchaseDate", date ? date.toISOString().split("T")[0] : "")
                }
                dateFormat="yyyy-MM-dd"
                placeholderText="날짜를 선택하세요"
                className={clsx(styles.input, !formData.purchaseDate && styles.placeholder)}
              />
            </div>
          </label>

          <label className={styles.fieldRow}>
            <span className={styles.fieldLabel}>구매링크</span>
            <input
              type="url"
              className={styles.input}
              placeholder="링크를 입력하세요"
              value={formData.purchaseLink}
              onChange={(e) => handleChange("purchaseLink", e.target.value)}
            />
          </label>

          <label className={clsx(styles.fieldRow, styles.textareaRow)}>
            <span className={styles.fieldLabel}>설명</span>
            <textarea
              className={styles.textarea}
              placeholder="설명을 입력하세요"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </label>
        </section>

        <button
          type="submit"
          className={clsx(styles.submitButton, !isFormValid && styles.submitButtonDisabled)}
          disabled={!isFormValid}
        >
          등록하기
        </button>
      </form>

      {/* ✅ 카테고리 시트 (DB기반) */}
      {isCategorySheetOpen && (
        <div className={styles.sheetOverlay} onClick={() => setIsCategorySheetOpen(false)}>
          <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
            <div className={styles.sheetHandle} />
            <h2 className={styles.sheetTitle}>카테고리 선택</h2>

            <div className={styles.sheetMainList}>
              {mainCategories.map((category) => (
                <button
                  key={category.codeId}
                  type="button"
                  className={clsx(
                    styles.sheetMainButton,
                    activeMainCategory === category.codeId && styles.sheetMainActive,
                  )}
                  onClick={() => setActiveMainCategory(category.codeId)}
                >
                  <img
                    src={CATEGORY_ICON_MAP[category.codeId.toLowerCase()] || AccessoriesIcon}
                    alt={category.codeName}
                    className={styles.sheetMainIcon}
                  />
                  <span>{category.codeName}</span>
                </button>
              ))}
            </div>

            <div className={styles.sheetSubList}>
              {activeMainCategory ? (
                <>
                  <h3 className={styles.sheetSubTitle}>세부 카테고리</h3>
                  <div className={styles.sheetSubGrid}>
                    {(subCategoriesMap[activeMainCategory] || []).map((sub) => (
                      <button
                        key={sub.codeId}
                        type="button"
                        className={clsx(
                          styles.sheetSubButton,
                          formData.category === activeMainCategory &&
                            formData.subCategory === sub.codeId &&
                            styles.sheetSubActive,
                        )}
                        onClick={() => handleCategorySelect(activeMainCategory, sub.codeId)}
                      >
                        {sub.codeName}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <p className={styles.sheetSubPlaceholder}>먼저 카테고리를 선택해주세요</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClosetRegisterPage;
