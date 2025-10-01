import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import clsx from "clsx";

import styles from "./AvatarSelectionPage.module.css";
import addAvatarIcon from "@/assets/images/enrollicon.png";
import { useAiFittingStore } from "@/stores/aiFittingStore.js";

const AvatarSelectionPage = () => {
  const navigate = useNavigate();
  const avatars = useAiFittingStore((state) => state.avatars);
  const isLoading = useAiFittingStore((state) => state.isLoadingAvatars);
  const avatarError = useAiFittingStore((state) => state.avatarError);
  const selectedAvatarId = useAiFittingStore((state) => state.selectedAvatarId);
  const setSelectedAvatarId = useAiFittingStore((state) => state.setSelectedAvatarId);
  const loadAvatars = useAiFittingStore((state) => state.loadAvatars);
  const removeAvatar = useAiFittingStore((state) => state.removeAvatar);
  const hasLoadedAvatars = useAiFittingStore((state) => state.hasLoadedAvatars);
  const [pendingAvatarId, setPendingAvatarId] = useState(
    selectedAvatarId ?? avatars[0]?.id ?? null,
  );
  const [deletingAvatarId, setDeletingAvatarId] = useState(null);

  useEffect(() => {
    if (!hasLoadedAvatars) {
      loadAvatars().catch(() => {
        // 에러 상태는 avatarError로 관리
      });
    }
  }, [hasLoadedAvatars, loadAvatars]);

  useEffect(() => {
    if (!pendingAvatarId && avatars[0]) {
      setPendingAvatarId(avatars[0].id);
      return;
    }

    if (pendingAvatarId && !avatars.some((avatar) => avatar.id === pendingAvatarId)) {
      setPendingAvatarId(avatars[0]?.id ?? null);
    }
  }, [avatars, pendingAvatarId]);

  const handleConfirm = () => {
    if (!pendingAvatarId) return;
    setSelectedAvatarId(pendingAvatarId);
    navigate("/ai-fitting");
  };

  const handleDelete = async (avatarId) => {
    setDeletingAvatarId(avatarId);

    try {
      await removeAvatar(avatarId);
    } catch (error) {
      console.error("Failed to delete avatar", error);
    } finally {
      setDeletingAvatarId(null);
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>아바타를 선택하세요</h1>
      </header>

      <div className={styles.carousel}>
        {isLoading && avatars.length === 0 && (
          <div className={styles.loadingState}>아바타를 불러오는 중입니다...</div>
        )}

        {!isLoading && avatarError && avatars.length === 0 && (
          <div className={styles.errorState}>아바타를 불러오지 못했습니다.</div>
        )}

        {avatars.map((avatar) => (
          <div key={avatar.id} className={styles.avatarCardWrapper}>
            <button
              type="button"
              className={clsx(
                styles.avatarCard,
                pendingAvatarId === avatar.id && styles.avatarCardActive,
              )}
              onClick={() => setPendingAvatarId(avatar.id)}
            >
              <div className={styles.avatarImageWrapper}>
                <img src={avatar.imageUrl} alt={avatar.name} className={styles.avatarImage} />
              </div>
              <span className={styles.avatarName}>{avatar.name}</span>
            </button>
            <button
              type="button"
              className={styles.deleteButton}
              onClick={() => handleDelete(avatar.id)}
              disabled={deletingAvatarId === avatar.id}
            >
              {deletingAvatarId === avatar.id ? "삭제 중..." : "삭제"}
            </button>
          </div>
        ))}

        <div className={styles.avatarCardWrapper}>
          <button
            type="button"
            className={clsx(styles.avatarCard, styles.createAvatarCard)}
            onClick={() => navigate("/ai-fitting/avatars/new")}
          >
            <div className={styles.createAvatarInner}>
              <div className={styles.createAvatarIllustration}>
                <img src={addAvatarIcon} alt="" className={styles.createIcon} />
              </div>
              <p className={styles.createAvatarDescription}>나만의 아바타를 제작해보세요</p>
              <span className={styles.createAvatarButton}>아바타 제작</span>
            </div>
            <span className={styles.avatarName}>아바타 추가</span>
          </button>
        </div>
      </div>

      <button
        type="button"
        className={styles.confirmButton}
        onClick={handleConfirm}
        disabled={!pendingAvatarId}
      >
        선택하기
      </button>
    </div>
  );
};

export default AvatarSelectionPage;
