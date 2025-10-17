import { api } from "./axiosInstance";

class FileService {
  async uploadFile(file) {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await api.post("/files", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const result = response.data;
      console.log("파일 업로드 성공:", result);
      return result;
    } catch (error) {
      console.error("파일 업로드 실패:", error);
      throw new Error("파일 업로드 중 오류가 발생했습니다.");
    }
  }

  async getFiles() {
    try {
      const response = await api.get("/files");
      return response.data;
    } catch (error) {
      console.error("파일 리스트 조회 실패:", error);
      return [];
    }
  }

  async getFileUrl(fileId) {
    const fileData = await this.getFileById(fileId);
    return fileData ? fileData.s3Url : null;
  }

  async getFileById(fileId) {
    if (!fileId) return null;

    try {
      const response = await api.get(`/files/${fileId}`);
      return response.data;
    } catch (error) {
      console.error("파일 조회 오류:", error);
      return null;
    }
  }
}

export default new FileService();
