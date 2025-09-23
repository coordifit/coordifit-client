import { ImagePage } from "@/pages/ImagePage/ImagePage";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./pages/Layout/Layout";
import Main from "./pages/Main/Main";
import Calendar from "./pages/Calendar/Calendar";
import Closet from "./pages/Closet/Closet";
import Snap from "./pages/Snap/Snap";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Main />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/snap" element={<Snap />} />
          <Route path="/closet" element={<Closet />} />
          <Route path="/images" element={<ImagePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
