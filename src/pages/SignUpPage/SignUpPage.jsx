import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./SignUpPage.module.css";

const SignUp = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        verificationCode: "",
        nickname: "",
        password: "",
        passwordConfirm: ""
    });
    
    const [validation, setValidation] = useState({
        email: false,
        emailVerified: false,
        password: false,
        passwordConfirm: false,
        nickname: false
    });
    
    const [isLoading, setIsLoading] = useState(false);
    const [verificationTimer, setVerificationTimer] = useState(0);
    const [sentVerificationCode, setSentVerificationCode] = useState("");
    const [messages, setMessages] = useState({});

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePassword = (password) => {
        const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return passwordRegex.test(password);
    };

    const validateNickname = (nickname) => {
        return nickname.length >= 2 && nickname.length <= 50;
    };

    const checkEmailDuplicate = async (email) => {
        if (!email) {
            setMessages(prev => ({ ...prev, email: '이메일을 입력해주세요.' }));
            setValidation(prev => ({ ...prev, email: false }));
            return;
        }
        
        if (!validateEmail(email)) {
            setMessages(prev => ({ ...prev, email: '올바른 이메일 형식이 아닙니다.' }));
            setValidation(prev => ({ ...prev, email: false }));
            return;
        }
        
        try {
            const response = await fetch(`http://localhost:8080/api/auth/check-email?email=${encodeURIComponent(email)}`);
            const result = await response.json();
            if (result.success && result.data) {
                setMessages(prev => ({ ...prev, email: '사용 가능한 이메일입니다.' }));
                setValidation(prev => ({ ...prev, email: true }));
            } else {
                setMessages(prev => ({ ...prev, email: '이미 사용 중인 이메일입니다.' }));
                setValidation(prev => ({ ...prev, email: false }));
            }
        } catch (error) {
            setMessages(prev => ({ ...prev, email: '이메일 중복 검사 중 오류가 발생했습니다.' }));
            setValidation(prev => ({ ...prev, email: false }));
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        
        if (field === 'email') {
            const isValid = validateEmail(value);
            setValidation(prev => ({ ...prev, email: isValid }));
            setMessages(prev => ({ 
                ...prev, 
                email: isValid ? '이메일 중복 확인이 필요합니다.' : '올바른 이메일 형식을 입력해주세요.' 
            }));
        } else if (field === 'password') {
            const isValid = validatePassword(value);
            setValidation(prev => ({ ...prev, password: isValid }));
            setMessages(prev => ({ 
                ...prev, 
                password: isValid ? '사용 가능한 비밀번호입니다.' : '영문, 숫자, 특수문자를 포함하여 8자 이상 입력해주세요.' 
            }));
            
            if (formData.passwordConfirm) {
                const isConfirmValid = value === formData.passwordConfirm;
                setValidation(prev => ({ ...prev, passwordConfirm: isConfirmValid }));
                setMessages(prev => ({ 
                    ...prev, 
                    passwordConfirm: isConfirmValid ? '비밀번호가 일치합니다.' : '비밀번호가 일치하지 않습니다.' 
                }));
            }
        } else if (field === 'passwordConfirm') {
            const isValid = value === formData.password;
            setValidation(prev => ({ ...prev, passwordConfirm: isValid }));
            setMessages(prev => ({ 
                ...prev, 
                passwordConfirm: isValid ? '비밀번호가 일치합니다.' : '비밀번호가 일치하지 않습니다.' 
            }));
        } else if (field === 'nickname') {
            const isValid = validateNickname(value);
            setValidation(prev => ({ ...prev, nickname: isValid }));
            setMessages(prev => ({ 
                ...prev, 
                nickname: isValid ? '닉네임 중복 확인이 필요합니다.' : '2자 이상 50자 이하로 입력해주세요.' 
            }));
        } else if (field === 'verificationCode') {
            const isValid = value.length === 6;
            setValidation(prev => ({ ...prev, emailVerified: isValid }));
            setMessages(prev => ({ 
                ...prev, 
                verification: isValid ? '인증 코드가 입력되었습니다.' : '6자리 인증 코드를 입력해주세요.' 
            }));
        }
    };

    useEffect(() => {
        let interval = null;
        if (verificationTimer > 0) {
            interval = setInterval(() => {
                setVerificationTimer(timer => timer - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [verificationTimer]);

    const sendVerification = async () => {
        if (!validation.email) {
            alert('유효한 이메일을 먼저 입력해주세요.');
            return;
        }
        
        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:8080/api/auth/send-verification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email })
            });
            const result = await response.json();
            if (result.success) {
                setSentVerificationCode(result.data);
                setVerificationTimer(600);
                alert('인증 코드가 발송되었습니다.');
            } else {
                alert(result.message);
            }
        } catch (error) {
            alert('인증 코드 발송 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    const verifyCode = () => {
        if (!formData.verificationCode || formData.verificationCode.length !== 6) {
            setMessages(prev => ({ ...prev, verification: '6자리 인증 코드를 입력해주세요.' }));
            setValidation(prev => ({ ...prev, emailVerified: false }));
            return;
        }
        
        if (!sentVerificationCode) {
            setMessages(prev => ({ ...prev, verification: '먼저 인증 코드를 발송해주세요.' }));
            setValidation(prev => ({ ...prev, emailVerified: false }));
            return;
        }
        
        if (formData.verificationCode === sentVerificationCode) {
            setValidation(prev => ({ ...prev, emailVerified: true }));
            setMessages(prev => ({ ...prev, verification: '이메일 인증이 완료되었습니다.' }));
            setVerificationTimer(0);
        } else {
            setMessages(prev => ({ ...prev, verification: '인증 코드가 올바르지 않습니다.' }));
            setValidation(prev => ({ ...prev, emailVerified: false }));
        }
    };

    const checkNicknameDuplicate = async (nickname) => {
        if (!nickname) {
            setMessages(prev => ({ ...prev, nickname: '닉네임을 입력해주세요.' }));
            setValidation(prev => ({ ...prev, nickname: false }));
            return;
        }
        
        if (!validateNickname(nickname)) {
            setMessages(prev => ({ ...prev, nickname: '2자 이상 50자 이하로 입력해주세요.' }));
            setValidation(prev => ({ ...prev, nickname: false }));
            return;
        }
        
        try {
            const response = await fetch(`http://localhost:8080/api/auth/check-nickname?nickname=${encodeURIComponent(nickname)}`);
            const result = await response.json();
            
            if (result.success && result.data) {
                setMessages(prev => ({ ...prev, nickname: '사용 가능한 닉네임입니다.' }));
                setValidation(prev => ({ ...prev, nickname: true }));
            } else {
                setMessages(prev => ({ ...prev, nickname: '이미 사용 중인 닉네임입니다.' }));
                setValidation(prev => ({ ...prev, nickname: false }));
            }
        } catch (error) {
            setMessages(prev => ({ ...prev, nickname: '닉네임 중복 확인 중 오류가 발생했습니다.' }));
            setValidation(prev => ({ ...prev, nickname: false }));
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        
        if (!Object.values(validation).every(value => value)) {
            alert('모든 필수 항목을 확인해주세요.');
            return;
        }
        
        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:8080/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const result = await response.json();
            
            if (result.success) {
                alert('회원가입이 완료되었습니다!');
                navigate("/login");
            } else {
                alert(result.message || '회원가입에 실패했습니다.');
            }
        } catch (error) {
            alert('회원가입 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <form className={styles.form} onSubmit={handleSubmit}>
                <h1 className={styles.title}>회원 가입</h1>
                <div className={styles.fieldGroup}>
                    <label className={styles.label} htmlFor="signupEmail">
                        이메일 주소
                    </label>
                    <div className={styles.row}>
                        <input
                            id="signupEmail"
                            className={styles.input}
                            type="email"
                            placeholder="예) coordifit@codifit.com"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            onBlur={() => checkEmailDuplicate(formData.email)}
                        />
                        <button 
                            type="button" 
                            className={styles.smallButton} 
                            onClick={sendVerification}
                            disabled={!validation.email || isLoading}
                        >
                            {isLoading ? '발송 중...' : '인증받기'}
                        </button>
                    </div>
                    {messages.email && (
                        <div className={`${styles.validationMessage} ${validation.email ? styles.success : styles.error}`}>
                            {messages.email}
                        </div>
                    )}
                </div>
                <div className={styles.fieldGroup}>
                    <label className={styles.label} htmlFor="signupCode">
                        인증번호
                    </label>
                    <input
                        id="signupCode"
                        className={styles.input}
                        type="text"
                    placeholder="6자리 인증 코드"
                    maxLength="6"
                    value={formData.verificationCode}
                    onChange={(e) => handleInputChange('verificationCode', e.target.value)}
                    onBlur={verifyCode}
                    />
                    {messages.verification && (
                        <div className={`${styles.validationMessage} ${validation.emailVerified ? styles.success : styles.error}`}>
                            {messages.verification}
                        </div>
                    )}
                    {verificationTimer > 0 && (
                        <div className={styles.timer}>
                            {Math.floor(verificationTimer / 60)}:{(verificationTimer % 60).toString().padStart(2, '0')} 남음
                    </div>
                    )}
                </div>
                <div className={styles.fieldGroup}>
                    <label className={styles.label} htmlFor="nickname">
                        닉네임
                    </label>
                    <input 
                        id="nickname" 
                        className={styles.input} 
                        type="text" 
                        placeholder="2자 이상 50자 이하"
                        value={formData.nickname}
                        onChange={(e) => handleInputChange('nickname', e.target.value)}
                        onBlur={() => checkNicknameDuplicate(formData.nickname)}
                    />
                    {messages.nickname && (
                        <div className={`${styles.validationMessage} ${validation.nickname ? styles.success : styles.error}`}>
                            {messages.nickname}
                        </div>
                    )}
                </div>
                <div className={styles.fieldGroup}>
                    <label className={styles.label} htmlFor="signupPassword">
                        비밀번호
                    </label>
                    <input
                        id="signupPassword"
                        className={styles.input}
                        type="password"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                    />
                    {messages.password && (
                        <div className={`${styles.validationMessage} ${validation.password ? styles.success : styles.error}`}>
                            {messages.password}
                        </div>
                    )}
                </div>
                <div className={styles.fieldGroup}>
                    <label className={styles.label} htmlFor="signupPasswordConfirm">
                        비밀번호 확인
                    </label>
                    <input
                        id="signupPasswordConfirm"
                        className={styles.input}
                        type="password"
                        value={formData.passwordConfirm}
                        onChange={(e) => handleInputChange('passwordConfirm', e.target.value)}
                    />
                    {messages.passwordConfirm && (
                        <div className={`${styles.validationMessage} ${validation.passwordConfirm ? styles.success : styles.error}`}>
                            {messages.passwordConfirm}
                        </div>
                    )}
                </div>
                <button 
                    type="submit" 
                    className={styles.submitButton}
                    disabled={!Object.values(validation).every(value => value) || isLoading}
                >
                    {isLoading ? '회원가입 중...' : '회원가입'}
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
