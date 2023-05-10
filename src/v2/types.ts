import { MutableRefObject } from "react";

/* TODO: AvailableHTMLElment 가짓수 늘리기 */
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

export type ScrollCallback<T extends Record<string, any>> = (
  params: ScrollApis<T> & { progress: number },
) => void;

export type ScrollListener<T extends Record<string, any>> = {
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
