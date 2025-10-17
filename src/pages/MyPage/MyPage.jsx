import { useMemo, useRef, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Tabs from "@/components/Tabs/Tabs";
import BottomSheet from "@/components/BottomSheet/BottomSheet";
import userService from "@/services/userService";
import { useUserStore } from "@/stores/userStore";
import profileImage from "@/assets/images/profile.png";
import styles from "./MyPage.module.css";

const TAB_ITEMS = [
  { id: "closet", label: "코디", icon: "grid" },
  { id: "snap", label: "스냅", icon: "heart" },
];
const MyPage = () => {
  const navigate = useNavigate();
  const { userId: urlUserId } = useParams();
  const { user } = useUserStore();
  const [activeTab, setActiveTab] = useState("closet");
  const [myPageData, setMyPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [isFollowListModalOpen, setIsFollowListModalOpen] = useState(false);
  const [followListType, setFollowListType] = useState(null);
  const [followListData, setFollowListData] = useState([]);
  const [followListLoading, setFollowListLoading] = useState(false);
  const tabSectionRef = useRef(null);

  const currentUserId = urlUserId || user?.userId;
  const isMyPage = user?.userId === currentUserId;

  useEffect(() => {
    const loadMyPageData = async () => {
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

  useEffect(() => {
    const checkFollowStatus = async () => {
      if (!isMyPage && currentUserId && user?.userId) {
        try {
          const response = await userService.checkFollowing(currentUserId);
          if (response.success) {
            setIsFollowing(response.data);
          }
        } catch (err) {
          console.error("팔로우 상태 확인 실패:", err);
        }
      }
    };
    checkFollowStatus();
  }, [isMyPage, currentUserId, user?.userId]);

  const handleMetricClick = (type) => {
    if (type === "posts") {
      tabSectionRef.current?.scrollIntoView({ behavior: "smooth" });
      setActiveTab("closet");
    } else if (type === "followers") {
      openFollowListModal("followers");
    } else if (type === "followings") {
      openFollowListModal("followings");
    }
  };

  const openFollowListModal = async (type) => {
    setIsFollowListModalOpen(true);
    setFollowListType(type);
    setFollowListLoading(true);

    try {
      const response =
        type === "followers"
          ? await userService.getFollowers(currentUserId)
          : await userService.getFollowings(currentUserId);

      if (response.success) {
        setFollowListData(response.data);
      } else {
        console.error("팔로우 목록 조회 실패:", response.message);
        setFollowListData([]);
      }
    } catch (error) {
      console.error("팔로우 목록 조회 오류:", error);
      setFollowListData([]);
    } finally {
      setFollowListLoading(false);
    }
  };

  const closeFollowListModal = () => {
    setIsFollowListModalOpen(false);
    setFollowListType(null);
    setFollowListData([]);
  };

  const handleFollowToggle = async () => {
    if (followLoading || !currentUserId) return;

    setFollowLoading(true);
    try {
      const response = await userService.toggleFollow(currentUserId);
      if (response.success) {
        setIsFollowing(!isFollowing);

        const myPageResponse = await userService.getMyPageInfo(currentUserId);
        if (myPageResponse.success) {
          setMyPageData(myPageResponse.data);
        }
      } else {
        alert(response.message || "팔로우 처리에 실패했습니다.");
      }
    } catch (err) {
      console.error("팔로우 처리 실패:", err);
      alert("팔로우 처리 중 오류가 발생했습니다.");
    } finally {
      setFollowLoading(false);
    }
  };

  const handlePostClick = (postId) => {
    navigate(`/snap/${postId}`);
  };

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
              <img src={myPageData.profileImageUrl || profileImage} alt="프로필" />
            </div>
            <div className={styles.summary}>
              <h2 className={styles.nickname}>{myPageData.nickname}</h2>
              <div className={styles.metrics}>
                <button type="button" onClick={() => handleMetricClick("posts")}>
                  <strong>{myPageData.postsCount?.toLocaleString() || 0}</strong>
                  <span>게시물</span>
                </button>
                <button type="button" onClick={() => handleMetricClick("followers")}>
                  <strong>{myPageData.followersCount?.toLocaleString() || 0}</strong>
                  <span>팔로워</span>
                </button>
                <button type="button" onClick={() => handleMetricClick("followings")}>
                  <strong>{myPageData.followingsCount?.toLocaleString() || 0}</strong>
                  <span>팔로잉</span>
                </button>
              </div>
            </div>
          </div>
          {/* 버튼 컨테이너 */}
          <div className={styles["button-container"]}>
            {isMyPage ? (
              <button
                type="button"
                className={styles["edit-button"]}
                onClick={() => navigate("/profile/edit")}
              >
                프로필 수정
              </button>
            ) : (
              <button
                type="button"
                className={`${styles["follow-button"]} ${isFollowing ? styles["following"] : ""}`}
                onClick={handleFollowToggle}
                disabled={followLoading}
              >
                {followLoading ? "처리중..." : isFollowing ? "팔로잉" : "팔로우"}
              </button>
            )}
          </div>
        </div>
      </section>
      <section ref={tabSectionRef} className={styles.gallery}>
        <Tabs tabs={TAB_ITEMS} activeTab={activeTab} onChange={setActiveTab} />
        <div className={styles["image-grid"]}>
          {renderItems.map((item) => (
            <div
              key={item.id}
              className={styles["image-card"]}
              onClick={() => handlePostClick(item.id)}
              style={{ cursor: "pointer" }}
            >
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

      {isFollowListModalOpen && (
        <BottomSheet
          title={
            followListType === "followers"
              ? `팔로워 ${followListData.length}명`
              : `팔로잉 ${followListData.length}명`
          }
          onClose={closeFollowListModal}
          height="60vh"
        >
          <div className={styles.followListModalContent}>
            {followListLoading ? (
              <div className={styles.loadingFollowList}>
                <p>불러오는 중...</p>
              </div>
            ) : followListData.length > 0 ? (
              <div className={styles.followUserList}>
                {followListData.map((followUser, index) => (
                  <div
                    key={index}
                    className={styles.followUserItem}
                    onClick={() => {
                      closeFollowListModal();
                      navigate(`/mypage/${followUser.userId}`);
                    }}
                  >
                    <img
                      src={followUser.profileImageUrl || profileImage}
                      alt="프로필"
                      className={styles.followUserProfileImage}
                    />
                    <span className={styles.followUserNickname}>{followUser.nickname}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.emptyFollowList}>
                <p>아직 {followListType === "followers" ? "팔로워" : "팔로잉"}가 없습니다.</p>
              </div>
            )}
          </div>
        </BottomSheet>
      )}
    </div>
  );
};
export default MyPage;
