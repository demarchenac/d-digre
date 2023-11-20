import type { FileError } from "../types";
import { toFileTooLargeError, toFileTooSmallError } from "./toError";

export function isFileSizeAccepted(
  file: File,
  minSize?: number,
  maxSize?: number,
): [boolean, FileError | null] {
  if (!file.size) return [true, null];

  if (minSize && file.size < minSize) return [false, toFileTooSmallError(minSize)];
  if (maxSize && file.size > maxSize) return [false, toFileTooLargeError(maxSize)];
  return [true, null];
}
