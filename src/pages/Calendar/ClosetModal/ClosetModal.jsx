import styles from "./ClosetModal.module.css";
import classNames from "classnames/bind";

import { useCategoryQuery } from "@/hooks/useCommonCodeQuery";
import { useClothesQuery } from "@/hooks/useClothesQuery";
import { useEffect, useMemo, useState } from "react";
import { CATEGORIES } from "@/constants/category";
import { CLOSET_TABS } from "@/pages/ClosetPage/closetData";

const cn = classNames.bind(styles);

const ClosetModal = ({ onRemove, onAdd, clothes, onClose, isOpen }) => {
  const [activeTab, setActiveTab] = useState("clothes");
  const [mainCategory, setMainCategory] = useState("all");
  const [subCategory, setSubCategory] = useState("all");
  const isCoordiTab = activeTab === "coordi";

  // 카테고리 쿼리
  const {
    data: categories,
    isLoading: isCategoryLoading,
    isError: isCategoryError,
    error: categoryError,
  } = useCategoryQuery();

  const {
    data: clothesItems = [],
    isLoading: isClothesLoading,
    isError: isClothesError,
    error: clothesError,
  } = useClothesQuery({
    select: (res) =>
      res?.data?.content?.map((item) => ({
        name: item.name,
        brand: item.brand,
        categoryCode: item.categoryCode,
        categoryName: item.categoryName,
        clothesId: item.clothesId,
        clothesSize: item.clothesSize,
        id: item.clothesId,
        images: item.images,
        thumbnailUrl: item.thumbnailUrl,
      })) ?? [],
  });

  // 로딩/에러 로깅 (1차적으로 에러만 콘솔에찍음)
  useEffect(() => {
    if (isCategoryError) console.error("❌ 카테고리 로드 오류:", categoryError);
    if (isClothesError) console.error("❌ 옷 정보 로드 오류:", clothesError);
  }, [isCategoryError, isClothesError, categoryError, clothesError]);

  const mainCategories = categories?.mainCategories ?? [];
  const subCategoriesMap = categories?.subCategoriesMap ?? {};

  const subCategories = mainCategory === "all" ? [] : subCategoriesMap[mainCategory];

  const filteredItems = useMemo(() => {
    // 메인 카테고리 선택하지 않으면 전체 아이템 조회
    if (mainCategory === "all") {
      return clothesItems;
    }

    // 서브카테고리 선택시 해당 아이템으로 필터링
    if (subCategory !== "all") {
      return clothesItems.filter((item) => item.categoryCode === subCategory);
    }

    const subCategoryCodes = subCategories.map((sub) => sub.codeId);
    return clothesItems.filter((item) => subCategoryCodes.includes(item.categoryCode));
  }, [clothesItems, mainCategory, subCategory, subCategories]);

  const isLoading = isCategoryLoading || isClothesLoading;

  const handleClickTab = (e) => setActiveTab(e.target.id);
  const handleClickCategory = (e) => {
    const [type, categoryId] = e.target.id.split("-");

    if (type === "main") {
      setMainCategory(categoryId);
      setSubCategory("all");
    } else {
      setSubCategory(categoryId);
    }
  };

  return (
    <>
      {isOpen && <div className={cn("sheetOverlay")} onClick={() => onClose(false)} />}
      <div className={cn("sheet", { sheetOpen: isOpen })}>
        <button className={cn("sheetClose")} onClick={() => onClose(false)}>
          닫기
        </button>
        {/* 옷 / 코드 선택 탭바 */}
        <section className={cn("tabBar")}>
          {CLOSET_TABS.map((tab) => (
            <button
              id={tab.id}
              key={tab.id}
              type="button"
              className={cn("tabButton", { activeTab: activeTab === tab.id })}
              onClick={handleClickTab}
            >
              {tab.label}
            </button>
          ))}
        </section>
        {/* 카테고리 선택 탭 */}
        {!isCoordiTab && (
          <section className={cn("categories")}>
            <div className={cn("categoryHeader")}>
              <div className={cn("categoryMainList")}>
                {mainCategories.map((cat) => {
                  return (
                    <button
                      id={`main-${cat.codeId}`}
                      key={cat.codeId}
                      type="button"
                      className={cn("categoryButton", {
                        activeCategory: mainCategory === cat.codeId,
                      })}
                      onClick={handleClickCategory}
                    >
                      {cat.codeName}
                    </button>
                  );
                })}
              </div>
            </div>

            {mainCategory !== "all" && (
              <div className={cn("subCategoryList")}>
                {subCategories.map((sub) => (
                  <button
                    id={`sub-${sub.codeId}`}
                    key={sub.codeId}
                    type="button"
                    className={cn("subCategoryButton", {
                      activeSubCategory: subCategory === sub.codeId,
                    })}
                    onClick={handleClickCategory}
                  >
                    {sub.codeName}
                  </button>
                ))}
              </div>
            )}
          </section>
        )}

        <div className={cn("sheetBody")}>
          {isLoading && <div className={cn("loading")}>불러오는 중…</div>}
          {/* 필터링된 아이템 렌더링 */}
          <div className={cn("closetGrid")}>
            {isCoordiTab ? (
              <h2>이곳은 코디 페이지 입니다.</h2>
            ) : (
              <>
                {filteredItems.map((item) => {
                  const isAdded = clothes.some((c) => c.clothesId === item.clothesId);

                  return (
                    <button
                      key={item.clothesId}
                      className={cn("closetCard", { disabledCard: isAdded })}
                      onClick={() => onAdd(item)}
                      disabled={isAdded}
                    >
                      <img src={item.thumbnailUrl} alt={item.name} className={cn("closetImg")} />
                      <div className={cn("closetInfo")}>
                        <div className={cn("closetName")}>{item.name}</div>
                        <div className={cn("closetCat")}>
                          {CATEGORIES[item.categoryCode]?.ko ?? "기타"}
                        </div>
                      </div>
                      {isAdded && <div className={cn("badge")}>추가됨</div>}
                    </button>
                  );
                })}
              </>
            )}
          </div>
          {/* 캔버스에 선택된 아이템 목록 */}
          <div className={cn("selectedBar")}>
            {clothes.length === 0 ? (
              <div className={cn("selectedEmpty")}>아직 추가된 아이템이 없어요</div>
            ) : (
              <ul className={cn("selectedList")}>
                {clothes.map((item) => (
                  <li key={item.clothesId} className={cn("selectedItem")}>
                    <button
                      className={cn("removeBtn")}
                      onClick={() => onRemove(item.clothesId)}
                      aria-label="아이템 제거"
                    >
                      ×
                    </button>
                    <div className={cn("selectedThumbWrap")}>
                      <img src={item.imageUrl} alt={item.name} className={cn("selectedThumb")} />
                    </div>
                    <div className={cn("selectedMeta")}>
                      <span className={cn("selectedName")}>{item.name}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ClosetModal;
