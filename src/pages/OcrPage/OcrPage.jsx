import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./OcrPage.module.css";

const OcrPage = () => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragOver(false);
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleUpload = () => {
    if (selectedFile) {
      // TODO: OCR API 호출 로직 구현
      console.log("OCR 처리:", selectedFile);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button type="button" className={styles.backButton} onClick={() => navigate(-1)}>
          ←
        </button>
        <h1 className={styles.title}>구매내역 등록하기</h1>
      </header>

      <div className={styles.content}>
        <div className={styles.uploadSection}>
          <div className={styles.uploadImage}>
            <img src="/images/mask.png" alt="업로드 이미지" />
          </div>

          <h2 className={styles.uploadTitle}>구매내역 캡처를 앨범에서 선택해주세요</h2>

          <div className={styles.uploadInfo}>
            <div className={styles.infoItem}>
              <span className={styles.bullet}>•</span>
              <span>밝고 선명한 사진일수록 인식이 잘 됩니다.</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.bullet}>•</span>
              <span>사진은 최대 1장만 업로드 가능합니다.</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.bullet}>•</span>
              <span>이미지 분석에 최대 1분정도 소요될 수 있습니다.</span>
            </div>
          </div>

          <div
            className={`${styles.dropZone} ${isDragOver ? styles.dragOver : ""} ${selectedFile ? styles.hasFile : ""}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            {selectedFile ? (
              <div className={styles.selectedFile}>
                <img
                  src={URL.createObjectURL(selectedFile)}
                  alt="선택된 파일"
                  className={styles.previewImage}
                />
                <p className={styles.fileName}>{selectedFile.name}</p>
              </div>
            ) : (
              <div className={styles.dropContent}>
                <div className={styles.uploadIcon}>📁</div>
                <p>이미지를 드래그하거나 클릭하여 업로드</p>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className={styles.fileInput}
            />
          </div>
        </div>

        <button
          type="button"
          className={styles.uploadButton}
          onClick={handleUpload}
          disabled={!selectedFile}
        >
          앨범에서 선택하기
        </button>
      </div>
    </div>
  );
};

export default OcrPage;
