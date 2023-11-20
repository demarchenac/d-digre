import { type FileArray, type FileWithPath } from "../types";

export function flatten<T>(items: (FileWithPath | FileArray[])[]): T[] {
  return items.flat(2) as T[];
}
