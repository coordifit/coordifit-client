import { api } from "@/shared/api/axiosInstance";

export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await api.post("/images", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
};
