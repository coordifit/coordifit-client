import { useState } from "react";
import { uploadImage } from "./uploadApi";

export const useUpload = (onSuccess) => {
  const [loading, setLoading] = useState(false);

  const handleUpload = async (file) => {
    if (!file) return;
    setLoading(true);
    try {
      await uploadImage(file);
      onSuccess && onSuccess();
    } catch (e) {
      console.error(e);
      alert("업로드 실패");
    } finally {
      setLoading(false);
    }
  };

  return { handleUpload, loading };
};
