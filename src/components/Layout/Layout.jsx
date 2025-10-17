import { useEffect, useState } from "react";
import { Outlet, useBlocker, useMatches, useNavigationType } from "react-router-dom";

import classNames from "classnames/bind";

import BottomNav from "@/components/Layout/BottomNav/BottomNav";
import Header from "@/components/Layout/Header/Header";
import Modal from "@/components/Modal/Modal";

import styles from "./Layout.module.css";
import { useClothesStore } from "@/stores/clothesStore";

const cn = classNames.bind(styles);

const lastDefined = (arr) => [...arr].reverse().find((v) => v !== undefined);
const isEditorPath = (pathname) => /^\/calendar\/\d{4}-\d{2}-\d{2}\/editor$/.test(pathname);

const Layout = () => {
  const matches = useMatches();
  const [open, setOpen] = useState(false);
  const { clothes, clearClothes } = useClothesStore();

  const handles = matches.map((m) => m.handle ?? {});

  const navigationType = useNavigationType();

  const shouldBlock =
    clothes.length > 0 && isEditorPath(location.pathname) && navigationType === "POP";
  const blocker = useBlocker(shouldBlock);

  const showHeader = lastDefined(handles.map((h) => h.showHeader));
  const showTabbar = lastDefined(handles.map((h) => h.showTabbar));
  const contentPadding = lastDefined(handles.map((h) => h.contentPadding));
  const isNoPad = contentPadding === "none";

  useEffect(() => {
    if (blocker.state === "blocked") {
      setOpen(true);
    }
  }, [blocker.state]);

  const handlerCloseModal = (confirm) => {
    setOpen(false);
    if (confirm) {
      clearClothes();
      blocker.proceed();
    } else {
      blocker.reset();
    }
  };

  return (
    <>
      <div className={cn("page")}>
        <div className={cn("app")}>
          {showHeader !== false && <Header />}
          <main className={cn("main-content", { "no-padding": isNoPad })}>
            <Outlet />
          </main>
          {showTabbar && <BottomNav />}
        </div>
      </div>
      {open && (
        <Modal
          title="뒤로 가기"
          onClose={() => setOpen(false)}
          footer={
            <>
              <button type="button" onClick={() => handlerCloseModal(false)}>
                아니요
              </button>
              <button type="button" onClick={() => handlerCloseModal(true)}>
                예
              </button>
            </>
          }
          children={
            "변경 사항이 저장되지 않았습니다\n 작성중인 데일리룩은 삭제됩니다. 뒤로 이동할까요?"
          }
        />
      )}
    </>
  );
};

export default Layout;
