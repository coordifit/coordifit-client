import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import clsx from "clsx";
import commonCodeService from "../../services/commonCodeService";
import clothesService from "@/services/clothesService";
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
import { useQueryClient } from "@tanstack/react-query";

const MAX_PHOTOS = 5;

const CATEGORY_ICON_MAP = {
  상의: TopIcon,
  하의: BottomIcon,
  신발: ShoesIcon,
  아우터: OuterIcon,
  패션소품: AccessoriesIcon,
};

const ClosetRegisterPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    size: "",
    price: "",
    purchaseDate: "",
    purchaseLink: "",
    description: "",
    category: "",
    subCategory: "",
  });

  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [photoFiles, setPhotoFiles] = useState([]);

  const [isCategorySheetOpen, setIsCategorySheetOpen] = useState(false);
  const [activeMainCategory, setActiveMainCategory] = useState(null);
  const [mainCategories, setMainCategories] = useState([]);
  const [subCategoriesMap, setSubCategoriesMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const queryClient = useQueryClient();

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files || []);
    const remainingSlots = MAX_PHOTOS - photoPreviews.length;
    const filesToAdd = files.slice(0, remainingSlots);

    if (filesToAdd.length === 0) {
      alert("최대 5장까지만 업로드 가능합니다.");
      return;
    }

    setPhotoFiles((prev) => [...prev, ...filesToAdd]);

    const newImageUrls = filesToAdd.map((file) => URL.createObjectURL(file));
    setPhotoPreviews((prev) => [...prev, ...newImageUrls]);

    event.target.value = "";
  };

  const handleRemoveImage = (index) => {
    URL.revokeObjectURL(photoPreviews[index]);
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
    setPhotoFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        const categoryData = await commonCodeService.getCategoryData();
        setMainCategories(categoryData.mainCategories);
        setSubCategoriesMap(categoryData.subCategoriesMap);
        setLoading(false);
      } catch (error) {
        console.error("카테고리 로드 오류:", error);
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  const handleCategorySelect = (mainCodeId, subCodeId) => {
    setFormData((prev) => ({
      ...prev,
      category: mainCodeId,
      subCategory: subCodeId,
    }));
    setIsCategorySheetOpen(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (photoPreviews.length === 0) {
      alert("사진을 1장 이상 등록해주세요.");
      return;
    }

    if (formData.name.trim().length === 0) {
      alert("이름을 입력해주세요.");
      return;
    }

    if (formData.name.trim().length > 100) {
      alert("이름은 100자 이내로 입력해주세요.");
      return;
    }

    if (!formData.category || !formData.subCategory) {
      alert("카테고리를 선택해주세요.");
      return;
    }

    if (formData.brand.trim().length === 0) {
      alert("브랜드를 입력해주세요.");
      return;
    }

    if (formData.brand.trim().length > 100) {
      alert("브랜드는 100자 이내로 입력해주세요.");
      return;
    }

    if (formData.size && formData.size.length > 20) {
      alert("사이즈는 20자 이내로 입력해주세요.");
      return;
    }

    if (formData.price && formData.price.length > 10) {
      alert("가격은 10자리 이내로 입력해주세요.");
      return;
    }

    if (formData.purchaseLink && formData.purchaseLink.length > 1000) {
      alert("구매링크는 1000자 이내로 입력해주세요.");
      return;
    }

    if (formData.description && formData.description.length > 1000) {
      alert("설명은 1000자 이내로 입력해주세요.");
      return;
    }

    try {
      setIsSubmitting(true);

      const clothesData = {
        name: formData.name,
        brand: formData.brand,
        categoryCode: formData.subCategory,
        clothesSize: formData.size,
        price: formData.price ? parseInt(formData.price) : null,
        purchaseDate: formData.purchaseDate,
        purchaseUrl: formData.purchaseLink,
        description: formData.description,
        files: photoFiles,
      };

      queryClient.invalidateQueries(["clothes"]);
      const response = await clothesService.createClothes(clothesData);

      if (response.success) {
        alert("옷이 성공적으로 등록되었습니다!");
        navigate("/closet");
      } else {
        alert(response.message || "등록에 실패했습니다.");
      }
    } catch (error) {
      console.error("옷 등록 오류:", error);
      alert("등록 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = useMemo(() => {
    return (
      photoPreviews.length > 0 &&
      formData.name.trim().length > 0 &&
      formData.category &&
      formData.subCategory &&
      formData.brand.trim().length > 0
    );
  }, [
    photoPreviews.length,
    formData.name,
    formData.category,
    formData.subCategory,
    formData.brand,
  ]);

  // 로딩 상태
  if (loading) {
    return (
      <div className={styles.page}>
        <div style={{ textAlign: "center", padding: "50px" }}>
          <p>카테고리를 불러오는 중...</p>
        </div>
      </div>
    );
  }

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
                {photoPreviews.map((photoUrl, index) => (
                  <div key={index} className={styles.previewItem}>
                    <img
                      src={photoUrl}
                      alt={`이미지 ${index + 1}`}
                      className={styles.previewImage}
                    />
                    <button
                      type="button"
                      className={styles.removeButton}
                      onClick={() => handleRemoveImage(index)}
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

          {/* 나머지 필드 */}
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
                maxDate={new Date()}
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
      </form>
      <div className={styles.bottomBar}>
        <button
          type="submit"
          className={clsx(
            styles.submitButton,
            (!isFormValid || isSubmitting) && styles.submitButtonDisabled,
          )}
          disabled={!isFormValid || isSubmitting}
          onClick={handleSubmit} // ✅ 직접 실행 (form 밖이므로)
        >
          {isSubmitting ? "등록 중..." : "등록하기"}
        </button>
      </div>
      {isCategorySheetOpen && (
        <div className={styles.sheetOverlay} onClick={() => setIsCategorySheetOpen(false)}>
          <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
            <div className={styles.sheetHandle} />
            <h2 className={styles.sheetTitle}>카테고리 선택</h2>

            <div className={styles.sheetMainList}>
              {mainCategories
                .filter((category) => category.codeId !== "all")
                .map((category) => (
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
                      src={CATEGORY_ICON_MAP[category.codeName] || AccessoriesIcon}
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
                    {(subCategoriesMap[activeMainCategory] || [])
                      .filter((sub) => sub.codeId !== "all")
                      .map((sub) => (
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
