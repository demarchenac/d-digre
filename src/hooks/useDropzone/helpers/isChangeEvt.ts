import { isObject } from "./isObject";

export function isChangeEvent(value: unknown): value is Event {
  return isObject<Event>(value) && isObject(value.target);
}
