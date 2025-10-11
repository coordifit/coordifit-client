import { api } from "./axiosInstance";

class UserService {
  async updateUserProfile(userId, profileData) {
    try {
      const response = await api.put(`/user/${userId}`, profileData);
      return response.data;
    } catch (error) {
      console.error("프로필 업데이트 오류:", error);
      throw error;
    }
  }

  async logout() {
    try {
      const response = await api.post("/auth/logout");
      return response.data;
    } catch (error) {
      console.error("로그아웃 오류:", error);
      throw error;
    }
  }

  async deactivateAccount(userId) {
    try {
      const response = await api.delete(`/user/${userId}?isActive=N`);
      return response.data;
    } catch (error) {
      console.error("계정 비활성화 오류:", error);
      throw error;
    }
  }

  async activateAccount(userId) {
    try {
      const response = await api.delete(`/user/${userId}?isActive=Y`);
      return response.data;
    } catch (error) {
      console.error("계정 활성화 오류:", error);
      throw error;
    }
  }

  async getMyPageInfo(userId) {
    try {
      const response = await api.get(`/mypage/${userId}`);
      return response.data;
    } catch (error) {
      console.error("마이페이지 정보 조회 오류:", error);
      throw error;
    }
  }
}

export default new UserService();
