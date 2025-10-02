import { api } from "./axiosInstance";

import { useUserStore } from "@/stores/userStore.js";

const resolveUserId = () => {
  const store = useUserStore.getState();
  if (!store.user) {
    const didLoad = store.loadUserFromToken?.();
    if (!didLoad) return null;
  }

  return useUserStore.getState().user?.userId ?? null;
};

const buildUserHeaders = () => {
  const userId = resolveUserId();

  if (!userId) {
    throw new Error("사용자 정보를 확인할 수 없습니다. 다시 로그인해주세요.");
  }

  return { "X-User-Id": userId };
};

/**
 * 아바타 목록 조회
 */
export const fetchAvatars = async () => {
  try {
    const { data } = await api.get("/avatars", {
      headers: buildUserHeaders(),
    });
    return data;
  } catch (error) {
    console.error("❌ fetchAvatars Error:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * 아바타 생성
 */
export const createAvatar = async ({ avatarFile, avatarName }) => {
  try {
    const formData = new FormData();
    formData.append("avatar", avatarFile); // ✅ 반드시 avatar 키
    if (avatarName) {
      formData.append("avatarName", avatarName);
    }

    const { data } = await api.post("/avatars", formData, {
      headers: buildUserHeaders(),
    });

    console.log("✅ createAvatar 성공:", data);
    return data;
  } catch (error) {
    console.error("❌ createAvatar Error:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * 아바타 삭제
 */
export const deleteAvatar = async (avatarId) => {
  try {
    const { data } = await api.delete(`/avatars/${avatarId}`, {
      headers: buildUserHeaders(),
    });
    console.log("✅ deleteAvatar 성공:", avatarId);
    return data;
  } catch (error) {
    console.error("❌ deleteAvatar Error:", error.response?.data || error.message);
    throw error;
  }
};
