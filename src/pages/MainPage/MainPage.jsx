import { useCallback, useEffect, useMemo, useState } from "react";
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
    title: "데일리코디로 완성하는, 나만의 스타일 캘린더",
    subtitle: "코디 관리의 시작, 캘린더에 담는 순간부터.",
    image: heroCalendar,
    destination: "/calendar",
  },
  {
    id: "snap",
    title: "#데일리룩 #오오티디",
    subtitle: "나만의 코디 스냅으로 기록하고 공유해요",
    image: heroSnap,
    destination: "/snap",
  },
  {
    id: "ai",
    title: "AI 가상 피팅으로 나만의 룩을 완성하세요.",
    subtitle: "나만의 AI 스타일리스트",
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
      categoryId: "top",
      subCategoryId: "shirts",
      keywords: ["셔츠"],
    },
    {
      id: "polo",
      label: "카라티",
      image: poloIcon,
      categoryId: "top",
      subCategoryId: "polo",
      keywords: ["카라티", "폴로"],
    },
    {
      id: "short-sleeve",
      label: "반팔",
      image: shortSleeveIcon,
      categoryId: "top",
      subCategoryId: "short-sleeve",
      keywords: ["반팔", "반팔티"],
    },
    {
      id: "long-sleeve",
      label: "긴팔",
      image: longSleeveIcon,
      categoryId: "top",
      subCategoryId: "long-sleeve",
      keywords: ["긴팔", "긴팔티"],
    },
    {
      id: "hoodie",
      label: "후드",
      image: hoodieIcon,
      categoryId: "top",
      subCategoryId: "hoodie",
      keywords: ["후드", "후드티"],
    },
    {
      id: "shorts",
      label: "반바지",
      image: shortsIcon,
      categoryId: "bottom",
      subCategoryId: "shorts",
      keywords: ["반바지", "숏팬츠"],
    },
  ],
  [
    {
      id: "jeans",
      label: "청바지",
      image: jeansIcon,
      categoryId: "bottom",
      subCategoryId: "jeans",
      keywords: ["청바지", "데님"],
    },
    {
      id: "skirt",
      label: "치마",
      image: skirtIcon,
      categoryId: "bottom",
      subCategoryId: "skirt",
      keywords: ["치마", "스커트"],
    },
    {
      id: "coat",
      label: "코트",
      image: coatIcon,
      categoryId: "outer",
      subCategoryId: "coat",
      keywords: ["코트"],
    },
    {
      id: "padding",
      label: "패딩",
      image: paddingIcon,
      categoryId: "outer",
      subCategoryId: "padding",
      keywords: ["패딩", "점퍼"],
    },
    {
      id: "sneakers",
      label: "스니커즈",
      image: sneakersIcon,
      categoryId: "shoes",
      subCategoryId: "sneakers",
      keywords: ["스니커즈", "운동화"],
    },
    {
      id: "dress-shoes",
      label: "구두",
      image: dressShoesIcon,
      categoryId: "shoes",
      subCategoryId: "dress-shoes",
      keywords: ["구두", "로퍼"],
    },
  ],
];

const FALLBACK_CLOTHES = [
  {
    id: "fallback-1",
    name: "옥스포드 셔츠",
    brand: "유니클로",
    price: 200000,
    image: topImage1,
  },
  {
    id: "fallback-2",
    name: "레드 헤비 스웨터",
    brand: "무신사 스탠다드",
    price: 155700,
    image: topImage2,
  },
  {
    id: "fallback-3",
    name: "롱 셔츠",
    brand: "자라",
    price: 123000,
    image: outerImage,
  },
  {
    id: "fallback-4",
    name: "헤비 웨이트 후드",
    brand: "커버낫",
    price: 232000,
    image: pantsImage,
  },
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

const getSearchableValue = (item) =>
  [item.categoryName, item.subCategoryName, item.categoryCode, item.categoryId, item.description]
    .filter(Boolean)
    .join("|")
    .toLowerCase();

const filterClothesByKeywords = (items, keywords = []) => {
  if (!keywords.length) {
    return items;
  }

  const normalizedKeywords = keywords.map((keyword) => keyword.toLowerCase());
  return items.filter((item) => {
    const haystack = getSearchableValue(item);
    if (!haystack) {
      return false;
    }

    return normalizedKeywords.some((keyword) => haystack.includes(keyword));
  });
};

const CALENDAR_DAYS = [
  {
    id: "2025-01-23",
    day: "Tue",
    date: 23,
    weather: "overcast",
    temperature: "17°",
    outfitImage: topImage1,
  },
  {
    id: "2025-01-24",
    day: "Wed",
    date: 24,
    weather: "sunny",
    temperature: "20°",
    outfitImage: topImage2,
  },
  {
    id: "2025-01-25",
    day: "Thu",
    date: 25,
    weather: "sunny",
    temperature: "20°",
    outfitImage: outerImage,
  },
  {
    id: "2025-01-26",
    day: "Fri",
    date: 26,
    weather: "sunny",
    temperature: "22°",
    outfitImage: shoesImage,
  },
  {
    id: "2025-01-27",
    day: "Sat",
    date: 27,
    weather: "add",
    temperature: null,
    outfitImage: null,
  },
];

const weatherLabel = {
  sunny: "☀️",
  overcast: "⛅",
  add: "＋",
};

const MainPage = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState(CATEGORY_ROWS[0][0]);
  const [isLoadingClothes, setIsLoadingClothes] = useState(true);
  const [rawClothes, setRawClothes] = useState([]);
  const [clothes, setClothes] = useState([]);
  const [clothesError, setClothesError] = useState(null);
  const [isLoadingSnaps, setIsLoadingSnaps] = useState(false);
  const [snapError, setSnapError] = useState(null);
  const [snaps, setSnaps] = useState([]);

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
          setClothes([]);
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
          description: item.description || "",
          image: item.imageUrl || FALLBACK_CLOTHES[index % FALLBACK_CLOTHES.length].image,
        }));

        setRawClothes(adapted);
      } catch (error) {
        if (!cancelled) {
          console.error("최근 착용한 옷 조회 실패", error);
          setRawClothes([]);
          setClothes([]);
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

  useEffect(() => {
    if (isLoadingClothes) {
      return;
    }

    const filtered = filterClothesByKeywords(rawClothes, activeFilter.keywords);

    if (filtered.length) {
      setClothes(filtered.slice(0, 4));
      setClothesError(null);
      return;
    }

    if (rawClothes.length) {
      setClothes(rawClothes.slice(0, 4));
      setClothesError(null);
      return;
    }

    setClothes([]);
  }, [activeFilter, isLoadingClothes, rawClothes]);

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

  const handleFilterClick = useCallback((filter) => {
    setActiveFilter(filter);
  }, []);

  const formattedClothes = useMemo(
    () =>
      clothes.map((item) => ({
        ...item,
        priceLabel:
          typeof item.price === "number" ? item.price.toLocaleString() : (item.price ?? ""),
      })),
    [clothes],
  );

  const displaySnaps = useMemo(() => (snaps.length ? snaps : SNAP_FALLBACK_DATA), [snaps]);
  const canNavigateSnap = snaps.length > 0;

  return (
    <div className={styles.page}>
      <div className={styles.topHero}>
        <header className={styles.appHeader}>
          <div>
            <p className={styles.brand}>CoordiFit</p>
            <p className={styles.weatherInfo}>오늘의 날씨 24°</p>
          </div>
          <button
            type="button"
            className={styles.profileButton}
            onClick={() => navigate("/mypage")}
            aria-label="마이페이지로 이동"
          >
            <img src={userIcon} alt="" />
          </button>
        </header>
        <div className={styles.heroCarousel}>
          {HERO_CARDS.map((card) => (
            <button
              key={card.id}
              type="button"
              className={styles.heroCard}
              onClick={() => handleHeroClick(card.destination)}
            >
              <img src={card.image} alt={`${card.subtitle} 배너`} className={styles.heroImage} />
              <div className={styles.heroTextBox}>
                <p className={styles.heroSubtitle}>{card.subtitle}</p>
                <h2 className={styles.heroTitle}>{card.title}</h2>
              </div>
            </button>
          ))}
        </div>
      </div>

      <section className={styles.section}>
        <header className={styles.sectionHeader}>
          <div className={styles.sectionTitleGroup}>
            <img src={closetIcon} alt="옷장" />
            <h2>나의 옷장</h2>
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
                <button
                  key={filter.id}
                  type="button"
                  className={
                    filter.id === activeFilter.id
                      ? `${styles.categoryButton} ${styles.activeCategory}`
                      : styles.categoryButton
                  }
                  onClick={() => handleFilterClick(filter)}
                  aria-pressed={filter.id === activeFilter.id}
                >
                  <img src={filter.image} alt={`${filter.label} 아이콘`} />
                  <span>{filter.label}</span>
                </button>
              ))}
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <header className={styles.sectionHeader}>
          <div className={styles.sectionTitleGroup}>
            <img src={calendarIcon} alt="캘린더" />
            <h2>코디 캘린더</h2>
          </div>
          <button
            type="button"
            className={styles.sectionLink}
            onClick={() => handleSectionNavigate("/calendar")}
          >
            달력 보기
          </button>
        </header>
        <div className={styles.calendarScroller}>
          {CALENDAR_DAYS.map((day) => (
            <div className={styles.calendarCard} key={day.id}>
              <div className={styles.calendarCardHeader}>
                <div>
                  <span className={styles.calendarDay}>{day.day}</span>
                  <span className={styles.calendarDate}>{day.date}</span>
                </div>
                <div className={styles.calendarWeather}>
                  <span>{weatherLabel[day.weather]}</span>
                  {day.temperature && (
                    <span className={styles.calendarTemp}>{day.temperature}</span>
                  )}
                </div>
              </div>
              <div className={styles.calendarCardBody}>
                {day.outfitImage ? (
                  <img src={day.outfitImage} alt={`${day.date}일 코디 미리보기`} />
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
            <img src={aiIcon} alt="AI" />
            <h2>AI 옷 입히기</h2>
          </div>
        </header>
        <button
          type="button"
          className={styles.aiBannerButton}
          onClick={() => handleSectionNavigate("/ai-fitting")}
        >
          <img src={aiBanner} alt="AI 피팅 배너" />
        </button>
      </section>

      <section className={styles.section}>
        <header className={styles.sectionHeader}>
          <div className={styles.sectionTitleGroup}>
            <img src={lastWornIcon} alt="최근 착용" />
            <h2>최근에 착용한 옷</h2>
          </div>
          <button
            type="button"
            className={styles.sectionLink}
            onClick={() => handleSectionNavigate("/closet")}
          >
            옷장 가기
          </button>
        </header>
        {clothesError && <p className={styles.errorText}>{clothesError}</p>}
        <div className={styles.clothesGrid}>
          {isLoadingClothes
            ? Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={`skeleton-${index}`}
                  className={`${styles.clothesCard} ${styles.skeleton}`}
                />
              ))
            : formattedClothes.length > 0
              ? formattedClothes.map((item) => (
                  <div className={styles.clothesCard} key={item.id}>
                    <div className={styles.clothesImageWrapper}>
                      <img src={item.image} alt={`${item.name} 이미지`} />
                    </div>
                    <div className={styles.clothesMeta}>
                      <span className={styles.brand}>{item.brand}</span>
                      <strong className={styles.clothesName}>{item.name}</strong>
                      {item.priceLabel && <span className={styles.price}>{item.priceLabel}</span>}
                    </div>
                  </div>
                ))
              : !clothesError && (
                  <div
                    style={{
                      gridColumn: "1 / -1",
                      textAlign: "center",
                      padding: "40px 0",
                      color: "#999",
                    }}
                  >
                    <p>등록된 옷이 없습니다.</p>
                    <p>옷장에서 새로운 옷을 등록해보세요!</p>
                  </div>
                )}
        </div>
      </section>

      <section className={styles.section}>
        <header className={styles.sectionHeader}>
          <div className={styles.sectionTitleGroup}>
            <img src={snapIcon} alt="스냅" />
            <h2>실시간 인기 스냅</h2>
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
