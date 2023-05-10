import { useEffect, useLayoutEffect, useReducer, useRef } from "react";
import { partialIsDifferent } from "./tools";
import { Calculatable, calculateProgress, roundBy } from "../final/tools";
import {
  AvailableHTMLElement,
  DefaultState,
  ScrollApis,
  ScrollCallback,
  ScrollHook,
  ScrollListener,
} from "./types";

const isSSR =
  typeof window === "undefined" ||
  !window.navigator ||
  /ServerSideRendering|^Deno\//.test(window.navigator.userAgent);

const useIsomorphicLayoutEffect = isSSR ? useEffect : useLayoutEffect;

const createScrollHook = <T extends Record<string, any>>(
  initialState: DefaultState<T>,
  hasScrollContainer?: boolean,
): [scrollHook: ScrollHook<T>] => {
  let isInitiated = false;
  let globalState: T = initialState.globalState;
  const defaultCallback = initialState.defaultCallback;
  const listeners: Set<ScrollListener<T>> = new Set();

  const getGlobalState = () => globalState;
  const setGlobalState = (partial: Partial<T>) => {
    if (partialIsDifferent(globalState, partial)) {
      globalState = { ...globalState, ...partial };
      listeners.forEach((listener) => listener.forceUpdate());
    }
  };

  const useScroll: ScrollHook<T> = (callback) => {
    const [, forceUpdate] = useReducer((c: number): number => c + 1, 0);
    const targetRef = useRef<AvailableHTMLElement | null>(null);
    const listenerRef = useRef<ScrollListener<T>>(null);
    const scrollCallback = useRef<ScrollCallback<T>>(callback ?? null);
    const apis: ScrollApis<T> = {
      getGlobal: getGlobalState(),
      setGlobal: setGlobalState,
    };

    const handleOnScroll = () => {
      const currentViewport: Calculatable = {
        offsetTop: window.scrollY,
        offsetHeight: window.innerHeight,
      };
      for (const { element, apis, callback } of listeners) {
        const target: Calculatable = {
          offsetTop: element.offsetTop,
          offsetHeight: element.offsetHeight,
        };
        const progress = roundBy(calculateProgress(target, currentViewport), 2);
        //defaultCallback이 있을 경우 적용
        if (defaultCallback) defaultCallback({ ...apis, progress });
        //자체 callback 적용
        if (callback)
          callback({
            ...apis,
            progress,
          });
      }
    };

    useIsomorphicLayoutEffect(() => {
      //처음 사용되는 훅은 이벤트리스너를 등록
      if (!hasScrollContainer) {
        if (!isInitiated) {
          window.addEventListener("scroll", handleOnScroll);
          window.addEventListener("resize", handleOnScroll);
          isInitiated = true;
        }
      }
      //마운트 시 리스너 등록
      if (targetRef.current) {
        const listener: ScrollListener<T> = {
          element: targetRef.current,
          callback: scrollCallback.current ?? null,
          forceUpdate,
          apis,
        };
        /* TODO: ref에 직접 assign하는 방법 찾기 */
        // @ts-ignore
        listenerRef.current = listener;
        listeners.add(listener);
        handleOnScroll();
      }
      //언마운트 시 리스너 삭제
      return () => {
        if (listenerRef.current) {
          listeners.delete(listenerRef.current);
        }
      };
    }, [targetRef]);

    return { targetRef, globalState: getGlobalState() };
  };

  return [useScroll];
};

export default createScrollHook;
