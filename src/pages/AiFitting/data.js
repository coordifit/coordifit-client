import topIcon from "@/assets/images/topicon.png";
import bottomIcon from "@/assets/images/bottomicon.png";
import shoesIcon from "@/assets/images/shoesicon.png";

export const initialAvatars = [
  {
    id: "avatar-1",
    name: "여성 아바타 1",
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "avatar-2",
    name: "여성 아바타 2",
    image:
      "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "avatar-3",
    name: "남성 아바타 1",
    image:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80",
  },
];

export const clothingTypes = [
  { id: "top", label: "상의", icon: topIcon },
  { id: "bottom", label: "하의", icon: bottomIcon },
  { id: "shoes", label: "신발", icon: shoesIcon },
];

export const closetCategoryMap = {
  top: "top",
  bottom: "bottom",
  shoes: "shoes",
};
