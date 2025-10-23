import { fastApi, api } from "./axiosInstance";

const ocrService = {
  // 1단계: FastAPI로 OCR 텍스트 추출
  async extractText(imageFile) {
    try {
      const formData = new FormData();
      formData.append("file", imageFile);

      const response = await fastApi.post("/api/ocr/extract", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 60000, // 60초 타임아웃
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("OCR 텍스트 추출 실패:", error);
      return {
        success: false,
        message: error.response?.data?.detail || "OCR 분석에 실패했습니다.",
        error: error.response?.data || error.message,
      };
    }
  },

  // 2단계: Spring Boot ChatGPT API로 OCR 결과 분석
  async analyzeOcrResult(ocrResults) {
    try {
      const response = await api.post("/ocr/analysis", {
        ocrResults: ocrResults, // FastAPI에서 받은 OCR 결과를 그대로 전달
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("ChatGPT 분석 실패:", error);
      return {
        success: false,
        message: error.response?.data?.message || "ChatGPT 분석에 실패했습니다.",
        error: error.response?.data || error.message,
      };
    }
  },

  // 전체 OCR + ChatGPT 분석 통합 메서드
  async analyzeImage(imageFile) {
    try {
      // 1단계: OCR 텍스트 추출
      const ocrResult = await this.extractText(imageFile);

      if (!ocrResult.success) {
        return ocrResult;
      }

      // 2단계: ChatGPT로 상품 정보 분석
      const analysisResult = await this.analyzeOcrResult(ocrResult.data.results);

      if (!analysisResult.success) {
        return analysisResult;
      }

      return {
        success: true,
        data: {
          ocrData: ocrResult.data,
          analysisResult: analysisResult.data,
        },
      };
    } catch (error) {
      console.error("이미지 분석 실패:", error);
      return {
        success: false,
        message: error.message || "이미지 분석에 실패했습니다.",
        error: error,
      };
    }
  },
};

export default ocrService;
