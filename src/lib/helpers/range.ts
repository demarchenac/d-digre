export function range(from: number, to?: number): number[] {
  const size = to ? to - from : from;
  if (size <= 0) return [];

  const elements = Array(size).fill(0);
  return elements.map((_, i) => (to ? from + i : i));
}
