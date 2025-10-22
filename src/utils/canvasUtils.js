import { CANVAS_CONFIG } from "@/constants/calendar";
import { CATEGORIES } from "@/constants/category";

const getDefaultPlacement = (categoryCode) => {
  const centerX = CANVAS_CONFIG.WIDTH / 2;
  const centerY = CANVAS_CONFIG.HEIGHT / 2;
  const parentCategory = CATEGORIES[categoryCode].parent;

  const map = {
    B20001: { x: centerX - 80, y: centerY - 220, scale: 0.5 },
    B20004: { x: centerX - 200, y: centerY - 120, scale: 0.5 },
    B20002: { x: centerX - 80, y: centerY - 30, scale: 0.5 },
    B20003: { x: centerX - 40, y: centerY + 70, scale: 0.4 },
    B20005: { x: centerX - 150, y: centerY + 80, scale: 0.3 },
  };

  return map[parentCategory] ?? map.B20005;
};

export { getDefaultPlacement };
