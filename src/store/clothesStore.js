import { create } from "zustand";
import { devtools } from "zustand/middleware";

export const useClothesStore = create(
  devtools((set) => ({
    clothes: [],
    setClothes: (newClothes) => set({ clothes: newClothes }),
    addClothes: (clothingItem) =>
      set((state) =>
        state.clothes.find((item) => item.id === clothingItem.id)
          ? state
          : { clothes: [...state.clothes, clothingItem] },
      ),
    removeClothes: (id) =>
      set((state) => ({
        clothes: state.clothes.filter((item) => item.id !== id),
      })),
    clearClothes: () => set({ clothes: [] }),
  })),
);
