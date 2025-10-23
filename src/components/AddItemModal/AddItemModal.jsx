import { useNavigate } from "react-router-dom";
import styles from "./AddItemModal.module.css";
import clothsenrollIcon from "@/assets/images/clothsenroll.png";
import paymentIcon from "@/assets/images/payment.png";

const AddItemModal = ({ onClose, position = "bottom" }) => {
  const navigate = useNavigate();

  const handleManualRegister = () => {
    navigate("/closet/register-sample");
    onClose();
  };

  const handleOcrRegister = () => {
    navigate("/closet/ocr");
    onClose();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={styles.overlay} onClick={handleBackdropClick}>
      <div
        className={`${styles.popup} ${position === "fab" ? styles.fabPosition : styles.cardPosition}`}
      >
        <button type="button" className={styles.option} onClick={handleManualRegister}>
          <div className={styles.optionIcon}>
            <img src={clothsenrollIcon} alt="옷 수기등록" />
          </div>
          <span className={styles.optionText}>옷 수기등록</span>
        </button>

        <button type="button" className={styles.option} onClick={handleOcrRegister}>
          <div className={styles.optionIcon}>
            <img src={paymentIcon} alt="결제내역 등록" />
          </div>
          <span className={styles.optionText}>결제내역 등록</span>
        </button>
      </div>
    </div>
  );
};

export default AddItemModal;
