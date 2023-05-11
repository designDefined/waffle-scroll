import { createLocalScrollHook, createScrollHook } from "../v2";

export const useTestScroll = createScrollHook({
  globalState: { progress: -999 },
  defaultCallback: ({ setState, progress }) => {
    setState({ progress });
  },
});

export const useNestedScroll = createLocalScrollHook(true);
