import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import postService from "../../services/postService";
import fileService from "../../services/fileService";
import profileImage from "@/assets/images/profile.png";
import BottomSheet from "@/components/BottomSheet/BottomSheet";
import { useUserStore } from "@/stores/userStore";
import styles from "./SnapDetailPage.module.css";

const SnapDetailPage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user } = useUserStore();
  const [postDetail, setPostDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [commentContent, setCommentContent] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [currentUserProfileImage, setCurrentUserProfileImage] = useState(null);
  const [isLikesModalOpen, setIsLikesModalOpen] = useState(false);
  const [likeUsers, setLikeUsers] = useState([]);
  const [loadingLikes, setLoadingLikes] = useState(false);

  useEffect(() => {
    const loadCurrentUserProfileImage = async () => {
      if (!user?.fileId) {
        setCurrentUserProfileImage(null);
        return;
      }
      try {
        const imageUrl = await fileService.getFileUrl(user.fileId);
        setCurrentUserProfileImage(imageUrl);
      } catch (err) {
        console.error("현재 사용자 프로필 이미지 로드 실패:", err);
        setCurrentUserProfileImage(null);
      }
    };

    loadCurrentUserProfileImage();
  }, [user?.fileId]);

  useEffect(() => {
    const loadPostDetail = async () => {
      try {
        setLoading(true);

        const detailResponse = await postService.getPostDetail(postId);

        if (detailResponse.success) {
          setPostDetail(detailResponse.data);
        } else {
          setError(detailResponse.message);
        }
      } catch (err) {
        console.error("포스트 상세 로드 실패:", err);
        setError("포스트를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      loadPostDetail();
    }
  }, [postId]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleUserClick = (userId) => {
    navigate(`/mypage/${userId}`);
  };

  const handleOpenCommentModal = () => {
    setIsCommentModalOpen(true);
  };

  const handleCloseCommentModal = () => {
    setIsCommentModalOpen(false);
    setCommentContent("");
    setReplyingTo(null);
  };

  const handleSubmitComment = async () => {
    if (!commentContent.trim()) {
      alert("댓글 내용을 입력해주세요.");
      return;
    }

    try {
      setIsSubmittingComment(true);
      const parentId = replyingTo ? replyingTo.commentId : null;
      const response = await postService.createComment(postId, commentContent.trim(), parentId);

      if (response.success) {
        const commentsResponse = await postService.getComments(postId);
        if (commentsResponse.success) {
          setPostDetail((prev) => ({
            ...prev,
            comments: commentsResponse.data,
          }));
        }
        setCommentContent("");
        setReplyingTo(null);
        alert("댓글이 등록되었습니다.");
      } else {
        alert(response.message || "댓글 등록에 실패했습니다.");
      }
    } catch (err) {
      console.error("댓글 작성 실패:", err);
      alert("댓글 작성 중 오류가 발생했습니다.");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleReplyToComment = (comment) => {
    setReplyingTo(comment);
    setIsCommentModalOpen(true);
  };

  const handleCommentUserClick = (userId) => {
    navigate(`/mypage/${userId}`);
  };

  const handleOpenLikesModal = async () => {
    setIsLikesModalOpen(true);
    setLoadingLikes(true);

    try {
      const response = await postService.getPostLikes(postId);
      if (response.success) {
        setLikeUsers(response.data);
      } else {
        console.error("좋아요 목록 조회 실패:", response.message);
        setLikeUsers([]);
      }
    } catch (error) {
      console.error("좋아요 목록 조회 오류:", error);
      setLikeUsers([]);
    } finally {
      setLoadingLikes(false);
    }
  };

  const handleCloseLikesModal = () => {
    setIsLikesModalOpen(false);
    setLikeUsers([]);
  };

  const handleTogglePostLike = async () => {
    if (!postDetail) return;

    const previousState = {
      liked: postDetail.liked,
      likeCount: postDetail.likeCount,
    };

    setPostDetail((prev) => ({
      ...prev,
      liked: !prev.liked,
      likeCount: prev.liked ? prev.likeCount - 1 : prev.likeCount + 1,
    }));

    try {
      const response = await postService.togglePostLike(postId);
      if (!response.success) {
        setPostDetail((prev) => ({
          ...prev,
          liked: previousState.liked,
          likeCount: previousState.likeCount,
        }));
        alert("좋아요 처리 중 오류가 발생했습니다.");
      }
    } catch (err) {
      console.error("게시글 좋아요 처리 실패:", err);
      setPostDetail((prev) => ({
        ...prev,
        liked: previousState.liked,
        likeCount: previousState.likeCount,
      }));
      alert("좋아요 처리 중 오류가 발생했습니다.");
    }
  };

  const handleToggleCommentLike = async (commentId) => {
    const previousComments = [...postDetail.comments];

    setPostDetail((prev) => ({
      ...prev,
      comments: prev.comments.map((comment) =>
        comment.commentId === commentId
          ? {
              ...comment,
              liked: !comment.liked,
              likeCount: comment.liked ? comment.likeCount - 1 : comment.likeCount + 1,
            }
          : comment,
      ),
    }));

    try {
      const response = await postService.toggleCommentLike(commentId);
      if (!response.success) {
        setPostDetail((prev) => ({
          ...prev,
          comments: previousComments,
        }));
        alert("좋아요 처리 중 오류가 발생했습니다.");
      }
    } catch (err) {
      console.error("댓글 좋아요 처리 실패:", err);
      setPostDetail((prev) => ({
        ...prev,
        comments: previousComments,
      }));
      alert("좋아요 처리 중 오류가 발생했습니다.");
    }
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingContainer}>
          <p>포스트를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <div className={styles.errorContainer}>
          <p>오류: {error}</p>
          <button onClick={handleBack}>돌아가기</button>
        </div>
      </div>
    );
  }

  if (!postDetail) {
    return (
      <div className={styles.page}>
        <div className={styles.emptyContainer}>
          <p>포스트를 찾을 수 없습니다.</p>
          <button onClick={handleBack}>돌아가기</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* 사용자 정보 */}
      <div className={styles.userSection}>
        <div className={styles.userInfo} onClick={() => handleUserClick(postDetail.userId)}>
          <img
            src={postDetail.profileImageUrl || profileImage}
            alt="프로필"
            className={styles.profileImage}
          />
          <span className={styles.username}>{postDetail.nickname}</span>
        </div>
      </div>

      {/* 메인 이미지 */}
      <div className={styles.mainImageContainer}>
        {postDetail.imageUrls && postDetail.imageUrls.length > 0 ? (
          <div className={styles.imageScrollContainer}>
            <div className={styles.imageScrollWrapper}>
              {postDetail.imageUrls.map((imageUrl, index) => (
                <img
                  key={index}
                  src={imageUrl}
                  alt={`스냅 이미지 ${index + 1}`}
                  className={styles.scrollImage}
                />
              ))}
            </div>
            {postDetail.imageUrls.length > 1 && (
              <div className={styles.imageCounter}>
                <span className={styles.currentImage}>1</span>
                <span className={styles.imageSeparator}>/</span>
                <span className={styles.totalImages}>{postDetail.imageUrls.length}</span>
              </div>
            )}
          </div>
        ) : (
          <div className={styles.noImagePlaceholder}>
            <p>이미지가 없습니다</p>
          </div>
        )}
      </div>

      {/* 상품 정보 */}
      {postDetail.clothes && postDetail.clothes.length > 0 && (
        <div className={styles.productSection}>
          <div className={styles.productList}>
            {postDetail.clothes.map((clothes, index) => (
              <div key={index} className={styles.productItem}>
                <img
                  src={
                    clothes.imageUrl ||
                    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80"
                  }
                  alt={clothes.name}
                  className={styles.productImage}
                />
                <div className={styles.productInfo}>
                  <div className={styles.productName}>{clothes.name}</div>
                  <div className={styles.productPrice}>
                    {clothes.price ? `${clothes.price.toLocaleString()}원` : ""}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 상호작용 버튼 및 통계 */}
      <div className={styles.interactionSection}>
        <div className={styles.interactionHeader}>
          <div className={styles.actionButtons}>
            <button className={styles.actionButton} onClick={handleTogglePostLike}>
              {postDetail.liked ? "❤️" : "🤍"}
            </button>
            <button className={styles.actionButton} onClick={handleOpenCommentModal}>
              💬
            </button>
          </div>
          <div className={styles.stats}>
            <span className={styles.statItem}>조회수 {postDetail.viewCount || 0}개</span>
          </div>
        </div>
        <p className={styles.content} onClick={handleOpenLikesModal} style={{ cursor: "pointer" }}>
          좋아요 <strong>{postDetail.likeCount || 0}</strong>개
        </p>
        <p className={styles.content}>{postDetail.content}</p>
      </div>

      {/* 댓글 섹션 */}
      <div className={styles.commentSection}>
        {/* 댓글이 있을 때만 댓글 헤더와 첫 댓글 표시 */}
        {postDetail.comments && postDetail.comments.length > 0 && (
          <>
            <div className={styles.commentHeader} onClick={handleOpenCommentModal}>
              <span className={styles.commentCount}>
                {postDetail.comments.length > 1
                  ? `${postDetail.comments.length}개 댓글 더보기`
                  : "댓글"}
              </span>
            </div>
            <div className={styles.commentItem} onClick={handleOpenCommentModal}>
              <span
                className={styles.commentUser}
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenCommentModal();
                }}
              >
                {postDetail.comments[0].nickname}
              </span>
              <span className={styles.commentText}>{postDetail.comments[0].content}</span>
            </div>
          </>
        )}

        {/* 댓글 입력 버튼 */}
        <button className={styles.commentInputButton} onClick={handleOpenCommentModal}>
          <img
            src={currentUserProfileImage || profileImage}
            alt="프로필"
            className={styles.commentProfileImage}
          />
          <span className={styles.commentPlaceholder}>댓글을 남겨주세요.</span>
        </button>

        {/* 날짜 */}
        <div className={styles.postDate}>
          {new Date(postDetail.createdAt)
            .toLocaleDateString("ko-KR", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            })
            .replace(/\./g, ".")}
        </div>
      </div>

      {/* 댓글 작성 바텀시트 */}
      {isCommentModalOpen && (
        <BottomSheet
          title="댓글"
          onClose={handleCloseCommentModal}
          height="70vh"
          footer={
            <div className={styles.modalInputContainer}>
              <img
                src={currentUserProfileImage || profileImage}
                alt="프로필"
                className={styles.modalInputProfileImage}
              />
              <input
                type="text"
                placeholder={
                  replyingTo
                    ? `${replyingTo.nickname}님에게 답글 남기는 중...`
                    : "댓글을 입력하세요."
                }
                className={styles.modalInputField}
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                disabled={isSubmittingComment}
              />
              {replyingTo && (
                <button
                  className={styles.cancelReplyButton}
                  onClick={() => setReplyingTo(null)}
                  title="답글 취소"
                >
                  ✕
                </button>
              )}
              <button
                className={styles.modalSendButton}
                onClick={handleSubmitComment}
                disabled={isSubmittingComment || !commentContent.trim()}
              >
                ↑
              </button>
            </div>
          }
        >
          <div className={styles.commentModalContent}>
            {/* 댓글이 있을 때만 표시 */}
            {postDetail.comments && postDetail.comments.length > 0 ? (
              <div className={styles.modalCommentList}>
                {postDetail.comments.map((comment, index) => (
                  <div
                    key={index}
                    className={`${styles.modalCommentItem} ${comment.parentId ? styles.replyComment : ""}`}
                  >
                    <div className={styles.modalCommentHeader}>
                      <div className={styles.modalCommentUserInfo}>
                        <img
                          src={comment.profileImageUrl || profileImage}
                          alt="프로필"
                          className={styles.modalCommentProfileImage}
                          onClick={() => handleCommentUserClick(comment.userId)}
                        />
                        <span
                          className={styles.modalCommentUser}
                          onClick={() => handleCommentUserClick(comment.userId)}
                        >
                          {comment.nickname}
                        </span>
                        <span className={styles.modalCommentDate}>
                          {new Date(comment.createdAt)
                            .toLocaleDateString("ko-KR", {
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                            })
                            .replace(/\./g, ".")}
                        </span>
                      </div>
                      <button
                        className={styles.modalLikeButton}
                        onClick={() => handleToggleCommentLike(comment.commentId)}
                      >
                        {comment.liked ? "❤️" : "🤍"} {comment.likeCount || 0}
                      </button>
                    </div>
                    <div className={styles.modalCommentText}>{comment.content}</div>
                    <div className={styles.modalCommentActions}>
                      {!comment.parentId && (
                        <button
                          className={styles.modalReplyButton}
                          onClick={() => handleReplyToComment(comment)}
                        >
                          답글 달기
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.modalEmptyComment}>
                등록된 댓글이 없습니다. 가장 먼저 댓글을 남겨보세요.
              </div>
            )}
          </div>
        </BottomSheet>
      )}

      {/* 좋아요 목록 바텀시트 */}
      {isLikesModalOpen && (
        <BottomSheet
          title={`좋아요 ${likeUsers.length}명`}
          onClose={handleCloseLikesModal}
          height="50vh"
        >
          <div className={styles.likesModalContent}>
            {loadingLikes ? (
              <div className={styles.loadingLikes}>
                <p>불러오는 중...</p>
              </div>
            ) : likeUsers.length > 0 ? (
              <div className={styles.likeUserList}>
                {likeUsers.map((likeUser, index) => (
                  <div
                    key={index}
                    className={styles.likeUserItem}
                    onClick={() => {
                      handleCloseLikesModal();
                      navigate(`/mypage/${likeUser.userId}`);
                    }}
                  >
                    <img
                      src={likeUser.profileImageUrl || profileImage}
                      alt="프로필"
                      className={styles.likeUserProfileImage}
                    />
                    <span className={styles.likeUserNickname}>{likeUser.nickname}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.emptyLikes}>
                <p>아직 좋아요가 없습니다.</p>
              </div>
            )}
          </div>
        </BottomSheet>
      )}
    </div>
  );
};

export default SnapDetailPage;
