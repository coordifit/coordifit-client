import { useRef, useSyncExternalStore } from 'react';

/**
 * 기본 Zustand 스토어 생성 헬퍼
 * 애플리케이션 전역에서 동일한 패턴으로 스토어를 초기화할 수 있도록 래핑합니다.
 *
 * @param {import("zustand").StateCreator<any>} initializer
 * @returns {import("zustand").UseBoundStore<any>}
 */
const defaultEquality = Object.is;

export const createZustandStore = (initializer) => {
  let state;
  const listeners = new Set();

  const notify = () => {
    listeners.forEach((listener) => listener());
  };

  const setState = (partial, replace = false) => {
    const nextState =
      typeof partial === 'function' ? (partial(state) ?? state) : (partial ?? state);

    if (nextState === state) {
      return;
    }

    state = replace ? nextState : { ...state, ...nextState };
    notify();
  };

  const getState = () => state;

  const subscribe = (listener) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  };

  const api = { setState, getState, subscribe };

  state = initializer((partial, replace) => setState(partial, replace), getState, api);

  const useBoundStore = (selector = (value) => value, equalityFn = defaultEquality) => {
    const selectedRef = useRef(selector(state));

    return useSyncExternalStore(
      subscribe,
      () => {
        const nextSelected = selector(state);
        if (!equalityFn(selectedRef.current, nextSelected)) {
          selectedRef.current = nextSelected;
        }
        return selectedRef.current;
      },
      () => selector(state),
    );
  };

  useBoundStore.getState = getState;
  useBoundStore.setState = setState;
  useBoundStore.subscribe = subscribe;
  useBoundStore.destroy = () => listeners.clear();

  return useBoundStore;
};
