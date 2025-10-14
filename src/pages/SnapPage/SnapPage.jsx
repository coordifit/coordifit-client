import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import postService from "../../services/postService";
import styles from "./SnapPage.module.css";

const SnapPage = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 게시물 목록 로드
  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoading(true);
        const response = await postService.getAllPosts();

        if (response.success) {
          setPosts(response.data);
        } else {
          setError(response.message);
        }
      } catch (err) {
        console.error("게시물 목록 로드 실패:", err);
        setError("게시물을 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, []);

  // 게시물 클릭 처리
  const handlePostClick = (postId) => {
    navigate(`/snap/${postId}`);
  };

  // 로딩 상태 처리
  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingContainer}>
          <p>게시물을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 에러 상태 처리
  if (error) {
    return (
      <div className={styles.page}>
        <div className={styles.errorContainer}>
          <p>오류: {error}</p>
          <button onClick={() => window.location.reload()}>다시 시도</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.postList}>
        {posts.length > 0 ? (
          posts.map((post) => (
            <div
              key={post.postId}
              className={styles.postCard}
              onClick={() => handlePostClick(post.postId)}
            >
              <div className={styles.postImage}>
                <img
                  src={
                    post.imageUrl ||
                    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80"
                  }
                  alt="게시물"
                />
              </div>
            </div>
          ))
        ) : (
          <div className={styles.emptyContainer}>
            <p>등록된 게시물이 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SnapPage;
