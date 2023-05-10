import {
  MutableRefObject,
  useEffect,
  useLayoutEffect,
  useReducer,
  useRef,
} from "react";
import { partialIsDifferent } from "./tools";
import { Calculatable, calculateProgress, roundBy } from "../final/tools";
import { getScrollUtils } from "../final/extendedUtils";

const isSSR =
  typeof window === "undefined" ||
  !window.navigator ||
  /ServerSideRendering|^Deno\//.test(window.navigator.userAgent);

const useIsomorphicLayoutEffect = isSSR ? useEffect : useLayoutEffect;

export type AvailableHTMLElement = HTMLDivElement;

export type ScrollApis<
  GlobalInterface extends Record<string, any>,
  // LocalInterface extends Record<string, any>,
> = {
  getGlobal: GlobalInterface;
  setGlobal: (partial: Partial<GlobalInterface>) => void;
  // getLocal: LocalInterface;
  // setLocal: (partial: Partial<LocalInterface>) => void;
};

type ScrollCallback<T extends Record<string, any>> = (
  params: ScrollApis<T> & { progress: number },
) => void;

type ScrollListener<T extends Record<string, any>> = {
  element: AvailableHTMLElement;
  callback: ScrollCallback<T>;
  forceUpdate: () => void;
  apis: ScrollApis<T>;
};

export type ScrollHook<
  T extends Record<string, any>,
  // U extends Record<string, any>,
> = (callback: ScrollCallback<T>) => {
  targetRef: MutableRefObject<AvailableHTMLElement | null>;
  globalState: T;
};

const createScrollHook = <T extends Record<string, any>>(
  initialGlobalState: T,
  hasScrollContainer?: boolean,
): [scrollHook: ScrollHook<T>] => {
  let isInitiated = false;
  let globalState: T = initialGlobalState;
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
    const scrollCallback = useRef<ScrollCallback<T>>(callback);
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
          callback: scrollCallback.current,
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
