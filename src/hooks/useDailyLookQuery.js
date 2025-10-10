import { useQuery } from "@tanstack/react-query";

import { getDailyLookByDate, getDailyLooksByMonth } from "@/services/dailyLookApi";

const useDailyLookByDateQuery = (wearDate) => {
  return useQuery({
    queryKey: ["dailyLook", wearDate],
    queryFn: () => getDailyLookByDate(wearDate),
    staleTime: 1000 * 60 * 5,
    enabled: !!wearDate,
  });
};
const useDailyLooksByMonthQuery = (yearMonth) => {
  return useQuery({
    queryKey: ["dailyLooks", yearMonth],
    queryFn: () => getDailyLooksByMonth(yearMonth),
    staleTime: 1000 * 60 * 5,
    enabled: !!yearMonth,
  });
};

export { useDailyLooksByMonthQuery, useDailyLookByDateQuery };
