// src/stores/aiFittingStore.js
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { initialAvatars } from "@/pages/AiFitting/data.js";

const createEmptySelection = () => ({
  top: null,
  bottom: null,
  shoes: null,
});

export const useAiFittingStore = create(
  devtools(
    (set) => ({
      avatars: initialAvatars,
      selectedAvatarId: null,
      clothingSelection: createEmptySelection(),

      addAvatar: (avatar) => set((state) => ({ avatars: [...state.avatars, avatar] })),
      setSelectedAvatarId: (avatarId) => set({ selectedAvatarId: avatarId }),
      updateClothingSelection: (type, item) =>
        set((state) => ({
          clothingSelection: {
            ...state.clothingSelection,
            [type]: item,
          },
        })),
      clearClothingSelection: () => set({ clothingSelection: createEmptySelection() }),
    }),
    { name: "AiFittingStore" }, // devtools에서 구분하기 쉽게 이름 붙임
  ),
);
