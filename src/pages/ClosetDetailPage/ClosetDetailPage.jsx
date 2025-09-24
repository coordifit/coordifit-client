import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import clsx from "clsx";
import styles from "./ClosetDetailPage.module.css";
import { CLOTHING_ITEMS } from "@/pages/ClosetPage/closetData";

const ClosetDetailPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { itemId } = useParams();
    const initialItem = useMemo(() => {
        if (location.state?.item) {
            return location.state.item;
        }

        return (
            CLOTHING_ITEMS.find((item) => item.id === itemId) ??
            CLOTHING_ITEMS[0]
        );
    }, [itemId, location.state]);

    const [item, setItem] = useState(initialItem);
    const [isInfoOpen, setIsInfoOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        setItem(initialItem);
        setCurrentImageIndex(0);
    }, [initialItem]);

    const images = item?.images?.length ? item.images : [];

    const handleFieldChange = (field, value) => {
        setItem((prev) => ({ ...prev, [field]: value }));
    };

    const handleToggleInfo = () => {
        setIsInfoOpen((prev) => !prev);
    };

    const handleToggleEdit = () => {
        setIsEditing((prev) => !prev);
    };

    const handleDelete = () => {
        navigate("/closet", { replace: true });
    };

    const handlePrevImage = () => {
        setCurrentImageIndex((prev) =>
            prev === 0 ? images.length - 1 : prev - 1
        );
    };

    const handleNextImage = () => {
        setCurrentImageIndex((prev) =>
            prev === images.length - 1 ? 0 : prev + 1
        );
    };

    const renderField = (label, fieldName, options = {}) => {
        const value = item?.[fieldName] ?? "";
        const isTextArea = options.type === "textarea";

        if (!isEditing) {
            return (
                <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>{label}</span>
                    <span className={styles.detailValue}>{value || "-"}</span>
                </div>
            );
        }

        if (isTextArea) {
            return (
                <label className={clsx(styles.detailRow, styles.editing)}>
                    <span className={styles.detailLabel}>{label}</span>
                    <textarea
                        className={styles.detailInput}
                        value={value}
                        onChange={(event) =>
                            handleFieldChange(fieldName, event.target.value)
                        }
                    />
                </label>
            );
        }

        return (
            <label className={clsx(styles.detailRow, styles.editing)}>
                <span className={styles.detailLabel}>{label}</span>
                <input
                    className={styles.detailInput}
                    value={value}
                    onChange={(event) =>
                        handleFieldChange(fieldName, event.target.value)
                    }
                />
            </label>
        );
    };

    if (!item) {
        return null;
    }

    return (
        <div className={styles.container}>
            <section className={styles.heroSection}>
                <div className={styles.imageWrapper}>
                    {images.length > 0 ? (
                        <img
                            src={images[currentImageIndex]}
                            alt={item.name}
                            className={styles.heroImage}
                        />
                    ) : (
                        <div className={styles.emptyImage}>
                            이미지가 없습니다
                        </div>
                    )}
                    {images.length > 1 && (
                        <>
                            <button
                                type="button"
                                className={styles.navButton}
                                onClick={handlePrevImage}
                            >
                                ◀
                            </button>
                            <button
                                type="button"
                                className={styles.navButton}
                                onClick={handleNextImage}
                            >
                                ▶
                            </button>
                        </>
                    )}
                    <span className={styles.imageIndicator}>
                        {images.length > 0
                            ? `${currentImageIndex + 1}/${images.length}`
                            : "0/0"}
                    </span>
                </div>
                <div className={styles.heroContent}>
                    <h2 className={styles.itemName}>{item.name}</h2>
                    <div className={styles.badgeRow}>
                        <span className={styles.badge}>{`${
                            item.category ? item.category.toUpperCase() : "-"
                        }`}</span>
                        <span className={styles.badge}>{`착용횟수 ${
                            item.wearCount ?? 0
                        }회`}</span>
                        <span className={styles.badge}>{`최근착용 ${
                            item.lastWornDate ?? "-"
                        }`}</span>
                    </div>
                    <p className={styles.brandText}>{item.brand}</p>
                </div>
            </section>

            <section className={styles.detailSection}>
                {renderField("사이즈", "size")}
                {renderField("가격", "price")}
                {renderField("구매일", "purchaseDate")}
                {renderField("구매링크", "purchaseLink")}
                <button
                    type="button"
                    className={styles.infoToggle}
                    onClick={handleToggleInfo}
                >
                    상세정보 {isInfoOpen ? "닫기" : "보기"}
                </button>
                {isInfoOpen &&
                    renderField("설명", "description", { type: "textarea" })}
            </section>

            <div className={styles.actionBar}>
                <button
                    type="button"
                    className={styles.editButton}
                    onClick={handleToggleEdit}
                >
                    {isEditing ? "수정완료" : "수정하기"}
                </button>
                <button
                    type="button"
                    className={styles.deleteButton}
                    onClick={handleDelete}
                >
                    삭제하기
                </button>
            </div>
        </div>
    );
};

export default ClosetDetailPage;
