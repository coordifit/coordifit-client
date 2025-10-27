import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./OcrAnalyzingPage.module.css";
import autoAwesomeIcon from "@/assets/images/auto_awesome.png";
import ocrService from "@/services/ocrService";

const OcrAnalyzingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("ocr"); // 'ocr', 'chatgpt', 'complete'

  const selectedFile = location.state?.selectedFile;

  useEffect(() => {
    if (!selectedFile) {
      navigate("/closet/ocr");
      return;
    }

    analyzeImage();
  }, [selectedFile]);

  const analyzeImage = async () => {
    try {
      // 1단계: OCR 텍스트 추출
      setCurrentStep("ocr");
      setProgress(20);

      const ocrResult = await ocrService.extractText(selectedFile);

      if (!ocrResult.success) {
        throw new Error(ocrResult.message);
      }

      setProgress(60);

      // 2단계: ChatGPT로 상품 정보 분석 (OCR 결과 전체를 전달)
      setCurrentStep("chatgpt");

      const chatgptResult = await ocrService.analyzeOcrResult(ocrResult.data.results);

      if (!chatgptResult.success) {
        throw new Error(chatgptResult.message);
      }

      setProgress(100);
      setCurrentStep("complete");

      console.log("🎯 결과 페이지로 전달할 데이터:", {
        originalImage: selectedFile,
        ocrData: ocrResult.data,
        analysisResult: chatgptResult.data, // Spring Boot ApiResponseDto 구조 그대로 전달
      });

      // 분석 완료 후 즉시 결과 페이지로 이동
      navigate("/closet/ocr/result", {
        state: {
          originalImage: selectedFile,
          ocrData: ocrResult.data,
          analysisResult: chatgptResult.data, // Spring Boot ApiResponseDto 구조 그대로 전달
        },
      });
    } catch (error) {
      console.error("분석 실패:", error);
      alert(`분석에 실패했습니다: ${error.message}`);
      navigate("/closet/ocr");
    }
  };

  const handleBack = () => {
    navigate("/closet/ocr");
  };

  const getStepMessage = () => {
    switch (currentStep) {
      case "ocr":
        return "이미지에서 텍스트를 추출하고 있습니다...";
      case "chatgpt":
        return "AI가 상품 정보를 분석하고 있습니다...";
      case "complete":
        return "분석이 완료되었습니다!";
      default:
        return "분석을 준비하고 있습니다...";
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.analyzingSection}>
          <div className={styles.sparkleIcon}>
            <img src={autoAwesomeIcon} alt="분석중" className={styles.sparkleImage} />
          </div>
          <div className={styles.receiptPreview}>
            {selectedFile && (
              <img
                src={URL.createObjectURL(selectedFile)}
                alt="분석중인 영수증"
                className={styles.receiptImage}
              />
            )}
            <div className={styles.highlightOverlay}></div>
          </div>
          <h2 className={styles.analyzingTitle}>AI가 사진을 분석중입니다.</h2>
          <p className={styles.analyzingSubtitle}>최대 1분정도 소요될 수 있습니다.</p>

          <div className={styles.progressContainer}>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${progress}%` }}></div>
            </div>
            <div className={styles.progressText}>{progress}%</div>
          </div>

          <div className={styles.stepMessage}>{getStepMessage()}</div>
        </div>
      </div>
    </div>
  );
};

export default OcrAnalyzingPage;
