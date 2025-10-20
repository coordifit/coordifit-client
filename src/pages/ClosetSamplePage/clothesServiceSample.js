import { api } from "../../services/axiosInstance";

class ClothesServiceSample {
  async createClothes(clothesData) {
    try {
      const formData = new FormData();

      if (clothesData.name) formData.append("name", clothesData.name);
      if (clothesData.brand) formData.append("brand", clothesData.brand);
      if (clothesData.categoryCode) formData.append("categoryCode", clothesData.categoryCode);
      if (clothesData.clothesSize) formData.append("clothesSize", clothesData.clothesSize);
      if (clothesData.price) formData.append("price", clothesData.price);
      if (clothesData.purchaseDate) formData.append("purchaseDate", clothesData.purchaseDate);
      if (clothesData.purchaseUrl) formData.append("purchaseUrl", clothesData.purchaseUrl);
      if (clothesData.description) formData.append("description", clothesData.description);

      if (clothesData.files && clothesData.files.length > 0) {
        clothesData.files.forEach((file) => {
          formData.append("files", file);
        });
      }

      console.log("옷 등록 FormData 항목:", Array.from(formData.entries()));

      const response = await api.post("/clothes/sample", formData);
      return response.data;
    } catch (error) {
      console.error("옷 등록 오류:", error);
      throw error;
    }
  }

  async getUserClothes() {
    try {
      const response = await api.get("/clothes/sample");
      return response.data;
    } catch (error) {
      console.error("옷 목록 조회 오류:", error);
      throw error;
    }
  }

  async getClothesDetail(clothesId) {
    try {
      const response = await api.get(`/clothes/sample/${clothesId}`);
      return response.data;
    } catch (error) {
      console.error("옷 상세 조회 오류:", error);
      throw error;
    }
  }
}

export default new ClothesServiceSample();
