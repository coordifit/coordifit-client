import { api } from "./axiosInstance";

// ✅ 임시 유저 ID (로그인 연동 전까지 사용)
const TEMP_USER_ID = "U000002";

/**
 * 아바타 목록 조회
 */
export const fetchAvatars = async () => {
  try {
    const { data } = await api.get("/avatars", {
      headers: { "X-User-Id": TEMP_USER_ID },
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
      headers: {
        "X-User-Id": "U000002", // 임시 유저 ID
        // ⚠️ Content-Type은 axios가 자동으로 넣게 둔다
      },
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
      headers: { "X-User-Id": TEMP_USER_ID },
    });
    console.log("✅ deleteAvatar 성공:", avatarId);
    return data;
  } catch (error) {
    console.error("❌ deleteAvatar Error:", error.response?.data || error.message);
    throw error;
  }
};
