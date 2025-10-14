import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Layer, Rect, Stage } from "react-konva";
import { useQueryClient } from "@tanstack/react-query";
import cn from "classnames";

import { useDailyLookByDateQuery } from "@/hooks/useDailyLookQuery";
import { useClothesStore } from "@/store/clothesStore";
import { api } from "@/services/axiosInstance";

import ItemCarousel from "@/components/ItemCarousel/ItemCarousel";
import CanvasItem from "../CanvasItem/CanvasItem";
import ClosetModal from "../ClosetModal/ClosetModal";

import styles from "./CalendarEditor.module.css";
import { CANVAS_CONFIG } from "@/constants/calendar";

const CalendarEditor = () => {
  const [bgColor, setBgColor] = useState("#ffffff");
  const [selectedId, setSelectedId] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [description, setDiscription] = useState("");

  const { clothes, setClothes, updateClothes, addClothes, removeClothes, clearClothes } =
    useClothesStore();

  const navigate = useNavigate();
  const { date } = useParams();

  const queryClient = useQueryClient();
  const stageRef = useRef(null);

  const { data: dailyLook = { data: {} } } = useDailyLookByDateQuery(date);

  useEffect(() => {
    if (dailyLook?.data?.canvasJson) {
      const initial = JSON.parse(dailyLook.data.canvasJson);
      setClothes(initial);
      setDiscription(dailyLook.data.description || "");
    }
  }, [dailyLook]);

  const getDefaultPlacement = (category) => {
    const centerX = CANVAS_CONFIG.WIDTH / 2;
    const centerY = CANVAS_CONFIG.HEIGHT / 2;

    const map = {
      top: { x: centerX - 80, y: centerY - 220, scale: 0.5 },
      outer: { x: centerX - 200, y: centerY - 120, scale: 0.5 },

      bottom: { x: centerX - 80, y: centerY - 30, scale: 0.5 },
      shoes: { x: centerX - 40, y: centerY + 70, scale: 0.4 },
      default: { x: centerX - 150, y: centerY + 80, scale: 0.3 },
    };

    return map[category] ?? map.default;
  };

  const addToCanvas = (item) => {
    console.log("addToCanvas", item);
    const pos =
      item?.x != null && item?.y != null
        ? { x: item.x, y: item.y, scale: item.scaleX ?? 0.5 }
        : getDefaultPlacement(item.category);

    const obj = {
      instanceId: `${item.id}-${Date.now()}`,
      id: item.id,
      src: item.imageUrl,
      name: item.name,
      category: item.category,
      x: pos.x,
      y: pos.y,
      scaleX: pos.scale,
      scaleY: pos.scale,
      rotation: item.roation || 0,
    };

    addClothes(obj);
    setSelectedId(obj.id);
  };

  const removeSelected = () => {
    if (!selectedId) return;
    removeClothes(selectedId);
    setSelectedId(null);
  };

  const saveImage = async () => {
    if (!stageRef.current) return;
    const prev = selectedId;
    setSelectedId(null);
    requestAnimationFrame(async () => {
      const uri = stageRef.current.toDataURL({ pixelRatio: 2 });
      const blob = await (await fetch(uri)).blob();
      const formData = new FormData();
      const fileName = `look-${date}-${Date.now()}.png`;

      formData.append("image", blob, fileName);
      formData.append("description", description);
      formData.append(
        "items",
        JSON.stringify(clothes.map((item) => ({ ...item, scaleX: 1, scaleY: 1 }))),
      );

      await api.post(`/daily-look/date/${date}`, formData);
      await queryClient.invalidateQueries(["dailyLook", date]);

      const link = document.createElement("a");
      link.download = fileName;
      link.href = uri;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setSelectedId(prev);
      clearClothes();
      navigate(`/calendar/${date}`);
    });
  };

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}></header>
      <div className={styles.editorRow}>
        <input
          className={styles.input}
          placeholder="오늘의 데일리룩에 대한 코멘트를 남겨주세요."
          value={description}
          onChange={(e) => setDiscription(e.target.value)}
        />
        <div className={styles.canvasCard}>
          <Stage
            ref={stageRef}
            width={CANVAS_CONFIG.WIDTH}
            height={CANVAS_CONFIG.HEIGHT}
            className={styles.stage}
          >
            <Layer>
              <Rect
                width={CANVAS_CONFIG.WIDTH}
                height={CANVAS_CONFIG.HEIGHT}
                fill={bgColor}
                onMouseDown={() => setSelectedId(null)} // 데스크탑 클릭 시 해제
                onTouchStart={() => setSelectedId(null)} // 모바일 탭 시 해제
              />
            </Layer>
            <Layer>
              {clothes.map((item) => (
                <CanvasItem
                  key={item.id}
                  obj={item}
                  isSelected={item.id === selectedId}
                  onSelect={() => setSelectedId(item.id)}
                  onChange={(next) => updateClothes(item.id, next)}
                />
              ))}
            </Layer>
          </Stage>
          <div className={styles.toolbar}>
            <div className={styles.colors}>
              {CANVAS_CONFIG.PALLETTE.map((hexColor) => (
                <button
                  key={hexColor}
                  className={cn(styles.colorDot, bgColor === hexColor && styles.activeDot)}
                  onClick={() => setBgColor(hexColor)}
                  title={hexColor}
                />
              ))}
            </div>
            <div className={styles.actions}>
              <button className={styles.btnDanger} onClick={removeSelected}>
                삭제
              </button>
              <button className={styles.btnPrimary} onClick={saveImage}>
                이미지 저장
              </button>
            </div>
          </div>
        </div>
        <button
          className={styles.fab}
          onClick={(e) => {
            e.stopPropagation();
            setSheetOpen(true);
          }}
        >
          +
        </button>
      </div>
      <ItemCarousel items={clothes} selectedId={selectedId} onClick={setSelectedId} />
      <ClosetModal
        isOpen={sheetOpen}
        onClose={setSheetOpen}
        onAdd={addToCanvas}
        clothes={clothes}
        onRemove={removeClothes}
      />
    </div>
  );
};

export default CalendarEditor;
