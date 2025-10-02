import { api } from "./axiosInstance";

class CommonCodeService {
  async getCommonCodes() {
    try {
      const response = await api.get("/common-codes");
      return response.data;
    } catch (error) {
      console.error("공통코드 조회 오류:", error);
      throw error;
    }
  }

  async getCommonCodesByParentCodeId(parentCodeId) {
    try {
      const response = await api.get(`/common-codes/${parentCodeId}`);
      return response.data;
    } catch (error) {
      console.error("공통코드 조회 오류:", error);
      throw error;
    }
  }
}

export default new CommonCodeService();
