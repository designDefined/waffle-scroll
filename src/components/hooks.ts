import { createGlobalScrollHook, createLocalScrollHook } from "../v2";

export const useTestScroll = createGlobalScrollHook({
  globalState: { progress: -999 },
  defaultCallback: ({ setState, progress }) => {
    setState({ progress });
  },
});

export const useNestedScroll = createLocalScrollHook(
  {
    localState: { progress: 0 },
    defaultCallback: ({ progress, setState }) => {
      setState({ progress });
    },
  },
  true,
);
