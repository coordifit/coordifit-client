import { useNavigate } from "react-router-dom";

import styles from "./PasswordResetPage.module.css";

const PasswordReset = () => {
    const navigate = useNavigate();

    const handleSubmit = (event) => {
        event.preventDefault();
        navigate("/login");
    };

    return (
        <div className={styles.container}>
            <form className={styles.form} onSubmit={handleSubmit}>
                <h1 className={styles.title}>비밀번호 찾기</h1>
                <div className={styles.row}>
                    <div className={styles.field}>
                        <label className={styles.label} htmlFor="resetEmail">
                            이메일 주소
                        </label>
                        <input
                            id="resetEmail"
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
                        <label className={styles.label} htmlFor="resetCode">
                            인증번호
                        </label>
                        <input
                            id="resetCode"
                            className={styles.input}
                            type="text"
                        />
                    </div>
                    <button type="button" className={styles.smallButton}>
                        인증하기
                    </button>
                </div>
                <label className={styles.label} htmlFor="newPassword">
                    새 비밀번호
                </label>
                <input
                    id="newPassword"
                    className={styles.input}
                    type="password"
                />
                <label className={styles.label} htmlFor="newPasswordConfirm">
                    새 비밀번호 확인
                </label>
                <input
                    id="newPasswordConfirm"
                    className={styles.input}
                    type="password"
                />
                <button type="submit" className={styles.submitButton}>
                    비밀번호 재설정
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

export default PasswordReset;
