import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import styles from "./AvatarCreationPage.module.css";
import cameraIcon from "@/assets/images/snap.svg";
import galleryIcon from "@/assets/images/calendaricon.png";
import {
  selectAddAvatar,
  selectSetSelectedAvatarId,
  useAiFittingStore,
} from "./store/useAiFittingStore";

const AvatarCreationPage = () => {
  const navigate = useNavigate();
  const addAvatar = useAiFittingStore(selectAddAvatar);
  const setSelectedAvatarId = useAiFittingStore(selectSetSelectedAvatarId);

  const [name, setName] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState("");

  const galleryInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setImageDataUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (!name.trim() || !imageDataUrl) return;

    const newAvatar = {
      id: `avatar-${Date.now()}`,
      name: name.trim(),
      image: imageDataUrl,
    };

    addAvatar(newAvatar);
    setSelectedAvatarId(newAvatar.id);
    navigate("/ai-fitting/avatars");
  };

  const isSubmittable = Boolean(name.trim() && imageDataUrl);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>아바타 만들기</h1>
        <p className={styles.description}>
          이름을 정하고 사진을 업로드해 나만의 아바타를 완성하세요.
        </p>
      </header>

      <div className={styles.form}>
        <div className={styles.inputGroup}>
          <label htmlFor="avatar-name" className={styles.label}>
            아바타 이름
          </label>
          <input
            id="avatar-name"
            type="text"
            className={styles.textInput}
            placeholder="아바타 이름을 입력하세요"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>

        <div className={styles.inputGroup}>
          <span className={styles.label}>아바타 이미지</span>
          <div className={styles.uploadPanel}>
            {imageDataUrl ? (
              <img
                src={imageDataUrl}
                alt="새 아바타 미리보기"
                className={styles.previewImage}
              />
            ) : (
              <div className={styles.previewPlaceholder}>
                업로드한 이미지가 여기에서 미리보기로 표시됩니다.
              </div>
            )}

            <div className={styles.uploadActions}>
              <button
                type="button"
                className={styles.uploadButton}
                onClick={() => cameraInputRef.current?.click()}
              >
                <img src={cameraIcon} alt="" className={styles.uploadIcon} />
                촬영하기
              </button>
              <button
                type="button"
                className={styles.uploadButton}
                onClick={() => galleryInputRef.current?.click()}
              >
                <img src={galleryIcon} alt="" className={styles.uploadIcon} />
                갤러리에서 선택
              </button>
            </div>

            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className={styles.hiddenInput}
              onChange={handleFileChange}
            />
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              className={styles.hiddenInput}
              onChange={handleFileChange}
            />
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.secondaryButton}
          onClick={() => navigate("/ai-fitting/avatars")}
        >
          돌아가기
        </button>
        <button
          type="button"
          className={styles.primaryButton}
          disabled={!isSubmittable}
          onClick={handleSubmit}
        >
          아바타 등록
        </button>
      </div>
    </div>
  );
};

export default AvatarCreationPage;
