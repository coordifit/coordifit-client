import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import clsx from "clsx";
import styles from "./ClosetRegisterPage.module.css";
import { MAIN_CATEGORIES } from "@/pages/ClosetPage/closetData";

const MAX_PHOTOS = 5;

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
    const [isCategorySheetOpen, setIsCategorySheetOpen] = useState(false);
    const [activeMainCategory, setActiveMainCategory] = useState("top");

    const subCategories = useMemo(() => {
        const found = MAIN_CATEGORIES.find(
            (category) => category.id === activeMainCategory
        );
        return found?.subcategories ?? [];
    }, [activeMainCategory]);

    const handleFileChange = (event) => {
        const files = Array.from(event.target.files || []).slice(0, MAX_PHOTOS);
        const previewUrls = files.map((file) => ({
            url: URL.createObjectURL(file),
            name: file.name,
        }));
        setPhotoPreviews(previewUrls);
    };

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleCategorySelect = (mainId, subId) => {
        setFormData((prev) => ({
            ...prev,
            category: mainId,
            subCategory: subId,
        }));
        setActiveMainCategory(mainId);
        setIsCategorySheetOpen(false);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        navigate("/closet", { replace: true });
    };

    const selectedCategoryLabel = useMemo(() => {
        if (!formData.category) {
            return "카테고리를 선택해주세요";
        }

        const main = MAIN_CATEGORIES.find(
            (category) => category.id === formData.category
        );
        const sub = main?.subcategories.find(
            (category) => category.id === formData.subCategory
        );
        return [main?.name, sub?.name].filter(Boolean).join(" / ");
    }, [formData.category, formData.subCategory]);

    return (
        <form className={styles.container} onSubmit={handleSubmit}>
            <section className={styles.photoSection}>
                <label
                    htmlFor="photo-input"
                    className={styles.photoPlaceholder}
                >
                    {photoPreviews.length > 0 ? (
                        <div className={styles.photoPreviewGrid}>
                            {photoPreviews.map((photo, index) => (
                                <div
                                    key={photo.name + index}
                                    className={styles.previewItem}
                                >
                                    <img
                                        src={photo.url}
                                        alt={photo.name}
                                        className={styles.previewImage}
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className={styles.photoPlaceholderContent}>
                            <span className={styles.cameraIcon}>📷</span>
                            <p className={styles.photoText}>
                                사진 등록 (0/{MAX_PHOTOS})
                            </p>
                            <p className={styles.photoHint}>
                                1개 이상 등록해주세요
                            </p>
                        </div>
                    )}
                </label>
                <input
                    id="photo-input"
                    className={styles.fileInput}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                />
            </section>

            <section className={styles.formSection}>
                <button
                    type="button"
                    className={styles.categorySelector}
                    onClick={() => setIsCategorySheetOpen(true)}
                >
                    <span className={styles.categoryLabel}>카테고리</span>
                    <span
                        className={clsx(
                            styles.categoryValue,
                            !formData.category && styles.placeholder
                        )}
                    >
                        {selectedCategoryLabel}
                    </span>
                </button>

                <label className={styles.field}>
                    <span className={styles.fieldLabel}>이름</span>
                    <input
                        type="text"
                        className={styles.input}
                        placeholder="예: 파브레가 셔츠"
                        value={formData.name}
                        onChange={(event) =>
                            handleChange("name", event.target.value)
                        }
                    />
                </label>

                <label className={styles.field}>
                    <span className={styles.fieldLabel}>브랜드</span>
                    <input
                        type="text"
                        className={styles.input}
                        placeholder="예: 무신사"
                        value={formData.brand}
                        onChange={(event) =>
                            handleChange("brand", event.target.value)
                        }
                    />
                </label>

                <label className={styles.field}>
                    <span className={styles.fieldLabel}>사이즈</span>
                    <input
                        type="text"
                        className={styles.input}
                        placeholder="예: XL"
                        value={formData.size}
                        onChange={(event) =>
                            handleChange("size", event.target.value)
                        }
                    />
                </label>

                <label className={styles.field}>
                    <span className={styles.fieldLabel}>가격</span>
                    <input
                        type="number"
                        className={styles.input}
                        placeholder="예: 49500"
                        value={formData.price}
                        onChange={(event) =>
                            handleChange("price", event.target.value)
                        }
                    />
                </label>

                <label className={styles.field}>
                    <span className={styles.fieldLabel}>구매일</span>
                    <input
                        type="date"
                        className={styles.input}
                        value={formData.purchaseDate}
                        onChange={(event) =>
                            handleChange("purchaseDate", event.target.value)
                        }
                    />
                </label>

                <label className={styles.field}>
                    <span className={styles.fieldLabel}>구매링크</span>
                    <input
                        type="url"
                        className={styles.input}
                        placeholder="https://"
                        value={formData.purchaseLink}
                        onChange={(event) =>
                            handleChange("purchaseLink", event.target.value)
                        }
                    />
                </label>

                <label className={styles.field}>
                    <span className={styles.fieldLabel}>설명</span>
                    <textarea
                        className={styles.textarea}
                        placeholder="상세 설명을 입력해주세요"
                        value={formData.description}
                        onChange={(event) =>
                            handleChange("description", event.target.value)
                        }
                    />
                </label>
            </section>

            <button type="submit" className={styles.submitButton}>
                등록하기
            </button>

            {isCategorySheetOpen && (
                <div
                    className={styles.sheetOverlay}
                    onClick={() => setIsCategorySheetOpen(false)}
                >
                    <div
                        className={styles.sheet}
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className={styles.sheetHandle} />
                        <h2 className={styles.sheetTitle}>카테고리 선택</h2>
                        <div className={styles.sheetContent}>
                            <div className={styles.sheetMainList}>
                                {MAIN_CATEGORIES.map((category) => (
                                    <button
                                        key={category.id}
                                        type="button"
                                        className={clsx(
                                            styles.sheetMainButton,
                                            activeMainCategory ===
                                                category.id &&
                                                styles.sheetMainActive
                                        )}
                                        onClick={() =>
                                            setActiveMainCategory(category.id)
                                        }
                                    >
                                        {category.name}
                                    </button>
                                ))}
                            </div>
                            <div className={styles.sheetSubList}>
                                {subCategories.map((category) => (
                                    <button
                                        key={category.id}
                                        type="button"
                                        className={clsx(
                                            styles.sheetSubButton,
                                            formData.category ===
                                                activeMainCategory &&
                                                formData.subCategory ===
                                                    category.id &&
                                                styles.sheetSubActive
                                        )}
                                        onClick={() =>
                                            handleCategorySelect(
                                                activeMainCategory,
                                                category.id
                                            )
                                        }
                                    >
                                        {category.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </form>
    );
};

export default ClosetRegisterPage;
