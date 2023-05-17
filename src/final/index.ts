import { MutableRefObject, useLayoutEffect, useReducer, useRef } from "react";
import {
  Calculatable,
  calculateProgress,
  partialIsDifferent,
  roundBy,
} from "./tools";
import { getScrollUtils, ScrollUtils } from "./extendedUtils";

//타입들
type AvailableHTMLElement = HTMLDivElement;

export type ScrollApis<T extends object> = {
  getScrollState: T;
  setScrollState: (partial: Partial<T>) => void;
  setGlobalState: (key: string, value: boolean) => void;
};

type ScrollFunction<T extends object> = (
  params: ScrollApis<T> &
    ScrollUtils<T> & {
      progress: number;
    },
) => void;

type ScrollListener<T extends object> = {
  element: AvailableHTMLElement;
  scrollFunction: ScrollFunction<T>;
  globalKeys: string[];
  forceUpdate: () => void;
  apis: ScrollApis<T>;
};

//데이터들
let isInitiated = false;
const scrollListeners: ScrollListener<any>[] = [];
const globalState: Record<string, boolean> = {};
const getGlobalStateWithKeys: (
  totalState: Record<string, boolean>,
  keys: string[],
) => Record<string, boolean> = (totalState, keys) => {
  const partialState: Record<string, boolean> = {};
  keys.forEach((key) => {
    partialState[key] = globalState[key];
  });
  return partialState;
};

//스크롤 이벤트 핸들러
const onScrollHandler = () => {
  const currentViewport: Calculatable = {
    offsetTop: window.scrollY,
    offsetHeight: window.innerHeight,
  };
  for (const { element, apis, scrollFunction } of scrollListeners) {
    const target: Calculatable = {
      offsetTop: element.offsetTop,
      offsetHeight: element.offsetHeight,
    };
    const progress = roundBy(calculateProgress(target, currentViewport), 2);
    scrollFunction({
      ...apis,
      ...getScrollUtils(progress, apis),
      progress,
    });
  }
};

//메인 Hook
const useWaffleScroll = <T extends object>(
  scrollFunction: ScrollFunction<T>,
  initialState: T,
  globalStateKey?: string[],
) => {
  const [, forceUpdate] = useReducer((c: number): number => c + 1, 0);
  const ref = useRef<AvailableHTMLElement | null>(null);
  const state = useRef<T>(initialState);
  const func = useRef<ScrollFunction<T>>(scrollFunction);
  const apis: ScrollApis<T> = {
    getScrollState: state.current,
    setScrollState: (partial) => {
      if (partialIsDifferent(state.current, partial)) {
        state.current = { ...state.current, ...partial };
        forceUpdate();
      }
    },
    setGlobalState: (key, value) => {
      const previousValue = globalState[key];
      if (previousValue !== value) {
        globalState[key] = value;

        scrollListeners
          .filter((listener) => listener.globalKeys.includes(key))
          .forEach((listener) => listener.forceUpdate());
      }
    },
  };
  useLayoutEffect(() => {
    //처음 사용되는 훅은 이벤트리스너를 등록
    if (!isInitiated) {
      window.addEventListener("scroll", onScrollHandler);
      window.addEventListener("resize", onScrollHandler);
      isInitiated = true;
    }
    //마운트 시 리스너 등록
    if (ref.current) {
      const listener: ScrollListener<T> = {
        element: ref.current,
        scrollFunction: func.current,
        globalKeys: globalStateKey ?? [],
        forceUpdate,
        apis: apis,
      };
      scrollListeners.push(listener);
      onScrollHandler();
    }
    //globalStateKey가 있을 시 등록
    if (globalStateKey) {
      globalStateKey.forEach((key) => {
        globalState[key] = false;
      });
    }

    //언마운트 시 리스너 삭제
    return () => {
      const index = scrollListeners.findIndex(
        (listener) => listener.element === ref.current,
      );
      if (index >= 0) {
        scrollListeners.splice(index, 1);
      }
    };
  }, [ref]);

  const hooks: {
    ref: MutableRefObject<any>;
    scrollState: T;
    globalState?: Record<string, boolean>;
  } = { ref, scrollState: state.current };
  if (globalStateKey) {
    const partialGlobalState = getGlobalStateWithKeys(
      globalState,
      globalStateKey,
    );
    hooks.globalState = partialGlobalState;
  }

  return hooks;
};

export default useWaffleScroll;
