import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ImagePage } from "@/pages/ImagePage/ui/ImagePage";

export const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/images" replace />} />
        <Route path="/images" element={<ImagePage />} />
      </Routes>
    </BrowserRouter>
  );
};
