import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';

import styles from './AvatarSelectionPage.module.css';
import addAvatarIcon from '@/assets/images/enrollicon.png';
import {
  selectAvatars,
  selectSelectedAvatarId,
  selectSetSelectedAvatarId,
  useAiFittingStore,
} from '@/stores/aiFittingStore.js';

const AvatarSelectionPage = () => {
  const navigate = useNavigate();
  const avatars = useAiFittingStore(selectAvatars);
  const selectedAvatarId = useAiFittingStore(selectSelectedAvatarId);
  const setSelectedAvatarId = useAiFittingStore(selectSetSelectedAvatarId);

  const [pendingAvatarId, setPendingAvatarId] = useState(
    selectedAvatarId ?? avatars[0]?.id ?? null,
  );

  const handleConfirm = () => {
    if (!pendingAvatarId) return;
    setSelectedAvatarId(pendingAvatarId);
    navigate('/ai-fitting');
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>아바타를 선택하세요</h1>
      </header>

      <div className={styles.carousel}>
        {avatars.map((avatar) => (
          <button
            key={avatar.id}
            type="button"
            className={clsx(
              styles.avatarCard,
              pendingAvatarId === avatar.id && styles.avatarCardActive,
            )}
            onClick={() => setPendingAvatarId(avatar.id)}
          >
            <div className={styles.avatarImageWrapper}>
              <img src={avatar.image} alt={avatar.name} className={styles.avatarImage} />
            </div>
            <span className={styles.avatarName}>{avatar.name}</span>
          </button>
        ))}

        <button
          type="button"
          className={clsx(styles.avatarCard, styles.createAvatarCard)}
          onClick={() => navigate('/ai-fitting/avatars/new')}
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
