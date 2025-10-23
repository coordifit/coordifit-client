import styles from "./Weather.module.css";
import {
  WiDaySunny,
  WiCloud,
  WiRain,
  WiStormShowers,
  WiSnowflakeCold,
  WiDayFog,
} from "react-icons/wi";
import { useEffect, useState } from "react";
import { useDailyWeatherQuery } from "@/hooks/useDailyWeatherQuery";

const iconByCode = (code) => {
  if (code === 0) return <WiDaySunny />;
  if ([1, 2, 3].includes(code)) return <WiCloud />;
  if ([45, 48].includes(code)) return <WiDayFog />;
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return <WiRain />;
  if ([95, 96, 99].includes(code)) return <WiStormShowers />;
  if ([56, 57, 66, 67, 71, 73, 75, 77, 85, 86].includes(code)) return <WiSnowflakeCold />;
  return <WiCloud />;
};

const Weather = ({ targetDate }) => {
  const [geoTried, setGeoTried] = useState(false);
  const [coords, setCoords] = useState(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setGeoTried(true);
      return;
    }
    let cancelled = false;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (cancelled) return;
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGeoTried(true);
      },
      () => {
        if (!cancelled) setGeoTried(true);
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 },
    );
    return () => {
      cancelled = true;
    };
  }, []);

  const q = useDailyWeatherQuery(targetDate, coords);

  if (!coords) return geoTried ? null : <span style={{ color: "#888" }}>위치 확인 중…</span>;
  if (q.isLoading) return <span style={{ color: "#888" }}>날씨 불러오는 중…</span>;
  if (q.isError || !q.data) return null;

  const { tmax, tmin, wcode } = q.data;

  return (
    <div className={styles.badge}>
      <span className={styles.icon}>{iconByCode(wcode)}</span>
      <span className={styles.text}>
        최고 {tmax}° / 최저 {tmin}°
      </span>
    </div>
  );
};

export default Weather;
