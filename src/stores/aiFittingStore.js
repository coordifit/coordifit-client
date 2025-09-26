import { createZustandStore } from "../stores/createZustandstore.js";
import { initialAvatars } from "@/pages/AiFitting/data.js";

const createEmptySelection = () => ({
  top: null,
  bottom: null,
  shoes: null,
});

export const useAiFittingStore = createZustandStore((set) => ({
  avatars: initialAvatars,
  selectedAvatarId: initialAvatars[0]?.id ?? null,
  clothingSelection: createEmptySelection(),
  addAvatar: (avatar) => {
    set((state) => ({ avatars: [...state.avatars, avatar] }));
  },
  setSelectedAvatarId: (avatarId) => {
    set({ selectedAvatarId: avatarId });
  },
  updateClothingSelection: (type, item) => {
    set((state) => ({
      clothingSelection: {
        ...state.clothingSelection,
        [type]: item,
      },
    }));
  },
  clearClothingSelection: () => {
    set({ clothingSelection: createEmptySelection() });
  },
}));

export const selectAvatars = (state) => state.avatars;
export const selectSelectedAvatarId = (state) => state.selectedAvatarId;
export const selectClothingSelection = (state) => state.clothingSelection;
export const selectAddAvatar = (state) => state.addAvatar;
export const selectSetSelectedAvatarId = (state) => state.setSelectedAvatarId;
export const selectUpdateClothingSelection = (state) =>
  state.updateClothingSelection;
export const selectClearClothingSelection = (state) =>
  state.clearClothingSelection;
