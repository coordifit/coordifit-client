import ClosetModal from "@/pages/Calendar/ClosetModal/ClosetModal";
import styles from "./CoordiEditor.module.css";
import classNames from "classnames/bind";
import ItemCarousel from "@/components/ItemCarousel/ItemCarousel";
import Modal from "@/components/Modal/Modal";

import { Layer, Rect, Stage } from "react-konva";
import { useCoordiStore } from "@/stores/coordiStore";
import { useBeforeUnload, useLocation, useNavigate, useParams } from "react-router-dom";
import { useLeaveConfirm } from "@/hooks/useLeaveConfirm";
import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useCoordiByIdQuery } from "@/hooks/useCoordiQuery";
import { CANVAS_CONFIG } from "@/constants/calendar";
import { getCanvasPosition } from "@/utils/canvasUtils";
import CanvasItem from "@/pages/Calendar/CanvasItem/CanvasItem";
import { api } from "@/services/axiosInstance";
import Button from "@/components/Button/Button";
import { TbShirt } from "react-icons/tb";
import { FiImage } from "react-icons/fi";
import aiIcon from "@/assets/icons/samsung_ai.webp";

const cn = classNames.bind(styles);
const MAX_NAME_LEN = 30;
const MAX_DESC_LEN = 200;

const CoordiEditor = () => {
  const [bgColor, setBgColor] = useState("#ffffff");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [description, setDescription] = useState("");
  const [coordiName, setCoordiName] = useState("");
  const [errors, setErrors] = useState({ name: "", desc: "" });
  const [viewMode, setViewMode] = useState("coordi");

  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadStatusMap, setLoadStatusMap] = useState({});
  const [aiExists, setAiExists] = useState(false);
  const [aiImageUrl, setAiImageUrl] = useState("");

  const pastClothesRef = useRef([]);
  const queryClient = useQueryClient();
  const stageRef = useRef(null);
  const navigate = useNavigate();
  const { coordiId } = useParams();
  const location = useLocation();

  const isCoordiNameValid = coordiName && coordiName.length <= 30;
  const isDescriptionValid = description && description.length <= 200;
  const isItemsValid = coordiItems.length > 0;
  const isDisabled = !(isItemsValid && isCoordiNameValid && isDescriptionValid);

  useEffect(() => {
    if (location.state?.dataUrl) {
      setAiExists(true);
    }

    if (location.state?.clothesList) {
      console.log("location.state?.clothesList", location.state?.clothesList);
    }
  }, [location]);

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
    } else {
      clearCoordiItems();
      navigate(-1);
    }
  });

  const { data: coordi = { data: {} } } = useCoordiByIdQuery(coordiId);

  useEffect(() => {
    const statuses = Object.values(loadStatusMap);

    if (statuses.length === 0) {
      setIsLoading(false);
    } else if (statuses.every((s) => s === "loaded")) {
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }
  }, [loadStatusMap]);

  useEffect(() => {
    if (coordi?.data?.canvasJson) {
      const pastClothes = JSON.parse(coordi.data.canvasJson);

      pastClothesRef.current = pastClothes;
      setCoordiItems(pastClothes);
      setDescription(coordi.data.description || "");
      setCoordiName(coordi.data.coordiName || "");
    }

    console.log("coordidata", coordi.data);
    if (coordi?.data?.aiImageUrl) {
      setAiImageUrl(coordi?.data?.aiImageUrl);
      setAiExists(true);
    }
  }, [coordi]);

  useEffect(() => {
    const sameClothes = JSON.stringify(pastClothesRef.current) === JSON.stringify(coordiItems);
    const sameName = (coordi?.data?.coordiName || "") === coordiName;
    const sameDesc = (coordi?.data?.description || "") === description;
    const dirtyNow = !(sameClothes && sameDesc && sameName);

    setIsDirty((prev) => (prev !== dirtyNow ? dirtyNow : prev));
  }, [coordi, coordiItems, coordi?.data?.coordiName, coordi?.data?.description]);

  const handleNameChange = (e) => {
    const value = e.target.value;
    if (value.length > MAX_NAME_LEN) {
      setErrors((prev) => ({
        ...prev,
        name: `제목은 ${MAX_NAME_LEN}자 이하로 입력해주세요.`,
      }));
    } else {
      setErrors((prev) => ({ ...prev, name: "" }));
    }
    setCoordiName(value);
  };

  const isInvalid = !!errors.name || !!errors.desc || !coordiName.trim() || !description.trim();

  const handleDescChange = (e) => {
    const value = e.target.value;
    if (value.length > MAX_DESC_LEN) {
      setErrors((prev) => ({
        ...prev,
        desc: `상세 설명은 ${MAX_DESC_LEN}자 이하로 입력해주세요.`,
      }));
    } else {
      setErrors((prev) => ({ ...prev, desc: "" }));
    }
    setDescription(value);
  };

  const handleClickCancel = () => {
    setIsModalOpen(false);
  };

  const handleLoadStatus = (id, status) => {
    setLoadStatusMap((prev) => ({ ...prev, [id]: status }));
  };

  const addToCanvas = (item) => {
    const pos =
      item.x != null && item.y != null
        ? { x: item.x, y: item.y, scale: 1 }
        : getCanvasPosition(item.categoryCode);

    const img = new Image();
    img.src = item.imageUrl;
    img.onload = () => {
      const maxWidth = 350;
      let scale = 1;

      if (img.width > maxWidth) {
        scale = maxWidth / img.width;
      }

      const konvaObject = {
        instanceId: `${item.clothesId}-${Date.now()}`,
        clothesId: item.clothesId,
        imageUrl: item.imageUrl,
        name: item.name,
        categoryCode: item.categoryCode,
        x: pos.x,
        y: pos.y,
        scaleX: (pos.scale ?? 1) * scale,
        scaleY: (pos.scale ?? 1) * scale,
        rotation: item.rotation ?? 0,
        ...(item.width && { width: item.width }),
        ...(item.height && { height: item.height }),
      };

      addCoordiItem(konvaObject);
      setSelectedId(konvaObject.clothesId);
    };
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

        console.log("canvasJson", JSON.stringify(coordiItems));
        if (coordiId) {
          if (aiExists && !aiImageUrl) {
            const cleanBase64 = location.state.dataUrl.value.replace(/\s+/g, "");
            const dataUrl = `data:image/png;base64,${cleanBase64}`;

            await api.put(`/coordi/${coordiId}/ai-image`, {
              dataUrl,
            });
          } else {
            await api.put(`/coordi/${coordiId}`, formData);
          }
        } else {
          if (aiExists && aiImageUrl) {
            const cleanBase64 = location.state.dataUrl.value.replace(/\s+/g, "");
            const dataUrl = `data:image/png;base64,${cleanBase64}`;

            formData.append("dataUrl", dataUrl);
          }
          await api.post(`/coordi`, formData);
        }

        pastClothesRef.current = coordiItems;
        setIsDirty(false);
        clearCoordiItems();

        setTimeout(() => {
          navigate("/closet", { replace: true });
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
      <div className={cn("headerWapper")}>
        <div className={cn("content-header")}>
          <div className={cn("header-left")}>
            <div className={cn("label-wrapper")}>
              <label htmlFor="coordiName" className={cn("inputLabel")}>
                코디 제목<span className={cn("requiredMark")}>*</span>
              </label>
              <span className={cn("charCounter", coordiName.length > 30 && "error")}>
                {coordiName.length}/30자
              </span>
            </div>
            <div className={cn("inputWrapper")}>
              <input
                id="coordiName"
                type="text"
                className={cn("titleInput", errors.name && "error")}
                value={coordiName}
                placeholder="코디 제목을 입력하세요 (최대 30자)"
                onChange={(e) => {
                  const val = e.target.value;
                  setCoordiName(val);
                  setErrors((prev) => ({
                    ...prev,
                    name: val.length > 30 ? "제목은 30자 이내로 입력해주세요." : "",
                  }));
                }}
              />
              <div className={cn("counterRow")}>
                {errors.name ? (
                  <span className={cn("errorMsgInline")}>{errors.name}</span>
                ) : (
                  <div className={cn("emptyErrorMsg")} />
                )}
              </div>
            </div>
          </div>
          <div className={cn("view-toggle-wrapper")}>
            <div className={cn("view-toggle")} role="tablist" aria-label="보기 전환">
              <button
                role="tab"
                aria-selected={viewMode === "coordi"}
                className={cn("toggle-option", viewMode === "coordi" && "active")}
                onClick={() => setViewMode("coordi")}
                title="코디 아이템 보기"
              >
                <TbShirt className={cn("toggle-icon")} />
                <span className={cn("span")}>코디</span>
              </button>

              <button
                role="tab"
                aria-selected={viewMode === "ai"}
                className={cn(
                  "toggle-option",
                  "toggle-ai",
                  viewMode === "ai" && "active",
                  !aiExists && "empty", // 시각적으로 '없음' 상태 표시
                )}
                onClick={() => {
                  setViewMode("ai");
                  setIsLoading(false);
                }}
                title={aiExists ? "AI 피팅 이미지 보기" : "AI 피팅하러 가기"}
              >
                <img src={aiIcon} className={cn("toggle-icon")} />
                <span className={cn("span")}>AI 피팅</span>

                {aiExists ? (
                  <span className={cn("ai-badge", "ok")}>완료</span>
                ) : (
                  <span className={cn("ai-badge", "none")}>없음</span>
                )}
              </button>
            </div>
          </div>
        </div>
        <div className={cn("inputGroup")}>
          <div className={cn("label-wrapper")}>
            <label htmlFor="description" className={cn("inputLabel")}>
              상세 설명
              <span className={cn("requiredMark")}>*</span>
            </label>
            <span className={cn("charCounter", description.length > 200 && "error")}>
              {description.length}/200자
            </span>
          </div>

          <div className={cn("inputWrapper")}>
            <input
              type="text"
              name="description"
              className={cn("descInput", errors.desc && "error")}
              defaultValue={description}
              value={description}
              placeholder="설명을 입력하세요 (최대 200자)"
              onChange={(e) => {
                const val = e.target.value;
                setDescription(val);
                setErrors((prev) => ({
                  ...prev,
                  desc: val.length > 200 ? "설명은 200자 이내로 입력해주세요." : "",
                }));
              }}
            />
            <div className={cn("counterRow")}>
              {errors.desc ? (
                <span className={cn("errorMsgInline")}>{errors.desc}</span>
              ) : (
                <div className={cn("emptyErrorMsg")} />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className={cn("editorRow")}>
        {isLoading && (
          <div className={cn("canvas-loading-center")}>
            <div className={cn("loading-blur-box")}>
              <div className={cn("spinner")} />
              <p className={cn("loading-text")}>이미지 추가 중...</p>
            </div>
          </div>
        )}
        <div className={cn("canvasCard")}>
          {viewMode === "coordi" ? (
            <>
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
                      onLoad={handleLoadStatus}
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
            </>
          ) : aiExists ? (
            <>
              <img
                src={aiImageUrl}
                alt="" // 장식용
                className={cn("aiLayer")}
              />
            </>
          ) : (
            <>
              <div className={cn("aiEmpty")}>
                <div className={cn("aiEmptyIcon")}>
                  <FiImage />
                </div>
                <p className={cn("aiEmptyTitle")}>AI 시착 이미지가 없습니다</p>
                <p className={cn("aiEmptySub")}>코디를 저장한 뒤 AI 이미지를 생성할 수 있어요.</p>
              </div>
            </>
          )}
        </div>
        {viewMode === "coordi" && (
          <button
            className={cn("fab")}
            onClick={(e) => {
              e.stopPropagation();
              setSheetOpen(true);
            }}
          >
            +
          </button>
        )}
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
          <Button onClick={saveImage} style="default" disabled={isDisabled}>
            저장하기
          </Button>
          <Button
            onClick={(e) => {
              e.preventDefault();
              clearCoordiItems();
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
              <div className={cn("field")}>
                <label className={cn("label")}>코디 제목</label>
                <input
                  className={cn("input")}
                  placeholder="예) 오피스 캐주얼 룩"
                  value={coordiName}
                  onChange={handleNameChange}
                />
                {errors.name && <p className={cn("error")}>{errors.name}</p>}
              </div>

              <div className={cn("field")}>
                <label className={cn("label")}>상세 설명</label>
                <input
                  className={cn("input")}
                  placeholder="코디의 포인트나 특징을 자유롭게 써주세요"
                  value={description}
                  onChange={handleDescChange}
                />
                {errors.desc && <p className={cn("error")}>{errors.desc}</p>}
              </div>
              <button
                className={cn("saveButton")}
                onClick={saveImage}
                disabled={isSaving || isInvalid}
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
          children={"변경 사항이 저장되지 않았습니다.\n\n계속 이동할까요?"}
        />
      )}
    </div>
  );
};

export default CoordiEditor;
