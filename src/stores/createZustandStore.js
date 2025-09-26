import { create } from "zustand";

/**
 * 기본 Zustand 스토어 생성 헬퍼
 * 애플리케이션 전역에서 동일한 패턴으로 스토어를 초기화할 수 있도록 래핑합니다.
 *
 * @param {import("zustand").StateCreator<any>} initializer
 * @returns {import("zustand").UseBoundStore<any>}
 */
export const createZustandStore = (initializer) => {
  const useStore = create(initializer);

  const useBoundStore = (selector = (state) => state, equalityFn) =>
    useStore(selector, equalityFn);

  useBoundStore.getState = useStore.getState;
  useBoundStore.setState = useStore.setState;
  useBoundStore.subscribe = useStore.subscribe;
  useBoundStore.destroy = useStore.destroy;

  return useBoundStore;
};
