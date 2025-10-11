import { api } from "./axiosInstance";

class PostService {
  async createPost(postData) {
    try {
      const response = await api.post("/posts", postData);
      return response.data;
    } catch (error) {
      console.error("게시물 등록 오류:", error);
      throw error;
    }
  }
}

export default new PostService();
