import { useLayoutEffect, useReducer, useRef } from "react";
import { Calculatable, calculateProgress, roundBy } from "./calculate";
import { partialIsDifferent } from "./compare";

const localWindow = window;

type ScrollFunctionParams<StateType extends object> = {
  progress: number;
  getScrollState: StateType;
  setScrollState: (partial: Partial<StateType>) => void;
};

type ScrollListener<StateType extends object> = {
  element: HTMLDivElement;
  scrollFunction: (params: ScrollFunctionParams<StateType>) => void;
  apis: {
    getScrollState: StateType;
    setScrollState: (partial: Partial<StateType>) => void;
  };
};

const scrollListeners: ScrollListener<any>[] = [];

const onScrollHandler = () => {
  const currentViewport: Calculatable = {
    offsetTop: localWindow.scrollY,
    offsetHeight: localWindow.innerHeight,
  };
  for (const { element, apis, scrollFunction } of scrollListeners) {
    //calculate scroll progress
    const target: Calculatable = {
      offsetTop: element.offsetTop,
      offsetHeight: element.offsetHeight,
    };
    const progress = roundBy(calculateProgress(target, currentViewport), 2);
    scrollFunction({ ...apis, progress });
  }
};

export const useWaffleScrollContainer = () => {
  const ref = useRef<HTMLDivElement | null>(null);

  //스크롤 이벤트 처음 등록 시
  useLayoutEffect(() => {
    localWindow.addEventListener("scroll", onScrollHandler);
    onScrollHandler();
    //return window.removeEventListener("scroll", onScrollHandler);
  }, []);

  return { ref, onScroll: onScrollHandler };
};

export const useWaffleScroll = <StateType extends object>(
  scrollFunction: (params: ScrollFunctionParams<StateType>) => void,
  initialState: StateType,
) => {
  const [, forceUpdate] = useReducer((c: number): number => c + 1, 0);
  const ref = useRef<HTMLDivElement | null>(null);
  const state = useRef<StateType>(initialState);
  const func =
    useRef<(params: ScrollFunctionParams<StateType>) => void>(scrollFunction);
  const apis = {
    getScrollState: state.current,
    setScrollState: (partial: Partial<StateType>): void => {
      if (partialIsDifferent(state.current, partial)) {
        state.current = { ...state.current, ...partial };
        forceUpdate();
      }
    },
  };
  //스크롤 이벤트 처음 등록 시
  useLayoutEffect(() => {
    if (ref.current) {
      const listener: ScrollListener<StateType> = {
        element: ref.current,
        scrollFunction: func.current,
        apis: apis,
      };
      scrollListeners.push(listener);
      console.log(scrollListeners);
    }
  }, [ref]);

  return { ref, scrollState: state.current };
};
