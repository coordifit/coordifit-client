import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import clsx from "clsx";
import commonCodeService from "../../services/commonCodeService";
import clothesService from "../../services/clothesService";
import { useSnapStore } from "../../stores/snapStore";
import styles from "./SnapAddPage.module.css";
import cameraIcon from "@/assets/images/snapupload.png";
import checkIcon from "@/assets/images/checkicon.png";

const SnapAddPage = () => {
  const navigate = useNavigate();
  const {
    setImageFiles: setSnapImageFiles,
    setUploadedImages: setSnapUploadedImages,
    setSelectedItems: setSnapSelectedItems,
  } = useSnapStore();
  const [uploadedImages, setUploadedImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [mainCategory, setMainCategory] = useState("all");
  const [subCategory, setSubCategory] = useState("all");
  const [showSelectedOnly, setShowSelectedOnly] = useState(false);
  const [mainCategories, setMainCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [subCategoriesMap, setSubCategoriesMap] = useState({});
  const [clothesItems, setClothesItems] = useState([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    if (mainCategory === "all") {
      setSubCategories([]);
      return;
    }

    const subCategoriesForMain = subCategoriesMap[mainCategory] || [];
    setSubCategories(subCategoriesForMain);
  }, [mainCategory, subCategoriesMap]);

  // 옷 정보 로드
  useEffect(() => {
    const loadAllClothes = async () => {
      try {
        const clothes = await clothesService.getClothes();
        console.log("전체 옷 정보:", clothes);
        const transformedClothes = clothes.data.content.map((item) => ({
          id: item.clothesId,
          name: item.name,
          brand: item.brand,
          price: item.price,
          category: item.categoryCode,
          subCategory: item.categoryCode,
          images: [
            item.images[0].url ||
              "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80",
          ],
        }));

        setClothesItems(transformedClothes);
      } catch (error) {
        console.error("옷 정보 로드 오류:", error);
        setClothesItems([]);
      }
    };

    loadAllClothes();
  }, []);

  // 필터링된 아이템들
  const filteredItems = useMemo(() => {
    return clothesItems.filter((item) => {
      // 전체 선택 시 모든 아이템 표시
      if (mainCategory === "all") {
        return true;
      }

      // 서브카테고리 선택 시 해당 서브카테고리만 표시
      if (subCategory !== "all") {
        return item.category === subCategory;
      }

      // 메인카테고리 선택 시 해당 메인카테고리 하위의 모든 서브카테고리 표시
      const subCategoriesForMain = subCategoriesMap[mainCategory] || [];
      const subCategoryCodes = subCategoriesForMain.map((sub) => sub.codeId);
      return subCategoryCodes.includes(item.category);
    });
  }, [clothesItems, mainCategory, subCategory, subCategoriesMap]);

  const handleImageUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.multiple = true;
    input.onchange = (e) => {
      const files = Array.from(e.target.files);
      const remainingSlots = 10 - uploadedImages.length;
      const filesToAdd = files.slice(0, remainingSlots);

      if (filesToAdd.length === 0) {
        alert("최대 10장까지만 업로드 가능합니다.");
        return;
      }

      // 파일 유효성 검사
      const validFiles = filesToAdd.filter((file) => {
        if (!file.type.startsWith("image/")) {
          alert(`${file.name}은(는) 이미지 파일이 아닙니다.`);
          return false;
        }
        if (file.size > 10 * 1024 * 1024) {
          // 10MB 제한
          alert(`${file.name}은(는) 10MB를 초과합니다.`);
          return false;
        }
        return true;
      });

      if (validFiles.length === 0) return;

      // 파일들을 File 객체로 저장
      setImageFiles((prev) => [...prev, ...validFiles]);

      // 미리보기를 위한 URL 생성
      const newImageUrls = validFiles.map((file) => URL.createObjectURL(file));
      setUploadedImages((prev) => [...prev, ...newImageUrls]);
    };
    input.click();
  };

  const removeImage = (index) => {
    // URL 해제 (메모리 누수 방지)
    URL.revokeObjectURL(uploadedImages[index]);

    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    // 모든 데이터를 Zustand store에 저장
    setSnapImageFiles([...imageFiles]);
    setSnapUploadedImages([...uploadedImages]);
    setSnapSelectedItems([...selectedItems]);

    // 스냅 업로드 완료 페이지로 이동
    navigate("/snap/upload-complete");
  };

  const toggleItemSelection = (itemId) => {
    setSelectedItems((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId],
    );
  };

  const handleCategoryChange = (id) => {
    setMainCategory(id);
    setSubCategory("all");
  };

  const handleSubCategoryChange = (id) => {
    setSubCategory(id);
  };

  const handleAddMoreProducts = () => {
    setShowSelectedOnly(false);
  };

  const canProceed = () => {
    return uploadedImages.length > 0 && selectedItems.length > 0;
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.stepContent}>
          <div style={{ textAlign: "center", padding: "50px" }}>
            <p>카테고리를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.stepContent}>
        {/* 이미지 업로드 섹션 */}
        <div className={styles.imageUploadSection}>
          <div className={styles.sectionHeader}>
            <h3>스냅 사진을 올려주세요</h3>
            <span className={styles.required}>필수</span>
          </div>
          <p className={styles.uploadHint}>사진은 최대 10장까지 등록 가능합니다.</p>

          {uploadedImages.length === 0 ? (
            <div className={styles.uploadArea} onClick={handleImageUpload}>
              <img src={cameraIcon} alt="카메라 아이콘" className={styles.cameraIcon} />
              <p>사진 첨부</p>
            </div>
          ) : (
            <div className={styles.uploadedImages}>
              {uploadedImages.map((image, index) => (
                <div key={index} className={styles.uploadedImage}>
                  <img src={image} alt={`업로드된 이미지 ${index + 1}`} />
                  <button className={styles.removeImageButton} onClick={() => removeImage(index)}>
                    ×
                  </button>
                </div>
              ))}
              {uploadedImages.length < 10 && (
                <div className={styles.addMoreButton} onClick={handleImageUpload}>
                  <div className={styles.uploadIcon}>📷</div>
                  <p>사진 추가</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 상품 선택 섹션 */}
        <div className={styles.productSelectionSection}>
          <div className={styles.sectionHeader}>
            <h3>함께 착용한 상품을 선택해주세요</h3>
            <span className={styles.required}>필수</span>
          </div>
          {selectedItems.length > 0 && (
            <button
              type="button"
              className={styles.toggleViewButton}
              onClick={() => setShowSelectedOnly(!showSelectedOnly)}
            >
              {showSelectedOnly ? "상품 추가" : "선택된 상품 보기"}
            </button>
          )}

          {!showSelectedOnly ? (
            <>
              <div className={styles.categoryTabs}>
                {mainCategories.map((category) => (
                  <button
                    key={category.codeId}
                    type="button"
                    className={clsx(
                      styles.categoryTab,
                      mainCategory === category.codeId && styles.activeCategoryTab,
                    )}
                    onClick={() => handleCategoryChange(category.codeId)}
                  >
                    {category.codeName}
                  </button>
                ))}
              </div>

              {subCategories.length > 1 && (
                <div className={styles.subCategoryTabs}>
                  {subCategories.map((category) => (
                    <button
                      key={category.codeId}
                      type="button"
                      className={clsx(
                        styles.subCategoryTab,
                        subCategory === category.codeId && styles.activeSubCategoryTab,
                      )}
                      onClick={() => handleSubCategoryChange(category.codeId)}
                    >
                      {category.codeName}
                    </button>
                  ))}
                </div>
              )}
              <div className={styles.productGrid}>
                {filteredItems.map((item) => (
                  <div key={item.id} className={styles.productCard}>
                    <img src={item.images[0]} alt={item.name} />
                    <div className={styles.radioWrapper}>
                      <input
                        type="checkbox"
                        id={item.id}
                        checked={selectedItems.includes(item.id)}
                        onChange={() => toggleItemSelection(item.id)}
                      />
                      <label htmlFor={item.id}></label>

                      {/* ✅ 체크되면 아이콘 표시 */}
                      {selectedItems.includes(item.id) && (
                        <img src={checkIcon} alt="선택됨" className={styles.checkIcon} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className={styles.selectedProductsView}>
              <div className={styles.selectedProducts}>
                {selectedItems.map((itemId) => {
                  const item = clothesItems.find((i) => i.id === itemId);
                  return item ? (
                    <div key={itemId} className={styles.selectedProduct}>
                      <img src={item.images[0]} alt={item.name} />
                      <span className={styles.productName}>{item.name}</span>
                      <button
                        className={styles.removeProductButton}
                        onClick={() => toggleItemSelection(itemId)}
                      >
                        ×
                      </button>
                    </div>
                  ) : null;
                })}
                <div className={styles.addProductPlaceholder} onClick={handleAddMoreProducts}>
                  <span>+</span>
                  <span className={styles.addText}>상품 추가</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={styles.actionButtonWrapper}>
        <button
          type="button"
          className={clsx(styles.actionButton, canProceed() && styles.actionButtonActive)}
          onClick={handleNext}
          disabled={!canProceed()}
        >
          {selectedItems.length > 0
            ? `${selectedItems.length}개 상품 선택완료`
            : "상품을 선택하세요."}
        </button>
      </div>
    </div>
  );
};

export default SnapAddPage;
