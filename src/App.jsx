import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "@/components/Layout/Layout";
import CalendarPage from "@/pages/Calendar/CalendarPage/CalendarPage";
import ClosetPage from "@/pages/ClosetPage/ClosetPage";
import LoginPage from "@/pages/LoginPage/LoginPage";
import MainPage from "@/pages/MainPage/MainPage";
import PasswordReset from "@/pages/PasswordResetPage/PasswordResetPage";
import SignUpPage from "@/pages/SignUpPage/SignUpPage";
import SnapPage from "@/pages/SnapPage/SnapPage";
import Start from "@/pages/Start/Start";
import MyPage from "@/pages/MyPage/MyPage";
import ProfileEditPage from "@/pages/ProfileEditPage.jsx/ProfileEditPage";
import CalendarRouter from "./pages/Calendar/CalendarRouter";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Start />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/password-reset" element={<PasswordReset />} />
        <Route element={<Layout />}>
          <Route path="/main" element={<MainPage />} />
          <Route path="/calendar" element={<CalendarPage />}>
            <Route path=":date" element={<CalendarRouter />} />
          </Route>
          <Route path="/snap" element={<SnapPage />} />
          <Route path="/closet" element={<ClosetPage />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/profile/edit" element={<ProfileEditPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
