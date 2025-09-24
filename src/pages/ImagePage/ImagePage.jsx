import { useEffect, useState } from "react";
import { api } from "@/services/axiosInstance";
import styles from "./ImagePage.module.css";
import UploadForm from "@/components/UploadForm/UploadForm";
import ImageItem from "@/components/ImageItem/ImageItem";

export const ImagePage = () => {
  const [images, setImages] = useState([]);

  const fetchImages = async () => {
    try {
      const res = await api.get("/images");
      setImages(res.data);
    } catch (err) {
      console.error("이미지 불러오기 실패", err);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>이미지 업로드 테스트</h2>
      <UploadForm onSuccess={fetchImages} />
      <ul className={styles.list}>
        {images.map((img, index) => (
          <ImageItem key={img.id} image={img} active={index === 0} />
        ))}
      </ul>
    </div>
  );
};
