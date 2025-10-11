import { api } from "./axiosInstance";

class ClothesService {
  async getClothes(categoryId = null, subCategoryId = null) {
    try {
      const params = {};
      if (categoryId) params.categoryId = categoryId;
      if (subCategoryId) params.subCategoryId = subCategoryId;

      const response = await api.get("/clothes", { params });
      return response.data;
    } catch (error) {
      console.error("옷 정보 조회 오류:", error);
      throw error;
    }
  }
}

export default new ClothesService();
