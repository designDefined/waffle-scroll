import { useLayoutEffect, useReducer, useRef } from "react";
import { Calculatable, calculateProgress, roundBy } from "./calculate";
import { partialIsDifferent } from "./compare";
import { GlobalStateApi, globalStateApis } from "./useGlobalScrollState";
import { getScrollUtils, ScrollUtils } from "./utils";

//type utility
export type PickByType<T, U> = {
  [P in keyof T as T[P] extends U ? (U extends T[P] ? P : never) : never]: T[P];
};

//types
type AvailableHTMLElement = HTMLDivElement;

export type ScrollApis<T extends object> = {
  getScrollState: T;
  setScrollState: (partial: Partial<T>) => void;
};

type ScrollFunction<T extends object> = (
  params: ScrollApis<T> &
    ScrollUtils<T> &
    GlobalStateApi & {
      progress: number;
    },
) => void;

type ScrollListener<T extends object> = {
  element: AvailableHTMLElement;
  scrollFunction: ScrollFunction<T>;
  apis: {
    getScrollState: T;
    setScrollState: (partial: Partial<T>) => void;
  };
};

//local scope window
const localWindow = window;

//local data
const scrollListeners: ScrollListener<any>[] = [];
let isInitiated = false;

//scroll handler
const onScrollHandler = () => {
  const currentViewport: Calculatable = {
    offsetTop: localWindow.scrollY,
    offsetHeight: localWindow.innerHeight,
  };
  //iterate current scrollListeners
  for (const { element, apis, scrollFunction } of scrollListeners) {
    //calculate scroll progress
    const target: Calculatable = {
      offsetTop: element.offsetTop,
      offsetHeight: element.offsetHeight,
    };
    const progress = roundBy(calculateProgress(target, currentViewport), 2);
    scrollFunction({
      ...apis,
      ...globalStateApis,
      ...getScrollUtils(progress, apis),
      progress,
    });
  }
};

//main hook
export const useWaffleScroll = <T extends object>(
  scrollFunction: ScrollFunction<T>,
  initialState: T,
) => {
  const [, forceUpdate] = useReducer((c: number): number => c + 1, 0);
  const ref = useRef<AvailableHTMLElement | null>(null);
  const state = useRef<T>(initialState);
  const func = useRef<ScrollFunction<T>>(scrollFunction);
  const apis: ScrollApis<T> = {
    getScrollState: state.current,
    setScrollState: (partial: Partial<T>): void => {
      if (partialIsDifferent(state.current, partial)) {
        state.current = { ...state.current, ...partial };
        forceUpdate();
      }
    },
  };
  useLayoutEffect(() => {
    //처음일 때는 이벤트 리스너 등록
    if (!isInitiated) {
      localWindow.addEventListener("scroll", onScrollHandler);
      isInitiated = true;
    }
    //스크롤 이벤트 처음 등록 시
    if (ref.current) {
      const listener: ScrollListener<T> = {
        element: ref.current,
        scrollFunction: func.current,
        apis: apis,
      };
      scrollListeners.push(listener);
    }
    onScrollHandler();
    //언마운트 시 리스터 삭제
    return () => {
      const index = scrollListeners.findIndex(
        (listener) => listener.element === ref.current,
      );
      if (index >= 0) {
        scrollListeners.splice(index, 1);
      }
    };
  }, [ref]);

  return { ref, scrollState: state.current };
};
