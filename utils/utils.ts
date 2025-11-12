export function sleep(time: number) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(true);
    }, time * 1000);
  });
}
export function compareString(a: string, b: string) {
  if (a === b) return 0;
  return a > b ? 1 : -1;
}
