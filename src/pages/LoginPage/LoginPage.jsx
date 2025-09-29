import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, TokenManager } from "../../services/axiosInstance";

import styles from "./LoginPage.module.css";

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
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
            const response = await api.post('/auth/login', {
                email: formData.email,
                password: formData.password
            });

            if (response.data.success) {
                const { data } = response.data;
                
                console.log(data);
                // JWT 토큰 저장
                TokenManager.setTokens(data.accessToken, data.refreshToken);
                
                // 메인 페이지로 이동
                navigate("/main");
            } else {
                setError(response.data.message || "로그인에 실패했습니다.");
            }
        } catch (error) {
            console.error("로그인 오류:", error);
            if (error.response?.data?.message) {
                setError(error.response.data.message);
            } else {
                setError("로그인 처리 중 오류가 발생했습니다.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <form className={styles.form} onSubmit={handleSubmit}>
                <h1 className={styles.logo}>CoordiFit</h1>
                
                {error && (
                    <div className={styles.errorMessage}>
                        {error}
                    </div>
                )}
                
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
                <button 
                    type="submit" 
                    className={styles.loginButton}
                    disabled={isLoading}
                >
                    {isLoading ? "로그인 중..." : "로그인"}
                </button>
                <div className={styles.links}>
                    <button
                        type="button"
                        className={styles.linkButton}
                        onClick={() => navigate("/signup")}
                    >
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
                <button
                    type="button"
                    className={styles.kakaoButton}
                    onClick={() => navigate("/main")}
                >
                    <span className={styles.kakaoIcon}>💬</span> 카카오로
                    시작하기
                </button>
            </form>
        </div>
    );
};

export default Login;
