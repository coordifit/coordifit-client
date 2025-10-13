import { useMemo, useRef, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Tabs from "@/components/Tabs/Tabs";
import Modal from "@/components/Modal/Modal";
import userService from "@/services/userService";
import { useUserStore } from "@/stores/userStore";
import styles from "./MyPage.module.css";

const TAB_ITEMS = [
  { id: "closet", label: "코디", icon: "grid" },
  { id: "snap", label: "스냅", icon: "heart" },
];
const MyPage = () => {
  const navigate = useNavigate();
  const { userId: urlUserId } = useParams(); // URL에서 userId 파라미터 가져오기 (다른 사용자 페이지 접근용)
  const { user } = useUserStore(); // 현재 로그인한 사용자 정보
  const [activeTab, setActiveTab] = useState("closet");
  const [modalType, setModalType] = useState(null);
  const [myPageData, setMyPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const tabSectionRef = useRef(null);

  // 현재 조회할 사용자 ID 결정 (URL 파라미터가 있으면 해당 사용자, 없으면 현재 로그인한 사용자)
  const currentUserId = urlUserId || user?.userId;

  // 마이페이지 데이터 로드
  useEffect(() => {
    const loadMyPageData = async () => {
      // 사용자 정보가 없으면 로딩 중
      if (!currentUserId) {
        setLoading(true);
        return;
      }

      try {
        setLoading(true);
        const response = await userService.getMyPageInfo(currentUserId);

        if (response.success) {
          setMyPageData(response.data);
        } else {
          setError(response.message);
        }
      } catch (err) {
        console.error("마이페이지 데이터 로드 실패:", err);
        setError("마이페이지 데이터를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    loadMyPageData();
  }, [currentUserId]);

  const openModal = (type) => {
    setModalType(type);
    // TODO: 팔로워/팔로잉 API 구현 후 데이터 로드
    console.log(`${type} 모달 열기 - 추후 구현 예정`);
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

  // 게시물 데이터 처리
  const posts = useMemo(() => {
    if (!myPageData?.posts) return [];
    return myPageData.posts.map((post) => ({
      id: post.postId,
      imageUrl: post.imageUrl || "https://via.placeholder.com/200x240",
    }));
  }, [myPageData?.posts]);

  const snaps = useMemo(() => {
    // 스냅은 현재는 코디와 동일하게 처리 (추후 별도 로직 구현 가능)
    return posts;
  }, [posts]);

  const renderItems = activeTab === "closet" ? posts : snaps;

  // 로딩 상태 처리
  if (loading) {
    return (
      <div className={styles.page}>
        <div style={{ textAlign: "center", padding: "50px" }}>
          <p>마이페이지를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 에러 상태 처리
  if (error) {
    return (
      <div className={styles.page}>
        <div style={{ textAlign: "center", padding: "50px" }}>
          <p>오류: {error}</p>
          <button onClick={() => window.location.reload()}>다시 시도</button>
        </div>
      </div>
    );
  }

  // 데이터가 없는 경우
  if (!myPageData) {
    return (
      <div className={styles.page}>
        <div style={{ textAlign: "center", padding: "50px" }}>
          <p>사용자 정보를 찾을 수 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles["profile-section-container"]}>
          <div className={styles["profile-section"]}>
            <div className={styles["profile-image"]}>
              <img
                src={myPageData.profileImageUrl || "https://i.pravatar.cc/160?img=12"}
                alt="프로필"
              />
            </div>
            <div className={styles.summary}>
              <h2 className={styles.nickname}>{myPageData.nickname}</h2>
              <div className={styles.metrics}>
                <button type="button" onClick={() => handleMetricClick("posts")}>
                  <strong>{myPageData.postsCount?.toLocaleString() || 0}</strong>
                  <span>게시물</span>
                </button>
                <button type="button" onClick={() => handleMetricClick("followers")}>
                  <strong>0</strong>
                  <span>팔로워</span>
                </button>
                <button type="button" onClick={() => handleMetricClick("followings")}>
                  <strong>0</strong>
                  <span>팔로잉</span>
                </button>
              </div>
            </div>
          </div>
          {/* 현재 로그인한 사용자의 페이지일 때만 프로필 수정 버튼 표시 */}
          {user?.userId === currentUserId && (
            <div className={styles["button-container"]}>
              <button
                type="button"
                className={styles["edit-button"]}
                onClick={() => navigate("/profile/edit")}
              >
                프로필 수정
              </button>
            </div>
          )}
        </div>
      </section>
      <section ref={tabSectionRef} className={styles.gallery}>
        <Tabs tabs={TAB_ITEMS} activeTab={activeTab} onChange={setActiveTab} />
        <div className={styles["image-grid"]}>
          {renderItems.map((item) => (
            <div key={item.id} className={styles["image-card"]}>
              <img src={item.imageUrl} alt="코디" />
            </div>
          ))}
        </div>
      </section>
      {/* 현재 로그인한 사용자의 페이지일 때만 FAB 버튼 표시 */}
      {user?.userId === currentUserId && (
        <button className={styles["fab-button"]} onClick={() => navigate("/snap/add")}>
          <span>+</span>
        </button>
      )}
      {modalType ? (
        <Modal title={modalType === "followers" ? "팔로워" : "팔로잉"} onClose={closeModal}>
          <div style={{ padding: "20px", textAlign: "center" }}>
            <p>팔로워/팔로잉 기능은 추후 구현 예정입니다.</p>
          </div>
        </Modal>
      ) : null}
    </div>
  );
};
export default MyPage;
