import { useState, useEffect, useRef } from "react";
import { useNavigate, useMatches } from "react-router-dom";
import Modal from "@/components/Modal/Modal";
import { useUserStore } from "@/stores/userStore";
import { TokenManager } from "@/services/axiosInstance";
import userService from "@/services/userService";
import commonCodeService from "@/services/commonCodeService";
import fileService from "@/services/fileService";
import CustomSelect from "@/components/CustomSelect/CustomSelect";
import profileImage from "@/assets/images/profile.png";
import styles from "./ProfileEditPage.module.css";

const ProfileEditPage = () => {
  const navigate = useNavigate();
  const matches = useMatches();
  const { user, logout } = useUserStore();
  const [form, setForm] = useState({
    userId: "",
    nickname: "",
    fileId: "",
    email: "",
    gender: "",
    birth: "",
  });
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [genderOptions, setGenderOptions] = useState([]);
  const [file, setFile] = useState(null);
  const [fileImage, setFileImage] = useState(null);
  const fileInputRef = useRef(null);

  const loadGenderCodes = async () => {
    const genderCodes = await commonCodeService.getCommonCodesByParentCodeId("A10002");
    setGenderOptions(genderCodes);
  };

  const handleSave = async (event) => {
    event.preventDefault();

    try {
      let fileId = null;

      // 파일이 선택된 경우 업로드
      if (file) {
        console.log("파일 업로드 시작:", file.name);
        const uploadResult = await fileService.uploadFile(file);
        fileId = uploadResult.fileId;
        console.log("파일 업로드 성공, fileId:", fileId);
      }

      const profileData = {
        nickname: form.nickname,
        genderCode: form.gender,
        birthDate: form.birth ? form.birth : null,
        fileId: fileId || form.fileId || null,
      };

      console.log("프로필 업데이트 데이터:", profileData);

      // 프로필 업데이트 및 새 토큰 받기
      const response = await userService.updateUserProfile(user.userId, profileData);

      // 로그인 응답과 동일한 형식 (ApiResponseDto)
      if (response.success && response.data) {
        const { accessToken, refreshToken } = response.data;

        // 새 토큰 저장 (ProtectedRoute에서 자동으로 loadUserFromToken 호출됨)
        TokenManager.setTokens(accessToken, refreshToken);
      }

      alert("프로필이 성공적으로 수정되었습니다.");

      navigate(-1);
    } catch (error) {
      console.error("프로필 저장 오류:", error);
      alert("프로필 저장 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    setFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      setFileImage(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleLogout = () => {
    userService.logout();
    logout();
    navigate("/login");
  };
  const openDeleteModal = () => {
    setDeleteModalOpen(true);
  };
  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
  };
  const handleDeleteAccount = async () => {
    setDeleteModalOpen(false);
    try {
      await userService.deactivateAccount(user.userId);
      logout();
      navigate("/login");
    } catch (error) {
      console.error("계정 비활성화 실패:", error);
      alert("계정 비활성화 중 오류가 발생했습니다.");
    }
  };

  useEffect(() => {
    loadGenderCodes();
  }, []);

  useEffect(() => {
    if (user) {
      setForm({
        userId: user.userId || "",
        nickname: user.nickname || "",
        fileId: user.fileId || "",
        email: user.email || "",
        gender: user.genderCode || "",
        birth: user.birthDate ? user.birthDate.split("T")[0] : "",
      });

      if (user.fileId) {
        loadUserAvatar(user.fileId);
      }
    }
    console.log("user", user);
  }, [user]);

  const loadUserAvatar = async (fileId) => {
    try {
      const fileInfo = await fileService.getFileById(fileId);
      if (fileInfo && fileInfo.s3Url) {
        setFileImage(fileInfo.s3Url);
      }
    } catch (error) {
      console.error("사용자 아바타 로드 실패:", error);
    }
  };

  return (
    <form className={styles.page} onSubmit={handleSave}>
      <div className={styles.avatarContainer}>
        <div className={styles.avatar}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className={styles.fileInput}
          />
          <img
            src={fileImage || profileImage}
            alt="프로필 미리보기"
            onClick={() => fileInputRef.current?.click()}
            className={styles.avatarImage}
          />
        </div>
        <button type="button" className={styles.saveButton} onClick={handleSave}>
          저장
        </button>
      </div>

      <div className={styles.fields}>
        <label className={styles.field}>
          <span>닉네임</span>
          <input
            type="text"
            value={form.nickname}
            onChange={(event) => handleChange("nickname", event.target.value)}
          />
        </label>
        <label className={styles.field}>
          <span>이메일</span>
          <input
            type="email"
            disabled
            value={form.email}
            onChange={(event) => handleChange("email", event.target.value)}
          />
        </label>
        <div className={styles.field}>
          <span>성별</span>
          <CustomSelect
            options={genderOptions}
            value={form.gender}
            onChange={(value) => handleChange("gender", value)}
            placeholder="성별을 선택하세요"
          />
        </div>
        <label className={styles.field}>
          <span>생년월일</span>
          <input
            type="date"
            value={form.birth}
            onChange={(event) => handleChange("birth", event.target.value)}
          />
        </label>
      </div>
      <div className={styles.actions}>
        <button type="button" onClick={handleLogout}>
          로그아웃
        </button>
        <button type="button" className={styles["text-button"]} onClick={openDeleteModal}>
          계정을 탈퇴하시겠습니까?
        </button>
      </div>
      {isDeleteModalOpen ? (
        <Modal
          title="계정을 탈퇴하시겠습니까?"
          onClose={closeDeleteModal}
          footer={
            <>
              <button type="button" onClick={closeDeleteModal}>
                취소
              </button>
              <button type="button" onClick={handleDeleteAccount}>
                탈퇴하기
              </button>
            </>
          }
        >
          <p className={styles["modal-message"]}>
            탈퇴를 진행하면 지금까지 저장된 코디 기록이 모두 삭제돼요.
          </p>
        </Modal>
      ) : null}
    </form>
  );
};
export default ProfileEditPage;
