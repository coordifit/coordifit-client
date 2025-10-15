import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { getCurrentWeather, getPastWeather } from "@/services/weatherApi";
import { formatDate } from "@/utils/calendarUtils";

const daysFromToday = (date) => {
  const a = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const t = new Date();
  const b = new Date(t.getFullYear(), t.getMonth(), t.getDate());
  return Math.round((a - b) / (1000 * 60 * 60 * 24)); // 미래: 양수
};

/**
 * 1일 날짜 데이터 호출 (최고 / 최저 / 날씨코드)
 * - 미래 데이터는 현재로부터 5일 이상 데이터만 조회 가능
 * - 과거 데이터는 archive 과거 날씨 호출 API 사용
 *
 * @param { Date } targetDate
 * @param { lat:number, lng:number } coords
 */

const useDailyWeatherQuery = (targetDate, coords) => {
  const dateString = formatDate(targetDate);

  const diff = useMemo(() => daysFromToday(targetDate), [targetDate]);

  const isPast = diff < 0;
  const canFetch = !!coords?.lat && !!coords?.lng && (isPast || diff <= 5);

  return useQuery({
    queryKey: ["weather", "daily", dateString, coords?.lat, coords?.lng],
    queryFn: () =>
      isPast
        ? getPastWeather({ lat: coords.lat, lng: coords.lng, dateString })
        : getCurrentWeather({ lat: coords.lat, lng: coords.lng, dateString }),
    enabled: canFetch,
    staleTime: 1000 * 60 * 5, // 5분
    retry: 1,
  });
};

export { useDailyWeatherQuery };
