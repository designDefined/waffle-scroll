export type Calculatable = { offsetTop: number; offsetHeight: number };

export const calculateProgress = (
  target: Calculatable,
  viewport: Calculatable,
): number => {
  const { offsetTop: targetTop, offsetHeight: targetHeight } = target;
  const { offsetTop: viewportTop, offsetHeight: viewportHeight } = viewport;
  const diff = viewportTop + viewportHeight - targetTop;
  if (diff < 0) return 0;
  if (diff > targetHeight + viewportHeight) return 3;
  if (viewportHeight === targetHeight) {
    if (diff <= viewportHeight) return diff / viewportHeight;
    if (diff > viewportHeight) return 1 + diff / viewportHeight;
  }
  if (viewportHeight < targetHeight) {
    if (diff <= viewportHeight) return diff / viewportHeight;
    if (diff > viewportHeight && diff < targetHeight)
      return 1 + (diff - viewportHeight) / (targetHeight - viewportHeight);
    if (diff >= targetHeight) return 2 + (diff - targetHeight) / viewportHeight;
  }
  if (viewportHeight > targetHeight) {
    if (diff <= targetHeight) return 1 + diff / targetHeight;
    if (diff > targetHeight && diff < viewportHeight)
      return 1 + (diff - targetHeight) / (viewportHeight - targetHeight);
    if (diff >= viewportHeight)
      return 2 + (diff - viewportHeight) / targetHeight;
  }
  return -999999;
};

export const roundBy = (value: number, threshold: number): number => {
  const step = 10 ** threshold;
  return Math.round(value * step) / step;
};
