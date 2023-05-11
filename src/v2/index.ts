import { useEffect, useLayoutEffect, useReducer, useRef } from "react";
import { partialIsDifferent } from "./tools";
import { Calculatable, calculateProgress, roundBy } from "../final/tools";
import {
  AvailableHTMLElement,
  DefaultState,
  SetScrollContainer,
  ScrollApis,
  ScrollCallback,
  ScrollCreatorReturnType,
  ScrollHook,
  ScrollListener,
  LocalScrollHook,
  LocalScrollCreatorReturnType,
} from "./types";

const isSSR =
  typeof window === "undefined" ||
  !window.navigator ||
  /ServerSideRendering|^Deno\//.test(window.navigator.userAgent);

const useIsomorphicLayoutEffect = isSSR ? useEffect : useLayoutEffect;

export const createScrollHook = <T extends Record<string, any>>(
  initialState: DefaultState<T>,
  hasScrollContainer?: boolean,
): ScrollCreatorReturnType<T> => {
  let isInitiated = false;
  let globalState: T = initialState.globalState;
  const defaultCallback = initialState.defaultCallback;
  const listeners: Set<ScrollListener<T>> = new Set();
  let scrollContainer: AvailableHTMLElement | null = null;

  const getGlobalState = () => globalState;
  const setGlobalState = (partial: Partial<T>) => {
    if (partialIsDifferent(globalState, partial)) {
      globalState = { ...globalState, ...partial };
      listeners.forEach((listener) => listener.forceUpdate());
    }
  };

  const handleOnScroll = () => {
    const currentViewport: Calculatable = hasScrollContainer
      ? {
          offsetTop: scrollContainer?.scrollTop ?? 999999,
          offsetHeight: scrollContainer?.offsetHeight ?? 0,
        }
      : {
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

  const setScrollContainer: SetScrollContainer = (containerElement) => {
    if (!hasScrollContainer) {
      console.error(
        "스크롤 컨테이너를 사용하려면 hasScrollContainer를 true로 하세요",
      );
      return null;
    }
    scrollContainer = containerElement;
    containerElement.addEventListener("scroll", handleOnScroll);
    containerElement.addEventListener("resize", handleOnScroll);
  };

  const useScroll: ScrollHook<T> = (callback) => {
    const [, forceUpdate] = useReducer((c: number): number => c + 1, 0);
    const targetRef = useRef<AvailableHTMLElement | null>(null);
    const listenerRef = useRef<ScrollListener<T>>(null);
    const scrollCallback = useRef<ScrollCallback<T>>(callback ?? null);
    const apis: ScrollApis<T> = {
      getState: getGlobalState(),
      setState: setGlobalState,
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
        if (!hasScrollContainer || (hasScrollContainer && scrollContainer))
          handleOnScroll();
      }
      //언마운트 시 리스너 삭제
      return () => {
        if (listenerRef.current) {
          listeners.delete(listenerRef.current);
        }
      };
    }, [targetRef]);

    return { targetRef, state: getGlobalState() };
  };

  return Object.assign(useScroll, { setScrollContainer });
};

export const createLocalScrollHook = <T extends Record<string, any>>(
  hasScrollContainer?: boolean,
): LocalScrollCreatorReturnType<T> => {
  let isInitiated = false;
  const listeners: Set<ScrollListener<T>> = new Set();
  let scrollContainer: AvailableHTMLElement | null = null;

  const handleOnScroll = () => {
    const currentViewport: Calculatable = hasScrollContainer
      ? {
          offsetTop: scrollContainer?.scrollTop ?? 999999,
          offsetHeight: scrollContainer?.offsetHeight ?? 0,
        }
      : {
          offsetTop: window.scrollY,
          offsetHeight: window.innerHeight,
        };

    for (const { element, apis, callback } of listeners) {
      const target: Calculatable = {
        offsetTop: element.offsetTop,
        offsetHeight: element.offsetHeight,
      };
      const progress = roundBy(calculateProgress(target, currentViewport), 2);
      if (callback)
        callback({
          ...apis,
          progress,
        });
    }
  };

  const setScrollContainer: SetScrollContainer = (containerElement) => {
    if (!hasScrollContainer) {
      console.error(
        "스크롤 컨테이너를 사용하려면 hasScrollContainer를 true로 하세요",
      );
      return null;
    }
    scrollContainer = containerElement;
    containerElement.addEventListener("scroll", handleOnScroll);
    containerElement.addEventListener("resize", handleOnScroll);
  };

  const useLocalScroll: LocalScrollHook<T> = (callback, initialState) => {
    const [, forceUpdate] = useReducer((c: number): number => c + 1, 0);
    const localState = useRef<T>(initialState);
    const targetRef = useRef<AvailableHTMLElement | null>(null);
    const listenerRef = useRef<ScrollListener<T>>(null);
    const scrollCallback = useRef<ScrollCallback<T>>(callback);

    const getLocalState = () => localState.current;

    const setLocalState = (partial: Partial<T>) => {
      if (partialIsDifferent(localState.current, partial)) {
        localState.current = { ...localState.current, ...partial };
        listeners.forEach((listener) => listener.forceUpdate());
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
          apis: {
            getState: getLocalState(),
            setState: setLocalState,
          },
        };
        /* TODO: ref에 직접 assign하는 방법 찾기 */
        // @ts-ignore
        listenerRef.current = listener;
        listeners.add(listener);
        if (!hasScrollContainer || (hasScrollContainer && scrollContainer))
          handleOnScroll();
      }
      //언마운트 시 리스너 삭제
      return () => {
        if (listenerRef.current) {
          listeners.delete(listenerRef.current);
        }
      };
    }, [targetRef]);

    return { targetRef, state: getLocalState() };
  };
  return Object.assign(useLocalScroll, { setScrollContainer });
};
