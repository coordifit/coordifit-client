import { useEffect, useRef, useState } from "react";
import { useBeforeUnload, useNavigate, useParams } from "react-router-dom";

import { Layer, Rect, Stage } from "react-konva";
import { useQueryClient } from "@tanstack/react-query";

import { useDailyLookByDateQuery } from "@/hooks/useDailyLookQuery";
import { api } from "@/services/axiosInstance";

import ItemCarousel from "@/components/ItemCarousel/ItemCarousel";
import CanvasItem from "../CanvasItem/CanvasItem";
import ClosetModal from "../ClosetModal/ClosetModal";

import styles from "./CalendarEditor.module.css";
import { CANVAS_CONFIG } from "@/constants/calendar";
import { useClothesStore } from "@/stores/clothesStore";
import { useLeaveConfirm } from "@/hooks/useLeaveConfirm";
import Modal from "@/components/Modal/Modal";
import { getDefaultPlacement } from "@/utils/canvasUtils";
import Button from "@/components/Button/Button";

const CalendarEditor = () => {
  const [bgColor, setBgColor] = useState("#ffffff");
  const [selectedId, setSelectedId] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [description, setDescription] = useState("");

  const { clothes, setClothes, updateClothes, addClothes, removeClothes, clearClothes } =
    useClothesStore();

  const isSavingRef = useRef(false);
  const stageRef = useRef(null);

  const navigate = useNavigate();
  const { date } = useParams();

  const queryClient = useQueryClient();

  const isDirty = clothes.length > 0;

  const { open, confirm, cancel } = useLeaveConfirm(!isSavingRef.current && isDirty);

  useBeforeUnload((e) => {
    if (!isSavingRef.current && isDirty) {
      e.preventDefault();
      e.returnValue = "";
    }
  });

  const { data: dailyLook = { data: {} } } = useDailyLookByDateQuery(date);

  useEffect(() => {
    if (dailyLook?.data?.canvasJson) {
      const initial = JSON.parse(dailyLook.data.canvasJson);
      setClothes(initial);
      setDescription(dailyLook.data.description || "");
    }
  }, [dailyLook]);

  const addToCanvas = (item) => {
    const pos = getDefaultPlacement(item.categoryCode);

    const obj = {
      instanceId: `${item.clothesId}-${Date.now()}`,
      clothesId: item.clothesId,
      imageUrl: item.thumbnailUrl,
      name: item.name,
      categoryCode: item.categoryCode,
      x: pos.x,
      y: pos.y,
      scaleX: pos.scale,
      scaleY: pos.scale,
      rotation: item.roation,
    };

    addClothes(obj);
    setSelectedId(obj.clothesId);
  };

  const removeSelected = () => {
    if (!selectedId) return;
    removeClothes(selectedId);
    setSelectedId(null);
  };

  const saveImage = async () => {
    if (!stageRef.current) return;
    isSavingRef.current = true;
    const prev = selectedId;
    setSelectedId(null);
    requestAnimationFrame(async () => {
      try {
        const uri = stageRef.current.toDataURL({ pixelRatio: 2 });
        const blob = await (await fetch(uri)).blob();
        const formData = new FormData();
        const fileName = `look-${date}-${Date.now()}.png`;

        formData.append("image", blob, fileName);
        formData.append("description", description);
        formData.append("items", JSON.stringify(clothes));

        await api.post(`/daily-look/date/${date}`, formData);

        clearClothes();

        setTimeout(() => {
          navigate(`/calendar/${date}`);
        }, 0);

        setTimeout(() => {
          queryClient.invalidateQueries(["dailyLook", date]);
        }, 0);

        setSelectedId(prev);
      } finally {
        setTimeout(() => (isSavingRef.current = false), 0);
      }
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
          onChange={(e) => setDescription(e.target.value)}
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
                onMouseDown={() => setSelectedId(null)}
                onTouchStart={() => setSelectedId(null)}
              />
            </Layer>
            <Layer>
              {clothes.map((item) => (
                <CanvasItem
                  key={item.clothesId}
                  obj={item}
                  isSelected={item.clothesId === selectedId}
                  onSelect={() => setSelectedId(item.clothesId)}
                  onChange={(next) => updateClothes(item.clothesId, next)}
                />
              ))}
            </Layer>
          </Stage>
          <div className={styles.toolbar}>
            <div className={styles.colors}>
              {CANVAS_CONFIG.PALLETTE.map((hexColor) => (
                <button
                  key={hexColor}
                  className={`${styles.colorDot} ${bgColor === hexColor ? styles.activeDot : ""}`}
                  onClick={() => setBgColor(hexColor)}
                  title={hexColor}
                  style={{ backgroundColor: hexColor }}
                />
              ))}
            </div>
            <div className={styles.actions}>
              <button className={styles.btnDanger} onClick={removeSelected}>
                삭제하기
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
      <div className={styles["button-wrapper"]}>
        <>
          <Button onClick={saveImage} style="default">
            저장하기
          </Button>
          <Button
            onClick={(e) => {
              e.preventDefault();
              navigate(-1);
            }}
            style="secondary"
          >
            뒤로가기
          </Button>
        </>
      </div>
      {open && (
        <Modal
          title="뒤로 가기"
          onClose={cancel}
          footer={
            <>
              <button type="button" onClick={cancel}>
                아니요
              </button>
              <button
                type="button"
                onClick={() => {
                  clearClothes();
                  confirm();
                }}
              >
                예
              </button>
            </>
          }
          children={"변경 사항이 저장되지 않았습니다\n 계속 이동할까요?"}
        />
      )}
    </div>
  );
};

export default CalendarEditor;
