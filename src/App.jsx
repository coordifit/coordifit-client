import { ImagePage } from "@/pages/ImagePage/ImagePage";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/images" replace />} />
        <Route path="/images" element={<ImagePage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
