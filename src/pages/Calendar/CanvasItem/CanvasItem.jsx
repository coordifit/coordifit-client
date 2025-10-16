import React, { useEffect, useRef } from "react";
import styles from "./CanvasItem.module.css";
import useImage from "use-image";
import { Image, Transformer } from "react-konva";

const CanvasItem = ({ obj, isSelected, onSelect, onChange }) => {
  const [image] = useImage(obj.src, "anonymous");
  const shapeRef = useRef(null);
  const trRef = useRef(null);
  const MIN_SIZE = 10;

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
      trRef.current.moveToTop();
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected, image]);

  const handleSelect = () => {
    if (shapeRef.current) {
      shapeRef.current.moveToTop();
      shapeRef.current.getLayer().batchDraw();
    }

    onSelect(obj.id);
  };

  if (!image) {
    console.error("image 없음");
    return null;
  }

  return (
    <>
      <Image
        ref={shapeRef}
        image={image}
        x={obj.x}
        y={obj.y}
        scaleX={obj.scaleX}
        scaleY={obj.scaleY}
        width={obj.width}
        height={obj.height}
        rotation={obj.rotation}
        draggable={isSelected}
        onClick={handleSelect}
        onTap={handleSelect}
        onDragEnd={(e) => {
          if (!isSelected) return;
          onChange({ ...obj, x: e.target.x(), y: e.target.y() });
        }}
        onTransformEnd={() => {
          if (!isSelected) return;
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();

          const newWidth = node.width() * scaleX;
          const newHeight = node.height() * scaleY;

          node.scaleX(1);
          node.scaleY(1);

          onChange({
            ...obj,
            width: newWidth,
            height: newHeight,
            x: node.x(),
            y: node.y(),
            rotation: node.rotation(),
          });
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          rotateEnabled
          keepRatio={false}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < MIN_SIZE || newBox.height < MIN_SIZE) return oldBox;
            return newBox;
          }}
        />
      )}
    </>
  );
};

export default CanvasItem;
