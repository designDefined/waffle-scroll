//compare
export const partialIsDifferent = <T extends object>(
  state: T,
  partialState: Partial<T>,
): boolean => {
  const originalKeys = Object.keys(state);
  const partialEntries = Object.entries(partialState);
  if (originalKeys.length < 1) {
    return false;
  }
  for (const [key, value] of partialEntries) {
    if (originalKeys.includes(key)) {
      const validKey = key as keyof typeof state;
      if (state[validKey] !== value) {
        return true;
      }
    } else {
      return true;
    }
  }
  return false;
};

//calculate
export type Calculatable = {
  offsetTop: number;
  offsetHeight: number;
  offsetLeft: number;
  offsetWidth: number;
};

export const calculateProgress = (
  target: Calculatable,
  viewport: Calculatable,
  isHorizontal = false,
): number => {
  const targetStart = isHorizontal ? target.offsetLeft : target.offsetTop;
  const targetLength = isHorizontal ? target.offsetWidth : target.offsetHeight;
  const viewportStart = isHorizontal ? viewport.offsetLeft : viewport.offsetTop;
  const viewportLength = isHorizontal
    ? viewport.offsetWidth
    : viewport.offsetHeight;
  const diff = viewportStart + viewportLength - targetStart;
  console.log(targetStart);

  if (diff < 0) return 0;
  if (diff > targetLength + viewportLength) return 3;
  if (viewportLength === targetLength) {
    if (diff <= viewportLength) return diff / viewportLength;
    if (diff > viewportLength) return 1 + diff / viewportLength;
  }
  if (viewportLength < targetLength) {
    if (diff <= viewportLength) return diff / viewportLength;
    if (diff > viewportLength && diff < targetLength)
      return 1 + (diff - viewportLength) / (targetLength - viewportLength);
    if (diff >= targetLength) return 2 + (diff - targetLength) / viewportLength;
  }
  if (viewportLength > targetLength) {
    if (diff <= targetLength) return diff / targetLength;
    if (diff > targetLength && diff < viewportLength)
      return 1 + (diff - targetLength) / (viewportLength - targetLength);
    if (diff >= viewportLength)
      return 2 + (diff - viewportLength) / targetLength;
  }
  return -999999;
};

export const roundBy = (value: number, threshold: number): number => {
  const step = 10 ** threshold;
  return Math.round(value * step) / step;
};
