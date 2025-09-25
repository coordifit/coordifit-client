import { useEffect, useRef, useState } from "react";

import styles from "./CalendarEditor.module.css";
import cn from "classnames";
import useImage from "use-image";
import { Layer, Rect, Stage, Image as KonvaImage, Transformer } from "react-konva";

import top1 from "@images/top1.png";
import top2 from "@images/top2.png";
import pants1 from "@images/pants1.png";
import outer1 from "@images/outer1.png";
import shoes1 from "@images/shoes1.png";
import shoes2 from "@images/shoes2.png";
import acc1 from "@images/acc1.png";

const CANVAS_W = 300;
const CANVAS_H = 450;

const CLOSET = [
  {
    id: "top-01",
    name: "Brown sweater",
    category: "top",
    imageUrl: top1,
  },
  {
    id: "top-02",
    name: "Denim shirts",
    category: "top",
    imageUrl: top2,
  },
  {
    id: "pants-01",
    name: "Cotton pants",
    category: "bottom",
    imageUrl: pants1,
  },
  {
    id: "outer-01",
    name: "Blue Shirt",
    category: "outer",
    imageUrl: outer1,
  },
  {
    id: "shoes-01",
    name: "Berwick Shoes",
    category: "shoes",
    imageUrl: shoes1,
  },
  {
    id: "shoes-02",
    name: "Adidas Shoes",
    category: "shoes",
    imageUrl: shoes2,
  },
  {
    id: "acc-01",
    name: "Chrome hearts",
    category: "default",
    imageUrl: acc1,
  },
];

function URLImage({ obj, isSelected, onSelect, onChange }) {
  const [image] = useImage(obj.src, "anonymous");
  const shapeRef = useRef(null);
  const trRef = useRef(null);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  const handleSelect = () => {
    onSelect(obj.id); // 부모에서 토글 처리
  };

  return (
    <>
      <KonvaImage
        ref={shapeRef}
        image={image}
        x={obj.x}
        y={obj.y}
        scaleX={obj.scaleX}
        scaleY={obj.scaleY}
        rotation={obj.rotation}
        draggable
        onClick={handleSelect}
        onTap={handleSelect}
        onDragEnd={(e) => {
          onChange({ ...obj, x: e.target.x(), y: e.target.y() });
        }}
        onTransformEnd={() => {
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          const rotation = node.rotation();
          onChange({ ...obj, scaleX, scaleY, rotation });
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          rotateEnabled
          keepRatio={false}
          boundBoxFunc={(oldBox, newBox) => {
            const MIN = 10;
            if (newBox.width < MIN || newBox.height < MIN) return oldBox;
            return newBox;
          }}
        />
      )}
    </>
  );
}

const CalendarEditor = () => {
  const stageRef = useRef(null);

  const [bgColor, setBgColor] = useState("#ffffff");
  const [used, setUsed] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const centerX = CANVAS_W / 2;
  const centerY = CANVAS_H / 2;

  const getDefaultPlacement = (category) => {
    const map = {
      top: { x: centerX - 80, y: centerY - 220, scale: 0.5 },
      outer: { x: centerX - 200, y: centerY - 120, scale: 0.5 },

      bottom: { x: centerX - 80, y: centerY - 30, scale: 0.5 },
      shoes: { x: centerX - 40, y: centerY + 70, scale: 0.4 },
      default: { x: centerX - 150, y: centerY + 80, scale: 0.3 },
    };
    return map[category] || map.default;
  };

  const addToCanvas = (item) => {
    const pos = getDefaultPlacement(item.category);

    const obj = {
      id: `${item.id}-${Date.now()}`,
      src: item.imageUrl,
      name: item.name,
      category: item.category,
      x: pos.x,
      y: pos.y,
      scaleX: pos.scale,
      scaleY: pos.scale,
      rotation: 0,
    };
    setUsed((prev) => [...prev, obj]);
    setSelectedId(obj.id);
    setSheetOpen(false);
  };

  const updateObject = (id, next) => {
    setUsed((prev) => prev.map((o) => (o.id === id ? next : o)));
  };

  const removeSelected = () => {
    if (!selectedId) return;
    setUsed((prev) => prev.filter((o) => o.id !== selectedId));
    setSelectedId(null);
  };

  const bringForward = () => {
    if (!selectedId) return;
    setUsed((prev) => {
      const idx = prev.findIndex((o) => o.id === selectedId);

      if (idx === -1 || idx === prev.length - 1) return prev;
      const next = prev.slice();
      const [item] = next.splice(idx, 1);
      next.splice(idx + 1, 0, item);
      return next;
    });
  };

  const sendBackward = () => {
    if (!selectedId) return;
    setUsed((prev) => {
      const idx = prev.findIndex((o) => o.id === selectedId);
      if (idx <= 0) return prev;
      const next = prev.slice();
      const [item] = next.splice(idx, 1);
      next.splice(idx - 1, 0, item);
      return next;
    });
  };

  const saveImage = async () => {
    if (!stageRef.current) return;
    const prev = selectedId;
    setSelectedId(null); // Transformer 숨김
    requestAnimationFrame(() => {
      const uri = stageRef.current.toDataURL({ pixelRatio: 2 });
      const w = window.open();
      w.document.write(`<img src="${uri}" style="max-width:100%"/>`);
      setSelectedId(prev);
    });
  };

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <h1 className={styles.title}>Look Editor Demo</h1>
      </header>

      <div className={styles.editorRow}>
        <div className={styles.canvasCard}>
          <Stage
            ref={stageRef}
            width={CANVAS_W}
            height={CANVAS_H}
            className={styles.stage}
          >
            <Layer>
              <Rect
                width={CANVAS_W}
                height={CANVAS_H}
                fill={bgColor}
                onMouseDown={() => setSelectedId(null)} // 데스크탑 클릭 시 해제
                onTouchStart={() => setSelectedId(null)} // 모바일 탭 시 해제
              />
            </Layer>
            <Layer>
              {used.map((obj) => (
                <URLImage
                  key={obj.id}
                  obj={obj}
                  isSelected={obj.id === selectedId}
                  onSelect={() => setSelectedId(obj.id)}
                  onChange={(next) => updateObject(obj.id, next)}
                />
              ))}
            </Layer>
          </Stage>

          {/* 툴바 */}
          <div className={styles.toolbar}>
            <div className={styles.colors}>
              {["#ffffff", "#f2f2f2", "#e4f0ff"].map((c) => (
                <button
                  key={c}
                  className={cn(styles.colorDot, bgColor === c && styles.activeDot)}
                  onClick={() => setBgColor(c)}
                  title={c}
                />
              ))}
            </div>
            <div className={styles.actions}>
              <button className={styles.btn} onClick={bringForward}>
                앞
              </button>
              <button className={styles.btn} onClick={sendBackward}>
                뒤
              </button>
              <button className={styles.btnDanger} onClick={removeSelected}>
                삭제
              </button>
              <button className={styles.btnPrimary} onClick={saveImage}>
                이미지 저장
              </button>
            </div>
          </div>
        </div>
      </div>
      <aside className={styles.usedPanel}>
        <h3 className={styles.panelTitle}>사용된 아이템</h3>
        {used.length === 0 && <div className={styles.empty}>아직 없음</div>}
        <ul className={styles.usedList}>
          {used.map((o) => (
            <li
              key={o.id}
              className={cn(
                styles.usedItem,
                o.id === selectedId && styles.usedItemActive
              )}
              onClick={() => setSelectedId(o.id)}
            >
              <img src={o.src} alt={o.name} className={styles.thumb} />
              <div className={styles.meta}>
                <div className={styles.name}>{o.name}</div>
                <div className={styles.category}>{o.category}</div>
              </div>
            </li>
          ))}
        </ul>
      </aside>
      <button className={styles.fab} onClick={() => setSheetOpen(true)}>
        +
      </button>

      <div className={cn(styles.sheet, sheetOpen && styles.sheetOpen)}>
        <div className={styles.sheetHeader}>
          <div className={styles.sheetTitle}>옷장</div>
          <button className={styles.sheetClose} onClick={() => setSheetOpen(false)}>
            닫기
          </button>
        </div>
        <div className={styles.closetGrid}>
          {CLOSET.map((item) => (
            <button
              key={item.id}
              className={styles.closetCard}
              onClick={() => addToCanvas(item)}
            >
              <img src={item.imageUrl} alt={item.name} className={styles.closetImg} />
              <div className={styles.closetInfo}>
                <div className={styles.closetName}>{item.name}</div>
                <div className={styles.closetCat}>{item.category}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CalendarEditor;
