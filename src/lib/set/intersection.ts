export function intersection<T>(A: Set<T>, B: Set<T>): Set<T> {
  const result = new Set<T>();

  for (const element of B) {
    if (A.has(element)) result.add(element);
  }

  return result;
}
