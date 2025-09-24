import styles from "./ImageItem.module.css";
import clsx from "clsx";

const ImageItem = ({ image, active }) => {
  return (
    <li className={clsx(styles.item, active && styles.active)}>
      <p>{image.fileName}</p>
      <img src={image.url} alt={image.fileName} width="200" />
    </li>
  );
};

export default ImageItem;
