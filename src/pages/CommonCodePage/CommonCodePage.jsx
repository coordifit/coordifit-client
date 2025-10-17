import React, { useState, useEffect } from "react";
import { api } from "../../services/axiosInstance";
import styles from "./CommonCodePage.module.css";
import { useQueryClient } from "@tanstack/react-query";
import { useCommonCodesQuery } from "@/hooks/useCommonCodeQuery";

const CommonCodePage = () => {
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const [filteredCodes, setFilteredCodes] = useState({});
  const [selectedParentCode, setSelectedParentCode] = useState("");
  const [newCodeName, setNewCodeName] = useState("");
  const [isAddingCode, setIsAddingCode] = useState(false);
  const [isRootCode, setIsRootCode] = useState(false);
  const [editingCode, setEditingCode] = useState(null);
  const [editCodeName, setEditCodeName] = useState("");
  const [isUpdatingCode, setIsUpdatingCode] = useState(false);

  const queryClient = useQueryClient();

  const { data: commonCodes, isError, error, isLoading, refetch } = useCommonCodesQuery();

  useEffect(() => {
    setFilteredCodes(commonCodes);
  }, [commonCodes]);

  const toggleNode = (codeId) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(codeId)) {
      newExpanded.delete(codeId);
    } else {
      newExpanded.add(codeId);
    }
    setExpandedNodes(newExpanded);
  };

  const handleNodeClick = (code) => {
    setSelectedParentCode(code.codeId);
    setNewCodeName("");
    setIsRootCode(false);
  };

  const handleRootCodeClick = () => {
    setSelectedParentCode("");
    setNewCodeName("");
    setIsRootCode(true);
  };

  const handleEditClick = (code) => {
    setEditingCode(code.codeId);
    setEditCodeName(code.codeName);
  };

  const handleEditCancel = () => {
    setEditingCode(null);
    setEditCodeName("");
  };

  const updateCommonCode = async (codeId, codeName, isActive) => {
    try {
      await api.put(`/common-codes/${codeId}`, {
        codeName: codeName,
        isActive: isActive,
        updatedBy: "U000001", // 실제로는 로그인한 사용자 ID
      });

      console.log(">> 공통코드 업데이트 성공:", codeId);

      queryClient.invalidateQueries({ queryKey: ["commonCodes"] });

      return true;
    } catch (error) {
      console.error("코드 업데이트 중 오류:", error);
      return false;
    }
  };

  const handleEditSave = async (code) => {
    if (!editCodeName.trim()) {
      alert("코드명을 입력해주세요.");
      return;
    }

    setIsUpdatingCode(true);
    try {
      const success = await updateCommonCode(code.codeId, editCodeName.trim(), code.isActive);

      if (success) {
        setEditingCode(null);
        setEditCodeName("");
      }
    } finally {
      setIsUpdatingCode(false);
    }
  };

  const handleStatusToggle = async (code) => {
    const newStatus = code.isActive === "Y" ? "N" : "Y";
    await updateCommonCode(code.codeId, code.codeName, newStatus);
  };

  const handleDeleteCode = async (code) => {
    if (window.confirm(`'${code.codeName}' 코드를 삭제하시겠습니까?`)) {
      try {
        await api.delete(`/common-codes/${code.codeId}`);
        queryClient.invalidateQueries({ queryKey: ["commonCodes"] });
        alert("코드가 성공적으로 삭제되었습니다.");
      } catch (error) {
        console.error("코드 삭제 중 오류:", error);
      }
    }
  };

  const handleAddCode = async () => {
    if (!newCodeName.trim()) {
      alert("코드명을 입력해주세요.");
      return;
    }

    if (!isRootCode && !selectedParentCode) {
      alert("상위코드를 선택하거나 루트코드 버튼을 클릭해주세요.");
      return;
    }

    setIsAddingCode(true);
    try {
      await api.post("/common-codes", {
        codeName: newCodeName.trim(),
        parentCodeId: isRootCode ? null : selectedParentCode,
        isActive: "Y",
        createdBy: "U000001", // 실제로는 로그인한 사용자 ID
      });

      queryClient.invalidateQueries({ queryKey: ["commonCodes"] });
      alert("코드가 성공적으로 추가되었습니다.");
      setSelectedParentCode("");
      setNewCodeName("");
      setIsRootCode(false);
    } catch (error) {
      alert(error.response?.data?.message || "코드 추가 중 오류가 발생했습니다.");
    } finally {
      setIsAddingCode(false);
    }
  };

  const renderTreeNode = (code, level = 0) => {
    const hasChildren = code.children && Object.keys(code.children).length > 0;
    const isExpanded = expandedNodes.has(code.codeId);
    const indent = level * 20;

    return (
      <div key={code.codeId} className={styles.treeNode}>
        <div
          className={styles.treeNodeContent}
          onClick={() => handleNodeClick(code)}
          onDoubleClick={() => hasChildren && toggleNode(code.codeId)}
        >
          <div className={styles.treeNodeHeader}>
            <div className={styles.codeIdSection} style={{ paddingLeft: `${indent}px` }}>
              {hasChildren && <span className={styles.treeToggle}>{isExpanded ? "▼" : "▶"}</span>}
              {!hasChildren && <span className={styles.treeSpacer}></span>}
              <span className={styles.treeCodeId}>{code.codeId}</span>
            </div>
            <div className={styles.codeNameSection}>
              {editingCode === code.codeId ? (
                <input
                  type="text"
                  value={editCodeName}
                  onChange={(e) => setEditCodeName(e.target.value)}
                  className={styles.editInput}
                  autoFocus
                />
              ) : (
                <span className={styles.treeCodeName}>{code.codeName}</span>
              )}
            </div>
            <div className={styles.statusSection}>
              <button onClick={() => handleStatusToggle(code)} className={styles.actionButton}>
                {code.isActive === "Y" ? "사용" : "미사용"}
              </button>
            </div>
            <div className={styles.actionSection}>
              {editingCode === code.codeId ? (
                <>
                  <button
                    onClick={() => handleEditSave(code)}
                    disabled={isUpdatingCode}
                    className={styles.actionButton}
                  >
                    {isUpdatingCode ? "저장 중..." : "저장"}
                  </button>
                  <button onClick={handleEditCancel} className={styles.actionButton}>
                    취소
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => handleEditClick(code)} className={styles.actionButton}>
                    수정
                  </button>
                  <button onClick={() => handleDeleteCode(code)} className={styles.actionButton}>
                    삭제
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className={styles.treeChildren}>
            {Object.values(code.children).map((child) => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>공통코드를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h3>오류가 발생했습니다</h3>
          <p>{error}</p>
          <button onClick={() => refetch()} className={styles.retryBtn}>
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>공통코드 관리</h1>
        <div className={styles.actions}>
          <button onClick={() => refetch()} className={styles.refreshBtn}>
            조회
          </button>
        </div>
      </div>

      <div className={styles.addCodeSection}>
        <div className={styles.addCodeFields}>
          <div className={styles.fieldGroup}>
            <div className={styles.labelContainer}>
              <label className={styles.label}>상위코드:</label>
              <button
                onClick={handleRootCodeClick}
                className={`${styles.actionButton} ${!isRootCode ? styles.active : ""}`}
              >
                루트코드
              </button>
            </div>
            <input
              type="text"
              value={isRootCode ? "루트코드" : selectedParentCode}
              readOnly
              className={styles.parentCodeInput}
              placeholder="노드를 선택하세요"
            />
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>코드명:</label>
            <input
              type="text"
              value={newCodeName}
              onChange={(e) => setNewCodeName(e.target.value)}
              className={styles.codeNameInput}
              placeholder="새 코드명을 입력하세요"
            />
          </div>
          <div className={styles.buttonGroup}>
            <button
              onClick={handleAddCode}
              disabled={(!isRootCode && !selectedParentCode) || !newCodeName.trim() || isAddingCode}
              className={styles.addCodeBtn}
            >
              {isAddingCode ? "추가 중..." : "코드 추가"}
            </button>
          </div>
        </div>
      </div>

      <div className={styles.treeContainer}>
        <div className={styles.treeHeader}>
          <div>코드ID</div>
          <div>코드명</div>
          <div>상태</div>
          <div>작업</div>
        </div>

        <div className={styles.treeContent}>
          {Object.values(filteredCodes).map((code) => renderTreeNode(code))}
        </div>
      </div>
    </div>
  );
};

export default CommonCodePage;
