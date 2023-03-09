import { useLayoutEffect, useReducer, useRef } from "react";
import { Calculatable, calculateProgress, roundBy } from "./calculate";
import { partialIsDifferent } from "./compare";

//types
export type PickByType<T, U> = {
  [P in keyof T as T[P] extends U ? (U extends T[P] ? P : never) : never]: T[P];
};

type AvailableHTMLElement = HTMLDivElement;

type ScrollApis<StateType extends object> = {
  getScrollState: StateType;
  setScrollState: (partial: Partial<StateType>) => void;
};
type ScrollUtils<StateType extends object> = {
  toggleState: (
    min: number,
    max: number,
    stateKeyToToggle: keyof PickByType<StateType, boolean>,
  ) => void;
};

type ScrollFunction<StateType extends object> = (
  params: ScrollApis<StateType> &
    ScrollUtils<StateType> & {
      progress: number;
    },
) => void;

type ScrollFunctionParams<StateType extends object> = Parameters<
  ScrollFunction<StateType>
>;

type ScrollListener<StateType extends object> = {
  element: AvailableHTMLElement;
  scrollFunction: ScrollFunction<StateType>;
  apis: {
    getScrollState: StateType;
    setScrollState: (partial: Partial<StateType>) => void;
  };
};

//global scope data
const localWindow = window;
const scrollListeners: ScrollListener<any>[] = [];
const isInitiated = false;

//function
//const onInitiateScroll = () => {};

const onScrollHandler = () => {
  const currentViewport: Calculatable = {
    offsetTop: localWindow.scrollY,
    offsetHeight: localWindow.innerHeight,
  };
  //interate current scrollListeners
  for (const { element, apis, scrollFunction } of scrollListeners) {
    //calculate scroll progress
    const target: Calculatable = {
      offsetTop: element.offsetTop,
      offsetHeight: element.offsetHeight,
    };
    const progress = roundBy(calculateProgress(target, currentViewport), 2);
    scrollFunction({ ...apis, ...getScrollUtils(progress, apis), progress });
  }
};

//utility function
const getScrollUtils = <StateType extends object>(
  progress: number,
  apis: ScrollApis<StateType>,
): ScrollUtils<StateType> => {
  const { getScrollState, setScrollState } = apis;

  const toggleState: ScrollUtils<StateType>["toggleState"] = (
    min,
    max,
    stateKeyToToggle,
  ) => {
    if (progress >= min && progress <= max) {
      setScrollState({ [stateKeyToToggle]: true });
    } else {
      setScrollState({ [stateKeyToToggle]: false });
    }
  };
  return { toggleState };
};

export const useWaffleScrollContainer = () => {
  const ref = useRef<AvailableHTMLElement | null>(null);

  //스크롤 이벤트 처음 등록 시
  useLayoutEffect(() => {
    localWindow.addEventListener("scroll", onScrollHandler);
    onScrollHandler();
    //return window.removeEventListener("scroll", onScrollHandler);
  }, []);

  return { ref, onScroll: onScrollHandler };
};

export const useWaffleScroll = <StateType extends object>(
  scrollFunction: ScrollFunction<StateType>,
  initialState: StateType,
) => {
  const [, forceUpdate] = useReducer((c: number): number => c + 1, 0);
  const ref = useRef<AvailableHTMLElement | null>(null);
  const state = useRef<StateType>(initialState);
  const func = useRef<ScrollFunction<StateType>>(scrollFunction);
  const apis: ScrollApis<StateType> = {
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
    }
  }, [ref]);

  return { ref, scrollState: state.current };
};
