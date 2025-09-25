import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import clsx from "clsx";
import styles from "./ClosetPage.module.css";
import {
    CLOSET_TABS,
    CLOTHING_ITEMS,
    COORDI_ITEMS,
    MAIN_CATEGORIES,
} from "./closetData";

const ITEMS_PER_BATCH = 9;

const ClosetPage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("clothes");
    const [mainCategory, setMainCategory] = useState("all");
    const [subCategory, setSubCategory] = useState("all");
    const [items, setItems] = useState(CLOTHING_ITEMS);
    const [visibleCount, setVisibleCount] = useState(ITEMS_PER_BATCH);
    const [isSelecting, setIsSelecting] = useState(false);
    const [selectedItems, setSelectedItems] = useState([]);
    const [isCategoryPanelOpen, setIsCategoryPanelOpen] = useState(false);
    const observer = useRef(null);

    const currentItems = useMemo(() => {
        if (activeTab === "coordi") {
            return COORDI_ITEMS;
        }

        return items;
    }, [activeTab, items]);

    const filteredItems = useMemo(() => {
        if (activeTab === "coordi") {
            return currentItems;
        }

        return currentItems.filter((item) => {
            const matchMain =
                mainCategory === "all" ? true : item.category === mainCategory;
            const matchSub =
                subCategory === "all" || mainCategory === "all"
                    ? true
                    : item.subCategory === subCategory;

            return matchMain && matchSub;
        });
    }, [activeTab, currentItems, mainCategory, subCategory]);

    useEffect(() => {
        setVisibleCount(ITEMS_PER_BATCH);
    }, [mainCategory, subCategory, activeTab]);

    useEffect(() => {
        setSelectedItems((prev) =>
            prev.filter((id) => filteredItems.some((item) => item.id === id))
        );
    }, [filteredItems]);

    const sentinelRef = useCallback(
        (node) => {
            if (observer.current) {
                observer.current.disconnect();
            }

            if (!node) return;

            observer.current = new IntersectionObserver((entries) => {
                if (!entries[0].isIntersecting) return;

                setVisibleCount((prev) => {
                    if (prev >= filteredItems.length) return prev;
                    return Math.min(
                        prev + ITEMS_PER_BATCH,
                        filteredItems.length
                    );
                });
            });

            observer.current.observe(node);
        },
        [filteredItems.length]
    );

    useEffect(() => () => observer.current?.disconnect(), []);

    const visibleItems = useMemo(
        () =>
            filteredItems.slice(
                0,
                Math.min(visibleCount, filteredItems.length)
            ),
        [filteredItems, visibleCount]
    );

    const activeMainCategory = useMemo(
        () => MAIN_CATEGORIES.find((cat) => cat.id === mainCategory),
        [mainCategory]
    );

    const handleSelectMode = () => {
        setIsSelecting((prev) => !prev);
        setSelectedItems([]);
    };

    const toggleItemSelection = (itemId) => {
        setSelectedItems((prev) =>
            prev.includes(itemId)
                ? prev.filter((id) => id !== itemId)
                : [...prev, itemId]
        );
    };

    const handleDelete = () => {
        if (!selectedItems.length) return;

        setItems((prev) =>
            prev.filter((item) => !selectedItems.includes(item.id))
        );
        setSelectedItems([]);
        setIsSelecting(false);
    };

    const handleCardClick = (item) => {
        if (isSelecting) {
            toggleItemSelection(item.id);
            return;
        }

        navigate(`/closet/item/${item.id}`, { state: { item } });
    };

    const handleAddClick = () => {
        navigate("/closet/register");
    };

    const handleCategoryChange = (id) => {
        setMainCategory(id);
        setSubCategory("all");
    };

    const handleSubCategoryChange = (id) => {
        setSubCategory(id);
    };

    const isCoordiTab = activeTab === "coordi";

    return (
        <div className={styles.container}>
            <section className={styles.tabBar}>
                {CLOSET_TABS.map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        className={clsx(
                            styles.tabButton,
                            activeTab === tab.id && styles.activeTab
                        )}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </section>

            {!isCoordiTab && (
                <section className={styles.categories}>
                    <div className={styles.categoryHeader}>
                        <div className={styles.categoryMainList}>
                            {MAIN_CATEGORIES.map((category) => (
                                <button
                                    key={category.id}
                                    type="button"
                                    className={clsx(
                                        styles.categoryButton,
                                        mainCategory === category.id &&
                                            styles.activeCategory
                                    )}
                                    onClick={() =>
                                        handleCategoryChange(category.id)
                                    }
                                >
                                    {category.name}
                                </button>
                            ))}
                        </div>
                    </div>
                    {activeMainCategory && (
                        <div className={styles.subCategoryList}>
                            {activeMainCategory.subcategories.map(
                                (category) => (
                                    <button
                                        key={category.id}
                                        type="button"
                                        className={clsx(
                                            styles.subCategoryButton,
                                            subCategory === category.id &&
                                                styles.activeSubCategory
                                        )}
                                        onClick={() =>
                                            handleSubCategoryChange(category.id)
                                        }
                                    >
                                        {category.name}
                                    </button>
                                )
                            )}
                        </div>
                    )}
                </section>
            )}

            <div className={styles.utilityRow}>
                <button
                    type="button"
                    className={clsx(
                        styles.selectToggle,
                        isSelecting && styles.cancelSelect
                    )}
                    onClick={handleSelectMode}
                >
                    <span className={styles.toggleIcon} aria-hidden />
                    {isSelecting ? "취소하기" : "선택하기"}
                </button>
                {isSelecting ? (
                    <div className={styles.selectionStatus}>
                        <span className={styles.selectionBadge} aria-hidden />
                        <span className={styles.selectionText}>
                            {selectedItems.length}개 선택됨
                        </span>
                    </div>
                ) : (
                    <div className={styles.selectionPlaceholder} />
                )}
                <button type="button" className={styles.sortButton}>
                    구매일순
                    <span className={styles.sortIcon} aria-hidden />
                </button>
            </div>

            <section className={styles.gridSection}>
                <div className={styles.grid}>
                    {visibleItems.map((item) => (
                        <article
                            key={item.id}
                            className={clsx(
                                styles.card,
                                isSelecting && styles.cardSelectable
                            )}
                            onClick={() => handleCardClick(item)}
                        >
                            <div className={styles.cardImageWrapper}>
                                <img
                                    src={item.images?.[0]}
                                    alt={item.name}
                                    className={styles.cardImage}
                                />
                                {isSelecting && (
                                    <span
                                        className={clsx(
                                            styles.checkbox,
                                            selectedItems.includes(item.id) &&
                                                styles.checkboxChecked
                                        )}
                                    />
                                )}
                            </div>
                            <div className={styles.cardContent}>
                                <p className={styles.cardName}>{item.name}</p>
                                {item.purchaseDate && (
                                    <p className={styles.cardMeta}>
                                        {item.purchaseDate}
                                    </p>
                                )}
                            </div>
                        </article>
                    ))}
                    {!isCoordiTab && (
                        <button
                            type="button"
                            className={styles.addCard}
                            onClick={handleAddClick}
                        >
                            <span className={styles.addIcon}>＋</span>
                            <span className={styles.addLabel}>아이템 추가</span>
                        </button>
                    )}
                </div>
                <div
                    ref={sentinelRef}
                    className={styles.observerTarget}
                    aria-hidden
                />
            </section>

            {isCategoryPanelOpen && !isCoordiTab && (
                <aside className={styles.categoryPanel}>
                    <header className={styles.categoryPanelHeader}>
                        <h2 className={styles.categoryPanelTitle}>
                            카테고리 선택
                        </h2>
                        <button
                            type="button"
                            className={styles.categoryPanelClose}
                            onClick={() => setIsCategoryPanelOpen(false)}
                        >
                            닫기
                        </button>
                    </header>
                    <div className={styles.categoryPanelBody}>
                        {MAIN_CATEGORIES.map((category) => (
                            <div
                                key={category.id}
                                className={styles.categoryPanelGroup}
                            >
                                <button
                                    type="button"
                                    className={clsx(
                                        styles.categoryPanelMain,
                                        mainCategory === category.id &&
                                            styles.activePanelMain
                                    )}
                                    onClick={() =>
                                        handleCategoryChange(category.id)
                                    }
                                >
                                    {category.name}
                                </button>
                                {mainCategory === category.id && (
                                    <div
                                        className={styles.categoryPanelSubList}
                                    >
                                        {category.subcategories.map((sub) => (
                                            <button
                                                key={sub.id}
                                                type="button"
                                                className={clsx(
                                                    styles.categoryPanelSub,
                                                    subCategory === sub.id &&
                                                        styles.activePanelSub
                                                )}
                                                onClick={() =>
                                                    handleSubCategoryChange(
                                                        sub.id
                                                    )
                                                }
                                            >
                                                {sub.name}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </aside>
            )}

            {isSelecting && selectedItems.length > 0 && (
                <button
                    type="button"
                    className={styles.deletePill}
                    onClick={handleDelete}
                >
                    <span className={styles.deleteIcon} aria-hidden />
                    삭제
                </button>
            )}
        </div>
    );
};

export default ClosetPage;
