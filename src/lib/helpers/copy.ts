export function copy<T>(toCopy: T): T {
  return JSON.parse(JSON.stringify(toCopy)) as T;
}
