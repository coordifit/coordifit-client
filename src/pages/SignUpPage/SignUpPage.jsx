import { useNavigate } from "react-router-dom";

import styles from "./SignUpPage.module.css";

const SignUp = () => {
    const navigate = useNavigate();

    const handleSubmit = (event) => {
        event.preventDefault();
        navigate("/login");
    };

    return (
        <div className={styles.container}>
            <form className={styles.form} onSubmit={handleSubmit}>
                <h1 className={styles.title}>회원 가입</h1>
                <div className={styles.row}>
                    <div className={styles.field}>
                        <label className={styles.label} htmlFor="signupEmail">
                            이메일 주소
                        </label>
                        <input
                            id="signupEmail"
                            className={styles.input}
                            type="email"
                            placeholder="예) coordifit@codifit.com"
                        />
                    </div>
                    <button type="button" className={styles.smallButton}>
                        인증받기
                    </button>
                </div>
                <div className={styles.row}>
                    <div className={styles.field}>
                        <label className={styles.label} htmlFor="signupCode">
                            인증번호
                        </label>
                        <input
                            id="signupCode"
                            className={styles.input}
                            type="text"
                        />
                    </div>
                    <button type="button" className={styles.smallButton}>
                        인증하기
                    </button>
                </div>
                <label className={styles.label} htmlFor="nickname">
                    닉네임
                </label>
                <input id="nickname" className={styles.input} type="text" />
                <label className={styles.label} htmlFor="signupPassword">
                    비밀번호
                </label>
                <input
                    id="signupPassword"
                    className={styles.input}
                    type="password"
                />
                <label className={styles.label} htmlFor="signupPasswordConfirm">
                    비밀번호 확인
                </label>
                <input
                    id="signupPasswordConfirm"
                    className={styles.input}
                    type="password"
                />
                <button type="submit" className={styles.submitButton}>
                    회원가입
                </button>
                <button
                    type="button"
                    className={styles.backButton}
                    onClick={() => navigate("/login")}
                >
                    로그인으로 돌아가기
                </button>
            </form>
        </div>
    );
};

export default SignUp;
