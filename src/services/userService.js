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
}

export default new UserService();
