import { api } from "./axiosInstance";

class PostService {
  async getAllPosts() {
    try {
      const response = await api.get("/posts");
      return response.data;
    } catch (error) {
      console.error("게시물 목록 조회 오류:", error);
      throw error;
    }
  }

  async createPost(postData) {
    try {
      const response = await api.post("/posts", postData);
      return response.data;
    } catch (error) {
      console.error("게시물 등록 오류:", error);
      throw error;
    }
  }

  async getPostDetail(postId) {
    try {
      const response = await api.get(`/posts/${postId}`);
      return response.data;
    } catch (error) {
      console.error("게시물 상세 조회 오류:", error);
      throw error;
    }
  }

  async incrementViewCount(postId) {
    try {
      const response = await api.post(`/posts/${postId}/view`);
      return response.data;
    } catch (error) {
      console.error("조회수 증가 오류:", error);
      throw error;
    }
  }
}

export default new PostService();
