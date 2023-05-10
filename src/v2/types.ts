import { MutableRefObject } from "react";

/* TODO: AvailableHTMLElment 가짓수 늘리기 */
export type AvailableHTMLElement = HTMLDivElement;

export type ScrollApis<GlobalInterface extends Record<string, any>> = {
  getGlobal: GlobalInterface;
  setGlobal: (partial: Partial<GlobalInterface>) => void;
};

export type ScrollCallback<T extends Record<string, any>> = (
  params: ScrollApis<T> & { progress: number },
) => void;

export type ScrollListener<T extends Record<string, any>> = {
  element: AvailableHTMLElement;
  callback: ScrollCallback<T> | null;
  forceUpdate: () => void;
  apis: ScrollApis<T>;
};

export type DefaultState<T extends Record<string, any>> = {
  globalState: T;
  defaultCallback?: ScrollCallback<T>;
};

export type ScrollHook<T extends Record<string, any>> = (
  callback?: ScrollCallback<T>,
) => {
  targetRef: MutableRefObject<AvailableHTMLElement | null>;
  globalState: T;
};

export type LoadScrollContainer = (
  containerElement: AvailableHTMLElement,
) => void;
