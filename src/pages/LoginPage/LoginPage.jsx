import { useNavigate } from "react-router-dom";

import styles from "./LoginPage.module.css";

const Login = () => {
    const navigate = useNavigate();

    const handleSubmit = (event) => {
        event.preventDefault();
        navigate("/main");
    };

    return (
        <div className={styles.container}>
            <form className={styles.form} onSubmit={handleSubmit}>
                <h1 className={styles.logo}>CoordiFit</h1>
                <label className={styles.label} htmlFor="email">
                    이메일 주소
                </label>
                <input
                    id="email"
                    className={styles.input}
                    type="email"
                    placeholder="예) coordifit@codifit.com"
                />
                <label className={styles.label} htmlFor="password">
                    비밀번호
                </label>
                <input
                    id="password"
                    className={styles.input}
                    type="password"
                    placeholder="비밀번호"
                />
                <button type="submit" className={styles.loginButton}>
                    로그인
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
