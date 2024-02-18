export function range(start: number, end: number): number[] {
  return Array.from({ length: end - start }, (_value, index) => start + index);
}
