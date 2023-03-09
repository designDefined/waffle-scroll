import { useLayoutEffect, useReducer, useRef, useState } from "react";
import { partialIsDifferent } from "./compare";

let isInitiated = false;

type GlobalStateMachine = {
  currentState: object;
};

export type GlobalStateApi = {
  getGlobalState: () => GlobalScrollState;
  setGlobalState: (partial: Partial<GlobalScrollState>) => void;
};

type GlobalListener = {
  id: number;
  refresh: () => void;
};

let id = 0;
const globalListeners: GlobalListener[] = [];

const globalState: GlobalStateMachine = {
  currentState: {},
};

const refreshAll = () => {
  for (const { refresh } of globalListeners) {
    refresh();
  }
};

type GlobalScrollState = ReturnType<ReturnType<typeof createGlobalScrollState>>;

export const globalStateApis: GlobalStateApi = {
  getGlobalState: () => globalState.currentState,
  setGlobalState: (partial) => {
    if (partialIsDifferent(globalState.currentState, partial)) {
      globalState.currentState = { ...globalState.currentState, ...partial };
      refreshAll();
    }
  },
};

export const createGlobalScrollState = <T extends object>(
  initialState: T,
): (() => T) => {
  if (!isInitiated) {
    globalState.currentState = {
      ...globalState.currentState,
      ...initialState,
    };
    isInitiated = true;
  } else {
    console.log("warn!");
  }

  const useGlobalState = () => {
    const [, forceUpdate] = useReducer((c: number): number => c + 1, 0);
    const listenerId = useRef(-1);

    useLayoutEffect(() => {
      globalListeners.push({ id, refresh: forceUpdate });
      listenerId.current = id;
      id = id + 1;
      refreshAll();
      return () => {
        const index = globalListeners.findIndex(
          (listener) => listener.id === listenerId.current,
        );
        if (index >= 0) globalListeners.splice(index, 1);
      };
    }, []);
    return globalState.currentState as T;
  };

  return useGlobalState;
};
