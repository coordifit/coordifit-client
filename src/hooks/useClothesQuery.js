import { useQuery } from "@tanstack/react-query";

import clothesService from "@/services/clothesService";

export const useClothesQuery = (options = {}, categoryId = null, subCategoryId = null) => {
  return useQuery({
    queryKey: ["clothes", categoryId, subCategoryId],
    queryFn: () => clothesService.getClothes(categoryId, subCategoryId),
    staleTime: 1000 * 60 * 5,
    onError: (error) => {
      console.error("❌ 옷 목록 조회 에러:", error);
    },
    ...options,
  });
};
