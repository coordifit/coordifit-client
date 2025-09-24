import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Tabs from "@/components/Tabs/Tabs";
import Modal from "@/components/Modal/Modal";
import styles from "./MyPage.module.css";
const TAB_ITEMS = [
    { id: "closet", label: "코디" },
    { id: "snap", label: "스냅" },
];
const MyPage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("closet");
    const [modalType, setModalType] = useState(null);
    const tabSectionRef = useRef(null);
    const posts = useMemo(
        () =>
            Array.from({ length: 12 }, (_, index) => ({
                id: `closet-${index}`,
                imageUrl: `https://picsum.photos/seed/closet-${index}/200/240`,
            })),
        []
    );
    const snaps = useMemo(
        () =>
            Array.from({ length: 8 }, (_, index) => ({
                id: `snap-${index}`,
                imageUrl: `https://picsum.photos/seed/snap-${index}/200/240`,
            })),
        []
    );
    const followers = useMemo(
        () =>
            Array.from({ length: 6 }, (_, index) => ({
                id: `follower-${index}`,
                name: `팔로워 ${index + 1}`,
                username: `follower_${index + 1}`,
            })),
        []
    );
    const followings = useMemo(
        () =>
            Array.from({ length: 5 }, (_, index) => ({
                id: `following-${index}`,
                name: `팔로잉 ${index + 1}`,
                username: `following_${index + 1}`,
            })),
        []
    );
    const openModal = (type) => {
        setModalType(type);
    };
    const closeModal = () => {
        setModalType(null);
    };
    const handleMetricClick = (type) => {
        if (type === "posts") {
            tabSectionRef.current?.scrollIntoView({ behavior: "smooth" });
            setActiveTab("closet");
        } else if (type === "followers") {
            openModal("followers");
        } else if (type === "followings") {
            openModal("followings");
        }
    };
    const renderItems = activeTab === "closet" ? posts : snaps;
    const modalData =
        modalType === "followers"
            ? followers
            : modalType === "followings"
            ? followings
            : [];
    return (
        <div className={styles.page}>
            <section className={styles.hero}>
                <div className={styles["profile-image"]}>
                    <img src="https://i.pravatar.cc/160?img=12" alt="프로필" />
                </div>
                <div className={styles.summary}>
                    <h2 className={styles.nickname}>jipgagosipda</h2>
                    <p className={styles.bio}>오늘의 코디 기록하기</p>
                </div>
                <button
                    type="button"
                    className={styles["edit-button"]}
                    onClick={() => navigate("/profile/edit")}
                >
                    프로필 수정
                </button>
                <div className={styles.metrics}>
                    <button
                        type="button"
                        onClick={() => handleMetricClick("posts")}
                    >
                        <strong>200</strong>
                        <span>게시물</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => handleMetricClick("followers")}
                    >
                        <strong>1,557</strong>
                        <span>팔로워</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => handleMetricClick("followings")}
                    >
                        <strong>123</strong>
                        <span>팔로잉</span>
                    </button>
                </div>
            </section>
            <section ref={tabSectionRef} className={styles.gallery}>
                <Tabs
                    tabs={TAB_ITEMS}
                    activeTab={activeTab}
                    onChange={setActiveTab}
                />
                <div className={styles["image-grid"]}>
                    {renderItems.map((item) => (
                        <div key={item.id} className={styles["image-card"]}>
                            <img src={item.imageUrl} alt="코디" />
                        </div>
                    ))}
                </div>
            </section>
            {modalType ? (
                <Modal
                    title={modalType === "followers" ? "팔로워" : "팔로잉"}
                    onClose={closeModal}
                >
                    <ul className={styles["people-list"]}>
                        {modalData.map((person) => (
                            <li key={person.id}>
                                <div className={styles["avatar"]}>
                                    <img
                                        src={`https://i.pravatar.cc/72?u=${person.id}`}
                                        alt="아바타"
                                    />
                                </div>
                                <div>
                                    <p className={styles["person-name"]}>
                                        {person.name}
                                    </p>
                                    <span className={styles["person-username"]}>
                                        @{person.username}
                                    </span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </Modal>
            ) : null}
        </div>
    );
};
export default MyPage;
