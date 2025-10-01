import { api } from "./axiosInstance";

export const fetchAvatars = (userId) =>
  api.get("/api/avatars", {
    params: userId ? { userId } : {},
  });

export const createAvatar = (payload) => api.post("/api/avatars", payload);

export const deleteAvatar = (avatarId) => api.delete(`/api/avatars/${avatarId}`);
