import { useState } from "react";
import { useUpload } from "../model/useUpload";

import styles from "./UploadForm.module.css";
import clsx from "clsx";

export const UploadForm = ({ onSuccess }) => {
  const [file, setFile] = useState(null);
  const { handleUpload, loading } = useUpload(onSuccess);

  return (
    <div className={styles.form}>
      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
        className={styles.input}
      />
      <button
        onClick={() => handleUpload(file)}
        disabled={loading}
        className={clsx(styles.button, loading && styles.disabled)}
      >
        {loading ? "업로드 중..." : "업로드"}
      </button>
    </div>
  );
};
