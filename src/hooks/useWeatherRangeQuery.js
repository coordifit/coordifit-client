import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";

import { getHistoricalWeatherRange } from "@/api/historicalWeatherApi";
import { getWeatherRange } from "@/api/weatherApi";
import { formatDate } from "@/utils/calendarUtils";
import { addDays, daysDiffFromToday, clampFutureLimit } from "@/utils/dateRange";

const MAX_FUTURE_DATE = 12;
const PREFETCH_ENABLED = true;

function mergeDaily(past, future) {
  return {
    time: [...(past?.time || []), ...(future?.time || [])],
    temperature_2m_max: [
      ...(past?.temperature_2m_max || []),
      ...(future?.temperature_2m_max || []),
    ],
    temperature_2m_min: [
      ...(past?.temperature_2m_min || []),
      ...(future?.temperature_2m_min || []),
    ],
    weathercode: [...(past?.weathercode || []), ...(future?.weathercode || [])],
  };
}

async function fetchMixedRange({ lat, lng, startDate, endDate }) {
  const today = new Date();
  const todayY = formatDate(today);
  const [pastWeather, futureWeather] = await Promise.all([
    getHistoricalWeatherRange({ lat, lng, startDate, endDate: todayY }),
    getWeatherRange({ lat, lng, startDate: todayY, endDate }),
  ]);
  return mergeDaily(pastWeather, futureWeather);
}

/**
 * 날짜 범위 조회 + 다음/이전 prefetch
 *
 * @param { lat:number, lng:number } coords
 * @param { string } startYMD - "YYYY-MM-DD"
 * @param { string } endYMD   - "YYYY-MM-DD"
 * @param {{chunkSize?:number, prefetch?:boolean}} options
 *   - chunkSize: 좌우로 넘길 때 한 번에 이동/미리 로드할 일수(기본 5)
 *   - prefetch: 프리페치 on/off
 */
const useWeatherRangeQuery = (coords, startYMD, endYMD, options = {}) => {
  const queryClient = useQueryClient();
  const { chunkSize = 5, prefetch = true } = options;

  const startDate = useMemo(() => new Date(startYMD), [startYMD]);
  const endDate = useMemo(() => new Date(endYMD), [endYMD]);

  const startDiff = useMemo(() => daysDiffFromToday(startDate), [startDate]);
  const endDiff = useMemo(() => daysDiffFromToday(endDate), [endDate]);

  const allFuture = startDiff >= 0;
  const allPast = endDiff < 0;
  const isMixed = startDiff < 0 && endDiff >= 0; // 과거 + 현재
  const isExistCoordi = !!coords?.lat && !!coords?.lng;

  // 현재 구간 데이터 쿼리
  const query = useQuery({
    queryKey: ["weatherRange", coords?.lat, coords?.lng, startYMD, endYMD],
    queryFn: async () => {
      if (allPast) {
        return getHistoricalWeatherRange({
          lat: coords.lat,
          lng: coords.lng,
          startDate: startYMD,
          endDate: endYMD,
        });
      } else if (allFuture) {
        const clamped = clampFutureLimit(startDate, endDate, MAX_FUTURE_DATE);
        return getWeatherRange({
          lat: coords.lat,
          lng: coords.lng,
          startDate: formatDate(clamped.start),
          endDate: formatDate(clamped.end),
        });
      } else if (isMixed) {
        return fetchMixedRange({
          lat: coords.lat,
          lng: coords.lng,
          startDate: startYMD,
          endDate: endYMD,
        });
      }
    },
    enabled: isExistCoordi,
    staleTime: 1000 * 60 * 30,
    retry: 1,
  });

  useEffect(() => {
    if (!PREFETCH_ENABLED || !query.data || !coords?.lat || !coords?.lng) return;

    const doPrefetch = async (rangeStart, rangeEnd) => {
      const sDiff = daysDiffFromToday(rangeStart);
      const eDiff = daysDiffFromToday(rangeEnd);

      const key = [
        "weatherRange",
        coords.lat,
        coords.lng,
        formatDate(rangeStart),
        formatDate(rangeEnd),
      ];

      if (eDiff < 0) {
        // 전부 과거
        await queryClient.prefetchQuery({
          queryKey: key,
          queryFn: () =>
            getHistoricalWeatherRange({
              lat: coords.lat,
              lng: coords.lng,
              startDate: formatDate(rangeStart),
              endDate: formatDate(rangeEnd),
            }),
          staleTime: 1000 * 60 * 30,
        });
      } else if (sDiff >= 0) {
        // 전부 미래 (16일 제한)
        const clamped = clampFutureLimit(rangeStart, rangeEnd, MAX_FUTURE_DATE);
        if (clamped.end < rangeStart) return; // 전부 제한 밖이면 스킵

        await queryClient.prefetchQuery({
          queryKey: key,
          queryFn: () =>
            getWeatherRange({
              lat: coords.lat,
              lng: coords.lng,
              startDate: formatDate(clamped.start),
              endDate: formatDate(clamped.end),
            }),
          staleTime: 1000 * 60 * 30,
        });
      } else {
        // 혼합 구간
        await queryClient.prefetchQuery({
          queryKey: key,
          queryFn: () =>
            fetchMixedRange({
              lat: coords.lat,
              lng: coords.lng,
              startDate: formatDate(rangeStart),
              endDate: formatDate(rangeEnd),
            }),
          staleTime: 1000 * 60 * 30,
        });
      }
    };

    // 다음(+chunkSize) 구간
    const nextStart = addDays(endDate, 1);
    const nextEnd = addDays(endDate, chunkSize);
    doPrefetch(nextStart, nextEnd);

    // 이전(-chunkSize) 구간
    const prevStart = addDays(startDate, -chunkSize);
    const prevEnd = addDays(startDate, -1);
    doPrefetch(prevStart, prevEnd);
  }, [query.data, coords?.lat, coords?.lng, startYMD, endYMD, chunkSize, prefetch]);

  return query;
};

export { useWeatherRangeQuery };
