import { isObject } from "./isObject";

export function isDataTransfer(value: unknown): value is DataTransfer {
  return isObject(value);
}
