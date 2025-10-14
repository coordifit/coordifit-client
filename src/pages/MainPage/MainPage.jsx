import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import styles from "./MainPage.module.css";

import userIcon from "@/assets/images/usericon.png";
import closetIcon from "@/assets/images/closet.svg";
import calendarIcon from "@/assets/images/calendaricon.png";
import aiIcon from "@/assets/images/auto_awesome.png";
import lastWornIcon from "@/assets/images/lastwornicon.svg";
import snapIcon from "@/assets/images/snap.svg";

import heroCloset from "@/assets/images/mainpage/hero-closet.svg";
import heroCalendar from "@/assets/images/mainpage/hero-calendar.svg";
import heroSnap from "@/assets/images/mainpage/hero-snap.svg";
import heroAi from "@/assets/images/mainpage/hero-ai.svg";
import aiBanner from "@/assets/images/mainpage/ai-banner.svg";
import calendarPlus from "@/assets/images/mainpage/calendar-plus.svg";
import shirtIcon from "@/assets/images/mainpage/shirt.svg";
import poloIcon from "@/assets/images/mainpage/polo.svg";
import shortSleeveIcon from "@/assets/images/mainpage/short-sleeve.svg";
import longSleeveIcon from "@/assets/images/mainpage/long-sleeve.svg";
import hoodieIcon from "@/assets/images/mainpage/hoodie.svg";
import shortsIcon from "@/assets/images/mainpage/shorts.svg";
import jeansIcon from "@/assets/images/mainpage/jeans.svg";
import skirtIcon from "@/assets/images/mainpage/skirt.svg";
import coatIcon from "@/assets/images/mainpage/coat.svg";
import paddingIcon from "@/assets/images/mainpage/padding.svg";
import sneakersIcon from "@/assets/images/mainpage/sneakers.svg";
import dressShoesIcon from "@/assets/images/mainpage/dress-shoes.svg";
import snap1 from "@/assets/images/mainpage/snap1.svg";
import snap2 from "@/assets/images/mainpage/snap2.svg";
import snap3 from "@/assets/images/mainpage/snap3.svg";
import snap4 from "@/assets/images/mainpage/snap4.svg";

import topImage1 from "@/assets/images/clothes/top1.png";
import topImage2 from "@/assets/images/clothes/top2.png";
import outerImage from "@/assets/images/clothes/outer1.png";
import pantsImage from "@/assets/images/clothes/pants1.png";
import shoesImage from "@/assets/images/clothes/shoes1.png";

import clothesService from "@/services/clothesService";

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
    },
    {
      id: "polo",
      label: "카라티",
      image: poloIcon,
      categoryId: "top",
      subCategoryId: "polo",
    },
    {
      id: "short-sleeve",
      label: "반팔",
      image: shortSleeveIcon,
      categoryId: "top",
      subCategoryId: "short-sleeve",
    },
    {
      id: "long-sleeve",
      label: "긴팔",
      image: longSleeveIcon,
      categoryId: "top",
      subCategoryId: "long-sleeve",
    },
    {
      id: "hoodie",
      label: "후드",
      image: hoodieIcon,
      categoryId: "top",
      subCategoryId: "hoodie",
    },
    {
      id: "shorts",
      label: "반바지",
      image: shortsIcon,
      categoryId: "bottom",
      subCategoryId: "shorts",
    },
  ],
  [
    {
      id: "jeans",
      label: "청바지",
      image: jeansIcon,
      categoryId: "bottom",
      subCategoryId: "jeans",
    },
    {
      id: "skirt",
      label: "치마",
      image: skirtIcon,
      categoryId: "bottom",
      subCategoryId: "skirt",
    },
    {
      id: "coat",
      label: "코트",
      image: coatIcon,
      categoryId: "outer",
      subCategoryId: "coat",
    },
    {
      id: "padding",
      label: "패딩",
      image: paddingIcon,
      categoryId: "outer",
      subCategoryId: "padding",
    },
    {
      id: "sneakers",
      label: "스니커즈",
      image: sneakersIcon,
      categoryId: "shoes",
      subCategoryId: "sneakers",
    },
    {
      id: "dress-shoes",
      label: "구두",
      image: dressShoesIcon,
      categoryId: "shoes",
      subCategoryId: "dress-shoes",
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

const SNAP_DUMMIES = [
  {
    id: "snap-1",
    image: snap1,
    author: "Inbum.hwang",
    title: "올 가을 난리난 재킷",
    likes: 435,
  },
  {
    id: "snap-2",
    image: snap2,
    author: "jibgago.sipda",
    title: "길 한복판에서 최고의 선택!",
    likes: 1557,
  },
  {
    id: "snap-3",
    image: snap3,
    author: "Inbum.hwang",
    title: "겨울 준비 필수템",
    likes: 982,
  },
  {
    id: "snap-4",
    image: snap4,
    author: "jibgago.sipda",
    title: "캐주얼 데일리룩",
    likes: 612,
  },
];

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
  const [isLoadingClothes, setIsLoadingClothes] = useState(false);
  const [clothes, setClothes] = useState(FALLBACK_CLOTHES);
  const [clothesError, setClothesError] = useState(null);

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
        const response = await clothesService.getClothes(
          activeFilter.categoryId,
          activeFilter.subCategoryId,
        );

        if (cancelled) {
          return;
        }

        const items = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response)
            ? response
            : [];

        if (!items.length) {
          setClothes(FALLBACK_CLOTHES);
          return;
        }

        const adapted = items.map((item, index) => ({
          id: item.id ?? `closet-${index}`,
          name: item.name ?? "이름 미입력",
          brand: item.brand ?? item.brandName ?? "브랜드 미입력",
          price: item.price ?? item.purchasePrice ?? null,
          image:
            item.images?.[0]?.url ||
            item.images?.[0] ||
            item.thumbnailUrl ||
            FALLBACK_CLOTHES[index % FALLBACK_CLOTHES.length].image,
        }));

        setClothes(adapted);
      } catch (error) {
        if (!cancelled) {
          console.error("최근 착용한 옷 조회 실패", error);
          setClothes(FALLBACK_CLOTHES);
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
  }, [activeFilter]);

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
            : formattedClothes.map((item) => (
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
              ))}
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
        <div className={styles.snapGrid}>
          {SNAP_DUMMIES.map((snap) => (
            <div className={styles.snapCard} key={snap.id}>
              <img src={snap.image} alt={`${snap.title} 스냅 이미지`} />
              <div className={styles.snapMeta}>
                <span className={styles.snapAuthor}>{snap.author}</span>
                <p className={styles.snapTitle}>{snap.title}</p>
                <span className={styles.snapLikes}>❤️ {snap.likes.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default MainPage;
