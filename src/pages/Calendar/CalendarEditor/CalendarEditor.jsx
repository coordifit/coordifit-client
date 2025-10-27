import { useEffect, useRef, useState } from "react";
import { useBeforeUnload, useNavigate, useParams } from "react-router-dom";

import { Layer, Rect, Stage } from "react-konva";
import { useQueryClient } from "@tanstack/react-query";

import { useDailyLookByDateQuery } from "@/hooks/useDailyLookQuery";
import { api } from "@/services/axiosInstance";

import ItemCarousel from "@/components/ItemCarousel/ItemCarousel";
import ClosetModal from "@calendar/ClosetModal/ClosetModal";
import CanvasItem from "@calendar/CanvasItem/CanvasItem";
import Button from "@/components/Button/Button";
import Modal from "@/components/Modal/Modal";

import styles from "./CalendarEditor.module.css";
import { CANVAS_CONFIG } from "@/constants/calendar";
import { useClothesStore } from "@/stores/clothesStore";
import { useLeaveConfirm } from "@/hooks/useLeaveConfirm";
import { getCanvasPosition } from "@/utils/canvasUtils";

const CalendarEditor = () => {
  const [closetModal, setClosetModal] = useState(false);
  const [bgColor, setBgColor] = useState("#ffffff");
  const [selectedId, setSelectedId] = useState(null);
  const [description, setDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const pastClothesRef = useRef([]);
  const stageRef = useRef(null);

  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { date } = useParams();

  const { open, confirm, cancel } = useLeaveConfirm(!isSaving && isDirty);
  const { clothes, setClothes, updateClothes, addClothes, removeClothes, clearClothes } =
    useClothesStore();
  const { data: dailyLook = { data: {} } } = useDailyLookByDateQuery(date);

  useBeforeUnload((e) => {
    if (!isSaving && isDirty) {
      e.preventDefault();
      e.returnValue = "";
    }
  });

  useEffect(() => {
    if (dailyLook?.data?.canvasJson) {
      const pastClothes = JSON.parse(dailyLook.data.canvasJson);

      pastClothesRef.current = pastClothes;
      setClothes(pastClothes);
      setDescription(dailyLook.data.description);
    } else {
      pastClothesRef.current = [];

      setClothes([]);
      setDescription("");
    }
  }, [dailyLook]);

  useEffect(() => {
    const sameClothes = JSON.stringify(pastClothesRef.current) === JSON.stringify(clothes);
    const sameDesc = (dailyLook?.data?.description || "") === description;

    setIsDirty(!(sameClothes && sameDesc));
  }, [clothes, dailyLook]);

  const addToCanvas = (item) => {
    const pos = getCanvasPosition(item.categoryCode);

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
      rotation: item.rotation,
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

    setIsSaving(true);
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

        pastClothesRef.current = clothes;
        setIsDirty(false);
        clearClothes();

        setTimeout(() => {
          navigate(`/calendar/${date}`);
        }, 0);

        setTimeout(() => {
          queryClient.invalidateQueries(["dailyLook", date]);
        }, 0);

        setSelectedId(prev);
      } finally {
        setIsSaving(false);
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
            setClosetModal(true);
          }}
        >
          +
        </button>
      </div>
      <ItemCarousel items={clothes} selectedId={selectedId} onClick={setSelectedId} />
      <ClosetModal
        isOpen={closetModal}
        onClose={setClosetModal}
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
