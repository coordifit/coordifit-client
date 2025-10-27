import ClosetModal from "@/pages/Calendar/ClosetModal/ClosetModal";
import styles from "./CoordiEditor.module.css";
import classNames from "classnames/bind";
import ItemCarousel from "@/components/ItemCarousel/ItemCarousel";
import Modal from "@/components/Modal/Modal";

import { Layer, Rect, Stage } from "react-konva";
import { useCoordiStore } from "@/stores/coordiStore";
import { useBeforeUnload, useNavigate, useParams } from "react-router-dom";
import { useLeaveConfirm } from "@/hooks/useLeaveConfirm";
import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useCoordiByIdQuery } from "@/hooks/useCoordiQuery";
import { CANVAS_CONFIG } from "@/constants/calendar";
import { getCanvasPosition } from "@/utils/canvasUtils";
import CanvasItem from "@/pages/Calendar/CanvasItem/CanvasItem";
import { api } from "@/services/axiosInstance";
import Button from "@/components/Button/Button";

const cn = classNames.bind(styles);

const CoordiEditor = () => {
  const [bgColor, setBgColor] = useState("#ffffff");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [description, setDescription] = useState("");
  const [coordiName, setCoordiName] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const queryClient = useQueryClient();
  const stageRef = useRef(null);
  const navigate = useNavigate();
  const { coordiId } = useParams();

  const {
    coordiItems,
    setCoordiItems,
    addCoordiItem,
    removeCooridItem,
    updateCoordiItem,
    clearCoordiItems,
  } = useCoordiStore();

  const { open, confirm, cancel } = useLeaveConfirm(!isSaving && isDirty);

  useBeforeUnload((e) => {
    if (!isSaving && isDirty) {
      e.preventDefault();
      e.returnValue = "";
    }
  });

  const { data: coordi = { data: {} } } = useCoordiByIdQuery(coordiId);

  useEffect(() => {
    if (coordi?.data?.canvasJson) {
      const pastClothes = JSON.parse(coordi.data.canvasJson);

      setCoordiItems(pastClothes);
      setDescription(coordi.data.description || "");
      setCoordiName(coordi.data.coordiName || "");
    }
  }, [coordi]);

  const handleClickSave = () => {
    setIsModalOpen(true);
  };

  const handleClickCancel = () => {
    setIsModalOpen(false);
  };

  const addToCanvas = (item) => {
    const pos = getCanvasPosition(item.categoryCode);

    const konvaObject = {
      instanceId: `${item.clothesId}-${Date.now()}`,
      clothesId: item.clothesId,
      imageUrl: item.imageUrl,
      name: item.name,
      categoryCode: item.categoryCode,
      x: pos.x,
      y: pos.y,
      scaleX: pos.scale,
      scaleY: pos.scale,
      rotation: item.roation,
    };

    addCoordiItem(konvaObject);
    setSelectedId(konvaObject.clothesId);
  };

  const removeSelected = () => {
    if (!selectedId) return;
    removeCooridItem(selectedId);
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
        const fileName = `look-${Date.now()}.png`;

        formData.append("image", blob, fileName);
        formData.append("description", description);
        formData.append("coordiName", coordiName);
        formData.append("canvasJson", JSON.stringify(coordiItems));

        if (coordiId) {
          await api.put(`/coordi/${coordiId}`, formData);
        } else {
          await api.post(`/coordi`, formData);
        }

        setIsDirty(false);
        clearCoordiItems();

        setTimeout(() => {
          navigate("/closet-sample", { replace: true });
        }, 0);

        queryClient.invalidateQueries(["coordis"]);

        setSelectedId(prev);
      } finally {
        setIsSaving(false);
      }
    });
  };

  return (
    <div className={cn("wrapper")}>
      <header className={cn("header")}></header>
      <div className={cn("editorRow")}>
        <div className={cn("canvasCard")}>
          <Stage
            ref={stageRef}
            width={CANVAS_CONFIG.WIDTH}
            height={CANVAS_CONFIG.HEIGHT}
            className={cn("stage")}
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
              {coordiItems.map((item) => (
                <CanvasItem
                  key={item.clothesId}
                  obj={item}
                  isSelected={item.clothesId === selectedId}
                  onSelect={() => setSelectedId(item.clothesId)}
                  onChange={(next) => updateCoordiItem(item.clothesId, next)}
                />
              ))}
            </Layer>
          </Stage>
          <div className={cn("toolbar")}>
            <div className={cn("colors")}>
              {CANVAS_CONFIG.PALLETTE.map((hexColor) => (
                <button
                  key={hexColor}
                  className={cn("colorDot", { activeDot: bgColor === hexColor })}
                  onClick={() => setBgColor(hexColor)}
                  title={hexColor}
                  style={{ backgroundColor: hexColor }}
                />
              ))}
            </div>
            <div className={cn("actions")}>
              <button className={cn("btnDanger")} onClick={removeSelected}>
                삭제하기
              </button>
            </div>
          </div>
        </div>
        <button
          className={cn("fab")}
          onClick={(e) => {
            e.stopPropagation();
            setSheetOpen(true);
          }}
        >
          +
        </button>
      </div>
      <ItemCarousel items={coordiItems} selectedId={selectedId} onClick={setSelectedId} />
      <ClosetModal
        isOpen={sheetOpen}
        onClose={setSheetOpen}
        onAdd={addToCanvas}
        clothes={coordiItems}
        onRemove={removeCooridItem}
      />
      <div className={styles["button-wrapper"]}>
        <>
          <Button onClick={handleClickSave} style="default" disabled={coordiItems.length === 0}>
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
      {isModalOpen && (
        <Modal
          title="코디 상세정보 입력"
          onClose={handleClickCancel}
          children={
            <>
              <div className={styles.field}>
                <label className={styles.label}>제목</label>
                <input
                  className={styles.input}
                  placeholder="코디의 제목을 입력해주세요."
                  value={coordiName}
                  onChange={(e) => setCoordiName(e.target.value)}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>설명</label>
                <input
                  className={styles.input}
                  placeholder="코디 상세 설명을 입력해주세요"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <button
                className={styles.saveButton}
                onClick={saveImage}
                disabled={isSaving || !coordiName.trim() || !description.trim()}
              >
                {isSaving ? "저장 중..." : "저장하기"}
              </button>
            </>
          }
        />
      )}
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
                  clearCoordiItems();
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

export default CoordiEditor;
