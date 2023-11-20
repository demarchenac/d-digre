export function isObject<T>(v: unknown): v is T {
  return typeof v === "object" && v !== null;
}
