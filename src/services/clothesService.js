import { api } from "./axiosInstance";

class ClothesService {
  // 1️⃣ 카테고리별 조회
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

  // 2️⃣ 내 옷 전체 목록 (JWT 기반)
  async getMyClothes() {
    try {
      const res = await api.get("/clothes/me");
      return res.data?.data || [];
    } catch (error) {
      console.error("❌ 내 옷 전체 조회 실패:", error);
      throw error;
    }
  }

  // 3️⃣ 옷 상세 조회
  async getClothesDetail(clothesId) {
    if (!clothesId) throw new Error("clothesId는 필수입니다.");
    try {
      const res = await api.get(`/clothes/${clothesId}`);
      return res.data?.data || null;
    } catch (error) {
      console.error(`❌ 옷 상세 조회 실패 (${clothesId})`, error);
      throw error;
    }
  }

  // 4️⃣ 옷 등록 (Base64 단건)
  async createClothes(item) {
    try {
      const res = await api.post("/clothes/base64", item);
      return res.data;
    } catch (error) {
      console.error("❌ 옷 등록 실패:", error);
      throw error;
    }
  }

  // 5️⃣ 옷 일괄 등록 (Base64 여러 벌)
  async createClothesBulk(items) {
    if (!Array.isArray(items) || items.length === 0)
      throw new Error("등록할 옷 목록이 비어 있습니다.");
    try {
      const res = await api.post("/clothes/base64/bulk", { items });
      return res.data;
    } catch (error) {
      console.error("❌ 옷 일괄 등록 실패:", error);
      throw error;
    }
  }

  // 6️⃣ 옷 수정 (Base64)
  async updateClothes(clothesId, item) {
    if (!clothesId) throw new Error("clothesId는 필수입니다.");
    try {
      const res = await api.put(`/clothes/${clothesId}/base64`, item);
      return res.data;
    } catch (error) {
      console.error(`❌ 옷 수정 실패 (${clothesId}):`, error);
      throw error;
    }
  }

  // 7️⃣ 옷 삭제 (단건)
  async deleteClothes(clothesId) {
    if (!clothesId) throw new Error("clothesId는 필수입니다.");
    try {
      const res = await api.delete(`/clothes/${clothesId}`);
      return res.data;
    } catch (error) {
      console.error(`❌ 옷 삭제 실패 (${clothesId}):`, error);
      throw error;
    }
  }

  // 8️⃣ 옷 일괄 삭제
  async deleteClothesBulk(clothesIds) {
    if (!Array.isArray(clothesIds) || clothesIds.length === 0)
      throw new Error("삭제할 clothesIds가 비어 있습니다.");
    try {
      const res = await api.delete("/clothes/bulk", { data: clothesIds });
      return res.data;
    } catch (error) {
      console.error("❌ 옷 일괄 삭제 실패:", error);
      throw error;
    }
  }

  // 9️⃣ 옷 이미지 목록 조회
  async getClothesImages(clothesId) {
    if (!clothesId) throw new Error("clothesId는 필수입니다.");
    try {
      const res = await api.get(`/clothes/${clothesId}/images`);
      return res.data?.data || [];
    } catch (error) {
      console.error(`❌ 옷 이미지 목록 조회 실패 (${clothesId}):`, error);
      throw error;
    }
  }

  // 🔟 전체 조회 (필터/정렬/페이징)
  async getAllClothes({
    categoryCode,
    sort = "purchaseDate",
    dir = "desc",
    page = 0,
    size = 20,
  } = {}) {
    try {
      const params = { categoryCode, sort, dir, page, size };
      const res = await api.get("/clothes", { params });
      return res.data?.data || {};
    } catch (error) {
      console.error("❌ 옷 전체 조회 실패:", error);
      throw error;
    }
  }
}

// ✅ 공용 export (기존 코드 영향 없음)
export default new ClothesService();
