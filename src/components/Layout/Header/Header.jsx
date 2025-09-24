import { useLocation, useNavigate } from "react-router-dom";
import { MdArrowBack } from "react-icons/md";
import styles from "./Header.module.css";
const TITLES = {
    "/": "홈",
    "/calendar": "코디 캘린더",
    "/snap": "스냅",
    "/closet": "내 옷장",
    "/images": "스냅 갤러리",
    "/mypage": "마이페이지",
    "/profile/edit": "프로필 수정",
};
const ROOT_ROUTES = new Set([
    "/",
    "/calendar",
    "/snap",
    "/closet",
    "/images",
    "/mypage",
]);
const Header = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const title = TITLES[location.pathname] ?? "CoordiFit";
    const showBackButton = !ROOT_ROUTES.has(location.pathname);
    return (
        <header className={styles.header}>
            {showBackButton ? (
                <button
                    type="button"
                    className={styles["back-button"]}
                    onClick={() => navigate(-1)}
                    aria-label="이전으로"
                >
                    <MdArrowBack size={24} />
                </button>
            ) : (
                <div className={styles.placeholder} />
            )}
            <h1 className={styles.title}>{title}</h1>
            <div className={styles.placeholder} />
        </header>
    );
};
export default Header;
