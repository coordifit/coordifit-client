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

  async getCategoryData() {
    try {
      const commonCodes = await this.getCommonCodes();

      const mainCategories = Object.values(commonCodes["B00001"].children["B10001"].children).map(
        (category) => ({
          codeId: category.codeId,
          codeName: category.codeName,
          children: category.children || {},
        }),
      );

      const subCategoriesMap = {};
      Object.values(commonCodes["B00001"].children["B10001"].children).forEach((mainCategory) => {
        if (mainCategory.children) {
          const subCategories = Object.values(mainCategory.children).map((subCategory) => ({
            codeId: subCategory.codeId,
            codeName: subCategory.codeName,
          }));

          const allSubOption = { codeId: "all", codeName: "전체" };
          subCategoriesMap[mainCategory.codeId] = [allSubOption, ...subCategories];
        } else {
          subCategoriesMap[mainCategory.codeId] = [{ codeId: "all", codeName: "전체" }];
        }
      });

      const allOption = { codeId: "all", codeName: "전체", children: {} };

      return {
        mainCategories: [allOption, ...mainCategories],
        subCategoriesMap,
      };
    } catch (error) {
      console.error("카테고리 데이터 조회 오류:", error);
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
