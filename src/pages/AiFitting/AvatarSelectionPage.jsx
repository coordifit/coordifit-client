import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import clsx from "clsx";

import styles from "./AvatarSelectionPage.module.css";
import addAvatarIcon from "@/assets/images/enrollicon.png";
import {
  selectAvatars,
  selectSelectedAvatarId,
  selectSetSelectedAvatarId,
  useAiFittingStore,
} from "./store/useAiFittingStore";

const AvatarSelectionPage = () => {
  const navigate = useNavigate();
  const avatars = useAiFittingStore(selectAvatars);
  const selectedAvatarId = useAiFittingStore(selectSelectedAvatarId);
  const setSelectedAvatarId = useAiFittingStore(selectSetSelectedAvatarId);

  const [pendingAvatarId, setPendingAvatarId] = useState(
    selectedAvatarId ?? avatars[0]?.id ?? null
  );

  const pendingAvatar = useMemo(
    () => avatars.find((avatar) => avatar.id === pendingAvatarId) ?? null,
    [avatars, pendingAvatarId]
  );

  const handleConfirm = () => {
    if (!pendingAvatarId) return;
    setSelectedAvatarId(pendingAvatarId);
    navigate("/ai-fitting");
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>아바타 선택</h1>
        <p className={styles.description}>
          나와 닮은 아바타를 선택하거나 새로 만들어보세요.
        </p>
      </header>

      <div className={styles.carousel}>
        {avatars.map((avatar) => (
          <button
            key={avatar.id}
            type="button"
            className={clsx(
              styles.avatarCard,
              pendingAvatarId === avatar.id && styles.avatarCardActive
            )}
            onClick={() => setPendingAvatarId(avatar.id)}
          >
            <img
              src={avatar.image}
              alt={avatar.name}
              className={styles.avatarImage}
            />
            <span className={styles.avatarName}>{avatar.name}</span>
          </button>
        ))}

        <button
          type="button"
          className={clsx(styles.avatarCard, styles.createAvatarCard)}
          onClick={() => navigate("/ai-fitting/avatars/new")}
        >
          <img src={addAvatarIcon} alt="" className={styles.createIcon} />
          <span className={styles.avatarName}>새 아바타 만들기</span>
        </button>
      </div>

      {pendingAvatar ? (
        <div className={styles.preview}>
          <img
            src={pendingAvatar.image}
            alt={pendingAvatar.name}
            className={styles.previewImage}
          />
          <div className={styles.previewInfo}>
            <h2 className={styles.previewName}>{pendingAvatar.name}</h2>
            <p className={styles.previewHint}>
              선택 완료를 누르면 이 아바타로 AI 피팅이 진행됩니다.
            </p>
          </div>
        </div>
      ) : (
        <p className={styles.emptyState}>선택 가능한 아바타가 없습니다.</p>
      )}

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.secondaryButton}
          onClick={() => navigate("/ai-fitting")}
        >
          취소
        </button>
        <button
          type="button"
          className={styles.primaryButton}
          onClick={handleConfirm}
          disabled={!pendingAvatarId}
        >
          선택 완료
        </button>
      </div>
    </div>
  );
};

export default AvatarSelectionPage;
