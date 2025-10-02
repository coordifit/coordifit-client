import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, TokenManager } from "../../services/axiosInstance";
import { useUserStore } from "../../stores/userStore";
import userService from "../../services/userService";
import Modal from "../../components/Modal/Modal";

import styles from "./LoginPage.module.css";

const Login = () => {
  const navigate = useNavigate();
  const { loadUserFromToken } = useUserStore();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isActivateModalOpen, setActivateModalOpen] = useState(false);
  const [deactivatedUserId, setDeactivatedUserId] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // 에러 메시지 초기화
    if (error) setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // 입력값 검증
    if (!formData.email.trim()) {
      setError("이메일을 입력해주세요.");
      return;
    }
    if (!formData.password.trim()) {
      setError("비밀번호를 입력해주세요.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/login", {
        email: formData.email,
        password: formData.password,
      });

      if (response.data.success) {
        const { data } = response.data;

        console.log(data);
        // JWT 토큰 저장
        TokenManager.setTokens(data.accessToken, data.refreshToken);

        // 토큰에서 사용자 정보 로드하여 store에 저장
        loadUserFromToken();

        // 메인 페이지로 이동
        navigate("/main");
      } else {
        setError(response.data.message || "로그인에 실패했습니다.");
      }
    } catch (error) {
      console.error("로그인 오류:", error);

      // 비활성화된 계정인 경우
      if (error.response?.status === 403 && !error.response?.data?.data?.isActive) {
        setDeactivatedUserId(error.response.data.data.userId);
        setActivateModalOpen(true);
        setError("");
      } else if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError("로그인 처리 중 오류가 발생했습니다.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleActivateAccount = async () => {
    try {
      setIsLoading(true);
      const response = await userService.activateAccount(deactivatedUserId);
      if (response.success) {
        const { accessToken, refreshToken } = response.data;
        // JWT 토큰 저장
        TokenManager.setTokens(accessToken, refreshToken);

        // 토큰에서 사용자 정보 로드하여 store에 저장
        loadUserFromToken();

        // 모달 닫기
        setActivateModalOpen(false);

        // 메인 페이지로 이동
        navigate("/main");
      }
    } catch (error) {
      console.error("계정 활성화 오류:", error);
      setError("계정 활성화 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseActivateModal = () => {
    setActivateModalOpen(false);
    setDeactivatedUserId("");
  };

  return (
    <div className={styles.container}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h1 className={styles.logo}>CoordiFit</h1>

        {error && <div className={styles.errorMessage}>{error}</div>}

        <label className={styles.label} htmlFor="email">
          이메일 주소
        </label>
        <input
          id="email"
          name="email"
          className={styles.input}
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="예) coordifit@codifit.com"
          disabled={isLoading}
        />
        <label className={styles.label} htmlFor="password">
          비밀번호
        </label>
        <input
          id="password"
          name="password"
          className={styles.input}
          type="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="비밀번호"
          disabled={isLoading}
        />
        <button type="submit" className={styles.loginButton} disabled={isLoading}>
          {isLoading ? "로그인 중..." : "로그인"}
        </button>
        <div className={styles.links}>
          <button type="button" className={styles.linkButton} onClick={() => navigate("/signup")}>
            이메일 회원가입
          </button>
          <span className={styles.separator}>|</span>
          <button
            type="button"
            className={styles.linkButton}
            onClick={() => navigate("/password-reset")}
          >
            비밀번호 찾기
          </button>
        </div>
        <button type="button" className={styles.kakaoButton} onClick={() => navigate("/main")}>
          <span className={styles.kakaoIcon}>💬</span> 카카오로 시작하기
        </button>
      </form>

      {isActivateModalOpen && (
        <Modal
          title="계정 활성화"
          onClose={handleCloseActivateModal}
          footer={
            <>
              <button type="button" onClick={handleCloseActivateModal}>
                취소
              </button>
              <button type="button" onClick={handleActivateAccount} disabled={isLoading}>
                {isLoading ? "활성화 중..." : "활성화하기"}
              </button>
            </>
          }
        >
          <p>비활성화된 계정입니다. 계정을 다시 활성화하시겠습니까?</p>
        </Modal>
      )}
    </div>
  );
};

export default Login;
