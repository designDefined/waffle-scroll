import createScrollHook from "../v2";

export const [useTestScroll] = createScrollHook({
  globalState: { progress: -999 },
  defaultCallback: ({ setGlobal, progress }) => {
    setGlobal({ progress });
  },
});

export const [useNestedScroll, load] = createScrollHook(
  {
    globalState: { progress: -999 },
    defaultCallback: ({ setGlobal, progress }) => {
      setGlobal({ progress });
    },
  },
  true,
);
