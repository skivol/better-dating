// https://github.com/you-dont-need/You-Dont-Need-Lodash-Underscore#_throttle
export function throttle(callback: any, timeFrame: number) {
  let lastInvocation = 0;
  // We return a throttled function
  return function (...args: any[]) {
    const now = Date.now();
    if (now - lastInvocation >= timeFrame) {
      callback(...args); // Execute users function
      lastInvocation = now;
    }
  };
}

export function debounce(func: any, wait: number, immediate: boolean) {
  let timeout: any;
  return function (...args: any[]) {
    clearTimeout(timeout);
    timeout = setTimeout(function () {
      timeout = null;
      func(...args);
    }, wait);
    if (immediate && !timeout) func(...args);
  };
}

export const truncate = (input: string) =>
  input?.length > 10 ? `${input.substring(0, 10)}…` : input;
