import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "@/components/Modal/Modal";
import styles from "./ProfileEditPage.module.css";
const ProfileEditPage = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        nickname: "jipgagosipda",
        statusMessage: "오늘도 멋지게",
        email: "JANG@gmail.com",
        gender: "남성",
        birth: "",
    });
    const [isPublic, setIsPublic] = useState(true);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const handleChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };
    const handleSave = (event) => {
        event.preventDefault();
        navigate(-1);
    };
    const handleLogout = () => {
        navigate("/login");
    };
    const openDeleteModal = () => {
        setDeleteModalOpen(true);
    };
    const closeDeleteModal = () => {
        setDeleteModalOpen(false);
    };
    const handleDeleteAccount = () => {
        setDeleteModalOpen(false);
        navigate("/login");
    };
    return (
        <form className={styles.page} onSubmit={handleSave}>
            <div className={styles["top-actions"]}>
                <span className={styles.helper}>사진 변경</span>
                <button type="submit" className={styles.save}>
                    저장
                </button>
            </div>
            <div className={styles.avatar}>
                <img
                    src="https://i.pravatar.cc/180?img=12"
                    alt="프로필 미리보기"
                />
                <button type="button" className={styles["change-photo"]}>
                    사진 변경
                </button>
            </div>
            <div className={styles.fields}>
                <label className={styles.field}>
                    <span>닉네임</span>
                    <input
                        type="text"
                        value={form.nickname}
                        onChange={(event) =>
                            handleChange("nickname", event.target.value)
                        }
                    />
                </label>
                <label className={styles.field}>
                    <span>상태 메시지</span>
                    <input
                        type="text"
                        value={form.statusMessage}
                        onChange={(event) =>
                            handleChange("statusMessage", event.target.value)
                        }
                    />
                </label>
                <label className={styles.field}>
                    <span>이메일</span>
                    <input
                        type="email"
                        value={form.email}
                        onChange={(event) =>
                            handleChange("email", event.target.value)
                        }
                    />
                </label>
                <label className={styles.field}>
                    <span>성별</span>
                    <select
                        value={form.gender}
                        onChange={(event) =>
                            handleChange("gender", event.target.value)
                        }
                    >
                        <option value="남성">남성</option>
                        <option value="여성">여성</option>
                        <option value="비공개">비공개</option>
                    </select>
                </label>
                <label className={styles.field}>
                    <span>생년월일</span>
                    <input
                        type="date"
                        value={form.birth}
                        onChange={(event) =>
                            handleChange("birth", event.target.value)
                        }
                    />
                </label>
            </div>
            <div className={styles["toggle-row"]}>
                <span>프로필 공개</span>
                <label className={styles.toggle}>
                    <input
                        type="checkbox"
                        checked={isPublic}
                        onChange={(event) => setIsPublic(event.target.checked)}
                    />
                    <span className={styles.slider} />
                </label>
            </div>
            <div className={styles.actions}>
                <button type="button" onClick={handleLogout}>
                    로그아웃
                </button>
                <button
                    type="button"
                    className={styles["danger-button"]}
                    onClick={openDeleteModal}
                >
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
                        탈퇴를 진행하면 지금까지 저장된 코디 기록이 모두
                        삭제돼요.
                    </p>
                </Modal>
            ) : null}
        </form>
    );
};
export default ProfileEditPage;
