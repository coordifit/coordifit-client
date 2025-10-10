import { create } from "zustand";
import { devtools } from "zustand/middleware";

export const useClothesStore = create(
  devtools((set) => ({
    clothes: [],
    setClothes: (newClothesList) => set({ clothes: newClothesList }),
    addClothes: (newClothes) =>
      set((state) =>
        state.clothes.find((item) => item.id === newClothes.id)
          ? state
          : { clothes: [...state.clothes, newClothes] },
      ),
    removeClothes: (targetId) =>
      set((state) => ({
        clothes: state.clothes.filter((item) => item.id !== targetId),
      })),
    updateClothes: (targetId, updatedFields) =>
      set((state) => ({
        clothes: state.clothes.map((item) =>
          item.id === targetId ? { ...item, ...updatedFields } : item,
        ),
      })),
    clearClothes: () => set({ clothes: [] }),
  })),
);
