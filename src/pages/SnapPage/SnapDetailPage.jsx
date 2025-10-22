import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import postService from "../../services/postService";
import profileImage from "@/assets/images/profile.png";
import BottomSheet from "@/components/BottomSheet/BottomSheet";
import { useUserStore } from "@/stores/userStore";
import styles from "./SnapDetailPage.module.css";
import heartRed from "@/assets/images/heart.png";
import heartlike from "@/assets/images/hearticon_red.png";
import heartBlack from "@/assets/images/hearticon_black.png";
import heartGray from "@/assets/images/hearticon_gray.png";
import messageCircle from "@/assets/images/message-circle.png";
import edit from "@/assets/images/edit.png";
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
  const [isLikesModalOpen, setIsLikesModalOpen] = useState(false);
  const [likeUsers, setLikeUsers] = useState([]);
  const [loadingLikes, setLoadingLikes] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [expandedReplies, setExpandedReplies] = useState(new Set());

  useEffect(() => {
    const loadPostDetail = async () => {
      try {
        setLoading(true);

        const detailResponse = await postService.getPostDetail(postId);
        console.log("포스트 상세 응답:", detailResponse);
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

  const handleImageScroll = (e) => {
    const scrollLeft = e.target.scrollLeft;
    const imageWidth = e.target.scrollWidth / postDetail.imageUrls.length;
    const newIndex = Math.round(scrollLeft / imageWidth);
    setCurrentImageIndex(newIndex);
  };

  const handleOpenCommentModal = () => {
    setIsCommentModalOpen(true);
  };

  const handleCloseCommentModal = () => {
    setIsCommentModalOpen(false);
    setCommentContent("");
    setReplyingTo(null);
    setExpandedReplies(new Set()); // 답글 확장 상태 초기화
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
      console.log("댓글 등록 응답:", response);
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

  const handleToggleReplies = (commentId) => {
    setExpandedReplies((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
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

  const handleEditPost = (e) => {
    e.stopPropagation(); // 부모 클릭 이벤트 중단
    // 단순히 스냅 추가 페이지로 이동
    navigate("/snap/add");
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
          {/* 수정 버튼 - 내 게시물일 때만 표시 */}
          {user?.userId === postDetail.userId && (
            <button className={styles.editButton} onClick={handleEditPost}>
              수정
            </button>
          )}
        </div>
      </div>

      {/* 메인 이미지 */}
      <div className={styles.mainImageContainer}>
        {postDetail.imageUrls && postDetail.imageUrls.length > 0 ? (
          <div className={styles.imageScrollContainer}>
            <div className={styles.imageScrollWrapper} onScroll={handleImageScroll}>
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
                <span className={styles.currentImage}>{currentImageIndex + 1}</span>
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
              <img
                src={postDetail.liked ? heartlike : heartBlack}
                alt="좋아요"
                className={styles.actionIcon}
              />
            </button>

            <button className={styles.actionButton} onClick={handleOpenCommentModal}>
              <img src={messageCircle} alt="댓글" className={styles.actionIcon} />
            </button>

            {/* 수정 버튼 - 내 게시물일 때만 표시 */}
            {user?.userId === postDetail.userId && (
              <button className={styles.actionButton} onClick={handleEditPost}>
                <img src={edit} alt="수정" className={styles.actionIcon} />
              </button>
            )}
          </div>

          <div className={styles.stats}>
            <span className={styles.statItem}>
              조회수 <strong>{postDetail.viewCount || 0}</strong>개
            </span>
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
                {postDetail.comments.length > 1 ? (
                  <p>
                    <strong>{postDetail.comments.length}</strong>개 댓글 더보기
                  </p>
                ) : (
                  "댓글"
                )}
              </span>
            </div>{" "}
            {/* ✅ 첫 번째 댓글 표시 */}
            <div className={styles.commentItem} onClick={handleOpenCommentModal}>
              <img
                src={
                  postDetail.comments[0].profileImageUrl
                    ? postDetail.comments[0].profileImageUrl
                    : profileImage
                }
                alt="댓글 작성자 프로필"
                className={styles.commentUserProfile}
              />
              <div className={styles.commentTextGroup}>
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
            </div>
          </>
        )}

        {/* 댓글 입력 버튼 */}
        <button className={styles.commentInputButton} onClick={handleOpenCommentModal}>
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
                src={user?.profileImageUrl || profileImage}
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
                {postDetail.comments
                  .filter((comment) => !comment.parentId)
                  .map((comment, index) => {
                    const replies = postDetail.comments.filter(
                      (reply) => reply.parentId === comment.commentId,
                    );
                    const isExpanded = expandedReplies.has(comment.commentId);

                    return (
                      <div key={index} className={styles.commentThread}>
                        {/* 원댓글 */}
                        <div className={styles.modalCommentItem}>
                          <img
                            src={comment.profileImageUrl || profileImage}
                            alt="프로필"
                            className={styles.modalCommentProfileImage}
                            onClick={() => handleCommentUserClick(comment.userId)}
                          />

                          <div className={styles.modalCommentContent}>
                            <div className={styles.modalCommentHeader}>
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

                            <div className={styles.modalCommentText}>{comment.content}</div>

                            <div className={styles.modalCommentActions}>
                              <button
                                className={styles.modalReplyButton}
                                onClick={() => handleReplyToComment(comment)}
                              >
                                답글 달기
                              </button>
                            </div>
                          </div>

                          <div className={styles.commentLikeSection}>
                            <button
                              className={styles.commentLikeButton}
                              onClick={() => handleToggleCommentLike(comment.commentId)}
                            >
                              <img
                                src={comment.liked ? heartRed : heartGray}
                                alt="좋아요"
                                className={styles.commentLikeIcon}
                              />
                            </button>
                            <span className={styles.commentLikeCount}>
                              {comment.likeCount || 0}
                            </span>
                          </div>
                        </div>

                        {/* 답글 더보기 버튼 (펼치기만) */}
                        {replies.length > 0 && !isExpanded && (
                          <div className={styles.viewRepliesContainer}>
                            <button
                              className={styles.modalViewRepliesButton}
                              onClick={() => handleToggleReplies(comment.commentId)}
                            >
                              답글 {replies.length}개 더보기
                            </button>
                          </div>
                        )}

                        {/* 답글들 */}
                        {isExpanded && (
                          <div className={styles.repliesContainer}>
                            {replies.map((reply, replyIndex) => (
                              <div
                                key={replyIndex}
                                className={`${styles.modalCommentItem} ${styles.replyComment}`}
                              >
                                <img
                                  src={reply.profileImageUrl || profileImage}
                                  alt="프로필"
                                  className={styles.modalCommentProfileImage}
                                  onClick={() => handleCommentUserClick(reply.userId)}
                                />

                                <div className={styles.modalCommentContent}>
                                  <div className={styles.modalCommentHeader}>
                                    <span
                                      className={styles.modalCommentUser}
                                      onClick={() => handleCommentUserClick(reply.userId)}
                                    >
                                      {reply.nickname}
                                    </span>
                                    <span className={styles.modalCommentDate}>
                                      {new Date(reply.createdAt)
                                        .toLocaleDateString("ko-KR", {
                                          year: "numeric",
                                          month: "2-digit",
                                          day: "2-digit",
                                        })
                                        .replace(/\./g, ".")}
                                    </span>
                                  </div>

                                  <div className={styles.modalCommentText}>{reply.content}</div>
                                </div>

                                <div className={styles.commentLikeSection}>
                                  <button
                                    className={styles.commentLikeButton}
                                    onClick={() => handleToggleCommentLike(reply.commentId)}
                                  >
                                    <img
                                      src={reply.liked ? heartRed : heartGray}
                                      alt="좋아요"
                                      className={styles.commentLikeIcon}
                                    />
                                  </button>
                                  <span className={styles.commentLikeCount}>
                                    {reply.likeCount || 0}
                                  </span>
                                </div>
                              </div>
                            ))}

                            {/* 답글 숨기기 버튼 - 답글 이미지와 정렬 */}
                            <div className={styles.hideRepliesContainer}>
                              <button
                                className={styles.modalViewRepliesButton}
                                onClick={() => handleToggleReplies(comment.commentId)}
                              >
                                답글 숨기기
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className={styles.modalEmptyComment}>
                <p className={styles.noCommentTitle}>등록된 댓글이 없습니다.</p>
                <p className={styles.noCommentSubtitle}>가장 먼저 댓글을 남겨보세요.</p>
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
          height="75vh"
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
