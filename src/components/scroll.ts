import { createGlobalScrollState } from "../hooks/useGlobalScrollState";

export const useHeaderScrollState = createGlobalScrollState<{
  current: "nobody" | "red";
}>({
  current: "nobody",
});
