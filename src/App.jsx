// App.jsx
import { createBrowserRouter, Navigate, RouterProvider, useNavigate } from "react-router-dom";
import { useEffect } from "react";

import Layout from "@/components/Layout/Layout";
import AiFittingLanding from "@/pages/AiFitting/AiFittingLanding";
import AiFittingResultPage from "@/pages/AiFitting/AiFittingResultPage";
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
import SnapAddPage from "@/pages/SnapPage/SnapAddPage";
import SnapUploadCompletePage from "@/pages/SnapPage/SnapUploadCompletePage";
import Start from "@/pages/Start/Start";
import MyPage from "@/pages/MyPage/MyPage";
import ProfileEditPage from "@/pages/ProfileEditPage.jsx/ProfileEditPage";
import CalendarRouter from "./pages/Calendar/CalendarRouter";
import CalendarDetail from "./pages/Calendar/CalendarDetail/CalendarDetail";
import CalendarEditor from "./pages/Calendar/CalendarEditor/CalendarEditor";
import CommonCodePage from "@/pages/CommonCodePage/CommonCodePage";
import { formatYearMonth } from "./utils/calenderUtils";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import { TokenManager } from "./services/axiosInstance";

const AutoLogin = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (TokenManager.isLoggedIn()) {
      navigate("/main");
    } else {
      navigate("/start");
    }
  }, [navigate]);

  return null;
};

// 라우터 정의
const router = createBrowserRouter([
  // 풀스크린 계열 → Layout 안 쓰니까 handle 필요 없음
  { path: "/", element: <AutoLogin /> },
  { path: "/start", element: <Start /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/signup", element: <SignUpPage /> },
  { path: "/password-reset", element: <PasswordReset /> },
  { path: "/common-codes", element: <CommonCodePage /> },

  // Layout 안에 들어가는 일반 페이지들
  {
    element: <Layout />,
    children: [
      // 루트 탭들: 헤더+탭 / 뒤로가기 없음
      {
        path: "/main",
        element: (
          <ProtectedRoute>
            <MainPage />
          </ProtectedRoute>
        ),
        handle: {
          showBack: false,
          showHeader: false,
          showTabbar: true,
        },
      },
      {
        path: "/calendar",
        element: (
          <ProtectedRoute>
            <CalendarPage />
          </ProtectedRoute>
        ),
        handle: {
          title: "코디 캘린더",
          showBack: false,
          showHeader: false,
          showTabbar: true,
        },
        children: [
          {
            index: true,
            element: <Navigate to={`/calendar/${formatYearMonth(new Date())}`} replace />,
          },
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
        element: (
          <ProtectedRoute>
            <ClosetPage />
          </ProtectedRoute>
        ),
        handle: {
          title: "내 옷장",
          showBack: true,
          showHeader: true,
          showTabbar: true,
        },
      },
      {
        path: "/closet/register",
        element: (
          <ProtectedRoute>
            <ClosetRegisterPage />
          </ProtectedRoute>
        ),
        handle: {
          title: "옷 등록",
          showBack: true,
          showHeader: true,
          showTabbar: false,
        },
      },
      {
        path: "/closet/item/:itemId",
        element: (
          <ProtectedRoute>
            <ClosetDetailPage />
          </ProtectedRoute>
        ),
        handle: {
          title: "옷 상세보기",
          showBack: true,
          showHeader: true,
          showTabbar: true,
        },
      },
      {
        path: "/mypage",
        element: (
          <ProtectedRoute>
            <MyPage />
          </ProtectedRoute>
        ),
        handle: {
          showBack: true,
          showHeader: true,
          showTabbar: true,
        },
      },

      // 헤더 X + 탭바 O
      {
        path: "/snap",
        element: (
          <ProtectedRoute>
            <SnapPage />
          </ProtectedRoute>
        ),
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
        element: (
          <ProtectedRoute>
            <ProfileEditPage />
          </ProtectedRoute>
        ),
        handle: {
          title: "프로필 수정",
          showBack: true,
          showHeader: true,
          showTabbar: true,
        },
      },
      {
        path: "/ai-fitting",
        element: (
          <ProtectedRoute>
            <AiFittingLanding />
          </ProtectedRoute>
        ),
        handle: {
          title: "AI 피팅",
          showBack: true,
          showHeader: true,
          showTabbar: true,
        },
      },
      {
        path: "/ai-fitting/result",
        element: (
          <ProtectedRoute>
            <AiFittingResultPage />
          </ProtectedRoute>
        ),
        handle: {
          title: "AI 피팅 결과",
          showBack: true,
          showHeader: true,
          showTabbar: false,
        },
      },
      {
        path: "/ai-fitting/avatars",
        element: (
          <ProtectedRoute>
            <AvatarSelectionPage />
          </ProtectedRoute>
        ),
        handle: {
          title: "아바타 선택",
          showBack: true,
          showHeader: true,
          showTabbar: false,
        },
      },
      {
        path: "/ai-fitting/avatars/new",
        element: (
          <ProtectedRoute>
            <AvatarCreationPage />
          </ProtectedRoute>
        ),
        handle: {
          title: "아바타 만들기",
          showBack: true,
          showHeader: true,
          showTabbar: false,
        },
      },
      {
        path: "/snap/add",
        element: (
          <ProtectedRoute>
            <SnapAddPage />
          </ProtectedRoute>
        ),
        handle: {
          title: "스냅 업로드",
          showBack: true,
          showHeader: true,
          showTabbar: false,
        },
      },
      {
        path: "/snap/upload-complete",
        element: (
          <ProtectedRoute>
            <SnapUploadCompletePage />
          </ProtectedRoute>
        ),
        handle: {
          title: "스냅 업로드",
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
