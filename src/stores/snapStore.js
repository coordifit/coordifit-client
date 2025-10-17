import { create } from "zustand";

export const useSnapStore = create((set) => ({
  imageFiles: [],
  uploadedImages: [],
  selectedItems: [],
  setImageFiles: (files) => set({ imageFiles: files }),
  setUploadedImages: (images) => set({ uploadedImages: images }),
  setSelectedItems: (items) => set({ selectedItems: items }),
  clearSnapData: () => set({ imageFiles: [], uploadedImages: [], selectedItems: [] }),
}));
