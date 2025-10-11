import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import clothesService from "../../services/clothesService";
import postService from "../../services/postService";
import fileService from "../../services/fileService";
import { snapImageFiles } from "./SnapAddPage";
import styles from "./SnapUploadCompletePage.module.css";

const SnapUploadCompletePage = () => {
  const navigate = useNavigate();
  const [uploadedImages, setUploadedImages] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [postContent, setPostContent] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [clothesItems, setClothesItems] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    // localStorage에서 데이터 가져오기
    const storedImages = JSON.parse(localStorage.getItem("uploadedImages") || "[]");
    const storedItems = JSON.parse(localStorage.getItem("selectedItems") || "[]");

    setUploadedImages(storedImages);
    setSelectedItems(storedItems);

    // SnapAddPage에서 전달받은 파일 객체들
    setImageFiles(snapImageFiles);
  }, []);

  // 옷 정보 로드
  useEffect(() => {
    const loadClothes = async () => {
      try {
        const clothes = await clothesService.getClothes();

        // API 응답을 기존 형식에 맞게 변환
        const transformedClothes = clothes.map((item) => ({
          id: item.clothesId,
          name: item.name,
          brand: "브랜드",
          price: 0,
          category: item.categoryCode,
          images: [
            item.imageUrl ||
              "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80",
          ],
        }));

        setClothesItems(transformedClothes);
      } catch (error) {
        console.error("옷 정보 로드 오류:", error);
        setClothesItems([]);
      }
    };

    loadClothes();
  }, []);

  const handlePostContentChange = (e) => {
    setPostContent(e.target.value);
  };

  const handlePublicToggle = () => {
    setIsPublic(!isPublic);
  };

  const handleUpload = async () => {
    if (uploading) return;

    setUploading(true);

    try {
      // 1. 이미지 파일들을 S3에 업로드하고 파일 ID 받기
      const imageFileIds = [];

      for (const file of imageFiles) {
        const uploadResult = await fileService.uploadFile(file);
        imageFileIds.push(uploadResult.fileId);
      }

      // 2. 게시물 등록
      const postData = {
        content: postContent,
        isPublic: isPublic,
        imageFileIds: imageFileIds,
        clothesIds: selectedItems,
      };

      const result = await postService.createPost(postData);

      console.log("게시물 등록 성공:", result);

      // 3. localStorage 정리
      localStorage.removeItem("uploadedImages");
      localStorage.removeItem("selectedItems");

      // 4. 메인 페이지로 이동
      navigate("/main");
    } catch (error) {
      console.error("게시물 등록 실패:", error);
      alert("게시물 등록에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setUploading(false);
    }
  };

  const handleBack = () => {
    navigate(-1); // 이전 페이지로 돌아가기
  };

  const getSelectedProducts = () => {
    // clothesItems에서 선택된 아이템들의 정보 가져오기
    return selectedItems
      .map((itemId) => clothesItems.find((item) => item.id === itemId))
      .filter(Boolean);
  };

  return (
    <div className={styles.container}>
      <div className={styles.stepContent}>
        {/* 업로드된 스냅 이미지들 */}
        <div className={styles.snapImages}>
          {uploadedImages.map((image, index) => (
            <div key={index} className={styles.snapImage}>
              <img src={image} alt={`스냅 이미지 ${index + 1}`} />
            </div>
          ))}
        </div>

        {/* 스냅 설명 입력 */}
        <div className={styles.contentSection}>
          <h3>스냅에 관련된 말들을 적어주세요.</h3>
          <textarea
            className={styles.contentInput}
            placeholder="오늘의 코디에 대한 이야기를 남겨보세요..."
            value={postContent}
            onChange={handlePostContentChange}
            rows={4}
          />
        </div>

        {/* 착용 상품 정보 */}
        <div className={styles.productSection}>
          <h3>착용 상품 정보</h3>
          <div className={styles.selectedProductsScroll}>
            {getSelectedProducts().map((product) => (
              <div key={product.id} className={styles.productCard}>
                <img src={product.images[0]} alt={product.name} />
                <div className={styles.productInfo}>
                  <div className={styles.brandName}>{product.brand}</div>
                  <div className={styles.productName}>{product.name}</div>
                  <div className={styles.price}>{product.price.toLocaleString()}원</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 게시글 공개 설정 */}
        <div className={styles.visibilitySection}>
          <div className={styles.visibilityToggle}>
            <span>게시글 공개</span>
            <label className={styles.toggleSwitch}>
              <input type="checkbox" checked={isPublic} onChange={handlePublicToggle} />
              <span className={styles.slider}></span>
            </label>
          </div>
        </div>
      </div>

      {/* 업로드 버튼 */}
      <div className={styles.actionButtonWrapper}>
        <button className={styles.actionButton} onClick={handleUpload} disabled={uploading}>
          {uploading ? "업로드 중..." : "업로드"}
        </button>
      </div>
    </div>
  );
};

export default SnapUploadCompletePage;
