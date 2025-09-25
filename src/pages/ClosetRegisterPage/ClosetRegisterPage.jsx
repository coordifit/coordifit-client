import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import clsx from "clsx";
import styles from "./ClosetRegisterPage.module.css";
import { MAIN_CATEGORIES } from "@/pages/ClosetPage/closetData";
import TopIcon from "@/assets/images/topicon.png";
import BottomIcon from "@/assets/images/bottomicon.png";
import ShoesIcon from "@/assets/images/shoesicon.png";
import OuterIcon from "@/assets/images/outericon.png";
import AccessoriesIcon from "@/assets/images/accessoriesicon.png";
import EnrollIcon from "@/assets/images/enrollicon.png";
import CalendarIcon from "@/assets/images/calendaricon.png";
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";

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
    const [activeMainCategory, setActiveMainCategory] = useState(null);

    const subCategories = useMemo(() => {
        if (!activeMainCategory) return []; // 선택 안 되었으면 빈 배열
        const found = MAIN_CATEGORIES.find(
            (category) => category.id === activeMainCategory
        );
        return found?.subcategories ?? [];
    }, [activeMainCategory]);

    const handleFileChange = (event) => {
        const files = Array.from(event.target.files || []);

        setPhotoPreviews((previous) => {
            // ✅ 기존 + 새 파일 합치기 (최대 MAX_PHOTOS 개)
            const combined = [
                ...previous,
                ...files.slice(0, MAX_PHOTOS - previous.length).map((file) => ({
                    url: URL.createObjectURL(file),
                    name: file.name,
                })),
            ];

            return combined;
        });

        // ✅ input 초기화 (같은 파일 다시 선택 가능하도록)
        event.target.value = "";
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

    useEffect(() => {
        return () => {
            photoPreviews.forEach((preview) =>
                URL.revokeObjectURL(preview.url)
            );
        };
    }, [photoPreviews]);

    const isFormValid = useMemo(() => {
        return (
            photoPreviews.length > 0 &&
            formData.name.trim().length > 0 &&
            formData.category &&
            formData.subCategory
        );
    }, [
        photoPreviews.length,
        formData.name,
        formData.category,
        formData.subCategory,
    ]);

    return (
        <div className={styles.page}>
            <form className={styles.form} onSubmit={handleSubmit}>
                <section className={styles.photoSection}>
                    {/* 0개일 때만 안내 문구 보여줌 */}
                    {photoPreviews.length === 0 && (
                        <p className={styles.photoGuide}>
                            사진 등록 0/{MAX_PHOTOS} (1개 이상)
                        </p>
                    )}

                    <label
                        htmlFor="photo-input"
                        className={styles.photoUploader}
                    >
                        {photoPreviews.length > 0 ? (
                            <div className={styles.previewScroll}>
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
                                        <button
                                            type="button"
                                            className={styles.removeButton}
                                            onClick={() =>
                                                setPhotoPreviews((prev) => {
                                                    URL.revokeObjectURL(
                                                        photo.url
                                                    );
                                                    return prev.filter(
                                                        (_, i) => i !== index
                                                    );
                                                })
                                            }
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className={styles.photoPlaceholder}>
                                <img
                                    src={EnrollIcon}
                                    alt="등록 아이콘"
                                    className={styles.photoIcon}
                                />
                            </div>
                        )}
                    </label>

                    {/* ✅ 사진 개수는 항상 우측 하단 표시 */}
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

                <section className={styles.fieldSection}>
                    {/* ✅ 카테고리 */}

                    <label className={styles.fieldRow}>
                        <span className={styles.fieldLabel}>이름</span>
                        <input
                            type="text"
                            className={styles.input}
                            placeholder="이름을 입력하세요"
                            value={formData.name}
                            onChange={(event) =>
                                handleChange("name", event.target.value)
                            }
                        />
                    </label>
                    <label
                        className={styles.fieldRow}
                        onClick={() => {
                            setActiveMainCategory(formData.category || null);
                            setIsCategorySheetOpen(true);
                        }}
                    >
                        <span className={styles.fieldLabel}>카테고리</span>
                        <span
                            className={clsx(
                                styles.fieldValue,
                                !formData.category && styles.placeholder
                            )}
                        >
                            {formData.category
                                ? MAIN_CATEGORIES.find(
                                      (c) => c.id === formData.category
                                  )?.name +
                                  (formData.subCategory
                                      ? " / " +
                                        MAIN_CATEGORIES.find(
                                            (c) => c.id === formData.category
                                        )?.subcategories.find(
                                            (sc) =>
                                                sc.id === formData.subCategory
                                        )?.name
                                      : "")
                                : "카테고리 선택"}
                        </span>
                    </label>

                    <label className={styles.fieldRow}>
                        <span className={styles.fieldLabel}>브랜드</span>
                        <input
                            type="text"
                            className={styles.input}
                            placeholder="브랜드를 입력하세요"
                            value={formData.brand}
                            onChange={(event) =>
                                handleChange("brand", event.target.value)
                            }
                        />
                    </label>

                    <label className={styles.fieldRow}>
                        <span className={styles.fieldLabel}>사이즈</span>
                        <input
                            type="text"
                            className={styles.input}
                            placeholder="사이즈를 입력하세요"
                            value={formData.size}
                            onChange={(event) =>
                                handleChange("size", event.target.value)
                            }
                        />
                    </label>

                    {/* ✅ 가격 */}
                    <label className={styles.fieldRow}>
                        <span className={styles.fieldLabel}>가격</span>
                        <input
                            type="text"
                            className={clsx(styles.input)}
                            placeholder="가격을 입력하세요"
                            value={formData.price}
                            onChange={(event) =>
                                handleChange("price", event.target.value)
                            }
                        />
                    </label>

                    <label className={styles.fieldRow}>
                        <span className={styles.fieldLabel}>구매일</span>
                        <div className={styles.dateRow}>
                            <img
                                src={CalendarIcon}
                                alt="캘린더"
                                className={styles.calendarIcon}
                            />
                            <DatePicker
                                selected={
                                    formData.purchaseDate
                                        ? new Date(formData.purchaseDate)
                                        : null
                                }
                                onChange={(date) => {
                                    setFormData((prev) => ({
                                        ...prev,
                                        purchaseDate: date
                                            ? date.toISOString().split("T")[0]
                                            : "",
                                    }));
                                }}
                                dateFormat="yyyy-MM-dd"
                                placeholderText="날짜를 선택하세요"
                                className={clsx(
                                    styles.input,
                                    !formData.purchaseDate && styles.placeholder
                                )}
                                popperPlacement="bottom-end"
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
                            onChange={(event) =>
                                handleChange("purchaseLink", event.target.value)
                            }
                        />
                    </label>

                    <label
                        className={clsx(styles.fieldRow, styles.textareaRow)}
                    >
                        <span className={styles.fieldLabel}>설명</span>
                        <textarea
                            className={styles.textarea}
                            placeholder="설명을 입력하세요"
                            value={formData.description}
                            onChange={(event) =>
                                handleChange("description", event.target.value)
                            }
                        />
                    </label>
                </section>

                <button
                    type="submit"
                    className={clsx(
                        styles.submitButton,
                        !isFormValid && styles.submitButtonDisabled
                    )}
                    disabled={!isFormValid}
                >
                    등록하기
                </button>
            </form>

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
                        <div className={styles.sheetMainList}>
                            {MAIN_CATEGORIES.filter(
                                (category) => category.id !== "all"
                            ).map((category) => (
                                <button
                                    key={category.id}
                                    type="button"
                                    className={clsx(
                                        styles.sheetMainButton,
                                        activeMainCategory === category.id &&
                                            styles.sheetMainActive
                                    )}
                                    onClick={() =>
                                        setActiveMainCategory(category.id)
                                    }
                                >
                                    <img
                                        src={CATEGORY_ICON_MAP[category.id]}
                                        alt={category.name}
                                        className={styles.sheetMainIcon}
                                    />
                                    <span>{category.name}</span>
                                </button>
                            ))}
                        </div>
                        <div className={styles.sheetSubList}>
                            {activeMainCategory ? (
                                <>
                                    <h3 className={styles.sheetSubTitle}>
                                        세부 카테고리
                                    </h3>
                                    <div className={styles.sheetSubGrid}>
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
                                </>
                            ) : (
                                <p className={styles.sheetSubPlaceholder}>
                                    먼저 카테고리를 선택해주세요
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClosetRegisterPage;
