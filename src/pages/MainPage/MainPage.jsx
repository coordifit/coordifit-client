import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

import styles from "./MainPage.module.css";

import userIcon from "@/assets/images/mainpage/usericon.png";
import closetIcon from "@/assets/images/mainpage/closeticon.png";
import calendarIcon from "@/assets/images/mainpage/calendaricon.png";
import aiIcon from "@/assets/images/mainpage/aiicon.png";
import lastWornIcon from "@/assets/images/mainpage/lastwornicon.png";
import snapIcon from "@/assets/images/mainpage/snapicon.png";

import heroCloset from "@/assets/images/mainpage/closetcarousel.png";
import heroCalendar from "@/assets/images/mainpage/calendarcarousel.png";
import heroSnap from "@/assets/images/mainpage/snapcarousel.png";
import heroAi from "@/assets/images/mainpage/fittingcarousel.png";
import aiBanner from "@/assets/images/mainpage/ai-banner.png";
import calendarPlus from "@/assets/images/mainpage/calendar-plus.png";
import shirtIcon from "@/assets/images/mainpage/shirt.png";
import poloIcon from "@/assets/images/mainpage/kara.png";
import shortSleeveIcon from "@/assets/images/mainpage/short.png";
import longSleeveIcon from "@/assets/images/mainpage/long.png";
import hoodieIcon from "@/assets/images/mainpage/hood.png";
import shortsIcon from "@/assets/images/mainpage/shortpants.png";
import jeansIcon from "@/assets/images/mainpage/jeans.png";
import skirtIcon from "@/assets/images/mainpage/skirt.png";
import coatIcon from "@/assets/images/mainpage/coat.png";
import paddingIcon from "@/assets/images/mainpage/jumper.png";
import sneakersIcon from "@/assets/images/mainpage/sneakers.png";
import dressShoesIcon from "@/assets/images/mainpage/shoes.png";
import sunnyIcon from "@/assets/images/mainpage/sunnyicon.png";
import overcastIcon from "@/assets/images/mainpage/overcasticon.png";
import rainyIcon from "@/assets/images/mainpage/rainyicon.png";
import snowIcon from "@/assets/images/mainpage/snowicon.png";
import snapFallback1 from "@/assets/images/mainpage/snap1.png";
import snapFallback2 from "@/assets/images/mainpage/snap2.png";
import snapFallback3 from "@/assets/images/mainpage/snap3.png";
import snapFallback4 from "@/assets/images/mainpage/snap4.png";

import topImage1 from "@/assets/images/clothes/top1.png";
import topImage2 from "@/assets/images/clothes/top2.png";
import outerImage from "@/assets/images/clothes/outer1.png";
import pantsImage from "@/assets/images/clothes/pants1.png";
import shoesImage from "@/assets/images/clothes/shoes1.png";

import clothesService from "@/services/clothesService";
import postService from "@/services/postService";
import commonCodeService from "@/services/commonCodeService";

const HERO_CARDS = [
  {
    id: "closet",
    title: "옷장 관리의 시작, 새 옷을 사는 순간부터.",
    subtitle: "나만의 스타일을 완성하는 가장 쉬운 방법",
    image: heroCloset,
    destination: "/closet",
  },
  {
    id: "calendar",
    title: "코디 관리의 시작, 캘린더에 담는 순간부터.",
    subtitle: "데일리코디로 완성하는, 나만의 스타일 캘린더",
    image: heroCalendar,
    destination: "/calendar",
  },
  {
    id: "snap",
    title: `<span style="color:#A7C7E7;">나만의 코디</span><br/><span style="color:#333333;">스냅으로 기록하고 공유해요</span>`,
    subtitle: "#데일리룩 #오오티디",
    image: heroSnap,
    destination: "/snap",
  },
  {
    id: "ai",
    title: "나만의<br/>AI 스타일리스트",
    subtitle: "AI 가상 피팅으로 나만의 룩을 완성하세요.",
    image: heroAi,
    destination: "/ai-fitting",
  },
];

const CATEGORY_ROWS = [
  [
    {
      id: "shirts",
      label: "셔츠",
      image: shirtIcon,
      mainLabel: "상의",
      subLabel: "셔츠",
      fallbackMainId: "top",
      fallbackSubId: "shirts",
    },
    {
      id: "polo",
      label: "카라티",
      image: poloIcon,
      mainLabel: "상의",
      subLabel: "카라티",
      subLabelAlternatives: ["폴로"],
      fallbackMainId: "top",
      fallbackSubId: "polo",
    },
    {
      id: "short-sleeve",
      label: "반팔",
      image: shortSleeveIcon,
      mainLabel: "상의",
      subLabel: "반팔",
      subLabelAlternatives: ["반팔티"],
      fallbackMainId: "top",
      fallbackSubId: "short-sleeve",
    },
    {
      id: "long-sleeve",
      label: "긴팔",
      image: longSleeveIcon,
      mainLabel: "상의",
      subLabel: "긴팔",
      subLabelAlternatives: ["긴팔티"],
      fallbackMainId: "top",
      fallbackSubId: "long-sleeve",
    },
    {
      id: "hoodie",
      label: "후드",
      image: hoodieIcon,
      mainLabel: "상의",
      subLabel: "후드",
      subLabelAlternatives: ["후드티"],
      fallbackMainId: "top",
      fallbackSubId: "hoodie",
    },
    {
      id: "shorts",
      label: "반바지",
      image: shortsIcon,
      mainLabel: "하의",
      subLabel: "반바지",
      subLabelAlternatives: ["숏팬츠"],
      fallbackMainId: "bottom",
      fallbackSubId: "shorts",
    },
  ],
  [
    {
      id: "jeans",
      label: "청바지",
      image: jeansIcon,
      mainLabel: "하의",
      subLabel: "청바지",
      subLabelAlternatives: ["데님"],
      fallbackMainId: "bottom",
      fallbackSubId: "jeans",
    },
    {
      id: "skirt",
      label: "치마",
      image: skirtIcon,
      mainLabel: "하의",
      subLabel: "치마",
      subLabelAlternatives: ["스커트"],
      fallbackMainId: "bottom",
      fallbackSubId: "skirt",
    },
    {
      id: "coat",
      label: "코트",
      image: coatIcon,
      mainLabel: "아우터",
      subLabel: "코트",
      fallbackMainId: "outer",
      fallbackSubId: "coat",
    },
    {
      id: "padding",
      label: "패딩",
      image: paddingIcon,
      mainLabel: "아우터",
      subLabel: "패딩",
      subLabelAlternatives: ["점퍼"],
      fallbackMainId: "outer",
      fallbackSubId: "padding",
    },
    {
      id: "sneakers",
      label: "스니커즈",
      image: sneakersIcon,
      mainLabel: "신발",
      subLabel: "스니커즈",
      subLabelAlternatives: ["운동화"],
      fallbackMainId: "shoes",
      fallbackSubId: "sneakers",
    },
    {
      id: "dress-shoes",
      label: "구두",
      image: dressShoesIcon,
      mainLabel: "신발",
      subLabel: "구두",
      subLabelAlternatives: ["로퍼"],
      fallbackMainId: "shoes",
      fallbackSubId: "dress-shoes",
    },
  ],
];

const RECENT_CATEGORY_TABS = [
  { id: "top", label: "상의", fallbackMainId: "top" },
  { id: "bottom", label: "하의", fallbackMainId: "bottom" },
  { id: "shoes", label: "신발", fallbackMainId: "shoes" },
  { id: "outer", label: "아우터", fallbackMainId: "outer" },
  { id: "fashion-item", label: "패션소품", fallbackMainId: "fashion-item" },
];
const SNAP_FALLBACKS = [snapFallback1, snapFallback2, snapFallback3, snapFallback4];
const PLACEHOLDER_LIKES = [428, 356, 512, 289, 643, 398];
const SNAP_FALLBACK_DATA = SNAP_FALLBACKS.map((image, index) => ({
  id: `snap-fallback-${index}`,
  image,
  author: "CoordiFit",
  title: "오늘의 데일리룩",
  likes: PLACEHOLDER_LIKES[index % PLACEHOLDER_LIKES.length],
}));

const CALENDAR_DAYS = [
  {
    id: "2025-01-23",
    day: "Tue",
    date: 23,
    weather: "overcast",
    weatherLabel: "흐림",
    weatherIcon: overcastIcon,
    temperature: "17°",
    outfitImage: topImage1,
  },
  {
    id: "2025-01-24",
    day: "Wed",
    date: 24,
    weather: "sunny",
    weatherLabel: "맑음",
    weatherIcon: sunnyIcon,
    temperature: "20°",
    outfitImage: topImage2,
  },
  {
    id: "2025-01-25",
    day: "Thu",
    date: 25,
    weather: "sunny",
    weatherLabel: "맑음",
    weatherIcon: sunnyIcon,
    temperature: "20°",
    outfitImage: outerImage,
  },
  {
    id: "2025-01-26",
    day: "Fri",
    date: 26,
    weather: "snow",
    weatherLabel: "눈",
    weatherIcon: snowIcon,
    temperature: "22°",
    outfitImage: shoesImage,
  },
  {
    id: "2025-01-27",
    day: "Sat",
    date: 27,
    weather: "rainy",
    weatherLabel: "비",
    weatherIcon: rainyIcon,
    temperature: "18°",
    outfitImage: pantsImage,
  },
  {
    id: "2025-01-28",
    day: "Sun",
    date: 28,
    weather: "add",
    weatherLabel: "추가",
    weatherIcon: null,
    temperature: null,
    outfitImage: null,
  },
];

const MainPage = () => {
  const navigate = useNavigate();
  const [isLoadingClothes, setIsLoadingClothes] = useState(true);
  const [rawClothes, setRawClothes] = useState([]);
  const [clothesError, setClothesError] = useState(null);
  const [isLoadingSnaps, setIsLoadingSnaps] = useState(false);
  const [snapError, setSnapError] = useState(null);
  const [snaps, setSnaps] = useState([]);
  const [activeRecentTab, setActiveRecentTab] = useState(RECENT_CATEGORY_TABS[0].id);
  const [categoryError, setCategoryError] = useState(null);
  const [categoryMappings, setCategoryMappings] = useState({
    mainByName: {},
    mainNameByCode: {},
    subByName: {},
    subToMain: {},
  });
  const scrollRef = useRef(null);
  const [activeCalendarIndex, setActiveCalendarIndex] = useState(1);

  const handleHeroClick = useCallback(
    (destination) => {
      navigate(destination);
    },
    [navigate],
  );

  const handleSectionNavigate = useCallback(
    (destination) => {
      navigate(destination);
    },
    [navigate],
  );

  useEffect(() => {
    let cancelled = false;

    const fetchCategories = async () => {
      setCategoryError(null);

      try {
        const categoryData = await commonCodeService.getCategoryData();

        if (cancelled) {
          return;
        }

        const mainByName = {};
        const mainNameByCode = {};
        const subByName = {};
        const subToMain = {};

        categoryData.mainCategories
          .filter((category) => category.codeId !== "all")
          .forEach((category) => {
            mainByName[category.codeName] = category.codeId;
            mainNameByCode[category.codeId] = category.codeName;
          });

        Object.entries(categoryData.subCategoriesMap).forEach(([mainCode, subs]) => {
          subs
            .filter((sub) => sub.codeId !== "all")
            .forEach((sub) => {
              subByName[sub.codeName] = sub.codeId;
              subToMain[sub.codeId] = mainCode;
            });
        });

        setCategoryMappings({ mainByName, mainNameByCode, subByName, subToMain });
      } catch (error) {
        if (!cancelled) {
          console.error("카테고리 데이터 조회 실패", error);
          setCategoryError("카테고리 정보를 불러오지 못했습니다.");
        }
      } finally {
        // no-op
      }
    };

    fetchCategories();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const fetchClothes = async () => {
      setIsLoadingClothes(true);
      setClothesError(null);

      try {
        const response = await clothesService.getClothes();

        if (cancelled) {
          return;
        }

        // SnapAddPage와 같은 방식으로 응답 처리
        const items = response?.data?.content || [];

        if (!items.length) {
          setRawClothes([]);
          return;
        }

        // SnapAddPage 방식을 참고하여 데이터 변환
        const adapted = items.map((item, index) => ({
          id: item.clothesId || `closet-${index}`,
          name: item.name || "이름 미입력",
          brand: item.brand || "브랜드 미입력",
          price: item.price ?? null,
          categoryName: item.categoryName || "",
          subCategoryName: item.subCategoryName || "",
          categoryCode: item.categoryCode || "",
          mainCategoryCode: item.mainCategoryCode || "",
          subCategoryCode: item.subCategoryCode || item.categoryCode || "",
          description: item.description || "",
          image: item.imageUrl || "",
        }));

        setRawClothes(adapted);
      } catch (error) {
        if (!cancelled) {
          console.error("최근 착용한 옷 조회 실패", error);
          setRawClothes([]);
          setClothesError("옷 정보를 불러오지 못했습니다.");
        }
      } finally {
        if (!cancelled) {
          setIsLoadingClothes(false);
        }
      }
    };

    fetchClothes();

    return () => {
      cancelled = true;
    };
  }, []);
  // ✅ 스크롤 기반 중앙 카드 확대 효과
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const handleScroll = () => {
      const cards = container.querySelectorAll(`.${styles.calendarCard}`);
      const containerRect = container.getBoundingClientRect();
      const centerX = containerRect.left + containerRect.width / 2;

      let closestIndex = 0;
      let closestDistance = Infinity;

      cards.forEach((card, index) => {
        const rect = card.getBoundingClientRect();
        const cardCenter = rect.left + rect.width / 2;
        const distance = Math.abs(centerX - cardCenter);

        const scale = Math.max(0.9, 1.0 - distance / 500);
        const opacity = Math.max(0.6, 1.1 - distance / 400);
        card.style.transform = `scale(${scale})`;
        card.style.opacity = opacity;
        card.style.transformOrigin = "center bottom";
        card.style.transition = "transform 0.25s ease-out, opacity 0.25s ease-out";

        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      setActiveCalendarIndex(closestIndex);
    };

    handleScroll();
    container.addEventListener("scroll", handleScroll, { passive: true });

    return () => container.removeEventListener("scroll", handleScroll);
  }, []);
  useEffect(() => {
    let cancelled = false;

    const fetchSnaps = async () => {
      setIsLoadingSnaps(true);
      setSnapError(null);

      try {
        const response = await postService.getAllPosts();

        if (cancelled) {
          return;
        }

        const items = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response?.data?.data)
            ? response.data.data
            : Array.isArray(response)
              ? response
              : [];

        if (!items.length) {
          setSnaps([]);
          return;
        }

        const adapted = items.map((item, index) => ({
          id: item.postId || item.id || `snap-${index}`,
          image:
            item.imageUrl || item.thumbnailUrl || SNAP_FALLBACKS[index % SNAP_FALLBACKS.length],
          author: item.authorNickname || item.nickname || item.userName || "CoordiFit 사용자",
          title: item.title || item.postTitle || "오늘의 데일리룩",
          likes:
            typeof item.likeCount === "number"
              ? item.likeCount
              : PLACEHOLDER_LIKES[index % PLACEHOLDER_LIKES.length],
        }));

        setSnaps(adapted.slice(0, 4));
      } catch (error) {
        if (!cancelled) {
          console.error("스냅 게시물 조회 실패", error);
          setSnapError("스냅 게시물을 불러오지 못했습니다.");
          setSnaps([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingSnaps(false);
        }
      }
    };

    fetchSnaps();

    return () => {
      cancelled = true;
    };
  }, []);

  const clothesWithMainCategory = useMemo(() => {
    if (!rawClothes.length) {
      return [];
    }

    return rawClothes.map((item) => {
      const subCode = item.subCategoryCode || "";
      const subName = item.subCategoryName || "";
      const mainName = item.categoryName || "";

      const derivedMainCode =
        item.mainCategoryCode ||
        categoryMappings.subToMain[subCode] ||
        (mainName && categoryMappings.mainByName[mainName]) ||
        (subName && categoryMappings.subByName[subName]
          ? categoryMappings.subToMain[categoryMappings.subByName[subName]]
          : "");

      const derivedMainName =
        categoryMappings.mainNameByCode[derivedMainCode] ||
        mainName ||
        (derivedMainCode && categoryMappings.mainNameByCode[derivedMainCode]) ||
        "";

      return {
        ...item,
        mainCategoryCode: derivedMainCode,
        mainCategoryName: derivedMainName,
      };
    });
  }, [rawClothes, categoryMappings]);

  const activeRecentTabConfig = useMemo(
    () => RECENT_CATEGORY_TABS.find((tab) => tab.id === activeRecentTab) || RECENT_CATEGORY_TABS[0],
    [activeRecentTab],
  );

  const filteredRecentClothes = useMemo(() => {
    if (!clothesWithMainCategory.length) {
      return [];
    }

    const desiredMainLabel = activeRecentTabConfig.label;
    const fallbackMainId = activeRecentTabConfig.fallbackMainId;
    const desiredMainCode = categoryMappings.mainByName[desiredMainLabel] || fallbackMainId;

    return clothesWithMainCategory
      .filter((item) => {
        const itemMainCode =
          item.mainCategoryCode ||
          (item.mainCategoryName && categoryMappings.mainByName[item.mainCategoryName]) ||
          (item.categoryName && categoryMappings.mainByName[item.categoryName]) ||
          "";

        if (itemMainCode && desiredMainCode && itemMainCode === desiredMainCode) {
          return true;
        }

        const itemMainName =
          item.mainCategoryName ||
          item.categoryName ||
          categoryMappings.mainNameByCode[itemMainCode] ||
          "";

        if (itemMainName && itemMainName === desiredMainLabel) {
          return true;
        }

        const fallbackCandidates = [
          item.subCategoryName,
          item.categoryName,
          item.categoryCode,
          item.subCategoryCode,
        ]
          .filter(Boolean)
          .map((value) => value.toString().toLowerCase());

        return fallbackCandidates.some((value) => value.includes(fallbackMainId));
      })
      .slice(0, 4);
  }, [
    activeRecentTabConfig,
    categoryMappings.mainByName,
    categoryMappings.mainNameByCode,
    clothesWithMainCategory,
  ]);

  const formattedClothes = useMemo(
    () =>
      filteredRecentClothes.map((item) => ({
        ...item,
        priceLabel:
          typeof item.price === "number" ? `${item.price.toLocaleString()}원` : (item.price ?? ""),
      })),
    [filteredRecentClothes],
  );

  const displaySnaps = useMemo(() => (snaps.length ? snaps : SNAP_FALLBACK_DATA), [snaps]);
  const canNavigateSnap = snaps.length > 0;

  const resolveShortcutCodes = useCallback(
    (shortcut) => {
      const mainCode = categoryMappings.mainByName[shortcut.mainLabel] || shortcut.fallbackMainId;
      const subCode = [shortcut.subLabel, ...(shortcut.subLabelAlternatives || [])]
        .map((name) => categoryMappings.subByName[name])
        .find(Boolean);

      return {
        mainCode,
        subCode: subCode || shortcut.fallbackSubId,
      };
    },
    [categoryMappings.mainByName, categoryMappings.subByName],
  );

  const handleCategoryShortcut = useCallback(
    (shortcut) => {
      const { mainCode, subCode } = resolveShortcutCodes(shortcut);

      navigate("/closet", {
        state: {
          mainCategoryId: mainCode,
          subCategoryId: subCode,
          mainCategoryName: shortcut.mainLabel,
          subCategoryName: shortcut.subLabel,
          fallbackMainId: shortcut.fallbackMainId,
          fallbackSubId: shortcut.fallbackSubId,
        },
      });
    },
    [navigate, resolveShortcutCodes],
  );

  return (
    <div className={styles.page}>
      <div className={styles.topHero}>
        <header className={styles.appHeader}>
          <div className={styles.brandGroup}>
            <p className={styles.brandLogo}>CoordiFit</p>
            <div className={styles.weatherInline}>
              <img src={sunnyIcon} alt="맑음" className={styles.weatherIcon} />
              <span className={styles.temperature}>24°</span>
            </div>
          </div>
          <button
            type="button"
            className={styles.profileButton}
            onClick={() => navigate("/mypage")}
            aria-label="마이페이지로 이동"
          >
            <img src={userIcon} alt="프로필 아이콘" />
          </button>
        </header>
        <div className={styles.heroCarousel}>
          {HERO_CARDS.map((card) => (
            <button
              key={card.id}
              type="button"
              className={`${styles.heroCard} ${card.id === "snap" ? styles.snapHeroCard : ""}`}
              onClick={() => handleHeroClick(card.destination)}
            >
              <img
                src={card.image}
                alt={`${card.subtitle} 배너`}
                className={styles.heroImage}
                style={card.id === "snap" ? { opacity: 0.6 } : undefined}
              />{" "}
              <div className={styles.heroTextBox}>
                <h2
                  className={styles.heroTitle}
                  dangerouslySetInnerHTML={{
                    __html: card.title.replace(/,\s*/g, ",<br />"),
                  }}
                />
                <p className={styles.heroSubtitle}>{card.subtitle}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <section className={styles.section}>
        <header className={styles.sectionHeader}>
          <div className={styles.sectionTitleGroup}>
            <h2>나의 옷장</h2>
            <img src={closetIcon} alt="옷장" />
          </div>
          <button
            type="button"
            className={styles.sectionLink}
            onClick={() => handleSectionNavigate("/closet")}
          >
            옷장 전체 보기
          </button>
        </header>

        <div className={styles.categoryGrid}>
          {CATEGORY_ROWS.map((row) => (
            <div className={styles.categoryRow} key={row.map((item) => item.id).join("-")}>
              {row.map((filter) => (
                <div key={filter.id} className={styles.categoryItem}>
                  <button
                    type="button"
                    className={styles.categoryButton}
                    onClick={() => handleCategoryShortcut(filter)}
                    aria-label={`${filter.label} 카테고리 보러가기`}
                  >
                    <div className={styles.categoryImageBox}>
                      <img src={filter.image} alt={filter.label} className={styles.categoryImage} />
                    </div>
                  </button>
                  <span className={styles.categoryLabel}>{filter.label}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ✅ 코디 캘린더 */}
      <section className={styles.section}>
        <header className={styles.sectionHeader}>
          <div className={styles.sectionTitleGroup}>
            <h2>코디 캘린더</h2>
            <img src={calendarIcon} alt="캘린더" />
          </div>
          <button
            type="button"
            className={styles.sectionLink}
            onClick={() => navigate("/calendar")}
          >
            달력 보기
          </button>
        </header>

        <div ref={scrollRef} className={styles.calendarScroller}>
          {CALENDAR_DAYS.map((day, index) => (
            <div
              key={day.id}
              className={`${styles.calendarCard} ${
                index === activeCalendarIndex ? styles.activeCalendarCard : ""
              }`}
            >
              <div className={styles.calendarCardHeader}>
                <div>
                  <span className={styles.calendarDay}>{day.day}</span>
                  <span className={styles.calendarDate}>{day.date}</span>
                </div>
                <div className={styles.calendarWeather}>
                  {day.weatherIcon && (
                    <img
                      src={day.weatherIcon}
                      alt={`${day.weatherLabel} 아이콘`}
                      className={styles.calendarWeatherIcon}
                    />
                  )}
                  <span className={styles.calendarTemp}>{day.temperature}</span>
                </div>
              </div>
              <div className={styles.calendarCardBody}>
                {day.outfitImage ? (
                  <img src={day.outfitImage} alt={`${day.date}일 코디`} />
                ) : (
                  <img src={calendarPlus} alt="코디 추가하기" className={styles.calendarAdd} />
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={`${styles.section} ${styles.aiSection}`}>
        <header className={styles.sectionHeader}>
          <div className={styles.sectionTitleGroup}>
            <h2>AI 옷 입히기</h2>
            <img src={aiIcon} alt="AI" />
          </div>
        </header>

        <button
          type="button"
          className={styles.aiBannerButton}
          onClick={() => handleSectionNavigate("/ai-fitting")}
          style={{ backgroundImage: `url(${aiBanner})` }}
        >
          <div className={styles.aiBannerOverlay} aria-hidden="true" />

          {/* 내부 배너 컨텐츠 */}
          <div className={styles.aiBannerContent}>
            <p className={styles.aiBannerHeadline}>
              <strong className={styles.aiHighlight}>AI </strong>
              <span>피팅으로 완벽한 스타일을 찾아보세요.</span>
            </p>

            <div className={styles.aiBannerActionWrapper}>
              <span className={styles.aiBannerAction}>+ 가상 피팅하기</span>
            </div>
          </div>
        </button>
      </section>

      {/* ✅ 최근에 착용한 옷 섹션 */}
      <section className={styles.section}>
        <header className={styles.sectionHeader}>
          <div className={styles.sectionTitleGroup}>
            <h2>최근에 착용한 옷</h2>
            <img src={lastWornIcon} alt="최근 착용" />
          </div>
          <button
            type="button"
            className={styles.sectionLink}
            onClick={() => handleSectionNavigate("/closet")}
          >
            옷장 가기
          </button>
        </header>

        {categoryError && <p className={styles.errorText}>{categoryError}</p>}

        {/* ✅ 좌우 여백 제거용 래퍼 */}
        <div className={styles.recentTabsWrapper}>
          <div className={styles.recentTabs} role="tablist" aria-label="최근에 착용한 옷 카테고리">
            {RECENT_CATEGORY_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={
                  tab.id === activeRecentTab
                    ? `${styles.recentTab} ${styles.activeRecentTab}`
                    : styles.recentTab
                }
                onClick={() => setActiveRecentTab(tab.id)}
                aria-pressed={tab.id === activeRecentTab}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 아래 옷 리스트 영역 */}

        {clothesError && <p className={styles.errorText}>{clothesError}</p>}
        <div className={styles.clothesGrid}>
          {isLoadingClothes
            ? Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={`skeleton-${index}`}
                  className={`${styles.clothesCard} ${styles.skeleton}`}
                />
              ))
            : formattedClothes.length > 0
              ? formattedClothes.map((item) => (
                  <div className={styles.clothesCard} key={item.id}>
                    <div className={styles.clothesImageWrapper}>
                      {item.image ? (
                        <img src={item.image} alt={`${item.name} 이미지`} />
                      ) : (
                        <span className={styles.imagePlaceholder}>이미지 없음</span>
                      )}
                    </div>
                    <div className={styles.clothesMeta}>
                      <span className={styles.brand}>{item.brand || "브랜드 미입력"}</span>
                      <strong className={styles.clothesName}>{item.name || "이름 없음"}</strong>
                      {item.priceLabel && <span className={styles.price}>{item.priceLabel}</span>}
                    </div>
                  </div>
                ))
              : !clothesError && (
                  <div className={styles.emptyState}>
                    <p>선택한 카테고리에 등록된 옷이 없습니다.</p>
                    <p>옷장에서 새로운 아이템을 추가해보세요!</p>
                  </div>
                )}
        </div>
      </section>

      <section className={styles.section}>
        <header className={styles.sectionHeader}>
          <div className={styles.sectionTitleGroup}>
            <h2>실시간 인기 스냅</h2>
            <img src={snapIcon} alt="스냅" />
          </div>
          <button
            type="button"
            className={styles.sectionLink}
            onClick={() => handleSectionNavigate("/snap")}
          >
            게시글 보기
          </button>
        </header>
        {snapError && <p className={styles.errorText}>{snapError}</p>}
        <div className={styles.snapGrid}>
          {isLoadingSnaps
            ? Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={`snap-skeleton-${index}`}
                  className={`${styles.snapCard} ${styles.skeleton}`}
                  aria-hidden="true"
                />
              ))
            : displaySnaps.map((snap) => (
                <button
                  key={snap.id}
                  type="button"
                  className={styles.snapCard}
                  onClick={() => canNavigateSnap && handleSectionNavigate(`/snap/${snap.id}`)}
                  disabled={!canNavigateSnap}
                >
                  <div className={styles.snapImageWrapper}>
                    <img src={snap.image} alt={`${snap.title} 스냅 이미지`} />
                  </div>
                  <div className={styles.snapMeta}>
                    <span className={styles.snapAuthor}>{snap.author}</span>
                    <p className={styles.snapTitle}>{snap.title}</p>
                    <span className={styles.snapLikes}>❤️ {snap.likes.toLocaleString()}</span>
                  </div>
                </button>
              ))}
        </div>
      </section>
    </div>
  );
};

export default MainPage;
