// App.jsx
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Layout from "@/components/Layout/Layout";
import AiFittingLanding from "@/pages/AiFitting/AiFittingLanding";
import AvatarCreationPage from "@/pages/AiFitting/AvatarCreationPage";
import AvatarSelectionPage from "@/pages/AiFitting/AvatarSelectionPage";
import CalendarPage from "@/pages/Calendar/CalendarPage/CalendarPage";
import ClosetPage from "@/pages/ClosetPage/ClosetPage";
import ClosetDetailPage from "@/pages/ClosetDetailPage/ClosetDetailPage";
import ClosetRegisterPage from "@/pages/ClosetRegisterPage/ClosetRegisterPage";
import LoginPage from "@/pages/LoginPage/LoginPage";
import MainPage from "@/pages/MainPage/MainPage";
import PasswordReset from "@/pages/PasswordResetPage/PasswordResetPage";
import SignUpPage from "@/pages/SignUpPage/SignUpPage";
import SnapPage from "@/pages/SnapPage/SnapPage";
import Start from "@/pages/Start/Start";
import MyPage from "@/pages/MyPage/MyPage";
import ProfileEditPage from "@/pages/ProfileEditPage.jsx/ProfileEditPage";
import CalendarRouter from "./pages/Calendar/CalendarRouter";
import CalendarDetail from "./pages/Calendar/CalendarDetail/CalendarDetail";
import CalendarEditor from "./pages/Calendar/CalendarEditor/CalendarEditor";
import CommonCodePage from "@/pages/CommonCodePage/CommonCodePage";

// 라우터 정의
const router = createBrowserRouter([
  // 풀스크린 계열 → Layout 안 쓰니까 handle 필요 없음
  { path: "/", element: <Start /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/signup", element: <SignUpPage /> },
  { path: "/password-reset", element: <PasswordReset /> },
  { path: "/common-codes", element: <CommonCodePage /> },
  //
  // Layout 안에 들어가는 일반 페이지들
  {
    element: <Layout />,
    children: [
      // 루트 탭들: 헤더+탭 / 뒤로가기 없음
      {
        path: "/main",
        element: <MainPage />,
        handle: {
          showBack: false,
          showHeader: false,
          showTabbar: true,
        },
      },
      {
        path: "/calendar",
        element: <CalendarPage />,
        handle: {
          title: "코디 캘린더",
          showBack: false,
          showHeader: false,
          showTabbar: true,
        },
        children: [
          {
            path: ":date",
            element: <CalendarRouter />,
            children: [
              { path: "", element: <CalendarDetail /> },
              { path: "editor", element: <CalendarEditor /> },
            ],
          },
        ],
      },
      {
        path: "/closet",
        element: <ClosetPage />,
        handle: {
          title: "내 옷장",
          showBack: true,
          showHeader: true,
          showTabbar: true,
        },
      },
      {
        path: "/closet/register",
        element: <ClosetRegisterPage />,
        handle: {
          title: "옷 등록",
          showBack: true,
          showHeader: true,
          showTabbar: false,
        },
      },
      {
        path: "/closet/item/:itemId",
        element: <ClosetDetailPage />,
        handle: {
          title: "옷 상세보기",
          showBack: true,
          showHeader: true,
          showTabbar: true,
        },
      },
      {
        path: "/mypage",
        element: <MyPage />,
        handle: {
          showBack: true,
          showHeader: true,
          showTabbar: true,
        },
      },

      // 헤더 X + 탭바 O
      {
        path: "/snap",
        element: <SnapPage />,
        handle: {
          title: "스냅",
          showBack: true,
          showHeader: true,
          showTabbar: true,
        },
      },

      // 헤더 O + 탭바 X (예: 상세/편집 페이지)
      {
        path: "/profile/edit",
        element: <ProfileEditPage />,
        handle: {
          title: "프로필 수정",
          showBack: true,
          showHeader: true,
          showTabbar: true,
        },
      },
      {
        path: "/ai-fitting",
        element: <AiFittingLanding />,
        handle: {
          title: "AI 피팅",
          showBack: true,
          showHeader: true,
          showTabbar: false,
        },
      },
      {
        path: "/ai-fitting/avatars",
        element: <AvatarSelectionPage />,
        handle: {
          title: "아바타 선택",
          showBack: true,
          showHeader: true,
          showTabbar: false,
        },
      },
      {
        path: "/ai-fitting/avatars/new",
        element: <AvatarCreationPage />,
        handle: {
          title: "아바타 만들기",
          showBack: true,
          showHeader: true,
          showTabbar: false,
        },
      },
    ],
  },
]);
const App = () => {
  return <RouterProvider router={router} />;
};

export default App;
// --- IGNORE ---
